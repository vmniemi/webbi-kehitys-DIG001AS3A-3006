import fs from "fs";
import path from "path";

const source = path.resolve("dist");
const target = path.resolve("../viikko5-site");

function copyFolder(src, dest) {
  if (!fs.existsSync(src)) {
    console.error("dist-kansiota ei löytynyt. Aja ensin npm run build.");
    process.exit(1);
  }

  fs.rmSync(dest, { recursive: true, force: true });
  fs.mkdirSync(dest, { recursive: true });

  fs.cpSync(src, dest, { recursive: true });

  console.log("Build kopioitu onnistuneesti:");
  console.log(`${src} -> ${dest}`);
}

copyFolder(source, target);