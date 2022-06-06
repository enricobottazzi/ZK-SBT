import bigInt from "big-integer";

export function fromString(s, radix) {
    if (typeof s == "string") {
        if (s.slice(0,2) == "0x") {
            return bigInt(s.slice(2), 16);
        } else {
            return bigInt(s,radix);
        }
    } else {
        return bigInt(s, radix);
    }
}

export const e = fromString;

export function fromArray(a, radix) {
    return bigInt.fromArray(a, radix);
}

export function bitLength(a) {
    return bigInt(a).bitLength();
}

export function isNegative(a) {
    return bigInt(a).isNegative();
}

export function isZero(a) {
    return bigInt(a).isZero();
}

export function shiftLeft(a, n) {
    return bigInt(a).shiftLeft(n);
}

export function shiftRight(a, n) {
    return bigInt(a).shiftRight(n);
}

export const shl = shiftLeft;
export const shr = shiftRight;

export function isOdd(a) {
    return bigInt(a).isOdd();
}


export function naf(n) {
    let E = bigInt(n);
    const res = [];
    while (E.gt(bigInt.zero)) {
        if (E.isOdd()) {
            const z = 2 - E.mod(4).toJSNumber();
            res.push( z );
            E = E.minus(z);
        } else {
            res.push( 0 );
        }
        E = E.shiftRight(1);
    }
    return res;
}

export function bits(n) {
    let E = bigInt(n);
    const res = [];
    while (E.gt(bigInt.zero)) {
        if (E.isOdd()) {
            res.push(1);
        } else {
            res.push( 0 );
        }
        E = E.shiftRight(1);
    }
    return res;
}

export function toNumber(s) {
    if (!s.lt(bigInt("9007199254740992", 10))) {
        throw new Error("Number too big");
    }
    return s.toJSNumber();
}

export function toArray(s, radix) {
    return bigInt(s).toArray(radix);
}

export function add(a, b) {
    return bigInt(a).add(bigInt(b));
}

export function sub(a, b) {
    return bigInt(a).minus(bigInt(b));
}

export function neg(a) {
    return bigInt.zero.minus(bigInt(a));
}

export function mul(a, b) {
    return bigInt(a).times(bigInt(b));
}

export function square(a) {
    return bigInt(a).square();
}

export function pow(a, b) {
    return bigInt(a).pow(bigInt(b));
}

export function exp(a, b) {
    return bigInt(a).pow(bigInt(b));
}

export function abs(a) {
    return bigInt(a).abs();
}

export function div(a, b) {
    return bigInt(a).divide(bigInt(b));
}

export function mod(a, b) {
    return bigInt(a).mod(bigInt(b));
}

export function eq(a, b) {
    return bigInt(a).eq(bigInt(b));
}

export function neq(a, b) {
    return bigInt(a).neq(bigInt(b));
}

export function lt(a, b) {
    return bigInt(a).lt(bigInt(b));
}

export function gt(a, b) {
    return bigInt(a).gt(bigInt(b));
}

export function leq(a, b) {
    return bigInt(a).leq(bigInt(b));
}

export function geq(a, b) {
    return bigInt(a).geq(bigInt(b));
}

export function band(a, b) {
    return bigInt(a).and(bigInt(b));
}

export function bor(a, b) {
    return bigInt(a).or(bigInt(b));
}

export function bxor(a, b) {
    return bigInt(a).xor(bigInt(b));
}

export function land(a, b) {
    return (!bigInt(a).isZero()) && (!bigInt(b).isZero());
}

export function lor(a, b) {
    return (!bigInt(a).isZero()) || (!bigInt(b).isZero());
}

export function lnot(a) {
    return bigInt(a).isZero();
}


