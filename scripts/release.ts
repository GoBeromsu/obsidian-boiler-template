// Usage: bun run release <patch|minor|major>
// Opens a version-bump PR. CI (plugin-release.yml) tags and publishes after it merges to main.
import { $ } from "bun";
import { readFileSync, writeFileSync } from "node:fs";

const bump = process.argv[2];
if (!["patch", "minor", "major"].includes(bump ?? "")) throw new Error("usage: release <patch|minor|major>");

const out = async (p: ReturnType<typeof $>) => (await p.text()).trim();
const readJson = (f: string) => JSON.parse(readFileSync(f, "utf8"));
const writeJson = (f: string, d: unknown) => writeFileSync(f, JSON.stringify(d, null, "\t") + "\n");

if ((await out($`git branch --show-current`)) !== "main") throw new Error("run from main");
if (await out($`git status --porcelain`)) throw new Error("working tree not clean");
await $`git fetch origin main`.quiet();
if ((await out($`git rev-parse HEAD`)) !== (await out($`git rev-parse origin/main`))) throw new Error("main is not up to date with origin/main");

const manifest = readJson("manifest.json");
const [maj, min, pat] = (manifest.version as string).split(".").map(Number) as [number, number, number];
const version = bump === "major" ? `${maj + 1}.0.0` : bump === "minor" ? `${maj}.${min + 1}.0` : `${maj}.${min}.${pat + 1}`;

const pkg = readJson("package.json");
const versions = readJson("versions.json");
pkg.version = manifest.version = version;
versions[version] = manifest.minAppVersion;
writeJson("package.json", pkg);
writeJson("manifest.json", manifest);
writeJson("versions.json", versions);

const branch = `chore/release-${version}`;
await $`git switch -c ${branch}`;
await $`git add package.json manifest.json versions.json`;
await $`git commit -m ${`chore(release): ${version}`}`;
await $`git push -u origin ${branch}`;
const pr = await out($`gh pr create --base main --head ${branch} --title ${`chore(release): ${version}`} --body ${"Version bump. The Release workflow tags and publishes after merge."}`);
console.log(pr);
// no auto-merge (needs a per-repo setting): wait for required checks, then admin-merge
for (;;) {
	const r = await $`gh pr checks ${pr} --watch`.nothrow().quiet();
	if (r.exitCode === 0) break;
	if (!r.stderr.includes("no checks reported")) throw new Error(`checks failed on ${pr}`);
	await Bun.sleep(3000);
}
await $`gh pr merge ${pr} --merge --admin --delete-branch`;
