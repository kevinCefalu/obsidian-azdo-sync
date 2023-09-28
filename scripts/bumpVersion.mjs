import { readFileSync, writeFileSync } from "fs";

const targetVersion = process.env.npm_package_version;

// read minAppVersion from manifest.json and bump version to target version
let manifest = JSON.parse(readFileSync("src/assets/manifest.json", "utf8"));
const { minAppVersion } = manifest;
manifest.version = targetVersion;
writeFileSync("src/assets/manifest.json", JSON.stringify(manifest, null, "  "));

// update versions.json with target version and minAppVersion from manifest.json
let versions = JSON.parse(readFileSync("src/assets/versions.json", "utf8"));
versions[targetVersion] = minAppVersion;
writeFileSync("src/assets/versions.json", JSON.stringify(versions, null, "  "));
