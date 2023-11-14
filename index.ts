import {Bundle} from "./src/bundle";
import {program} from "commander";
import {minify} from "terser";

program.name("Jiapu Compiler")
    .description("Compiler for class-based JS code");

program.command("compile")
    .argument("<path>", "the path to the root directory of the source code")
    .option("-o, --outfile <path>", "the path to write the compiled code")
    .action(async (path, options) => {
        console.time("total");

        const bundle = new Bundle(path);
        await bundle.load();
        bundle.transform();
        const code = bundle.generate();
        const optimised = await minify(code, { toplevel: true, mangle: true, module: true })

        if("outfile" in options) {
            await Bun.write(options.outfile as string, code);
        } else {
            console.log(code);
        }

        console.timeEnd("total");
    });

program.parse(Bun.argv);
