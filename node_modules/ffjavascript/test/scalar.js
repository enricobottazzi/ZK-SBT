import assert from "assert";

import * as ScalarN from "../src/scalar_native.js";
import * as ScalarB from "../src/scalar_bigint.js";

describe("Basic scalar convertions", () => {
    it("Should convertion Native", () => {
        assert(ScalarN.eq(ScalarN.e("0x12"), 18));
        assert(ScalarN.eq(ScalarN.e("0x12", 16), 18));
        assert(ScalarN.eq(ScalarN.e("12", 16), 18));
        assert(ScalarN.eq(ScalarN.e("18"), 18));
        assert(ScalarN.eq(ScalarN.e("18", 10), 18));
        assert(ScalarN.eq(ScalarN.e(18, 10), 18));
        assert(ScalarN.eq(ScalarN.e(18n, 10), 18));
        assert(ScalarN.eq(ScalarN.e(0x12, 10), 18));
        assert(ScalarN.eq(ScalarN.e(0x12n, 10), 18));

    });
    it("Should convertion BigInt", () => {
        assert(ScalarB.eq(ScalarB.e("0x12"), 18));
        assert(ScalarB.eq(ScalarB.e("0x12", 16), 18));
        assert(ScalarB.eq(ScalarB.e("12", 16), 18));
        assert(ScalarB.eq(ScalarB.e("18"), 18));
        assert(ScalarB.eq(ScalarB.e("18", 10), 18));
        assert(ScalarB.eq(ScalarB.e(18, 10), 18));
        assert(ScalarB.eq(ScalarB.e(18n, 10), 18));
        assert(ScalarB.eq(ScalarB.e(0x12, 10), 18));
        assert(ScalarB.eq(ScalarB.e(0x12n, 10), 18));
    });
    it("Should convert to js Number Native", () => {
        const maxJsNum = Number.MAX_SAFE_INTEGER;
        const maxToScalar = ScalarN.e(maxJsNum);

        const backToNum = ScalarN.toNumber(maxToScalar);
        assert(backToNum, maxJsNum);

        const overMaxJsNum = ScalarN.add(maxToScalar, 1);
        assert.throws(() => ScalarN.toNumber(overMaxJsNum));
    });
    it("Should convert to js Number BigInt", () => {
        const maxJsNum = Number.MAX_SAFE_INTEGER;
        const maxToScalar = ScalarB.e(maxJsNum);

        const backToNum = ScalarB.toNumber(maxToScalar);
        assert(backToNum, maxJsNum);

        const overMaxJsNum = ScalarB.add(maxToScalar, 1);
        assert.throws(() => ScalarB.toNumber(overMaxJsNum));
    });
});
