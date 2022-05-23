#!/usr/bin/env node
import meow from "meow";
import { Octokit } from "octokit";
import * as utils from "./utils.js";
import fs from "fs";
import showdown from "showdown";
import { capitalCase } from "change-case";

async function run() {
	const cli = meow(
		`
	Usage
	  $ metrics-generator

	Options:
	  --pat       Personal access token.
	  --repo      Full repository name. Ex: 10up/ads-txt.
	  --from      Start date. Accepts Date.parse() compatible formats.
	  --to        End date. Accepts Date.parse() compatible formats.
	  --wpSlug    The plugin handle on wordpress.org.
	  --outputDir Directory for output files.
	  --html      Enable HTML output. Boolean. Enabled by default.
	  --json      Enable JSON output. Boolean. Disabled by default.
	  --md        Enable Markdown output. Boolean. Disabled by default.
	  --help      Show help.
`,
		{
			importMeta: import.meta,
			flags: {
				repo: {
					type: "string",
					default: "",
				},
				pat: {
					type: "string",
				},
				from: {
					type: "string",
					default: "",
				},
				to: {
					type: "string",
					default: "",
				},
				wpSlug: {
					type: "string",
					default: "",
				},
				outputDir: {
					type: "string",
					default: ".",
				},
				html: {
					type: "boolean",
					default: true,
				},
				json: {
					type: "boolean",
					default: false,
				},
				md: {
					type: "boolean",
					default: false,
				},
			},
		}
	);

	const octokit = new Octokit({
		...(cli.flags.pat ? { auth: cli.flags.pat } : {}),
	});

	const [owner, repo] = cli.flags.repo.split("/");

	// Get general repository information.
	const repoInfo = await octokit.request("GET /repos/{owner}/{repo}", {
		owner,
		repo,
	});

	// Exit early if we can access the repo.
	if (repoInfo.status !== 200) {
		console.error(repoInfo.statusText);
		process.exit(1);
	}

	const from = cli.flags.from
		? new Date(cli.flags.from).getTime()
		: new Date(repoInfo.data.created_at).getTime();
	const to = cli.flags.to ? new Date(cli.flags.to).getTime() : Date.now();

	const result = {
		watchers: repoInfo.data.subscribers_count,
		stars: repoInfo.data.stargazers_count,
		forks: repoInfo.data.forks_count,
		releases: await utils.getReleasesCount(octokit, owner, repo, from, to),
		...(cli.flags.wpSlug ? {
			orgDownloads : await utils.getOrgDownloadsCount(cli.flags.wpSlug),
			orgActiveInstalls: await utils.getOrgActiveInstallsCount(
				cli.flags.wpSlug
			),
			orgAverageRatings: await utils.getOrgRatings(cli.flags.wpSlug),
		} : {}),
		openIssues: await utils.getOpenIssuesCount(octokit, owner, repo, from, to),
		closedIssues: await utils.getClosedIssuesCount(
			octokit,
			owner,
			repo,
			from,
			to
		),
		openPullRequests: await utils.getOpenPullsCount(octokit, owner, repo, from, to),
		closedPullRequests: await utils.getClosedPullsCount(
			octokit,
			owner,
			repo,
			from,
			to
		),
		mergedPullRequests: await utils.getMergedPullsCount(
			octokit,
			owner,
			repo,
			from,
			to
		),
		internalContributors: await utils.getInternalContributorsCount(
			octokit,
			owner,
			repo,
			from,
			to
		),
		externalContributors: await utils.getExternalContributorsCount(
			octokit,
			owner,
			repo,
			from,
			to
		),
		internalCommits: await utils.getInternalCommitsCount(
			octokit,
			owner,
			repo,
			from,
			to
		),
		externalCommits: await utils.getExternalCommitsCount(
			octokit,
			owner,
			repo,
			from,
			to
		),
	};

	let markdown = `| Metric | ${cli.flags.from} - ${cli.flags.to} |\n`;
	markdown += `| --- | --- |\n`;

	Object.keys(result).forEach((key) => {
		markdown += `| ${capitalCase(key)} | ${result[key]} |\n`;
	});

	if (cli.flags.html) {
		const converter = new showdown.Converter({ tables: true });
		const html = converter.makeHtml(markdown);
		fs.writeFileSync(
			`${cli.flags.outputDir.replace(/\/+$/, "")}/${repo}.html`,
			html
		);
		const stream = fs.createWriteStream(
			`${cli.flags.outputDir.replace(/\/+$/, "")}/${repo}.html`
		);
		stream.write("<!DOCTYPE html>");
		stream.write("<html>");
		stream.write("<head>");
		stream.write('<meta charset="utf-8">');
		stream.write(`<title>${cli.flags.repo} Metrics</title>`);
		stream.write('<link rel="stylesheet" href="https://unpkg.com/bamboo.css">');
		stream.write("<head>");
		stream.write("<body>");
		stream.write(html);
		stream.write("</body>");
		stream.write("</html>");
	}

	if (cli.flags.json) {
		fs.writeFileSync(
			`${cli.flags.outputDir.replace(/\/+$/, "")}/${repo}.json`,
			JSON.stringify(result, null, 2)
		);
	}

	if (cli.flags.md) {
		fs.writeFileSync(
			`${cli.flags.outputDir.replace(/\/+$/, "")}/${repo}.md`,
			markdown
		);
	}
}

run();
