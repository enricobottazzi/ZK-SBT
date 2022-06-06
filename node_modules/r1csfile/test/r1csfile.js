import * as r1cs from "../src/r1csfile.js";
import path from "path";
import assert from "assert";
import  { utils, ZqField, Scalar } from "ffjavascript";
const { stringifyBigInts } = utils;

const primeStr = "21888242871839275222246405745257275088548364400416034343698204186575808495617";

const expected = {
    "n8": 32,
    "prime": primeStr,
    "nVars": 7,
    "nOutputs": 1,
    "nPubInputs": 2,
    "nPrvInputs": 3,
    "nLabels": 1000,
    "nConstraints": 3,
    "constraints": [
        [
            {
                "5": "3",
                "6": "8"
            },
            {
                "0": "2",
                "2": "20",
                "3": "12"
            },
            {
                "0": "5",
                "2": "7"
            }
        ],[
            {
                "1": "4",
                "4": "8",
                "5": "3"
            },
            {
                "3": "44",
                "6": "6"
            },
            {}
        ],[
            {
                "6": "4"
            },
            {
                "0": "6",
                "2": "11",
                "3": "5"
            },
            {
                "6": "600"
            }
        ]
    ],
    "map": [
        0,
        3,
        10,
        11,
        12,
        15,
        324
    ]
};

describe("Parse R1CS file", function () {
    this.timeout(1000000000);
    it("Parse example file", async () => {
        let readed = await r1cs.load(path. join("test" , "testutils", "example.r1cs"), true, true);

        readed = stringifyBigInts(readed);

        delete readed.Fr;
        assert.deepEqual(stringifyBigInts(readed), expected);
    });
});
