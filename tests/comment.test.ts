/* eslint-disable @typescript-eslint/no-explicit-any, @n8n/community-nodes/no-restricted-imports, import-x/no-unresolved */
import { describe, test, expect } from 'bun:test';
import { mockApiRequest, mockApiRequestAllItems, createContext, T, setupBeforeEach } from './testUtils';
import { commentResource } from '../nodes/Codeberg/resources/comment';

setupBeforeEach();

describe('Comment', () => {
	test('create', async () => {
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			issueNumber: T.ISSUE_NUM,
			body: 'This is a comment',
		});
		const result = await commentResource.handlers.create.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith(
			'POST',
			`/repos/${T.OWNER}/${T.REPO}/issues/${T.ISSUE_NUM}/comments`,
			{ body: 'This is a comment' },
		);
	});

	test('get', async () => {
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			commentId: T.COMMENT_ID,
		});
		const result = await commentResource.handlers.get.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith(
			'GET',
			`/repos/${T.OWNER}/${T.REPO}/issues/comments/${T.COMMENT_ID}`,
		);
	});

	test('update', async () => {
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			commentId: T.COMMENT_ID,
			body: 'Updated comment text',
		});
		const result = await commentResource.handlers.update.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith(
			'PATCH',
			`/repos/${T.OWNER}/${T.REPO}/issues/comments/${T.COMMENT_ID}`,
			{ body: 'Updated comment text' },
		);
	});

	test('delete', async () => {
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			commentId: T.COMMENT_ID,
		});
		const result = await commentResource.handlers.delete.call(ctx as any, 0);
		expect(result).toEqual([{ json: { success: true } }]);
		expect(mockApiRequest).toHaveBeenCalledWith(
			'DELETE',
			`/repos/${T.OWNER}/${T.REPO}/issues/comments/${T.COMMENT_ID}`,
		);
	});

	test('list with minimal params', async () => {
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			issueNumber: T.ISSUE_NUM,
			additionalFields: {},
		});
		const result = await commentResource.handlers.list.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }, { json: { id: 2 } }]);
		expect(mockApiRequestAllItems).toHaveBeenCalledWith(
			'GET',
			`/repos/${T.OWNER}/${T.REPO}/issues/${T.ISSUE_NUM}/comments`,
			{},
			{},
		);
	});

	test('list with additional fields', async () => {
		mockApiRequestAllItems.mockImplementation(() => Promise.resolve([{ id: 50 }]));
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			issueNumber: T.ISSUE_NUM,
			additionalFields: { since: '2026-01-01T00:00:00Z', limit: 10 },
		});
		const result = await commentResource.handlers.list.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 50 } }]);
		expect(mockApiRequestAllItems).toHaveBeenCalledWith(
			'GET',
			`/repos/${T.OWNER}/${T.REPO}/issues/${T.ISSUE_NUM}/comments`,
			{},
			{ since: '2026-01-01T00:00:00Z', limit: 10 },
		);
	});
});
