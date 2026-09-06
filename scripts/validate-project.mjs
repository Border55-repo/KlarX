import { access, readFile } from "node:fs/promises";

const required = ["README.md", "VERSION", "CHANGELOG.md", "FRAMEWORK.md", "SECURITY.md", "package.json", "project.config.json"];
const missing = [];

for (const path of required) {
  try { await access(path); } catch { missing.push(path); }
}

if (missing.length) {
  console.error(`Mangler påkrevde filer: ${missing.join(", ")}`);
  process.exit(1);
}

const version = (await readFile("VERSION", "utf8")).trim();
if (!/^\d+\.\d+\.\d+$/.test(version)) {
  console.error("VERSION må følge SemVer.");
  process.exit(1);
}

const pkg = JSON.parse(await readFile("package.json", "utf8"));
const config = JSON.parse(await readFile("project.config.json", "utf8"));
const changelog = await readFile("CHANGELOG.md", "utf8");

if (pkg.version !== version || config.version !== version) {
  console.error("Versjonene i VERSION, package.json og project.config.json må være like.");
  process.exit(1);
}

if (!changelog.includes(`[${version}]`)) {
  console.error(`CHANGELOG.md mangler versjon ${version}.`);
  process.exit(1);
}

console.log(`Prosjektstandard godkjent for versjon ${version}.`);
