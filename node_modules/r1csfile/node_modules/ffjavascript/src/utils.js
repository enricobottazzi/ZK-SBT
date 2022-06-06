import * as utils_native from "./utils_native.js";
import * as utils_bigint from "./utils_bigint.js";

let utils = {};

const supportsNativeBigInt = typeof BigInt === "function";
if (supportsNativeBigInt) {
    Object.assign(utils, utils_native);
} else {
    Object.assign(utils, utils_bigint);
}


const _revTable = [];
for (let i=0; i<256; i++) {
    _revTable[i] = _revSlow(i, 8);
}

function _revSlow(idx, bits) {
    let res =0;
    let a = idx;
    for (let i=0; i<bits; i++) {
        res <<= 1;
        res = res | (a &1);
        a >>=1;
    }
    return res;
}

utils.bitReverse = function bitReverse(idx, bits) {
    return (
        _revTable[idx >>> 24] |
        (_revTable[(idx >>> 16) & 0xFF] << 8) |
        (_revTable[(idx >>> 8) & 0xFF] << 16) |
        (_revTable[idx & 0xFF] << 24)
    ) >>> (32-bits);
};


utils.log2 = function log2( V )
{
    return( ( ( V & 0xFFFF0000 ) !== 0 ? ( V &= 0xFFFF0000, 16 ) : 0 ) | ( ( V & 0xFF00FF00 ) !== 0 ? ( V &= 0xFF00FF00, 8 ) : 0 ) | ( ( V & 0xF0F0F0F0 ) !== 0 ? ( V &= 0xF0F0F0F0, 4 ) : 0 ) | ( ( V & 0xCCCCCCCC ) !== 0 ? ( V &= 0xCCCCCCCC, 2 ) : 0 ) | ( ( V & 0xAAAAAAAA ) !== 0 ) );
};

utils.buffReverseBits = function buffReverseBits(buff, eSize) {
    const n = buff.byteLength /eSize;
    const bits = utils.log2(n);
    if (n != (1 << bits)) {
        throw new Error("Invalid number of pointers");
    }
    for (let i=0; i<n; i++) {
        const r = utils.bitReverse(i,bits);
        if (i>r) {
            const tmp = buff.slice(i*eSize, (i+1)*eSize);
            buff.set( buff.slice(r*eSize, (r+1)*eSize), i*eSize);
            buff.set(tmp, r*eSize);
        }
    }
};

export let {
    bitReverse,
    log2,
    buffReverseBits,
    stringifyBigInts,
    unstringifyBigInts,
    beBuff2int,
    beInt2Buff,
    leBuff2int,
    leInt2Buff,
} = utils;

