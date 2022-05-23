# metrics-generator

> This command collects metrics for a GitHub repository and generates reports in multiple formats.

## Usage
Run this command in the root directory of a GitHub repository.

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
## Example

```sh
% npx github:10up/metrics-generator --repo=10up/ads-txt --from='01 Feb 2022' --to='28 Feb 2022' --pat=<github_personal_access_token> --slug=ads-txt --md --json

% ls
ads-txt.html ads-txt.json ads-txt.md

% cat ads-txt.json
{
  "repo": "ads-txt",
  "owner": "10up",
  "watchers": 48,
  "stargazers": 40,
  "forks": 22,
  "releases": 0,
  "openIssues": 0,
  "closedIssues": 2,
  "openPulls": 4,
  "closedPulls": 1,
  "mergedPulls": 4,
  "internalCommits": 35,
  "externalCommits": 2,
  "internalContributors": 3,
  "externalContributors": 1,
  "wpSlug": "ads-txt",
  "orgDownloads": 509259,
  "orgActiveInstalls": 100000,
  "orgRatings": 4.5
}
```
### The generated markdown file:

| Metric | 01 Feb 2022 - 28 Feb 2022 |
| --- | --- |
| Repo | ads-txt |
| Owner | 10up |
| Watchers | 48 |
| Stargazers | 40 |
| Forks | 22 |
| Releases | 0 |
| Open Issues | 0 |
| Closed Issues | 2 |
| Open Pulls | 4 |
| Closed Pulls | 1 |
| Merged Pulls | 4 |
| Internal Commits | 35 |
| External Commits | 2 |
| Internal Contributors | 3 |
| External Contributors | 1 |
| Wp Slug | ads-txt |
| Org Downloads | 509259 |
| Org Active Installs | 100000 |
| Org Ratings | 4.5 |

### Notes:
- Due to the limitation of the WordPress.org API, the downloaded count is the latest count, regardless of time range.
- This only works with GitHub repositories.
- For WordPress metrics, this command only supports plugins for now.
- Due to the rate limit of unauthorized API access, we may need PAT to ensure GitHub doesn't block our requests. Personal Access Token can be created [here](https://github.com/settings/tokens), `read:org` scope is required to query concealed contributors.
