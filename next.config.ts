import type { NextConfig } from "next";
import os from "node:os";

// Next 15 blocks dev assets/HMR requested from other origins; allow this machine's LAN IPs
// so a phone on the same Wi-Fi can open the dev server (see `pnpm dev:lan`).
const lanIps = Object.values(os.networkInterfaces())
  .flat()
  .filter((a) => a && a.family === "IPv4" && !a.internal)
  .map((a) => a!.address);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["tesseract.js"],
  allowedDevOrigins: lanIps,
};

export default nextConfig;
