# gds-github-connector
Connector for Google Data Studio to retrieve PR data from GitHub.

The [Pull Request API](https://docs.github.com/en/rest/pulls/pulls?apiVersion=2026-03-10#list-pull-requests) from GitHub drives data pulled in, exposing fields from _merged_ pull requests.

| Field | Description |
| --- | --- |
| repo | the repository pull requests were found in |
| user | the user login value reported by GitHub |
| title | pull request title |
| merged | date the pull request was merged |

## Looker Studio Community Connectors

https://developers.google.com/looker-studio/connector/get-started
