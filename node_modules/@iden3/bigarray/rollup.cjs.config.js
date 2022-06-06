import resolve from "rollup-plugin-node-resolve";
import commonJS from "rollup-plugin-commonjs";

export default {
    input: "./src/bigarray.js",
    output: {
        file: "build/main.cjs",
        format: "cjs",
        exports: "default"
    },
    plugins: [
        resolve({ preferBuiltins: true }),
        commonJS({
            preserveSymlinks: true
        }),
    ]
};

