import JSON5 from "json5";

import { readFileSync } from "fs";

const pkg = JSON5.parse(readFileSync("./package.json", "utf8").toString());
export default pkg;
