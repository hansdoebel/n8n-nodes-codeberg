/* eslint-disable @typescript-eslint/no-explicit-any, @n8n/community-nodes/no-restricted-imports, import-x/no-unresolved */
import { describe, test, expect } from 'bun:test';
import { mockApiRequest, createContext, T, setupBeforeEach } from './testUtils';
import { pullRequestResource } from '../nodes/Codeberg/resources/pullRequest';

setupBeforeEach();

describe('PullRequest', () => {
	test('create with minimal params', async () => {
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			title: 'Add feature',
			head: 'feature-branch',
			base: 'main',
			additionalFields: {},
		});
		const result = await pullRequestResource.handlers.create.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith(
			'POST',
			`/repos/${T.OWNER}/${T.REPO}/pulls`,
			{ title: 'Add feature', head: 'feature-branch', base: 'main' },
		);
	});

	test('create with additional fields', async () => {
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			title: 'Big PR',
			head: 'dev',
			base: 'main',
			additionalFields: {
				body: 'This is big',
				assignees: 'alice, bob',
				labels: '1,2',
				milestone: 3,
			},
		});
		const result = await pullRequestResource.handlers.create.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith(
			'POST',
			`/repos/${T.OWNER}/${T.REPO}/pulls`,
			{
				title: 'Big PR',
				head: 'dev',
				base: 'main',
				body: 'This is big',
				assignees: ['alice', 'bob'],
				labels: [1, 2],
				milestone: 3,
			},
		);
	});

	test('get', async () => {
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			pullNumber: T.PULL_NUM,
		});
		const result = await pullRequestResource.handlers.get.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith(
			'GET',
			`/repos/${T.OWNER}/${T.REPO}/pulls/${T.PULL_NUM}`,
		);
	});

	test('update with minimal params', async () => {
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			pullNumber: T.PULL_NUM,
			updateFields: {},
		});
		const result = await pullRequestResource.handlers.update.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith(
			'PATCH',
			`/repos/${T.OWNER}/${T.REPO}/pulls/${T.PULL_NUM}`,
			{},
		);
	});

	test('update with fields', async () => {
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			pullNumber: T.PULL_NUM,
			updateFields: {
				title: 'Renamed PR',
				body: 'New description',
				state: 'closed',
				base: 'develop',
				assignees: 'eve',
				labels: '5,6,7',
				milestone: 1,
			},
		});
		const result = await pullRequestResource.handlers.update.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith(
			'PATCH',
			`/repos/${T.OWNER}/${T.REPO}/pulls/${T.PULL_NUM}`,
			{
				title: 'Renamed PR',
				body: 'New description',
				state: 'closed',
				base: 'develop',
				assignees: ['eve'],
				labels: [5, 6, 7],
				milestone: 1,
			},
		);
	});

	test('list with minimal params', async () => {
		mockApiRequest.mockImplementation(() => Promise.resolve([{ id: 1 }, { id: 2 }]));
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			additionalFields: {},
		});
		const result = await pullRequestResource.handlers.list.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }, { json: { id: 2 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith(
			'GET',
			`/repos/${T.OWNER}/${T.REPO}/pulls`,
			{},
			{},
		);
	});

	test('list with additional fields', async () => {
		mockApiRequest.mockImplementation(() => Promise.resolve([{ id: 3 }]));
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			additionalFields: {
				state: 'open',
				sort: 'created',
				labels: 'urgent',
				milestone: 'v2',
				limit: 15,
			},
		});
		const result = await pullRequestResource.handlers.list.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 3 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith(
			'GET',
			`/repos/${T.OWNER}/${T.REPO}/pulls`,
			{},
			{ state: 'open', sort: 'created', labels: 'urgent', milestone: 'v2', limit: 15 },
		);
	});

	test('merge with minimal params', async () => {
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			pullNumber: T.PULL_NUM,
			mergeMethod: 'merge',
			additionalFields: {},
		});
		const result = await pullRequestResource.handlers.merge.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith(
			'POST',
			`/repos/${T.OWNER}/${T.REPO}/pulls/${T.PULL_NUM}/merge`,
			{ Do: 'merge' },
		);
	});

	test('merge with additional fields', async () => {
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			pullNumber: T.PULL_NUM,
			mergeMethod: 'squash',
			additionalFields: {
				merge_message_field: 'Squash commit',
				merge_title_field: 'feat: squash merge',
				delete_branch_after_merge: true,
			},
		});
		const result = await pullRequestResource.handlers.merge.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith(
			'POST',
			`/repos/${T.OWNER}/${T.REPO}/pulls/${T.PULL_NUM}/merge`,
			{
				Do: 'squash',
				merge_message_field: 'Squash commit',
				merge_title_field: 'feat: squash merge',
				delete_branch_after_merge: true,
			},
		);
	});

	test('merge returns success true when API returns empty', async () => {
		mockApiRequest.mockImplementation(() => Promise.resolve(undefined));
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			pullNumber: T.PULL_NUM,
			mergeMethod: 'rebase',
			additionalFields: {},
		});
		const result = await pullRequestResource.handlers.merge.call(ctx as any, 0);
		expect(result).toEqual([{ json: { success: true } }]);
	});
});
