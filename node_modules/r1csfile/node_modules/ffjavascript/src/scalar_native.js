/* global BigInt */
const hexLen = [ 0, 1, 2, 2, 3, 3, 3, 3, 4 ,4 ,4 ,4 ,4 ,4 ,4 ,4];

export function fromString(s, radix) {
    if ((!radix)||(radix==10)) {
        return BigInt(s);
    } else if (radix==16) {
        if (s.slice(0,2) == "0x") {
            return BigInt(s);
        } else {
            return BigInt("0x"+s);
        }
    }
}

export const e = fromString;

export function fromArray(a, radix) {
    let acc =0n;
    radix = BigInt(radix);
    for (let i=0; i<a.length; i++) {
        acc = acc*radix + BigInt(a[i]);
    }
    return acc;
}

export function bitLength(a) {
    const aS =a.toString(16);
    return (aS.length-1)*4 +hexLen[parseInt(aS[0], 16)];
}

export function isNegative(a) {
    return BigInt(a) < 0n;
}

export function isZero(a) {
    return !a;
}

export function shiftLeft(a, n) {
    return BigInt(a) << BigInt(n);
}

export function shiftRight(a, n) {
    return BigInt(a) >> BigInt(n);
}

export const shl = shiftLeft;
export const shr = shiftRight;

export function isOdd(a) {
    return (BigInt(a) & 1n) == 1n;
}


export function naf(n) {
    let E = BigInt(n);
    const res = [];
    while (E) {
        if (E & 1n) {
            const z = 2 - Number(E % 4n);
            res.push( z );
            E = E - BigInt(z);
        } else {
            res.push( 0 );
        }
        E = E >> 1n;
    }
    return res;
}


export function bits(n) {
    let E = BigInt(n);
    const res = [];
    while (E) {
        if (E & 1n) {
            res.push(1);
        } else {
            res.push( 0 );
        }
        E = E >> 1n;
    }
    return res;
}

export function toNumber(s) {
    if (s>BigInt(Number.MAX_SAFE_INTEGER )) {
        throw new Error("Number too big");
    }
    return Number(s);
}

export function toArray(s, radix) {
    const res = [];
    let rem = BigInt(s);
    radix = BigInt(radix);
    while (rem) {
        res.unshift( Number(rem % radix));
        rem = rem / radix;
    }
    return res;
}


export function add(a, b) {
    return BigInt(a) + BigInt(b);
}

export function sub(a, b) {
    return BigInt(a) - BigInt(b);
}

export function neg(a) {
    return -BigInt(a);
}

export function mul(a, b) {
    return BigInt(a) * BigInt(b);
}

export function square(a) {
    return BigInt(a) * BigInt(a);
}

export function pow(a, b) {
    return BigInt(a) ** BigInt(b);
}

export function exp(a, b) {
    return BigInt(a) ** BigInt(b);
}

export function abs(a) {
    return BigInt(a) >= 0 ? BigInt(a) : -BigInt(a);
}

export function div(a, b) {
    return BigInt(a) / BigInt(b);
}

export function mod(a, b) {
    return BigInt(a) % BigInt(b);
}

export function eq(a, b) {
    return BigInt(a) == BigInt(b);
}

export function neq(a, b) {
    return BigInt(a) != BigInt(b);
}

export function lt(a, b) {
    return BigInt(a) < BigInt(b);
}

export function gt(a, b) {
    return BigInt(a) > BigInt(b);
}

export function leq(a, b) {
    return BigInt(a) <= BigInt(b);
}

export function geq(a, b) {
    return BigInt(a) >= BigInt(b);
}

export function band(a, b) {
    return BigInt(a) & BigInt(b);
}

export function bor(a, b) {
    return BigInt(a) | BigInt(b);
}

export function bxor(a, b) {
    return BigInt(a) ^ BigInt(b);
}

export function land(a, b) {
    return BigInt(a) && BigInt(b);
}

export function lor(a, b) {
    return BigInt(a) || BigInt(b);
}

export function lnot(a) {
    return !BigInt(a);
}

