
import fs from"fs";

export async function open(fileName, openFlags, cacheSize, pageSize) {
    cacheSize = cacheSize || 4096*64;
    if (["w+", "wx+", "r", "ax+", "a+"].indexOf(openFlags) <0)
        throw new Error("Invalid open option");
    const fd =await fs.promises.open(fileName, openFlags);

    const stats = await fd.stat();

    return  new FastFile(fd, stats, cacheSize, pageSize, fileName);
}


class FastFile {

    constructor(fd, stats, cacheSize, pageSize, fileName) {
        this.fileName = fileName;
        this.fd = fd;
        this.pos = 0;
        this.pageSize = pageSize || (1 << 8);
        while (this.pageSize < stats.blksize) {
            this.pageSize *= 2;
        }
        this.totalSize = stats.size;
        this.totalPages = Math.floor((stats.size -1) / this.pageSize)+1;
        this.maxPagesLoaded = Math.floor( cacheSize / this.pageSize)+1;
        this.pages = {};
        this.pendingLoads = [];
        this.writing = false;
        this.reading = false;
        this.avBuffs = [];
        this.history = {};
    }

    _loadPage(p) {
        const self = this;
        const P = new Promise((resolve, reject)=> {
            self.pendingLoads.push({
                page: p,
                resolve: resolve,
                reject: reject
            });
        });
        self.__statusPage("After Load request: ", p);
        return P;
    }

    __statusPage(s, p) {
        const logEntry = [];
        const self=this;
        if (!self.logHistory) return;
        logEntry.push("==" + s+ " " +p);
        let S = "";
        for (let i=0; i<self.pendingLoads.length; i++) {
            if (self.pendingLoads[i].page == p) S = S + " " + i;
        }
        if (S) logEntry.push("Pending loads:"+S);
        if (typeof self.pages[p] != "undefined") {
            const page = self.pages[p];
            logEntry.push("Loaded");
            logEntry.push("pendingOps: "+page.pendingOps);
            if (page.loading) logEntry.push("loading: "+page.loading);
            if (page.writing) logEntry.push("writing");
            if (page.dirty) logEntry.push("dirty");
        }
        logEntry.push("==");

        if (!self.history[p]) self.history[p] = [];
        self.history[p].push(logEntry);
    }

    __printHistory(p) {
        const self = this;
        if (!self.history[p]) console.log("Empty History ", p);
        console.log("History "+p);
        for (let i=0; i<self.history[p].length; i++) {
            for (let j=0; j<self.history[p][i].length; j++) {
                console.log("-> " + self.history[p][i][j]);
            }
        }
    }



    _triggerLoad() {
        const self = this;

        if (self.reading) return;
        if (self.pendingLoads.length==0) return;

        const pageIdxs = Object.keys(self.pages);

        const deletablePages = [];
        for (let i=0; i<pageIdxs.length; i++) {
            const page = self.pages[parseInt(pageIdxs[i])];
            if ((page.dirty == false)&&(page.pendingOps==0)&&(!page.writing)&&(!page.loading)) deletablePages.push(parseInt(pageIdxs[i]));
        }

        let freePages = self.maxPagesLoaded - pageIdxs.length;

        const ops = [];

        // while pending loads and
        //     the page is loaded or I can recover one.
        while (
            (self.pendingLoads.length>0) &&
            (   (typeof self.pages[self.pendingLoads[0].page] != "undefined" )
              ||(  (freePages>0)
                 ||(deletablePages.length>0)))) {
            const load = self.pendingLoads.shift();
            if (typeof self.pages[load.page] != "undefined") {
                self.pages[load.page].pendingOps ++;
                const idx = deletablePages.indexOf(load.page);
                if (idx>=0) deletablePages.splice(idx, 1);
                if (self.pages[load.page].loading) {
                    self.pages[load.page].loading.push(load);
                } else {
                    load.resolve();
                }
                self.__statusPage("After Load (cached): ", load.page);

            } else {
                if (freePages) {
                    freePages--;
                } else {
                    const fp = deletablePages.shift();
                    self.__statusPage("Before Unload: ", fp);
                    self.avBuffs.unshift(self.pages[fp]);
                    delete self.pages[fp];
                    self.__statusPage("After Unload: ", fp);
                }

                if (load.page>=self.totalPages) {
                    self.pages[load.page] = getNewPage();
                    load.resolve();
                    self.__statusPage("After Load (new): ", load.page);
                } else {
                    self.reading = true;
                    self.pages[load.page] = getNewPage();
                    self.pages[load.page].loading = [load];
                    ops.push(self.fd.read(self.pages[load.page].buff, 0, self.pageSize, load.page*self.pageSize).then((res)=> {
                        self.pages[load.page].size = res.bytesRead;
                        const loading = self.pages[load.page].loading;
                        delete self.pages[load.page].loading;
                        for (let i=0; i<loading.length; i++) {
                            loading[i].resolve();
                        }
                        self.__statusPage("After Load (loaded): ", load.page);
                        return res;
                    }, (err) => {
                        load.reject(err);
                    }));
                    self.__statusPage("After Load (loading): ", load.page);
                }
            }
        }
        // if (ops.length>1) console.log(ops.length);

        Promise.all(ops).then( () => {
            self.reading = false;
            if (self.pendingLoads.length>0) setImmediate(self._triggerLoad.bind(self));
            self._tryClose();
        });

        function getNewPage() {
            if (self.avBuffs.length>0) {
                const p = self.avBuffs.shift();
                p.dirty = false;
                p.pendingOps = 1;
                p.size =0;
                return p;
            } else {
                return {
                    dirty: false,
                    buff: new Uint8Array(self.pageSize),
                    pendingOps: 1,
                    size: 0
                };
            }
        }

    }


