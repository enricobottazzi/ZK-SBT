export function createNew(o) {
    const initialSize = o.initialSize || 1<<20;
    const fd = new MemFile();
    fd.o = o;
    fd.o.data = new Uint8Array(initialSize);
    fd.allocSize = initialSize;
    fd.totalSize = 0;
    fd.readOnly = false;
    fd.pos = 0;
    return fd;
}

export function readExisting(o) {
    const fd = new MemFile();
    fd.o = o;
    fd.allocSize = o.data.byteLength;
    fd.totalSize = o.data.byteLength;
    fd.readOnly = true;
    fd.pos = 0;
    return fd;
}

export function readWriteExisting(o) {
    const fd = new MemFile();
    fd.o = o;
    fd.allocSize = o.data.byteLength;
    fd.totalSize = o.data.byteLength;
    fd.readOnly = false;
    fd.pos = 0;
    return fd;
}

const tmpBuff32 = new Uint8Array(4);
const tmpBuff32v = new DataView(tmpBuff32.buffer);
const tmpBuff64 = new Uint8Array(8);
const tmpBuff64v = new DataView(tmpBuff64.buffer);

class MemFile {

    constructor() {
        this.pageSize = 1 << 14;  // for compatibility
    }

    _resizeIfNeeded(newLen) {
        if (newLen > this.allocSize) {
            const newAllocSize = Math.max(
                this.allocSize + (1 << 20),
                Math.floor(this.allocSize * 1.1),
                newLen
            );
            const newData = new Uint8Array(newAllocSize);
            newData.set(this.o.data);
            this.o.data = newData;
            this.allocSize = newAllocSize;
        }
    }

    async write(buff, pos) {
        const self =this;
        if (typeof pos == "undefined") pos = self.pos;
        if (this.readOnly) throw new Error("Writing a read only file");

        this._resizeIfNeeded(pos + buff.byteLength);

        this.o.data.set(buff.slice(), pos);

        if (pos + buff.byteLength > this.totalSize) this.totalSize = pos + buff.byteLength;

        this.pos = pos + buff.byteLength;
    }

    async readToBuffer(buffDest, offset, len, pos) {
        const self = this;
        if (typeof pos == "undefined") pos = self.pos;
        if (this.readOnly) {
            if (pos + len > this.totalSize) throw new Error("Reading out of bounds");
        }
        this._resizeIfNeeded(pos + len);

        const buffSrc = new Uint8Array(this.o.data.buffer, this.o.data.byteOffset + pos, len);

        buffDest.set(buffSrc, offset);

        this.pos = pos + len;
    }

    async read(len, pos) {
        const self = this;

        const buff = new Uint8Array(len);
        await self.readToBuffer(buff, 0, len, pos);

        return buff;
    }

    close() {
        if (this.o.data.byteLength != this.totalSize) {
            this.o.data = this.o.data.slice(0, this.totalSize);
        }
    }

    async discard() {
    }


    async writeULE32(v, pos) {
        const self = this;

        tmpBuff32v.setUint32(0, v, true);

        await self.write(tmpBuff32, pos);
    }

    async writeUBE32(v, pos) {
        const self = this;

        tmpBuff32v.setUint32(0, v, false);

        await self.write(tmpBuff32, pos);
    }


    async writeULE64(v, pos) {
        const self = this;

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

    async readString(pos) {
        const self = this;

        let currentPosition = typeof pos == "undefined" ? self.pos : pos;

        if (currentPosition > this.totalSize) {
            if (this.readOnly) {
                throw new Error("Reading out of bounds");
            }
            this._resizeIfNeeded(pos);
        }
        const dataArray = new Uint8Array(
            self.o.data.buffer,
            currentPosition,
            this.totalSize - currentPosition
        );

        let indexEndOfString = dataArray.findIndex(element => element === 0);
        let endOfStringFound = indexEndOfString !== -1;

        let str = "";
        if (endOfStringFound) {
            str = new TextDecoder().decode(dataArray.slice(0, indexEndOfString));
            self.pos = currentPosition + indexEndOfString + 1;
        } else {
            self.pos = currentPosition;
        }
        return str;
    }
}
