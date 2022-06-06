import resolve from "rollup-plugin-node-resolve";
import commonJS from "rollup-plugin-commonjs";

export default {
    input: "./src/r1csfile.js",
    output: {
        file: "build/main.cjs",
        format: "cjs",
    },
    external: ["fastfile", "ffjavascript"],
    plugins: [
        resolve({ preferBuiltins: true }),
        commonJS({
            preserveSymlinks: true
        }),
    ]
};

