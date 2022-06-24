import resolve from "rollup-plugin-node-resolve";
import commonJS from "rollup-plugin-commonjs";

export default {
    input: "./src/fastfile.js",
    output: {
        file: "build/main.cjs",
        format: "cjs",
    },
    external: ["fs", "constants"],
    plugins: [
        resolve({ preferBuiltins: true }),
        commonJS({
            preserveSymlinks: true
        }),
    ]
};

