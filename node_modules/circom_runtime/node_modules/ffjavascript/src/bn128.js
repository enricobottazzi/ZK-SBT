import wasmcurves from "wasmcurves";
import buildEngine from "./engine.js";
import * as Scalar from "./scalar.js";

globalThis.curve_bn128 = null;

export default async function buildBn128(singleThread) {

    if ((!singleThread)&&(globalThis.curve_bn128)) return globalThis.curve_bn128;
    const params = {
        name: "bn128",
        wasm: wasmcurves.bn128_wasm,
        q: Scalar.e("21888242871839275222246405745257275088696311157297823662689037894645226208583"),
        r: Scalar.e("21888242871839275222246405745257275088548364400416034343698204186575808495617"),
        n8q: 32,
        n8r: 32,
        cofactorG2: Scalar.e("30644e72e131a029b85045b68181585e06ceecda572a2489345f2299c0f9fa8d", 16),
        singleThread: singleThread ? true : false
    };

    const curve = await buildEngine(params);
    curve.terminate = async function() {
        if (!params.singleThread) {
            globalThis.curve_bn128 = null;
            await this.tm.terminate();
        }
    };

    if (!singleThread) {
        globalThis.curve_bn128 = curve;
    }

    return curve;
}

