import bigInt from "big-integer";

export function stringifyBigInts(o) {
    if ((typeof(o) == "bigint") || o.eq !== undefined)  {
        return o.toString(10);
    } else if (Array.isArray(o)) {
        return o.map(stringifyBigInts);
    } else if (typeof o == "object") {
        const res = {};
        const keys = Object.keys(o);
        keys.forEach( (k) => {
            res[k] = stringifyBigInts(o[k]);
        });
        return res;
    } else {
        return o;
    }
}

export function unstringifyBigInts(o) {
    if ((typeof(o) == "string") && (/^[0-9]+$/.test(o) ))  {
        return bigInt(o);
    } else if (Array.isArray(o)) {
        return o.map(unstringifyBigInts);
    } else if (typeof o == "object") {
        const res = {};
        const keys = Object.keys(o);
        keys.forEach( (k) => {
            res[k] = unstringifyBigInts(o[k]);
        });
        return res;
    } else {
        return o;
    }
}

export function beBuff2int(buff) {
    let res = bigInt.zero;
    for (let i=0; i<buff.length; i++) {
        const n = bigInt(buff[buff.length - i - 1]);
        res = res.add(n.shiftLeft(i*8));
    }
    return res;
}

export function beInt2Buff(n, len) {
    let r = n;
    let o =len-1;
    const buff = new Uint8Array(len);
    while ((r.gt(bigInt.zero))&&(o>=0)) {
        let c = Number(r.and(bigInt("255")));
        buff[o] = c;
        o--;
        r = r.shiftRight(8);
    }
    if (!r.eq(bigInt.zero)) {
        throw new Error("Number does not fit in this length");
    }
    return buff;
}


export function leBuff2int (buff) {
    let res = bigInt.zero;
    for (let i=0; i<buff.length; i++) {
        const n = bigInt(buff[i]);
        res = res.add(n.shiftLeft(i*8));
    }
    return res;
}

export function leInt2Buff(n, len) {
    let r = n;
    let o =0;
    const buff = new Uint8Array(len);
    while ((r.gt(bigInt.zero))&&(o<buff.length)) {
        let c = Number(r.and(bigInt(255)));
        buff[o] = c;
        o++;
        r = r.shiftRight(8);
    }
    if (!r.eq(bigInt.zero)) {
        throw new Error("Number does not fit in this length");
    }
    return buff;
}
