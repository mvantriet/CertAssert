import typescript from "rollup-plugin-typescript2";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import url from "@rollup/plugin-url";
import external from "rollup-plugin-peer-deps-external";
import svgr from "@svgr/rollup";
import json from "@rollup/plugin-json";
import { terser } from "rollup-plugin-terser";
import pkg from "./package.json";

let tsOverrides = { compilerOptions: { module: "esnext" } };

export default {
    input: "src/index.ts",
    onwarn: function ( message ) {
        if ( /dependency/.test( message ) || /preferring built-in/.test( message ) || /Use of eval/.test(message)) return;
        console.error( message );
    },
    output: [
        {
            file: pkg.main,
            format: "cjs",
            exports: "named",
            sourcemap: false,    
        },
        {
            file: pkg.module,
            format: "es",
            exports: "named",
            sourcemap: false,
        },
    ],
    plugins: [
        external(),
        url(),
        svgr(),
        json(),
        resolve(),
        typescript({
            rollupCommonJSResolveHack: true,
            clean: true,
            useTsconfigDeclarationDir: true,
            tsconfigOverride: tsOverrides
        }),
        commonjs(),
        terser({
            keep_fnames: /./ // <-- REQUIRED or terser will corrupt the session DB
        })
    ],
};
