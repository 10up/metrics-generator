import fetch from "node-fetch";

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
			new Date(issue.closed_at).getTime() >= from &&
			new Date(issue.closed_at).getTime() <= to
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
		return (
			new Date(issue.created_at).getTime() >= from &&
			new Date(issue.created_at).getTime() <= to
		);
	});

	return filteredIssues.length;
};

export const getPulls = async (
	octokit,
	owner,
	repo,
	since,
	pulls = [],
	page = 1
) => {
	if (cache.pulls) {
		return cache.pulls;
	}
	const batch = await octokit.request("GET /repos/{owner}/{repo}/pulls", {
		owner,
		repo,
		per_page: 100,
		page,
		since,
		state: "all",
	});

	if (batch.status !== 200) {
		return pulls;
	}

	const newPulls = [...pulls, ...batch.data];

	if (batch.data.length >= 100) {
		return getPulls(octokit, owner, repo, since, newPulls, page + 1);
	}

	cache.pulls = newPulls;

	return newPulls;
};

export const getOpenPullsCount = async (octokit, owner, repo, from, to) => {
	const pulls = await getPulls(octokit, owner, repo);

	const filteredPulls = pulls.filter((pull) => {
		return (
			new Date(pull.created_at).getTime() >= from &&
			new Date(pull.created_at).getTime() <= to
		);
	});

	return filteredPulls.length;
};

export const getClosedPullsCount = async (octokit, owner, repo, from, to) => {
	const pulls = await getPulls(octokit, owner, repo);

	const filteredPulls = pulls.filter((pull) => {
		return (
			!pull.merged_at &&
			new Date(pull.closed_at).getTime() >= from &&
			new Date(pull.closed_at).getTime() <= to
		);
	});

	return filteredPulls.length;
};

export const getMergedPullsCount = async (octokit, owner, repo, from, to) => {
	const pulls = await getPulls(octokit, owner, repo);

	const filteredPulls = pulls.filter((pull) => {
		return (
			pull.merged_at &&
			new Date(pull.merged_at).getTime() >= from &&
			new Date(pull.merged_at).getTime() <= to
		);
	});

	return filteredPulls.length;
};

export const getCommits = async (
	octokit,
	owner,
	repo,
	since,
	until,
	commits = [],
	page = 1
) => {
	if (cache.commits) {
		return cache.commits;
	}
	const batch = await octokit.request("GET /repos/{owner}/{repo}/commits", {
		owner,
		repo,
		per_page: 100,
		page,
		since,
		until,
	});

	if (batch.status !== 200) {
		return commits;
	}

	const newCommits = [...commits, ...batch.data];

	if (batch.data.length >= 100) {
		return getCommits(octokit, owner, repo, from, to, newCommits, page + 1);
	}

	cache.commits = newCommits;

	return newCommits;
};

export const getOrgMembers = async (octokit, org, members = [], page = 1) => {
	if (cache.members) {
		return cache.members;
	}
	const batch = await octokit.request("GET /orgs/{org}/members", {
		org,
		per_page: 100,
		page,
	});

	if (batch.status !== 200) {
		return members;
	}

	const newMembers = [...members, ...batch.data.map((member) => member.login)];

	if (batch.data.length >= 100) {
		return getOrgMembers(octokit, org, newMembers, page + 1);
	}

	cache.members = newMembers;

	return newMembers;
};

export const getInternalCommitsCount = async (
	octokit,
	owner,
	repo,
	from,
	to
) => {
	const commits = await getCommits(
		octokit,
		owner,
		repo,
		new Date(from).toISOString(),
		new Date(to).toISOString()
	);
	const members = await getOrgMembers(octokit, owner);

	const filteredCommits = commits.filter((commit) =>
		members.includes(commit.author.login)
	);

	return filteredCommits.length;
};

export const getExternalCommitsCount = async (
	octokit,
	owner,
	repo,
	from,
	to
) => {
	const commits = await getCommits(
		octokit,
		owner,
		repo,
		new Date(from).toISOString(),
		new Date(to).toISOString()
	);
	const members = await getOrgMembers(octokit, owner);

	const filteredCommits = commits.filter(
		(commit) => !members.includes(commit.author.login)
	);

	return filteredCommits.length;
};

export const getInternalContributorsCount = async (
	octokit,
	owner,
	repo,
	from,
	to
) => {
	const commits = await getCommits(
		octokit,
		owner,
		repo,
		new Date(from).toISOString(),
		new Date(to).toISOString()
	);

	const members = await getOrgMembers(octokit, owner);

	const contributors = [
		...new Set(commits.map((commit) => commit.author.login)),
	];

	const filteredContributors = contributors.filter((contributor) =>
		members.includes(contributor)
	);

	return filteredContributors.length;
};

export const getExternalContributorsCount = async (
	octokit,
	owner,
	repo,
	from,
	to
) => {
	const commits = await getCommits(
		octokit,
		owner,
		repo,
		new Date(from).toISOString(),
		new Date(to).toISOString()
	);

	const members = await getOrgMembers(octokit, owner);

	const contributors = [
		...new Set(commits.map((commit) => commit.author.login)),
	];

	const filteredContributors = contributors.filter(
		(contributor) => !members.includes(contributor)
	);

	return filteredContributors.length;
};

const getOrgStats = async (slug) => {
	if (cache.stats) {
		return cache.stats;
	}
	const apiUrl = `https://api.wordpress.org/plugins/info/1.2/?action=plugin_information&request[slug]=${slug}&request[fields][downloaded]=1`;

	const respone = await fetch(apiUrl);

	cache.stats = await respone.json();

	return cache.stats;
};

export const getOrgDownloadsCount = async (slug) => {
	const stats = await getOrgStats(slug);
	return stats.downloaded;
};

export const getOrgActiveInstallsCount = async (slug) => {
	const stats = await getOrgStats(slug);
	return stats.active_installs;
};

export const getOrgRatings = async (slug) => {
	const stats = await getOrgStats(slug);
	const ratings = stats.ratings;

	const total = Object.keys(ratings).reduce((acc, key) => {
		return acc + ratings[key] * parseInt(key);
	}, 0);

	return Math.round((total / stats.num_ratings) * 10) / 10;
};
