import fs from "fs";
import path from "path";
import { parse } from "@typescript-eslint/typescript-estree";
import { FileInfo } from "./types";

const exts = [".ts", ".tsx", ".js", ".jsx"];

export async function analyzeRepo(root: string) {
  const files: FileInfo[] = [];

  function walk(dir: string) {
    for (const name of fs.readdirSync(dir)) {
      const p = path.join(dir, name);
      const stat = fs.statSync(p);
      if (stat.isDirectory() && !["node_modules", ".git", "dist", "build", "out", "coverage"].includes(name)) {
        walk(p);
      } else if (stat.isFile() && exts.includes(path.extname(name))) {
        const code = fs.readFileSync(p, "utf8");
        let imports: string[] = [], exportsArr: string[] = [];
        try {
          const ast = parse(code, { jsx: true, loc: false, range: false });
          // ultra-light extraction: import/export identifiers
          // @ts-ignore
          (ast as any).body?.forEach((n: any) => {
            if (n.type === "ImportDeclaration") imports.push(n.source.value);
            if (n.type === "ExportNamedDeclaration") {
              if (n.declaration?.declarations) {
                exportsArr.push(...n.declaration.declarations.map((d: any) => d.id?.name).filter(Boolean));
              }
              if (n.declaration?.id?.name) {
                exportsArr.push(n.declaration.id.name);
              }
            }
          });
        } catch {}
        files.push({ path: p.replace(root + path.sep, ""), lang: path.extname(name), imports, exports: exportsArr });
      }
    }
  }
  walk(root);
  return { files };
}
