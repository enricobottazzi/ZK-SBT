import * as Scalar from "./scalar.js";

import F1Field_native from "./f1field_native.js";
import F1Field_bigint from "./f1field_bigint.js";

const supportsNativeBigInt = typeof BigInt === "function";
let _F1Field;
if (supportsNativeBigInt) {
    _F1Field = F1Field_native;
} else {
    _F1Field = F1Field_bigint;
}

export default  class F1Field extends _F1Field {

    // Returns a buffer with Little Endian Representation
    toRprLE(buff, o, e) {
        Scalar.toRprLE(buff, o, e, this.n64*8);
    }

    // Returns a buffer with Big Endian Representation
    toRprBE(buff, o, e) {
        Scalar.toRprBE(buff, o, e, this.n64*8);
    }

    // Returns a buffer with Big Endian Montgomery Representation
    toRprBEM(buff, o, e) {
        return this.toRprBE(buff, o, this.mul(this.R, e));
    }

    toRprLEM(buff, o, e) {
        return this.toRprLE(buff, o, this.mul(this.R, e));
    }


    // Pases a buffer with Little Endian Representation
    fromRprLE(buff, o) {
        return Scalar.fromRprLE(buff, o, this.n8);
    }

    // Pases a buffer with Big Endian Representation
    fromRprBE(buff, o) {
        return Scalar.fromRprBE(buff, o, this.n8);
    }

    fromRprLEM(buff, o) {
        return this.mul(this.fromRprLE(buff, o), this.Ri);
    }

    fromRprBEM(buff, o) {
        return this.mul(this.fromRprBE(buff, o), this.Ri);
    }

}

