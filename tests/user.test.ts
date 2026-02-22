/* eslint-disable @typescript-eslint/no-explicit-any, @n8n/community-nodes/no-restricted-imports, import-x/no-unresolved */
import { describe, test, expect } from 'bun:test';
import { mockApiRequest, createContext, T, ENDPOINTS, setupBeforeEach } from './testUtils';
import { userResource } from '../nodes/Codeberg/resources/user';

setupBeforeEach();

describe('User', () => {
	test('get', async () => {
		mockApiRequest.mockImplementation(() => Promise.resolve({ id: 1, login: 'me' }));
		const ctx = createContext({});
		const result = await userResource.handlers.get.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1, login: 'me' } }]);
		expect(mockApiRequest).toHaveBeenCalledWith('GET', ENDPOINTS.USER);
	});

	test('getByUsername', async () => {
		mockApiRequest.mockImplementation(() => Promise.resolve({ id: 2, login: T.USERNAME }));
		const ctx = createContext({ username: T.USERNAME });
		const result = await userResource.handlers.getByUsername.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 2, login: T.USERNAME } }]);
		expect(mockApiRequest).toHaveBeenCalledWith('GET', `/users/${T.USERNAME}`);
	});

	test('search with minimal params', async () => {
		mockApiRequest.mockImplementation(() =>
			Promise.resolve({ data: [{ id: 1 }, { id: 2 }] }),
		);
		const ctx = createContext({ query: 'alice', additionalFields: {} });
		const result = await userResource.handlers.search.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }, { json: { id: 2 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith(
			'GET',
			ENDPOINTS.USERS_SEARCH,
			{},
			{ q: 'alice' },
		);
	});

	test('search with limit', async () => {
		mockApiRequest.mockImplementation(() => Promise.resolve({ data: [{ id: 5 }] }));
		const ctx = createContext({
			query: 'bob',
			additionalFields: { limit: 10 },
		});
		const result = await userResource.handlers.search.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 5 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith(
			'GET',
			ENDPOINTS.USERS_SEARCH,
			{},
			{ q: 'bob', limit: 10 },
		);
	});
});
