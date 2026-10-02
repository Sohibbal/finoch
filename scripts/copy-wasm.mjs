import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const sourceDir = path.join(rootDir, "node_modules", "@xenova", "transformers", "dist");
const targetDir = path.join(rootDir, "public", "wasm");

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const filesToCopy = ["ort-wasm-simd.wasm", "ort-wasm.wasm"];

for (const file of filesToCopy) {
  const src = path.join(sourceDir, file);
  const dest = path.join(targetDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied ${file} to public/wasm/`);
  } else {
    console.warn(`Source file not found: ${src}`);
  }
}
