import { cp, mkdir, rm } from "node:fs/promises";

await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
await cp("apps/web", "dist", { recursive: true });
await cp("apps/kova", "dist/kova", { recursive: true });
console.log("Bygget KlarX i dist/ og KOVA PWA i dist/kova/.");