    _triggerWrite() {
        const self = this;
        if (self.writing) return;

        const pageIdxs = Object.keys(self.pages);

        const ops = [];

        for (let i=0; i<pageIdxs.length; i++) {
            const page = self.pages[parseInt(pageIdxs[i])];
            if (page.dirty) {
                page.dirty = false;
                page.writing = true;
                self.writing = true;
                ops.push( self.fd.write(page.buff, 0, page.size, parseInt(pageIdxs[i])*self.pageSize).then(() => {
                    page.writing = false;
                    return;
                }, (err) => {
                    console.log("ERROR Writing: "+err);
                    self.error = err;
                    self._tryClose();
                }));
            }
        }

        if (self.writing) {
            Promise.all(ops).then( () => {
                self.writing = false;
                setImmediate(self._triggerWrite.bind(self));
                self._tryClose();
                if (self.pendingLoads.length>0) setImmediate(self._triggerLoad.bind(self));
            });
        }
    }

    _getDirtyPage() {
        for (let p in this.pages) {
            if (this.pages[p].dirty) return p;
        }
        return -1;
    }

    async write(buff, pos) {
        if (buff.byteLength == 0) return;
        const self = this;
/*
        if (buff.byteLength > self.pageSize*self.maxPagesLoaded*0.8) {
            const cacheSize = Math.floor(buff.byteLength * 1.1);
            this.maxPagesLoaded = Math.floor( cacheSize / self.pageSize)+1;
        }
*/
        if (typeof pos == "undefined") pos = self.pos;
        self.pos = pos+buff.byteLength;
        if (self.totalSize < pos + buff.byteLength) self.totalSize = pos + buff.byteLength;
        if (self.pendingClose)
            throw new Error("Writing a closing file");
        const firstPage = Math.floor(pos / self.pageSize);
        const lastPage = Math.floor((pos + buff.byteLength -1) / self.pageSize);

        const pagePromises = [];
        for (let i=firstPage; i<=lastPage; i++) pagePromises.push(self._loadPage(i));
        self._triggerLoad();

        let p = firstPage;
        let o = pos % self.pageSize;
        let r = buff.byteLength;
        while (r>0) {
            await pagePromises[p-firstPage];
            const l = (o+r > self.pageSize) ? (self.pageSize -o) : r;
            const srcView = buff.slice( buff.byteLength - r, buff.byteLength - r + l);
            const dstView = new Uint8Array(self.pages[p].buff.buffer, o, l);
            dstView.set(srcView);
            self.pages[p].dirty = true;
            self.pages[p].pendingOps --;
            self.pages[p].size = Math.max(o+l, self.pages[p].size);
            if (p>=self.totalPages) {
                self.totalPages = p+1;
            }
            r = r-l;
            p ++;
            o = 0;
            if (!self.writing) setImmediate(self._triggerWrite.bind(self));
        }
    }

