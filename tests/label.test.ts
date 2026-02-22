/* eslint-disable @typescript-eslint/no-explicit-any, @n8n/community-nodes/no-restricted-imports, import-x/no-unresolved */
import { describe, test, expect } from 'bun:test';
import { mockApiRequest, mockApiRequestAllItems, createContext, T, setupBeforeEach } from './testUtils';
import { labelResource } from '../nodes/Codeberg/resources/label';

setupBeforeEach();

describe('Label', () => {
	test('create', async () => {
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			name: 'bug',
			color: 'ee0701',
			additionalFields: { description: 'Bug reports', exclusive: true },
		});
		const result = await labelResource.handlers.create.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith(
			'POST',
			`/repos/${T.OWNER}/${T.REPO}/labels`,
			{ name: 'bug', color: 'ee0701', description: 'Bug reports', exclusive: true },
		);
	});

	test('create with empty additionalFields', async () => {
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			name: 'enhancement',
			color: '0075ca',
			additionalFields: {},
		});
		const result = await labelResource.handlers.create.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith(
			'POST',
			`/repos/${T.OWNER}/${T.REPO}/labels`,
			{ name: 'enhancement', color: '0075ca' },
		);
	});

	test('get', async () => {
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			labelId: T.LABEL_ID,
		});
		const result = await labelResource.handlers.get.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith(
			'GET',
			`/repos/${T.OWNER}/${T.REPO}/labels/${T.LABEL_ID}`,
		);
	});

	test('update', async () => {
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			labelId: T.LABEL_ID,
			updateFields: { name: 'critical-bug', color: 'ff0000', description: 'Critical', exclusive: false },
		});
		const result = await labelResource.handlers.update.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith(
			'PATCH',
			`/repos/${T.OWNER}/${T.REPO}/labels/${T.LABEL_ID}`,
			{ name: 'critical-bug', color: 'ff0000', description: 'Critical', exclusive: false },
		);
	});

	test('update with empty updateFields', async () => {
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			labelId: T.LABEL_ID,
			updateFields: {},
		});
		const result = await labelResource.handlers.update.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith(
			'PATCH',
			`/repos/${T.OWNER}/${T.REPO}/labels/${T.LABEL_ID}`,
			{},
		);
	});

	test('delete', async () => {
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			labelId: T.LABEL_ID,
		});
		const result = await labelResource.handlers.delete.call(ctx as any, 0);
		expect(result).toEqual([{ json: { success: true } }]);
		expect(mockApiRequest).toHaveBeenCalledWith(
			'DELETE',
			`/repos/${T.OWNER}/${T.REPO}/labels/${T.LABEL_ID}`,
		);
	});

	test('list', async () => {
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			additionalFields: { limit: 25 },
		});
		const result = await labelResource.handlers.list.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }, { json: { id: 2 } }]);
		expect(mockApiRequestAllItems).toHaveBeenCalledWith(
			'GET',
			`/repos/${T.OWNER}/${T.REPO}/labels`,
			{},
			{ limit: 25 },
		);
	});

	test('list with empty additionalFields', async () => {
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			additionalFields: {},
		});
		const result = await labelResource.handlers.list.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }, { json: { id: 2 } }]);
		expect(mockApiRequestAllItems).toHaveBeenCalledWith(
			'GET',
			`/repos/${T.OWNER}/${T.REPO}/labels`,
			{},
			{},
		);
	});
});
