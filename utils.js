// Dump cache
const cache = {};

export const getReleases = async (
	octokit,
	owner,
	repo,
	releases = [],
	page = 1
) => {
	if (cache.releases) {
		return cache.releases;
	}
	const batch = await octokit.request("GET /repos/{owner}/{repo}/releases", {
		owner,
		repo,
		per_page: 100,
		page,
	});

	if (batch.status !== 200) {
		return releases;
	}

	const newReleases = [...releases, ...batch.data];

	if (batch.data.length >= 100) {
		return getReleasesCount(octokit, owner, repo, newReleases, page + 1);
	}

	cache.releases = newReleases;

	return newReleases;
};

export const getReleasesCount = async (octokit, owner, repo, from, to) => {
	const releases = await getReleases(octokit, owner, repo);

	const filteredReleases = releases.filter((release) => {
		const releaseTime = new Date(release.published_at).getTime();
		return releaseTime >= from && releaseTime <= to;
	});

	return filteredReleases.length;
};

export const getIssues = async (
	octokit,
	owner,
	repo,
	since,
	issues = [],
	page = 1
) => {
	if (cache.issues) {
		return cache.issues;
	}
	const batch = await octokit.request("GET /repos/{owner}/{repo}/issues", {
		owner,
		repo,
		per_page: 100,
		page,
		since,
		state: "all",
	});

	if (batch.status !== 200) {
		return issues;
	}

	const newIssues = [
		...issues,
		...batch.data.filter((issue) => !issue.pull_request),
	];

	if (batch.data.length >= 100) {
		return getIssues(octokit, owner, repo, since, newIssues, page + 1);
	}

	cache.issues = newIssues;

	return newIssues;
};

export const getClosedIssuesCount = async (octokit, owner, repo, from, to) => {
	const issues = await getIssues(
		octokit,
		owner,
		repo,
		new Date(from).toISOString()
	);

	const filteredIssues = issues.filter((issue) => {
		return (
			new Date(issue.closed_at).getTime() <= to && issue.state === "closed"
		);
	});

	return filteredIssues.length;
};

export const getOpenIssuesCount = async (octokit, owner, repo, from, to) => {
	const issues = await getIssues(
		octokit,
		owner,
		repo,
		new Date(from).toISOString()
	);

	const filteredIssues = issues.filter((issue) => {
		return new Date(issue.created_at).getTime() <= to && issue.state === "open";
	});

	return filteredIssues.length;
};
