import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const dist = fileURLToPath(new URL("../dist/", import.meta.url));
const required = [
	"index.html",
	"install/index.html",
	"docs/index.html",
	"releases/index.html",
	"plugins/index.html",
	"assets/anvil-demo-poster.webp",
	"assets/anvil-demo.mp4",
	"assets/anvil-demo.webm",
	"404.html",
	"robots.txt",
	"sitemap-index.xml",
	"sitemap-0.xml",
];

const errors = [];
const html = [];

function walk(dir) {
	for (const entry of readdirSync(dir)) {
		const path = join(dir, entry);
		if (statSync(path).isDirectory()) walk(path);
		else if (path.endsWith(".html")) html.push(path);
	}
}

for (const file of required) {
	if (!existsSync(join(dist, file))) errors.push(`missing generated file: ${file}`);
}

walk(dist);

for (const file of html) {
	const name = relative(dist, file);
	const text = readFileSync(file, "utf8");

	if (!text.includes('lang="zh-CN"')) errors.push(`${name}: missing lang="zh-CN"`);
	if (!text.includes('href="#main"')) errors.push(`${name}: missing skip link`);
	if (!text.includes("application/ld+json")) errors.push(`${name}: missing JSON-LD`);
	if (!text.includes('property="og:image:alt"')) errors.push(`${name}: missing og:image:alt`);
	if (text.includes("undefined") || text.includes("[object Object]")) {
		errors.push(`${name}: contains an unrendered value`);
	}

	for (const match of text.matchAll(/(?:href|src)="([^"]+)"/g)) {
		const url = match[1];
		if (!url.startsWith("/") || url.startsWith("//") || url.startsWith("#")) continue;
		const [pathname] = url.split(/[?#]/);
		const local = pathname === "/" ? "index.html" : pathname.slice(1);
		const candidates = [local, `${local}.html`, `${local}/index.html`];
		if (!candidates.some((candidate) => existsSync(join(dist, candidate)))) {
			errors.push(`${name}: broken internal link ${url}`);
		}
	}
}

const home = readFileSync(join(dist, "index.html"), "utf8");
if (!home.includes('preload="none"')) errors.push("index.html: demo video must not preload");
if (!home.includes("anvil-demo-poster.webp")) errors.push("index.html: missing demo poster");
if ((home.match(/<details>/g) ?? []).length !== 4) errors.push("index.html: expected four FAQ entries");

const install = readFileSync(join(dist, "install/index.html"), "utf8");
if (!install.includes('data-copy="build-command"')) errors.push("install/index.html: missing build copy control");


for (const file of html.filter((path) => relative(dist, path).startsWith("docs/"))) {
	const name = relative(dist, file);
	const text = readFileSync(file, "utf8");
	const description = text.match(/<meta name="description" content="([^"]*)"/)?.[1]?.trim();

	if (!description) errors.push(`${name}: empty meta description`);
	if (!/<link rel="canonical" href="https:\/\/anvilkernel\.com\/[^"]+"/.test(text)) {
		errors.push(`${name}: missing absolute canonical`);
	}
	for (const property of ["og:title", "og:description", "og:image"]) {
		if (!text.includes(`property="${property}"`)) errors.push(`${name}: missing ${property}`);
	}
	if (!text.includes('name="twitter:card"')) errors.push(`${name}: missing twitter:card`);

	for (const match of text.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)) {
		const label = match[2].replace(/<[^>]*>/g, " ").replace(/&[^;]+;/g, " ").trim();
		if (!label && !/\baria-label=/.test(match[1])) errors.push(`${name}: icon-only button lacks aria-label`);
	}
	for (const match of text.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)) {
		if (!/\brel="[^"]*(?:prev|next)/.test(match[1])) continue;
		const label = match[2].replace(/<[^>]*>/g, " ").replace(/&[^;]+;/g, " ").trim();
		if (!label && !/\baria-label=/.test(match[1])) errors.push(`${name}: prev/next link lacks aria-label`);
	}
}

const docs = readFileSync(join(dist, "docs/index.html"), "utf8");
if (!docs.includes('data-copy="docs-quickstart"')) errors.push("docs/index.html: missing quickstart copy control");
if (!docs.includes('data-copy="docs-lsp"')) errors.push("docs/index.html: missing LSP copy control");
const notFound = readFileSync(join(dist, "404.html"), "utf8");
if (!notFound.includes('name="robots" content="noindex"')) errors.push("404.html: missing noindex");

const robots = readFileSync(join(dist, "robots.txt"), "utf8");
if (!robots.includes("Sitemap: https://anvilkernel.com/sitemap-index.xml")) {
	errors.push("robots.txt: missing canonical sitemap");
}

const sitemap = readFileSync(join(dist, "sitemap-0.xml"), "utf8");
for (const path of ["/", "/install/", "/docs/", "/releases/", "/plugins/"]) {
	if (!sitemap.includes(`<loc>https://anvilkernel.com${path}</loc>`)) {
		errors.push(`sitemap-0.xml: missing ${path}`);
	}
}
if (sitemap.includes("/404")) errors.push("sitemap-0.xml: 404 must not be indexed");

if (errors.length) {
	console.error(errors.join("\n"));
	process.exit(1);
}

console.log(`site check: ${html.length} HTML pages, ${required.length} required files, no broken internal links`);
