/* eslint-disable @typescript-eslint/no-explicit-any, @n8n/community-nodes/no-restricted-imports, import-x/no-unresolved */
import { describe, test, expect } from 'bun:test';
import { mockApiRequest, createContext, T, ENDPOINTS, setupBeforeEach } from './testUtils';
import { organizationResource } from '../nodes/Codeberg/resources/organization';

setupBeforeEach();

describe('Organization', () => {
	test('create with minimal params', async () => {
		const ctx = createContext({ username: T.ORG, additionalFields: {} });
		const result = await organizationResource.handlers.create.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith('POST', ENDPOINTS.ORGS, { username: T.ORG });
	});

	test('create with additional fields', async () => {
		const ctx = createContext({
			username: T.ORG,
			additionalFields: {
				full_name: 'Test Organization',
				description: 'A test org',
				website: 'https://example.org',
				location: 'Berlin',
				visibility: 'public',
			},
		});
		const result = await organizationResource.handlers.create.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith('POST', ENDPOINTS.ORGS, {
			username: T.ORG,
			full_name: 'Test Organization',
			description: 'A test org',
			website: 'https://example.org',
			location: 'Berlin',
			visibility: 'public',
		});
	});

	test('get', async () => {
		const ctx = createContext({ orgName: T.ORG });
		const result = await organizationResource.handlers.get.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith('GET', `/orgs/${T.ORG}`);
	});

	test('update with minimal params', async () => {
		const ctx = createContext({ orgName: T.ORG, updateFields: {} });
		const result = await organizationResource.handlers.update.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith('PATCH', `/orgs/${T.ORG}`, {});
	});

	test('update with fields', async () => {
		const ctx = createContext({
			orgName: T.ORG,
			updateFields: {
				full_name: 'Updated Org Name',
				description: 'New description',
				website: 'https://new.example.org',
				location: 'Munich',
				visibility: 'private',
			},
		});
		const result = await organizationResource.handlers.update.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith('PATCH', `/orgs/${T.ORG}`, {
			full_name: 'Updated Org Name',
			description: 'New description',
			website: 'https://new.example.org',
			location: 'Munich',
			visibility: 'private',
		});
	});

	test('delete', async () => {
		const ctx = createContext({ orgName: T.ORG });
		const result = await organizationResource.handlers.delete.call(ctx as any, 0);
		expect(result).toEqual([{ json: { success: true } }]);
		expect(mockApiRequest).toHaveBeenCalledWith('DELETE', `/orgs/${T.ORG}`);
	});

	test('list', async () => {
		mockApiRequest.mockImplementation(() => Promise.resolve([{ id: 1 }, { id: 2 }]));
		const ctx = createContext({ limit: 20 });
		const result = await organizationResource.handlers.list.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }, { json: { id: 2 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith('GET', ENDPOINTS.USER_ORGS, {}, { limit: 20 });
	});

	test('listMembers', async () => {
		mockApiRequest.mockImplementation(() => Promise.resolve([{ id: 100 }, { id: 101 }]));
		const ctx = createContext({ orgName: T.ORG, limit: 30 });
		const result = await organizationResource.handlers.listMembers.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 100 } }, { json: { id: 101 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith(
			'GET',
			`/orgs/${T.ORG}/members`,
			{},
			{ limit: 30 },
		);
	});
});
