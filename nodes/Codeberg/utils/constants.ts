export const CODEBERG_URLS = {
	API_BASE: 'https://codeberg.org/api/v1',
	OAUTH_AUTHORIZE: 'https://codeberg.org/login/oauth/authorize',
	OAUTH_TOKEN: 'https://codeberg.org/login/oauth/access_token',
} as const;

export const PAGINATION = {
	MAX_LIMIT: 50,
	DEFAULT_LIMIT: 50,
} as const;

export const ENDPOINTS = {
	USER: '/user',
	USER_REPOS: '/user/repos',
	USER_ORGS: '/user/orgs',
	USER_BY_NAME: '/users/{owner}',
	USER_REPOS_BY_NAME: '/users/{owner}/repos',
	USER_HEATMAP: '/users/{owner}/heatmap',
	USER_FOLLOWERS: '/users/{owner}/followers',
	USER_FOLLOWING: '/users/{owner}/following',
	USERS_SEARCH: '/users/search',

	REPOS_SEARCH: '/repos/search',
	REPO: '/repos/{owner}/{repo}',
	REPO_CREATE_USER: '/user/repos',
	REPO_CREATE_ORG: '/orgs/{owner}/repos',
	REPO_FORKS: '/repos/{owner}/{repo}/forks',
	REPO_TOPICS: '/repos/{owner}/{repo}/topics',
	REPO_COLLABORATORS: '/repos/{owner}/{repo}/collaborators',
	REPO_TEAMS: '/repos/{owner}/{repo}/teams',
	REPO_TRANSFER: '/repos/{owner}/{repo}/transfer',
	REPO_STARGAZERS: '/repos/{owner}/{repo}/stargazers',

	ISSUES: '/repos/{owner}/{repo}/issues',
	ISSUE: '/repos/{owner}/{repo}/issues/{index}',
	ISSUE_LABELS: '/repos/{owner}/{repo}/issues/{index}/labels',
	ISSUE_ASSIGNEES: '/repos/{owner}/{repo}/issues/{index}/assignees',
	ISSUE_DEADLINE: '/repos/{owner}/{repo}/issues/{index}/deadline',
	ISSUE_STOPWATCH_START: '/repos/{owner}/{repo}/issues/{index}/stopwatch/start',
	ISSUE_STOPWATCH_STOP: '/repos/{owner}/{repo}/issues/{index}/stopwatch/stop',
	ISSUES_SEARCH: '/repos/issues/search',

	ISSUE_COMMENTS: '/repos/{owner}/{repo}/issues/{index}/comments',
	ISSUE_COMMENT: '/repos/{owner}/{repo}/issues/comments/{id}',
	REPO_COMMENTS: '/repos/{owner}/{repo}/issues/comments',

	PULLS: '/repos/{owner}/{repo}/pulls',
	PULL: '/repos/{owner}/{repo}/pulls/{index}',
	PULL_MERGE: '/repos/{owner}/{repo}/pulls/{index}/merge',
	PULL_FILES: '/repos/{owner}/{repo}/pulls/{index}/files',
	PULL_REVIEWS: '/repos/{owner}/{repo}/pulls/{index}/reviews',
	PULL_COMMITS: '/repos/{owner}/{repo}/pulls/{index}/commits',

	LABELS: '/repos/{owner}/{repo}/labels',
	LABEL: '/repos/{owner}/{repo}/labels/{id}',
	ORG_LABELS: '/orgs/{owner}/labels',
	ORG_LABEL: '/orgs/{owner}/labels/{id}',

	MILESTONES: '/repos/{owner}/{repo}/milestones',
	MILESTONE: '/repos/{owner}/{repo}/milestones/{id}',

	RELEASES: '/repos/{owner}/{repo}/releases',
	RELEASE: '/repos/{owner}/{repo}/releases/{id}',
	RELEASE_LATEST: '/repos/{owner}/{repo}/releases/latest',
	RELEASE_BY_TAG: '/repos/{owner}/{repo}/releases/tags/{tag}',
	RELEASE_ASSETS: '/repos/{owner}/{repo}/releases/{id}/assets',

	BRANCHES: '/repos/{owner}/{repo}/branches',
	BRANCH: '/repos/{owner}/{repo}/branches/{branch}',

	FILE_CONTENTS: '/repos/{owner}/{repo}/contents/{filepath}',
	FILE_RAW: '/repos/{owner}/{repo}/raw/{filepath}',

	ORGS: '/orgs',
	ORG: '/orgs/{owner}',
	ORG_REPOS: '/orgs/{owner}/repos',
	ORG_MEMBERS: '/orgs/{owner}/members',
	ORG_TEAMS: '/orgs/{owner}/teams',
} as const;
