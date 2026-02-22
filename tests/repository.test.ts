/* eslint-disable @typescript-eslint/no-explicit-any, @n8n/community-nodes/no-restricted-imports, import-x/no-unresolved */
import { describe, test, expect } from 'bun:test';
import { mockApiRequest, createContext, T, ENDPOINTS, setupBeforeEach } from './testUtils';
import { repositoryResource } from '../nodes/Codeberg/resources/repository';

setupBeforeEach();

describe('Repository', () => {
	test('create with minimal params', async () => {
		const ctx = createContext({ name: 'my-repo', additionalFields: {} });
		const result = await repositoryResource.handlers.create.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith('POST', ENDPOINTS.USER_REPOS, { name: 'my-repo' });
	});

	test('create with additional fields', async () => {
		const ctx = createContext({
			name: 'my-repo',
			additionalFields: {
				description: 'A test repo',
				private: true,
				auto_init: true,
				gitignores: 'Go',
				license: 'MIT',
				default_branch: 'develop',
				readme: 'Default',
			},
		});
		const result = await repositoryResource.handlers.create.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith('POST', ENDPOINTS.USER_REPOS, {
			name: 'my-repo',
			description: 'A test repo',
			private: true,
			auto_init: true,
			gitignores: 'Go',
			license: 'MIT',
			default_branch: 'develop',
			readme: 'Default',
		});
	});

	test('get', async () => {
		const ctx = createContext({ owner: T.OWNER, repo: T.REPO });
		const result = await repositoryResource.handlers.get.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith('GET', `/repos/${T.OWNER}/${T.REPO}`);
	});

	test('update with minimal params', async () => {
		const ctx = createContext({ owner: T.OWNER, repo: T.REPO, updateFields: {} });
		const result = await repositoryResource.handlers.update.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith('PATCH', `/repos/${T.OWNER}/${T.REPO}`, {});
	});

	test('update with fields', async () => {
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			updateFields: {
				name: 'new-name',
				description: 'updated desc',
				private: false,
				default_branch: 'main',
				website: 'https://example.com',
				has_issues: true,
				has_pull_requests: false,
				has_wiki: true,
			},
		});
		const result = await repositoryResource.handlers.update.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith('PATCH', `/repos/${T.OWNER}/${T.REPO}`, {
			name: 'new-name',
			description: 'updated desc',
			private: false,
			default_branch: 'main',
			website: 'https://example.com',
			has_issues: true,
			has_pull_requests: false,
			has_wiki: true,
		});
	});

	test('delete', async () => {
		const ctx = createContext({ owner: T.OWNER, repo: T.REPO });
		const result = await repositoryResource.handlers.delete.call(ctx as any, 0);
		expect(result).toEqual([{ json: { success: true } }]);
		expect(mockApiRequest).toHaveBeenCalledWith('DELETE', `/repos/${T.OWNER}/${T.REPO}`);
	});

	test('search with minimal params', async () => {
		mockApiRequest.mockImplementation(() => Promise.resolve({ data: [{ id: 1 }, { id: 2 }] }));
		const ctx = createContext({ query: 'n8n', additionalFields: {} });
		const result = await repositoryResource.handlers.search.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }, { json: { id: 2 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith('GET', ENDPOINTS.REPOS_SEARCH, {}, { q: 'n8n' });
	});

	test('search with additional fields', async () => {
		mockApiRequest.mockImplementation(() => Promise.resolve({ data: [{ id: 3 }] }));
		const ctx = createContext({
			query: 'test',
			additionalFields: { sort: 'stars', order: 'asc', limit: 10 },
		});
		const result = await repositoryResource.handlers.search.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 3 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith(
			'GET',
			ENDPOINTS.REPOS_SEARCH,
			{},
			{ q: 'test', sort: 'stars', order: 'asc', limit: 10 },
		);
	});

	test('list', async () => {
		mockApiRequest.mockImplementation(() => Promise.resolve([{ id: 1 }, { id: 2 }]));
		const ctx = createContext({ limit: 25 });
		const result = await repositoryResource.handlers.list.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }, { json: { id: 2 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith('GET', ENDPOINTS.USER_REPOS, {}, { limit: 25 });
	});

	test('fork with minimal params', async () => {
		const ctx = createContext({ owner: T.OWNER, repo: T.REPO, additionalFields: {} });
		const result = await repositoryResource.handlers.fork.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith(
			'POST',
			`/repos/${T.OWNER}/${T.REPO}/forks`,
			{},
		);
	});

	test('fork with organization', async () => {
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			additionalFields: { organization: 'my-org' },
		});
		const result = await repositoryResource.handlers.fork.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith('POST', `/repos/${T.OWNER}/${T.REPO}/forks`, {
			organization: 'my-org',
		});
	});
});
