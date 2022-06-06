/*
    Copyright 2019 0KIMS association.

    This file is part of wasmbuilder

    wasmbuilder is a free software: you can redistribute it and/or modify it
    under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    wasmbuilder is distributed in the hope that it will be useful, but WITHOUT
    ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
    or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public
    License for more details.

    You should have received a copy of the GNU General Public License
    along with wasmbuilder. If not, see <https://www.gnu.org/licenses/>.
*/

const bigInt = require("big-integer");

function toNumber(n) {
    let v;
    if (typeof n=="string") {
        if (n.slice(0,2).toLowerCase() == "0x") {
            v = bigInt(n.slice(2),16);
        } else {
            v = bigInt(n);
        }
    } else {
        v = bigInt(n);
    }
    return v;
}

function u32(n) {
    const b = [];
    const v = toNumber(n);
    b.push(v.and(0xFF).toJSNumber());
    b.push(v.shiftRight(8).and(0xFF).toJSNumber());
    b.push(v.shiftRight(16).and(0xFF).toJSNumber());
    b.push(v.shiftRight(24).and(0xFF).toJSNumber());
    return b;
}

function u64(n) {
    const b = [];
    const v = toNumber(n);
    b.push(v.and(0xFF).toJSNumber());
    b.push(v.shiftRight(8).and(0xFF).toJSNumber());
    b.push(v.shiftRight(16).and(0xFF).toJSNumber());
    b.push(v.shiftRight(24).and(0xFF).toJSNumber());
    b.push(v.shiftRight(32).and(0xFF).toJSNumber());
    b.push(v.shiftRight(40).and(0xFF).toJSNumber());
    b.push(v.shiftRight(48).and(0xFF).toJSNumber());
    b.push(v.shiftRight(56).and(0xFF).toJSNumber());
    return b;
}

function toUTF8Array(str) {
    var utf8 = [];
    for (var i=0; i < str.length; i++) {
        var charcode = str.charCodeAt(i);
        if (charcode < 0x80) utf8.push(charcode);
        else if (charcode < 0x800) {
            utf8.push(0xc0 | (charcode >> 6),
                      0x80 | (charcode & 0x3f));
        }
        else if (charcode < 0xd800 || charcode >= 0xe000) {
            utf8.push(0xe0 | (charcode >> 12),
                      0x80 | ((charcode>>6) & 0x3f),
                      0x80 | (charcode & 0x3f));
        }
        // surrogate pair
        else {
            i++;
            // UTF-16 encodes 0x10000-0x10FFFF by
            // subtracting 0x10000 and splitting the
            // 20 bits of 0x0-0xFFFFF into two halves
            charcode = 0x10000 + (((charcode & 0x3ff)<<10)
                      | (str.charCodeAt(i) & 0x3ff));
            utf8.push(0xf0 | (charcode >>18),
                      0x80 | ((charcode>>12) & 0x3f),
                      0x80 | ((charcode>>6) & 0x3f),
                      0x80 | (charcode & 0x3f));
        }
    }
    return utf8;
}

function string(str) {
    const bytes = toUTF8Array(str);
    return [ ...varuint32(bytes.length), ...bytes ];
}

function varuint(n) {
    const code = [];
    let v = toNumber(n);
    if (v.isNegative()) throw new Error("Number cannot be negative");
    while (!v.isZero()) {
        code.push(v.and(0x7F).toJSNumber());
        v = v.shiftRight(7);
    }
    if (code.length==0) code.push(0);
    for (let i=0; i<code.length-1; i++) {
        code[i] = code[i] | 0x80;
    }
    return code;
}

function varint(_n) {
    let n, sign;
    const bits = _n.bitLength().toJSNumber();
    if (_n<0) {
        sign = true;
        n = bigInt.one.shiftLeft(bits).add(_n);
    } else {
        sign = false;
        n = toNumber(_n);
    }
    const paddingBits = 7 - (bits % 7);

    const padding = bigInt.one.shiftLeft(paddingBits).minus(1).shiftLeft(bits);
    const paddingMask = ((1 << (7 - paddingBits))-1) | 0x80;

    const code = varuint(n.add(padding));

    if (!sign) {
        code[code.length-1] = code[code.length-1] & paddingMask;
    }

    return code;
}

function varint32(n) {
    let v = toNumber(n);
    if (v.greater(bigInt("FFFFFFFF", 16))) throw new Error("Number too big");
    if (v.greater(bigInt("7FFFFFFF", 16))) v = v.minus(bigInt("100000000",16));
    if (v.lesser(bigInt("-80000000", 16))) throw new Error("Number too small");
    return varint(v);
}

function varint64(n) {
    let v = toNumber(n);
    if (v.greater(bigInt("FFFFFFFFFFFFFFFF", 16))) throw new Error("Number too big");
    if (v.greater(bigInt("7FFFFFFFFFFFFFFF", 16))) v = v.minus(bigInt("10000000000000000",16));
    if (v.lesser(bigInt("-8000000000000000", 16))) throw new Error("Number too small");
    return varint(v);
}

function varuint32(n) {
    let v = toNumber(n);
    if (v.greater(bigInt("FFFFFFFF", 16))) throw new Error("Number too big");
    return varuint(v);
}

function varuint64(n) {
    let v = toNumber(n);
    if (v.greater(bigInt("FFFFFFFFFFFFFFFF", 16))) throw new Error("Number too big");
    return varuint(v);
}

function toHexString(byteArray) {
    return Array.from(byteArray, function(byte) {
        return ("0" + (byte & 0xFF).toString(16)).slice(-2);
    }).join("");
}

function ident(text) {
    if (typeof text === "string") {
        let lines = text.split("\n");
        for (let i=0; i<lines.length; i++) {
            if (lines[i]) lines[i] = "    "+lines[i];
        }
        return lines.join("\n");
    } else if (Array.isArray(text)) {
        for (let i=0; i<text.length; i++ ) {
            text[i] = ident(text[i]);
        }
        return text;
    }
}

module.exports.toNumber = toNumber;
module.exports.u32 = u32;
module.exports.u64 = u64;
module.exports.varuint32 = varuint32;
module.exports.varuint64 = varuint64;
module.exports.varint32 = varint32;
module.exports.varint64 = varint64;
module.exports.string = string;
module.exports.toHexString = toHexString;
module.exports.ident = ident;
