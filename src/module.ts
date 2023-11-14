import BabelGenerate from "@babel/generator";
import BabelParser, { ParseResult } from "@babel/parser";
import { File as BabelFile, Identifier, ImportDeclaration } from "@babel/types";
import NodePath from "path";

// @ts-ignore
const generate = BabelGenerate.default as typeof BabelGenerate;

const TS_TRANSPILER = new Bun.Transpiler({ loader: "ts", target: "browser" });

const ID_GEN = (function* makeRangeIterator(
  start = 0,
  end = Infinity,
  step = 1
) {
  let iterationCount = 0;
  for (let i = start; i < end; i += step) {
    iterationCount++;
    yield i.toString(36);
  }
  return iterationCount;
})(0);

export class Module {
  public readonly dirpath: string;
  public readonly filename: string;
  public readonly rawCode: string;
  public readonly hash: string;

  public ast: ParseResult<BabelFile>;
  public importsAST = new Map<string, ImportDeclaration>();
  public imports = new Map<
    string,
    { ast: ImportDeclaration; module: Module }
  >();
  public extends?: { ast: Identifier; module: Module };
  public implementations = new Set<Module>();

  /*
  C'est la bonne direction à suivre:
    2 - il faut gérer les exports "default"
    3 - dans un premier temps on exclus tout fichier qui n'a pas de classe
        (on verra plus tard comment ré-organiser ces éléments avec l'ast),
    4 - une méthode efficace pourrait être de travailler d'avantage avec
        l'AST pour pouvoir réordonner des éléments avant de générer le code
        (ça permettrait d'avoir quelque chose de plus flexible, ou chaque
        classe/function serait déplacer globalement en fonction de ses dépendances
        sans avoir à se soucier de layers, il suffirait de partir des éléments
        les plus dépendants sans même avoir à toucher les moins dépendants -> en
        gros on aurait quelque chose de relatif, où on déplace les éléments en 
        fonction des autres -> pas de limitation de scope où on output un fichier
        par rapport à un autre).
  */
  public readonly declarationsAliases = new Map<string, string>();

  constructor(filepath: string, rawCode: string) {
    const path = NodePath.parse(filepath);
    this.dirpath = path.dir;
    this.filename = path.name;
    this.rawCode = rawCode;
    let code = rawCode;
    this.hash = ID_GEN.next().value.toString();

    if (path.ext === ".ts") {
      code = TS_TRANSPILER.transformSync(this.rawCode);
    }

    this.ast = BabelParser.parse(code, {
      sourceType: "module",
      strictMode: true,
      sourceFilename: filepath,
    });
  }

  get id(): string {
    return NodePath.join(this.dirpath, this.filename);
  }

  generate() {
    return generate(this.ast, {minified: true, compact: true, });
  }
}
