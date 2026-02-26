<h1 align="center">
  <br>
  n8n-nodes-codeberg
  <br>
</h1>

<p align="center">
	<img alt="NPM Version" src="https://img.shields.io/npm/v/n8n-nodes-codeberg">
	<img alt="GitHub License" src="https://img.shields.io/github/license/hansdoebel/n8n-nodes-codeberg">
	<img alt="NPM Downloads" src="https://img.shields.io/npm/dm/n8n-nodes-codeberg">
	<img alt="NPM Last Update" src="https://img.shields.io/npm/last-update/n8n-nodes-codeberg">
	<img alt="Static Badge" src="https://img.shields.io/badge/n8n-v2.9.4-EA4B71?logo=n8n">
</p>

<p align="center">
  <a href="#installation">Installation</a> |
  <a href="#credentials">Credentials</a> |
  <a href="#api-coverage">API Coverage</a> |
  <a href="#resources">Resources</a> |
  <a href="#development">Development</a>
</p>

---

An [n8n](https://n8n.io) community node that integrates with the [Codeberg](https://codeberg.org) API. Manage repositories, issues, pull requests, organizations, and more on Codeberg — a free, open-source Git hosting platform powered by Forgejo.

## API Coverage

The table below shows which resources are currently implemented:

<details>
<summary><strong>View all resources</strong></summary>

| Resource           | Status  | Operations                                              |
| ------------------ | ------- | ------------------------------------------------------- |
| **Repository**     | ✅ Full | Create, Delete, Fork, Get, List, Search, Update         |
| **Issue**          | ✅ Full | Create, Delete, Get, List, Search, Update               |
| **Pull Request**   | ✅ Full | Create, Get, List, Merge, Update                        |
| **Organization**   | ✅ Full | Create, Delete, Get, List, List Members, Update         |
| **User**           | ✅ Full | Get, Get by Username, Search                            |
| **Comment**        | ✅ Full | Create, Delete, Get, List, Update                       |
| **Label**          | ✅ Full | Create, Delete, Get, List, Update                       |
| **Milestone**      | ✅ Full | Create, Delete, Get, List, Update                       |
| **Release**        | ✅ Full | Create, Delete, Get, List, Update                       |
| **Branch**         | ✅ Full | Create, Delete, Get, List                               |
| **File**           | ✅ Full | Create, Delete, Get, List, Update                       |

</details>

## Installation

1. Make a new workflow or open an existing one
2. Open the nodes panel by selecting **+** or pressing **Tab**
3. Search for **Codeberg**
4. Select **Install** to install the node for your instance

For more details, see the [community nodes installation guide](https://docs.n8n.io/integrations/community-nodes/installation/).

## Credentials

This package supports two authentication methods:

### API Token

1. Go to your Codeberg account **Settings** > **Applications**
2. Generate a new personal access token
3. In n8n, go to **Credentials** > **Add credential**
4. Search for **Codeberg API** and paste your token

### OAuth2

1. Go to your Codeberg account **Settings** > **Applications**
2. Register a new OAuth2 application
3. In n8n, go to **Credentials** > **Add credential**
4. Search for **Codeberg OAuth2 API** and enter your client ID and secret

## Resources

<details>
<summary><strong>Repository</strong></summary>

| Operation | Description             |
| --------- | ----------------------- |
| Create    | Create a repository     |
| Delete    | Delete a repository     |
| Fork      | Fork a repository       |
| Get       | Get a repository        |
| List      | List repositories       |
| Search    | Search repositories     |
| Update    | Update a repository     |

</details>

<details>
<summary><strong>Issue</strong></summary>

| Operation | Description        |
| --------- | ------------------ |
| Create    | Create an issue    |
| Delete    | Delete an issue    |
| Get       | Get an issue       |
| List      | List issues        |
| Search    | Search issues      |
| Update    | Update an issue    |

</details>

<details>
<summary><strong>Pull Request</strong></summary>

| Operation | Description            |
| --------- | ---------------------- |
| Create    | Create a pull request  |
| Get       | Get a pull request     |
| List      | List pull requests     |
| Merge     | Merge a pull request   |
| Update    | Update a pull request  |

</details>

<details>
<summary><strong>Organization</strong></summary>

| Operation    | Description                  |
| ------------ | ---------------------------- |
| Create       | Create an organization       |
| Delete       | Delete an organization       |
| Get          | Get an organization          |
| List         | List organizations           |
| List Members | List organization members    |
| Update       | Update an organization       |

</details>

<details>
<summary><strong>User</strong></summary>

| Operation      | Description              |
| -------------- | ------------------------ |
| Get            | Get authenticated user   |
| Get by Username| Get a user by username   |
| Search         | Search users             |

</details>

<details>
<summary><strong>Comment</strong></summary>

| Operation | Description                    |
| --------- | ------------------------------ |
| Create    | Create a comment on an issue   |
| Delete    | Delete a comment               |
| Get       | Get a comment                  |
| List      | List comments on an issue      |
| Update    | Update a comment               |

</details>

<details>
<summary><strong>Label</strong></summary>

| Operation | Description      |
| --------- | ---------------- |
| Create    | Create a label   |
| Delete    | Delete a label   |
| Get       | Get a label      |
| List      | List labels      |
| Update    | Update a label   |

</details>

<details>
<summary><strong>Milestone</strong></summary>

| Operation | Description          |
| --------- | -------------------- |
| Create    | Create a milestone   |
| Delete    | Delete a milestone   |
| Get       | Get a milestone      |
| List      | List milestones      |
| Update    | Update a milestone   |

</details>

<details>
<summary><strong>Release</strong></summary>

| Operation | Description        |
| --------- | ------------------ |
| Create    | Create a release   |
| Delete    | Delete a release   |
| Get       | Get a release      |
| List      | List releases      |
| Update    | Update a release   |

</details>

<details>
<summary><strong>Branch</strong></summary>

| Operation | Description       |
| --------- | ----------------- |
| Create    | Create a branch   |
| Delete    | Delete a branch   |
| Get       | Get a branch      |
| List      | List branches     |

</details>

<details>
<summary><strong>File</strong></summary>

| Operation | Description                        |
| --------- | ---------------------------------- |
| Create    | Create a file in a repository      |
| Delete    | Delete a file from a repository    |
| Get       | Get a file from a repository       |
| List      | List files in a directory          |
| Update    | Update a file in a repository      |

</details>

## Development

```bash
git clone https://github.com/hansdoebel/n8n-nodes-codeberg.git
cd n8n-nodes-codeberg
npm install
npm run build
npm run lint
```

## License

[MIT](LICENSE.md)

<p align="center">
  <a href="https://github.com/hansdoebel/n8n-nodes-codeberg">GitHub</a> |
  <a href="https://github.com/hansdoebel/n8n-nodes-codeberg/issues">Issues</a> |
  <a href="https://codeberg.org/api/swagger">Codeberg API Docs</a>
</p>
