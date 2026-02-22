/* eslint-disable @typescript-eslint/no-explicit-any, @n8n/community-nodes/no-restricted-imports, import-x/no-unresolved */
import { describe, test, expect } from 'bun:test';
import { mockApiRequest, createContext, T, ENDPOINTS, setupBeforeEach } from './testUtils';
import { issueResource } from '../nodes/Codeberg/resources/issue';

setupBeforeEach();

describe('Issue', () => {
	test('create with minimal params', async () => {
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			title: 'Bug report',
			additionalFields: {},
		});
		const result = await issueResource.handlers.create.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith(
			'POST',
			`/repos/${T.OWNER}/${T.REPO}/issues`,
			{ title: 'Bug report' },
		);
	});

	test('create with additional fields including assignees and labels', async () => {
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			title: 'Feature request',
			additionalFields: {
				body: 'Please add this',
				assignees: 'alice, bob',
				labels: '1, 2, 3',
				milestone: 5,
				due_date: '2026-12-31T00:00:00Z',
			},
		});
		const result = await issueResource.handlers.create.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith(
			'POST',
			`/repos/${T.OWNER}/${T.REPO}/issues`,
			{
				title: 'Feature request',
				body: 'Please add this',
				assignees: ['alice', 'bob'],
				labels: [1, 2, 3],
				milestone: 5,
				due_date: '2026-12-31T00:00:00Z',
			},
		);
	});

	test('get', async () => {
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			issueNumber: T.ISSUE_NUM,
		});
		const result = await issueResource.handlers.get.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith(
			'GET',
			`/repos/${T.OWNER}/${T.REPO}/issues/${T.ISSUE_NUM}`,
		);
	});

	test('update with minimal params', async () => {
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			issueNumber: T.ISSUE_NUM,
			updateFields: {},
		});
		const result = await issueResource.handlers.update.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith(
			'PATCH',
			`/repos/${T.OWNER}/${T.REPO}/issues/${T.ISSUE_NUM}`,
			{},
		);
	});

	test('update with fields', async () => {
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			issueNumber: T.ISSUE_NUM,
			updateFields: {
				title: 'Updated title',
				body: 'Updated body',
				state: 'closed',
				assignees: 'charlie',
				labels: '10,20',
				milestone: 2,
				due_date: '2026-06-01T00:00:00Z',
			},
		});
		const result = await issueResource.handlers.update.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith(
			'PATCH',
			`/repos/${T.OWNER}/${T.REPO}/issues/${T.ISSUE_NUM}`,
			{
				title: 'Updated title',
				body: 'Updated body',
				state: 'closed',
				assignees: ['charlie'],
				labels: [10, 20],
				milestone: 2,
				due_date: '2026-06-01T00:00:00Z',
			},
		);
	});

	test('delete', async () => {
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			issueNumber: T.ISSUE_NUM,
		});
		const result = await issueResource.handlers.delete.call(ctx as any, 0);
		expect(result).toEqual([{ json: { success: true } }]);
		expect(mockApiRequest).toHaveBeenCalledWith(
			'DELETE',
			`/repos/${T.OWNER}/${T.REPO}/issues/${T.ISSUE_NUM}`,
		);
	});

	test('list with minimal params', async () => {
		mockApiRequest.mockImplementation(() => Promise.resolve([{ id: 10 }, { id: 11 }]));
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			additionalFields: {},
		});
		const result = await issueResource.handlers.list.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 10 } }, { json: { id: 11 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith(
			'GET',
			`/repos/${T.OWNER}/${T.REPO}/issues`,
			{},
			{},
		);
	});

	test('list with additional fields', async () => {
		mockApiRequest.mockImplementation(() => Promise.resolve([{ id: 5 }]));
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			additionalFields: { state: 'closed', labels: 'bug', sort: 'updated', limit: 10, milestone: 'v1.0' },
		});
		const result = await issueResource.handlers.list.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 5 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith(
			'GET',
			`/repos/${T.OWNER}/${T.REPO}/issues`,
			{},
			{ state: 'closed', labels: 'bug', sort: 'updated', limit: 10, milestone: 'v1.0' },
		);
	});

	test('search with minimal params', async () => {
		mockApiRequest.mockImplementation(() => Promise.resolve([{ id: 20 }]));
		const ctx = createContext({
			query: 'bug',
			additionalFields: {},
		});
		const result = await issueResource.handlers.search.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 20 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith(
			'GET',
			ENDPOINTS.ISSUES_SEARCH,
			{},
			{ q: 'bug' },
		);
	});

	test('search with additional fields', async () => {
		mockApiRequest.mockImplementation(() => Promise.resolve([{ id: 30 }, { id: 31 }]));
		const ctx = createContext({
			query: 'feature',
			additionalFields: {
				state: 'open',
				labels: 'enhancement',
				sort: 'created',
				order: 'asc',
				limit: 5,
			},
		});
		const result = await issueResource.handlers.search.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 30 } }, { json: { id: 31 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith(
			'GET',
			ENDPOINTS.ISSUES_SEARCH,
			{},
			{ q: 'feature', state: 'open', labels: 'enhancement', sort: 'created', order: 'asc', limit: 5 },
		);
	});
});
