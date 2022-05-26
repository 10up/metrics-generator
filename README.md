# Metrics Generator

> This command collects metrics for a GitHub repository and generates reports in multiple formats.

[![Support Level](https://img.shields.io/badge/support-beta-blueviolet.svg)](#support-level) [![MIT License](https://img.shields.io/github/license/10up/metrics-generator.svg)](https://github.com/10up/metrics-generator/blob/trunk/LICENSE.md)

## Usage

Run this command in the root directory of a GitHub repository:

```sh
~/workspace/wpcs-action
% npx github:10up/metrics-generator --help

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
```

### Example command run

```sh
% npx github:10up/metrics-generator --repo=10up/ads-txt --from='01 Feb 2022' --to='28 Feb 2022' --pat=<github_personal_access_token> --wpSlug=ads-txt --md --json

% ls
ads-txt.html ads-txt.json ads-txt.md

% cat ads-txt.json
{
  "repo": "ads-txt",
  "owner": "10up",
  "watchers": 48,
  "stars": 40,
  "forks": 22,
  "releases": 0,
  "orgDownloads": 509284,
  "orgActiveInstalls": 100000,
  "orgAverageRatings": 4.5,
  "openIssues": 0,
  "closedIssues": 2,
  "openPullRequests": 4,
  "closedPullRequests": 1,
  "mergedPullRequests": 4,
  "internalContributors": 3,
  "externalContributors": 1,
  "internalCommits": 35,
  "externalCommits": 2
}
```

### Example output markdown file

| Metric | 01 Feb 2022 - 28 Feb 2022 |
| --- | --- |
| Repo | ads-txt |
| Owner | 10up |
| Watchers | 48 |
| Stars | 40 |
| Forks | 22 |
| Releases | 0 |
| Org Downloads | 509284 |
| Org Active Installs | 100000 |
| Org Average Ratings | 4.5 |
| Open Issues | 0 |
| Closed Issues | 2 |
| Open Pull Requests | 4 |
| Closed Pull Requests | 1 |
| Merged Pull Requests | 4 |
| Internal Contributors | 3 |
| External Contributors | 1 |
| Internal Commits | 35 |
| External Commits | 2 |

### Notes

- Due to the limitation of the WordPress.org API, the downloaded count is the latest count, regardless of time range.
- This only works with GitHub repositories.
- For WordPress metrics, this command only supports plugins for now.
- Due to the rate limit of unauthorized API access, we may need PAT to ensure GitHub doesn't block our requests. Personal Access Token can be created [here](https://github.com/settings/tokens), `read:org` scope is required to query concealed contributors.

## Support Level

**Beta:** This project is quite new and we're not sure what our ongoing support level for this will be. Bug reports, feature requests, questions, and pull requests are welcome. If you like this project please let us know, but be cautious using this in a Production environment!

## Changelog

A complete listing of all notable changes to Metrics Generator are documented in [CHANGELOG.md](https://github.com/10up/metrics-generator/blob/develop/CHANGELOG.md).

## Contributing

Please read [CODE_OF_CONDUCT.md](https://github.com/10up/metrics-generator/blob/develop/CODE_OF_CONDUCT.md) for details on our code of conduct and [CONTRIBUTING.md](https://github.com/10up/metrics-generator/blob/develop/CONTRIBUTING.md) for details on the process for submitting pull requests to us.

## Like what you see?

<a href="http://10up.com/contact/"><img src="https://10up.com/uploads/2016/10/10up-Github-Banner.png" width="850"></a>
