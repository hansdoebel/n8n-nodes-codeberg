/* eslint-disable @typescript-eslint/no-explicit-any, @n8n/community-nodes/no-restricted-imports, import-x/no-unresolved */
import { describe, test, expect } from 'bun:test';
import { mockApiRequest, mockApiRequestAllItems, createContext, T, setupBeforeEach } from './testUtils';
import { milestoneResource } from '../nodes/Codeberg/resources/milestone';

setupBeforeEach();

describe('Milestone', () => {
	test('create', async () => {
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			title: 'v1.0',
			additionalFields: { description: 'First release', state: 'open', due_on: '2026-12-31T00:00:00Z' },
		});
		const result = await milestoneResource.handlers.create.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith(
			'POST',
			`/repos/${T.OWNER}/${T.REPO}/milestones`,
			{ title: 'v1.0', description: 'First release', state: 'open', due_on: '2026-12-31T00:00:00Z' },
		);
	});

	test('create with empty additionalFields', async () => {
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			title: 'v2.0',
			additionalFields: {},
		});
		const result = await milestoneResource.handlers.create.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith(
			'POST',
			`/repos/${T.OWNER}/${T.REPO}/milestones`,
			{ title: 'v2.0' },
		);
	});

	test('get', async () => {
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			milestoneId: T.MILESTONE_ID,
		});
		const result = await milestoneResource.handlers.get.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith(
			'GET',
			`/repos/${T.OWNER}/${T.REPO}/milestones/${T.MILESTONE_ID}`,
		);
	});

	test('update', async () => {
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			milestoneId: T.MILESTONE_ID,
			updateFields: { title: 'v1.1', description: 'Patch', state: 'closed', due_on: '2026-06-15T00:00:00Z' },
		});
		const result = await milestoneResource.handlers.update.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith(
			'PATCH',
			`/repos/${T.OWNER}/${T.REPO}/milestones/${T.MILESTONE_ID}`,
			{ title: 'v1.1', description: 'Patch', state: 'closed', due_on: '2026-06-15T00:00:00Z' },
		);
	});

	test('update with empty updateFields', async () => {
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			milestoneId: T.MILESTONE_ID,
			updateFields: {},
		});
		const result = await milestoneResource.handlers.update.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith(
			'PATCH',
			`/repos/${T.OWNER}/${T.REPO}/milestones/${T.MILESTONE_ID}`,
			{},
		);
	});

	test('delete', async () => {
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			milestoneId: T.MILESTONE_ID,
		});
		const result = await milestoneResource.handlers.delete.call(ctx as any, 0);
		expect(result).toEqual([{ json: { success: true } }]);
		expect(mockApiRequest).toHaveBeenCalledWith(
			'DELETE',
			`/repos/${T.OWNER}/${T.REPO}/milestones/${T.MILESTONE_ID}`,
		);
	});

	test('list', async () => {
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			additionalFields: { state: 'closed', limit: 10 },
		});
		const result = await milestoneResource.handlers.list.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }, { json: { id: 2 } }]);
		expect(mockApiRequestAllItems).toHaveBeenCalledWith(
			'GET',
			`/repos/${T.OWNER}/${T.REPO}/milestones`,
			{},
			{ state: 'closed', limit: 10 },
		);
	});

	test('list with empty additionalFields', async () => {
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			additionalFields: {},
		});
		const result = await milestoneResource.handlers.list.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }, { json: { id: 2 } }]);
		expect(mockApiRequestAllItems).toHaveBeenCalledWith(
			'GET',
			`/repos/${T.OWNER}/${T.REPO}/milestones`,
			{},
			{},
		);
	});
});
