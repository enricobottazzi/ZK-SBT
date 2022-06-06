
import * as Scalar_native from "./scalar_native.js";
import * as Scalar_bigint from "./scalar_bigint.js";

const supportsNativeBigInt = typeof BigInt === "function";

let Scalar = {};
if (supportsNativeBigInt) {
    Object.assign(Scalar, Scalar_native);
} else {
    Object.assign(Scalar, Scalar_bigint);
}


// Returns a buffer with Little Endian Representation
Scalar.toRprLE = function rprBE(buff, o, e, n8) {
    const s = "0000000" + e.toString(16);
    const v = new Uint32Array(buff.buffer, o, n8/4);
    const l = (((s.length-7)*4 - 1) >> 5)+1;    // Number of 32bit words;
    for (let i=0; i<l; i++) v[i] = parseInt(s.substring(s.length-8*i-8, s.length-8*i), 16);
    for (let i=l; i<v.length; i++) v[i] = 0;
    for (let i=v.length*4; i<n8; i++) buff[i] = Scalar.toNumber(Scalar.band(Scalar.shiftRight(e, i*8), 0xFF));
};

// Returns a buffer with Big Endian Representation
Scalar.toRprBE = function rprLEM(buff, o, e, n8) {
    const s = "0000000" + e.toString(16);
    const v = new DataView(buff.buffer, buff.byteOffset + o, n8);
    const l = (((s.length-7)*4 - 1) >> 5)+1;    // Number of 32bit words;
    for (let i=0; i<l; i++) v.setUint32(n8-i*4 -4, parseInt(s.substring(s.length-8*i-8, s.length-8*i), 16), false);
    for (let i=0; i<n8/4-l; i++) v[i] = 0;
};

// Pases a buffer with Little Endian Representation
Scalar.fromRprLE = function rprLEM(buff, o, n8) {
    n8 = n8 || buff.byteLength;
    o = o || 0;
    const v = new Uint32Array(buff.buffer, o, n8/4);
    const a = new Array(n8/4);
    v.forEach( (ch,i) => a[a.length-i-1] = ch.toString(16).padStart(8,"0") );
    return Scalar.fromString(a.join(""), 16);
};

// Pases a buffer with Big Endian Representation
Scalar.fromRprBE = function rprLEM(buff, o, n8) {
    n8 = n8 || buff.byteLength;
    o = o || 0;
    const v = new DataView(buff.buffer, buff.byteOffset + o, n8);
    const a = new Array(n8/4);
    for (let i=0; i<n8/4; i++) {
        a[i] = v.getUint32(i*4, false).toString(16).padStart(8, "0");
    }
    return Scalar.fromString(a.join(""), 16);
};

Scalar.toString = function toString(a, radix) {
    return a.toString(radix);
};

Scalar.toLEBuff = function toLEBuff(a) {
    const buff = new Uint8Array(Math.floor((Scalar.bitLength(a) - 1) / 8) +1);
    Scalar.toRprLE(buff, 0, a, buff.byteLength);
    return buff;
};


Scalar.zero = Scalar.e(0);
Scalar.one = Scalar.e(1);

export let {
    toRprLE,
    toRprBE,
    fromRprLE,
    fromRprBE,
    toString,
    toLEBuff,
    zero,
    one,
    fromString,
    e,
    fromArray,
    bitLength,
    isNegative,
    isZero,
    shiftLeft,
    shiftRight,
    shl,
    shr,
    isOdd,
    naf,
    bits,
    toNumber,
    toArray,
    add,
    sub,
    neg,
    mul,
    square,
    pow,
    exp,
    abs,
    div,
    mod,
    eq,
    neq,
    lt,
    gt,
    leq,
    geq,
    band,
    bor,
    bxor,
    land,
    lor,
    lnot,
} = Scalar;