    async read(len, pos) {
        const self = this;
        let buff = new Uint8Array(len);
        await self.readToBuffer(buff, 0, len, pos);

        return buff;
    }

    async readToBuffer(buffDst, offset, len, pos) {
        if (len == 0) {
            return;
        }
        const self = this;
        if (len > self.pageSize*self.maxPagesLoaded*0.8) {
            const cacheSize = Math.floor(len * 1.1);
            this.maxPagesLoaded = Math.floor( cacheSize / self.pageSize)+1;
        }
        if (typeof pos == "undefined") pos = self.pos;
        self.pos = pos+len;
        if (self.pendingClose)
            throw new Error("Reading a closing file");
        const firstPage = Math.floor(pos / self.pageSize);
        const lastPage = Math.floor((pos + len -1) / self.pageSize);

        const pagePromises = [];
        for (let i=firstPage; i<=lastPage; i++) pagePromises.push(self._loadPage(i));

        self._triggerLoad();

        let p = firstPage;
        let o = pos % self.pageSize;
        // Remaining bytes to read
        let r = pos + len > self.totalSize ? len - (pos + len - self.totalSize): len;
        while (r>0) {
            await pagePromises[p - firstPage];
            self.__statusPage("After Await (read): ", p);

            // bytes to copy from this page
            const l = (o+r > self.pageSize) ? (self.pageSize -o) : r;
            const srcView = new Uint8Array(self.pages[p].buff.buffer, self.pages[p].buff.byteOffset + o, l);
            buffDst.set(srcView, offset+len-r);
            self.pages[p].pendingOps --;

            self.__statusPage("After Op done: ", p);

            r = r-l;
            p ++;
            o = 0;
            if (self.pendingLoads.length>0) setImmediate(self._triggerLoad.bind(self));
        }

        this.pos = pos + len;

    }


    _tryClose() {
        const self = this;
        if (!self.pendingClose) return;
        if (self.error) {
            self.pendingCloseReject(self.error);
        }
        const p = self._getDirtyPage();
        if ((p>=0) || (self.writing) || (self.reading) || (self.pendingLoads.length>0)) return;
        self.pendingClose();
    }

    close() {
        const self = this;
        if (self.pendingClose)
            throw new Error("Closing the file twice");
        return new Promise((resolve, reject) => {
            self.pendingClose = resolve;
            self.pendingCloseReject = reject;
            self._tryClose();
        }).then(()=> {
            self.fd.close();
        }, (err) => {
            self.fd.close();
            throw (err);
        });
    }

    async discard() {
        const self = this;
        await self.close();
        await fs.promises.unlink(this.fileName);
    }

    async writeULE32(v, pos) {
        const self = this;
        const tmpBuff32 = new Uint8Array(4);
        const tmpBuff32v = new DataView(tmpBuff32.buffer);

        tmpBuff32v.setUint32(0, v, true);

        await self.write(tmpBuff32, pos);
    }

    async writeUBE32(v, pos) {
        const self = this;

        const tmpBuff32 = new Uint8Array(4);
        const tmpBuff32v = new DataView(tmpBuff32.buffer);

        tmpBuff32v.setUint32(0, v, false);

        await self.write(tmpBuff32, pos);
    }


    async writeULE64(v, pos) {
        const self = this;

        const tmpBuff64 = new Uint8Array(8);
        const tmpBuff64v = new DataView(tmpBuff64.buffer);

        tmpBuff64v.setUint32(0, v & 0xFFFFFFFF, true);
        tmpBuff64v.setUint32(4, Math.floor(v / 0x100000000) , true);

        await self.write(tmpBuff64, pos);
    }

    async readULE32(pos) {
        const self = this;
        const b = await self.read(4, pos);

        const view = new Uint32Array(b.buffer);

        return view[0];
    }

    async readUBE32(pos) {
        const self = this;
        const b = await self.read(4, pos);

        const view = new DataView(b.buffer);

        return view.getUint32(0, false);
    }

    async readULE64(pos) {
        const self = this;
        const b = await self.read(8, pos);

        const view = new Uint32Array(b.buffer);

        return view[1] * 0x100000000 + view[0];
    }

}
