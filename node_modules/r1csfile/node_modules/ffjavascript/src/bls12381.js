import wasmcurves from "wasmcurves";
import buildEngine from "./engine.js";
import * as Scalar from "./scalar.js";

let curve;

export default async function buildBls12381() {

    if (curve) return curve;
    const params = {
        name: "bls12381",
        wasm: wasmcurves.bls12381_wasm,
        q: Scalar.e("1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaab", 16),
        r: Scalar.e("73eda753299d7d483339d80809a1d80553bda402fffe5bfeffffffff00000001", 16),
        n8q: 48,
        n8r: 32,
        cofactorG1: Scalar.e("0x396c8c005555e1568c00aaab0000aaab", 16),
        cofactorG2: Scalar.e("0x5d543a95414e7f1091d50792876a202cd91de4547085abaa68a205b2e5a7ddfa628f1cb4d9e82ef21537e293a6691ae1616ec6e786f0c70cf1c38e31c7238e5", 16),
        singleThread: false
    };

    curve = await buildEngine(params);

    curve.terminate = async function() {
        curve = null;
        await this.tm.terminate();
    };
    return curve;
}

