import { Bundle } from "./src/bundle";
console.time("total");

const bundle = new Bundle("./tests/fixtures");
await bundle.load();
bundle.transform();
bundle.generate();

// console.debug(code);
console.timeEnd("total");
process.exit();

// Rename to prevent name collision
// TODO

// Minify and write
