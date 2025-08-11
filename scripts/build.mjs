import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pkg from "../package.json" with { type: "json" };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, "..");
const srcDir = path.resolve(rootDir, "src");
const distDir = path.resolve(rootDir, "dist");

function ensureDist() {
  if(fs.existsSync(distDir)){
    fs.rmSync(distDir, { recursive: true, force: true })
  }
  fs.mkdirSync(distDir, { recursive: true });
}

function copySrcFiles() {
  const srcFiles = fs.readdirSync(srcDir);
  for (const file of srcFiles) {
    const srcFilePath = path.join(srcDir, file);
    const distFilePath = path.join(distDir, file);

    if (fs.statSync(srcFilePath).isFile()) {
      fs.copyFileSync(srcFilePath, distFilePath);
      console.log(`✅ Copied: ${file}`);
    }
  }
}

function copyPluginRootFiles() {
  const rootFiles = ["LICENSE", "README.md"];
  for (const file of rootFiles) {
    const rootFilePath = path.join(rootDir, file);
    const distFilePath = path.join(distDir, file);

    if (fs.existsSync(rootFilePath)) {
      fs.copyFileSync(rootFilePath, distFilePath);
      console.log(`✅ Copied: ${file}`);
    }
  }
}

function createPackageJson(){
  const data = {...pkg}
  delete data.scripts
  delete data.private;
  delete data.devDependencies;

  const packageJson = {
    ...data,
    main: "./index.js",
    types: "./index.d.ts",
  }
  fs.writeFileSync(path.join(distDir, "package.json"), JSON.stringify(packageJson, null, 2));
}

async function build() {
  ensureDist();
  copySrcFiles();
  copyPluginRootFiles();
  createPackageJson();
  console.log("🎉 Build completed successfully!");
}

build();
