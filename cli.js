#!/usr/bin/env node
import meow from "meow";
import { Octokit } from "octokit";
import * as utils from "./utils.js";

async function run() {
	const cli = meow(
		`
	Usage
	  $ metrics-generator

	Options:
	  --pat         Personal access token.
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
		repo,
		owner,
		watchers: repoInfo.data.subscribers_count,
		stargazers: repoInfo.data.stargazers_count,
		forks: repoInfo.data.forks_count,
		releases: await utils.getReleasesCount(octokit, owner, repo, from, to),
		openIssues: await utils.getOpenIssuesCount(octokit, owner, repo, from, to),
		closedIssues: await utils.getClosedIssuesCount( octokit, owner, repo, from, to ),
		openPulls: await utils.getOpenPullsCount(octokit, owner, repo, from, to),
		closedPulls: await utils.getClosedPullsCount( octokit, owner, repo, from, to ),
		mergedPulls: await utils.getMergedPullsCount( octokit, owner, repo, from, to ),
		internalCommits: await utils.getInternalCommitsCount( octokit, owner, repo, from, to ),
		externalCommits: await utils.getExternalCommitsCount( octokit, owner, repo, from, to ),
		internalContributors: await utils.getInternalContributorsCount( octokit, owner, repo, from, to ),
		externalContributors: await utils.getExternalContributorsCount( octokit, owner, repo, from, to ),
	};

	console.log(result);
}

run();
