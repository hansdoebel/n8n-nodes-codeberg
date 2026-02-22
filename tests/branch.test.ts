/* eslint-disable @typescript-eslint/no-explicit-any, @n8n/community-nodes/no-restricted-imports, import-x/no-unresolved */
import { describe, test, expect } from 'bun:test';
import { mockApiRequest, mockApiRequestAllItems, createContext, T, setupBeforeEach } from './testUtils';
import { branchResource } from '../nodes/Codeberg/resources/branch';

setupBeforeEach();

describe('Branch', () => {
	test('create', async () => {
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			newBranchName: T.BRANCH,
			oldBranchName: T.SOURCE_BRANCH,
		});
		const result = await branchResource.handlers.create.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith(
			'POST',
			`/repos/${T.OWNER}/${T.REPO}/branches`,
			{ new_branch_name: T.BRANCH, old_branch_name: T.SOURCE_BRANCH },
		);
	});

	test('get', async () => {
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			branchName: T.BRANCH,
		});
		const result = await branchResource.handlers.get.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith(
			'GET',
			`/repos/${T.OWNER}/${T.REPO}/branches/${T.BRANCH}`,
		);
	});

	test('delete', async () => {
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			branchName: T.BRANCH,
		});
		const result = await branchResource.handlers.delete.call(ctx as any, 0);
		expect(result).toEqual([{ json: { success: true } }]);
		expect(mockApiRequest).toHaveBeenCalledWith(
			'DELETE',
			`/repos/${T.OWNER}/${T.REPO}/branches/${T.BRANCH}`,
		);
	});

	test('list', async () => {
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			additionalFields: { limit: 30 },
		});
		const result = await branchResource.handlers.list.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }, { json: { id: 2 } }]);
		expect(mockApiRequestAllItems).toHaveBeenCalledWith(
			'GET',
			`/repos/${T.OWNER}/${T.REPO}/branches`,
			{},
			{ limit: 30 },
		);
	});

	test('list with empty additionalFields', async () => {
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			additionalFields: {},
		});
		const result = await branchResource.handlers.list.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }, { json: { id: 2 } }]);
		expect(mockApiRequestAllItems).toHaveBeenCalledWith(
			'GET',
			`/repos/${T.OWNER}/${T.REPO}/branches`,
			{},
			{},
		);
	});
});
