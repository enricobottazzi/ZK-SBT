import assert from "assert";

import * as ScalarN from "../src/scalar_native.js";
import * as ScalarB from "../src/scalar_bigint.js";

import * as utilsN from "../src/utils_native.js";
import * as utilsB from "../src/utils_bigint.js";

describe("Utils native", () => {
    const num = ScalarN.e(21888242871839275222246405745257275088614511777268538073601725287587578984328);

    it("Should convert integer to buffer little-endian", () => {
        const buff = utilsN.leInt2Buff(num, 32);
        const numFromBuff = utilsN.leBuff2int(buff);

        assert(ScalarN.eq(num, numFromBuff), true);
    });

    it("Should convert integer to buffer big-endian", () => {
        const buff = utilsN.beInt2Buff(num, 32);
        const numFromBuff = utilsN.beBuff2int(buff);

        assert(ScalarN.eq(num, numFromBuff), true);
    });

    it("Should stringify bigInt", () => {
        const str = utilsN.stringifyBigInts(num);
        const numFromStr = utilsN.unstringifyBigInts(str);

        assert(ScalarN.eq(num, numFromStr), true);
    });
});

describe("Utils bigInt", () => {
    const num = ScalarB.e(21888242871839275222246405745257275088614511777268538073601725287587578984328);

    it("Should convert integer to buffer little-endian", () => {
        const buff = utilsB.leInt2Buff(num, 32);
        const numFromBuff = utilsB.leBuff2int(buff);

        assert(ScalarB.eq(num, numFromBuff), true);
    });

    it("Should convert integer to buffer big-endian", () => {
        const buff = utilsB.beInt2Buff(num, 32);
        const numFromBuff = utilsB.beBuff2int(buff);

        assert(ScalarB.eq(num, numFromBuff), true);
    });

    it("Should stringify bigInt", () => {
        const str = utilsB.stringifyBigInts(num);
        const numFromStr = utilsB.unstringifyBigInts(str);

        assert(ScalarB.eq(num, numFromStr), true);
    });
});
