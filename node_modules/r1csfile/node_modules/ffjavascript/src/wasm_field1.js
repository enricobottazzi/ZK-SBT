

import * as Scalar from "./scalar.js";
import * as utils from "./utils.js";
import { getThreadRng } from "./random.js";
import buildBatchConvert from "./engine_batchconvert.js";


export default class WasmField1 {

    constructor(tm, prefix, n8, p) {
        this.tm = tm;
        this.prefix = prefix;

        this.p = p;
        this.n8 = n8;
        this.type = "F1";
        this.m = 1;

        this.half = Scalar.shiftRight(p, Scalar.one);
        this.bitLength = Scalar.bitLength(p);
        this.mask = Scalar.sub(Scalar.shiftLeft(Scalar.one, this.bitLength), Scalar.one);

        this.pOp1 = tm.alloc(n8);
        this.pOp2 = tm.alloc(n8);
        this.pOp3 = tm.alloc(n8);
        this.tm.instance.exports[prefix + "_zero"](this.pOp1);
        this.zero = this.tm.getBuff(this.pOp1, this.n8);
        this.tm.instance.exports[prefix + "_one"](this.pOp1);
        this.one = this.tm.getBuff(this.pOp1, this.n8);

        this.negone = this.neg(this.one);
        this.two = this.add(this.one, this.one);

        this.n64 = Math.floor(n8/8);
        this.n32 = Math.floor(n8/4);

        if(this.n64*8 != this.n8) {
            throw new Error("n8 must be a multiple of 8");
        }

        this.half = Scalar.shiftRight(this.p, Scalar.one);
        this.nqr = this.two;
        let r = this.exp(this.nqr, this.half);
        while (!this.eq(r, this.negone)) {
            this.nqr = this.add(this.nqr, this.one);
            r = this.exp(this.nqr, this.half);
        }

        this.shift = this.mul(this.nqr, this.nqr);
        this.shiftInv = this.inv(this.shift);

        this.s = 0;
        let t = Scalar.sub(this.p, Scalar.one);

        while ( !Scalar.isOdd(t) ) {
            this.s = this.s + 1;
            t = Scalar.shiftRight(t, Scalar.one);
        }

        this.w = [];
        this.w[this.s] = this.exp(this.nqr, t);

        for (let i= this.s-1; i>=0; i--) {
            this.w[i] = this.square(this.w[i+1]);
        }

        if (!this.eq(this.w[0], this.one)) {
            throw new Error("Error calculating roots of unity");
        }

        this.batchToMontgomery = buildBatchConvert(tm, prefix + "_batchToMontgomery", this.n8, this.n8);
        this.batchFromMontgomery = buildBatchConvert(tm, prefix + "_batchFromMontgomery", this.n8, this.n8);
    }


    op2(opName, a, b) {
        this.tm.setBuff(this.pOp1, a);
        this.tm.setBuff(this.pOp2, b);
        this.tm.instance.exports[this.prefix + opName](this.pOp1, this.pOp2, this.pOp3);
        return this.tm.getBuff(this.pOp3, this.n8);
    }

    op2Bool(opName, a, b) {
        this.tm.setBuff(this.pOp1, a);
        this.tm.setBuff(this.pOp2, b);
        return !!this.tm.instance.exports[this.prefix + opName](this.pOp1, this.pOp2);
    }

    op1(opName, a) {
        this.tm.setBuff(this.pOp1, a);
        this.tm.instance.exports[this.prefix + opName](this.pOp1, this.pOp3);
        return this.tm.getBuff(this.pOp3, this.n8);
    }

    op1Bool(opName, a) {
        this.tm.setBuff(this.pOp1, a);
        return !!this.tm.instance.exports[this.prefix + opName](this.pOp1, this.pOp3);
    }

    add(a,b) {
        return this.op2("_add", a, b);
    }


    eq(a,b) {
        return this.op2Bool("_eq", a, b);
    }

    isZero(a) {
        return this.op1Bool("_isZero", a);
    }

    sub(a,b) {
        return this.op2("_sub", a, b);
    }

    neg(a) {
        return this.op1("_neg", a);
    }

    inv(a) {
        return this.op1("_inverse", a);
    }

    toMontgomery(a) {
        return this.op1("_toMontgomery", a);
    }

    fromMontgomery(a) {
        return this.op1("_fromMontgomery", a);
    }

    mul(a,b) {
        return this.op2("_mul", a, b);
    }

    div(a, b) {
        this.tm.setBuff(this.pOp1, a);
        this.tm.setBuff(this.pOp2, b);
        this.tm.instance.exports[this.prefix + "_inverse"](this.pOp2, this.pOp2);
        this.tm.instance.exports[this.prefix + "_mul"](this.pOp1, this.pOp2, this.pOp3);
        return this.tm.getBuff(this.pOp3, this.n8);
    }

    square(a) {
        return this.op1("_square", a);
    }

    isSquare(a) {
        return this.op1Bool("_isSquare", a);
    }

    sqrt(a) {
        return this.op1("_sqrt", a);
    }

    exp(a, b) {
        if (!(b instanceof Uint8Array)) {
            b = Scalar.toLEBuff(Scalar.e(b));
        }
        this.tm.setBuff(this.pOp1, a);
        this.tm.setBuff(this.pOp2, b);
        this.tm.instance.exports[this.prefix + "_exp"](this.pOp1, this.pOp2, b.byteLength, this.pOp3);
        return this.tm.getBuff(this.pOp3, this.n8);
    }

    isNegative(a) {
        return this.op1Bool("_isNegative", a);
    }

    e(a, b) {
        if (a instanceof Uint8Array) return a;
        let ra = Scalar.e(a, b);
        if (Scalar.isNegative(ra)) {
            ra = Scalar.neg(ra);
            if (Scalar.gt(ra, this.p)) {
                ra = Scalar.mod(ra, this.p);
            }
            ra = Scalar.sub(this.p, ra);
        } else {
            if (Scalar.gt(ra, this.p)) {
                ra = Scalar.mod(ra, this.p);
            }
        }
        const buff = utils.leInt2Buff(ra, this.n8);
        return this.toMontgomery(buff);
    }

    toString(a, radix) {
        const an = this.fromMontgomery(a);
        const s = Scalar.fromRprLE(an, 0);
        return Scalar.toString(s, radix);
    }

    fromRng(rng) {
        let v;
        const buff = new Uint8Array(this.n8);
        do {
            v = Scalar.zero;
            for (let i=0; i<this.n64; i++) {
                v = Scalar.add(v,  Scalar.shiftLeft(rng.nextU64(), 64*i));
            }
            v = Scalar.band(v, this.mask);
        } while (Scalar.geq(v, this.p));
        Scalar.toRprLE(buff, 0, v, this.n8);
        return buff;
    }

    random() {
        return this.fromRng(getThreadRng());
    }

    toObject(a) {
        const an = this.fromMontgomery(a);
        return Scalar.fromRprLE(an, 0);
    }

    fromObject(a) {
        const buff = new Uint8Array(this.n8);
        Scalar.toRprLE(buff, 0, a, this.n8);
        return this.toMontgomery(buff);
    }

    toRprLE(buff, offset, a) {
        buff.set(this.fromMontgomery(a), offset);
    }

    fromRprLE(buff, offset) {
        const res = buff.slice(offset, offset + this.n8);
        return this.toMontgomery(res);
    }


}


