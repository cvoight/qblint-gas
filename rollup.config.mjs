import { nodeResolve } from "@rollup/plugin-node-resolve";
import stripFinalExports from "rollup-plugin-strip-final-exports";

export default {
  input: "src/Code.bs.js",
  output: {
    dir: ".",
    format: "cjs"
  },
  plugins: [
    nodeResolve(),
    stripFinalExports()
  ]
};