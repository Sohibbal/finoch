// Runs `next dev` over HTTPS on the LAN so a phone on the same Wi-Fi can test the app.
// HTTPS matters: browsers only allow the microphone/camera (Bicara, Scan Struk) on secure origins.
// The certificate is self-signed for this machine's LAN IP: the phone shows a warning once
// ("Advanced" -> "Proceed"); nothing is installed into the system trust store.
import { execFileSync, spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const port = process.env.PORT || "3100";
const ips = Object.values(os.networkInterfaces())
  .flat()
  .filter((a) => a && a.family === "IPv4" && !a.internal)
  .map((a) => a.address);

if (ips.length === 0) {
  console.error("Tidak menemukan IP jaringan. Pastikan laptop terhubung ke Wi-Fi.");
  process.exit(1);
}

const certDir = path.resolve(".certs");
const key = path.join(certDir, "dev-lan-key.pem");
const cert = path.join(certDir, "dev-lan-cert.pem");
const ipList = path.join(certDir, "ips.txt");
const san = ["DNS:localhost", "IP:127.0.0.1", ...ips.map((ip) => `IP:${ip}`)].join(",");

// Regenerate when the LAN IP changed (e.g. another Wi-Fi network).
let stale = true;
try {
  stale = !existsSync(cert) || readFileSync(ipList, "utf8") !== san;
} catch {}

if (stale) {
  mkdirSync(certDir, { recursive: true });
  try {
    execFileSync("openssl", [
      "req", "-x509", "-newkey", "rsa:2048", "-nodes", "-days", "365",
      "-keyout", key, "-out", cert, "-subj", "/CN=finoch-dev", "-addext", `subjectAltName=${san}`,
    ], { stdio: "ignore" });
    writeFileSync(ipList, san);
  } catch {
    console.error("Gagal membuat sertifikat: openssl tidak ditemukan. Jalankan dari Git Bash atau pasang OpenSSL.");
    process.exit(1);
  }
}

console.log("\n  Buka di HP (Wi-Fi yang sama):");
for (const ip of ips) console.log(`    https://${ip}:${port}`);
console.log("  Saat muncul peringatan sertifikat: Lanjutan/Advanced -> Lanjutkan/Proceed.\n");

const next = path.resolve("node_modules/next/dist/bin/next");
spawn(process.execPath, [
  next, "dev", "-H", "0.0.0.0", "-p", port,
  "--experimental-https", "--experimental-https-key", key, "--experimental-https-cert", cert,
], { stdio: "inherit" })
  .on("exit", (code) => process.exit(code ?? 0));
