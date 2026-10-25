// Usage: bun release-notes.ts <version>  -> release notes markdown on stdout.
// Uses releases/<version>.md if present, else groups Conventional Commits since the previous tag.
import { $ } from "bun";
import { existsSync, readFileSync } from "node:fs";

const version = process.argv[2];
const file = `releases/${version}.md`;
if (existsSync(file)) {
	process.stdout.write(readFileSync(file, "utf8"));
	process.exit(0);
}

const prev = (await $`git describe --tags --abbrev=0`.nothrow().quiet().text()).trim();
const range = prev ? `${prev}..HEAD` : "HEAD";
const subjects = (await $`git log ${range} --no-merges --format=%s`.text()).split("\n").filter(Boolean);

const groups: Record<string, string[]> = { Features: [], Fixes: [], Other: [] };
for (const s of subjects) {
	if (/^chore\(release\)/.test(s)) continue;
	const type = /^(\w+)(\([^)]*\))?!?:/.exec(s)?.[1];
	groups[type === "feat" ? "Features" : type === "fix" ? "Fixes" : "Other"]!.push(s);
}

const body = Object.entries(groups)
	.filter(([, items]) => items.length)
	.map(([title, items]) => `## ${title}\n\n${items.map((i) => `- ${i}`).join("\n")}`)
	.join("\n\n");
console.log(body || "No notable changes.");
