/* eslint-disable @typescript-eslint/no-explicit-any, @n8n/community-nodes/no-restricted-imports, import-x/no-unresolved */
import { describe, test, expect } from 'bun:test';
import { mockApiRequest, mockApiRequestAllItems, createContext, T, setupBeforeEach } from './testUtils';
import { releaseResource } from '../nodes/Codeberg/resources/release';

setupBeforeEach();

describe('Release', () => {
	test('create', async () => {
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			tagName: 'v1.0.0',
			name: 'Release v1.0.0',
			body: 'Initial release',
			additionalFields: { draft: true, prerelease: false, target_commitish: 'main' },
		});
		const result = await releaseResource.handlers.create.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith(
			'POST',
			`/repos/${T.OWNER}/${T.REPO}/releases`,
			{
				tag_name: 'v1.0.0',
				name: 'Release v1.0.0',
				body: 'Initial release',
				draft: true,
				prerelease: false,
				target_commitish: 'main',
			},
		);
	});

	test('create with empty additionalFields', async () => {
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			tagName: 'v2.0.0',
			name: 'Release v2.0.0',
			body: 'Second release',
			additionalFields: {},
		});
		const result = await releaseResource.handlers.create.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith(
			'POST',
			`/repos/${T.OWNER}/${T.REPO}/releases`,
			{ tag_name: 'v2.0.0', name: 'Release v2.0.0', body: 'Second release' },
		);
	});

	test('get', async () => {
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			releaseId: T.RELEASE_ID,
		});
		const result = await releaseResource.handlers.get.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith(
			'GET',
			`/repos/${T.OWNER}/${T.REPO}/releases/${T.RELEASE_ID}`,
		);
	});

	test('update', async () => {
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			releaseId: T.RELEASE_ID,
			updateFields: {
				tag_name: 'v1.0.1',
				name: 'Patched Release',
				body: 'Bug fixes',
				draft: false,
				prerelease: true,
			},
		});
		const result = await releaseResource.handlers.update.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith(
			'PATCH',
			`/repos/${T.OWNER}/${T.REPO}/releases/${T.RELEASE_ID}`,
			{
				tag_name: 'v1.0.1',
				name: 'Patched Release',
				body: 'Bug fixes',
				draft: false,
				prerelease: true,
			},
		);
	});

	test('update with empty updateFields', async () => {
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			releaseId: T.RELEASE_ID,
			updateFields: {},
		});
		const result = await releaseResource.handlers.update.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith(
			'PATCH',
			`/repos/${T.OWNER}/${T.REPO}/releases/${T.RELEASE_ID}`,
			{},
		);
	});

	test('delete', async () => {
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			releaseId: T.RELEASE_ID,
		});
		const result = await releaseResource.handlers.delete.call(ctx as any, 0);
		expect(result).toEqual([{ json: { success: true } }]);
		expect(mockApiRequest).toHaveBeenCalledWith(
			'DELETE',
			`/repos/${T.OWNER}/${T.REPO}/releases/${T.RELEASE_ID}`,
		);
	});

	test('list', async () => {
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			additionalFields: { limit: 5 },
		});
		const result = await releaseResource.handlers.list.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }, { json: { id: 2 } }]);
		expect(mockApiRequestAllItems).toHaveBeenCalledWith(
			'GET',
			`/repos/${T.OWNER}/${T.REPO}/releases`,
			{},
			{ limit: 5 },
		);
	});

	test('list with empty additionalFields', async () => {
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			additionalFields: {},
		});
		const result = await releaseResource.handlers.list.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }, { json: { id: 2 } }]);
		expect(mockApiRequestAllItems).toHaveBeenCalledWith(
			'GET',
			`/repos/${T.OWNER}/${T.REPO}/releases`,
			{},
			{},
		);
	});
});
