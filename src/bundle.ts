import BabelTraverse from "@babel/traverse";
import { globSync } from "glob";
import NodePath from "path";
import { Module } from "./module";

// @ts-ignore
const traverse = BabelTraverse.default as typeof BabelTraverse;

export class Bundle {
  private files: Array<string> = [];
  private modules = new Map<string, Module>();
  private aliasMap = new Map<string, { original: string; module: Module }>();
  private loaded = false;
  public onloaded: () => void = () => undefined;

  constructor(dirpath: string) {
    this.files = globSync(`${dirpath}/**/*.ts`);
  }

  async load() {
    console.time("load");
    await Promise.allSettled(
      this.files.map(async (filepath) => {
        const content = await Bun.file(NodePath.resolve(filepath)).text();
        const module = new Module(filepath, content);
        this.modules.set(module.id, module);
        this.aliasModuleDeclarations(module.id);
      })
    );

    this.loaded = true;
    this.onloaded();
    console.timeEnd("load");
  }

  getModule(id: string): Module {
    const module = this.modules.get(id);

    if (!module) {
      throw new Error(`Module '${id}' doesn't exists`);
    }

    return module;
  }

  private aliasModuleDeclarations(id: string) {
    const module = this.getModule(id);

    traverse(module.ast, {
      Program: (path) => {
        Object.values(path.scope.getAllBindings()).forEach((binding) => {
          if (binding.path.type === "ImportSpecifier") {
            return;
          }

          const name = binding.identifier.name;
          const alias = `${module.hash}_${name}`;
          this.aliasMap.set(alias, { original: name, module });
          module.declarationsAliases.set(name, alias);
          path.scope.rename(name, alias);
        });

        path.stop();
      },
    });
  }

  private handleModuleImportDeclarations(id: string) {
    const module = this.getModule(id);

    traverse(module.ast, {
      ImportDeclaration: (path) => {
        const node = path.node;

        const importedModuleId = NodePath.join(
          module.dirpath,
          node.source.value
        );

        const importedModule = this.getModule(importedModuleId);

        module.importsAST.set(importedModuleId, node);

        path.node.specifiers.forEach((specifier) => {
          if (specifier.type !== "ImportSpecifier") {
            return;
          }

          const originalName =
            "value" in specifier.imported
              ? specifier.imported.value
              : specifier.imported.name;

          const alias = importedModule.declarationsAliases.get(originalName);

          if (!alias) {
            throw new Error("Alias not found");
          }

          path.scope.rename(specifier.local.name, alias);
        });

        path.remove();
        path.skip();
      },

      enter: (path) => {
        if (path.type !== "Program" && path.type !== "ImportDeclaration") {
          path.skip();
        }
      },
    });
  }

  private handleClassExtends(id: string) {
    const module = this.getModule(id);

    traverse(module.ast, {
      ClassDeclaration: (path) => {
        if (
          !path.node.superClass ||
          path.node.superClass.type !== "Identifier"
        ) {
          path.skip();
          return;
        }

        const extendsClassname = path.node.superClass.name;
        const extendsModule = this.aliasMap.get(extendsClassname);

        if (!extendsModule) {
          throw new Error(`Alias '${extendsClassname}' isn't registred`);
        }

        module.extends = {
          ast: path.node.superClass,
          module: extendsModule.module,
        };
        extendsModule.module.implementations.add(module);

        path.skip();
      },
    });
  }

  transform() {
    if (!this.loaded) {
      throw new Error("Cannot transform while the files are loading");
    }

    console.time("transform");
    const modules = Array.from(this.modules.keys());
    modules.forEach((id) => this.handleModuleImportDeclarations(id));
    modules.forEach((id) => this.handleClassExtends(id));
    console.timeEnd("transform");
  }

  generate() {
    console.time("generate");
    const tree: Array<Module> = Array.from(this.modules.values()).filter(
      (module) => !module.extends
    );

    const layers: Array<Set<Module>> = [new Set()];

    (function processModules(modules: Array<Module>, level = 0) {
      if (!layers[level]) {
        layers[level] = new Set();
      }

      const layer = layers[level];
      modules.forEach((m) => {
        layer.add(m);

        if (m.implementations.size > 0) {
          processModules(Array.from(m.implementations), level + 1);
        }
      });
    })(tree);

    // Concatenate
    const code = layers
      .map((layer, level) =>
        Array.from(layer.values())
          .map((m) => {
            const { code, map } = m.generate();
            return `// (level ${level}) file: ${m.id}\n${code}\n`;
          })
          .join(`\n`)
      )
      .join("\n");

    console.timeEnd("generate");
    return code;
  }
}
