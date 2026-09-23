import { cp, mkdir, rm } from "node:fs/promises";

await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
await cp("apps/kova", "dist/kova", { recursive: true });
console.log("Bygget KOVA PWA i dist/kova/. KlarX-root publiseres ikke.");
