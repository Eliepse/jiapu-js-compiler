import {Bundle} from "./src/bundle";
import {program} from "commander";
import {minify} from "terser";

program.name("Jiapu Compiler")
    .description("Compiler for class-based JS code");

program.command("compile")
    .argument("<path>", "the path to the root directory of the source code")
    .option("-o, --outfile <path>", "the path to write the compiled code")
    .option("--minify", "Minify the output", false)
    .action(async (path, options) => {
        console.time("total");

        const bundle = new Bundle(path);
        await bundle.load();
        bundle.transform();
        let code = bundle.generate();

        if("minify" in options && options.minify) {
            console.time("minify")
            const minification = await minify(code, { toplevel: true, mangle: true, module: true });

            if(!minification.code) {
                throw new Error("Failed to minify");
            }

            code = minification.code;
            console.timeEnd("minify")
        }

        if("outfile" in options) {
            await Bun.write(options.outfile as string, code);
        } else {
            console.log(code);
        }

        console.timeEnd("total");
    });

program.parse(Bun.argv);
