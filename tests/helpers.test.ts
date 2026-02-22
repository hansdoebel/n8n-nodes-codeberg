/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @n8n/community-nodes/no-restricted-imports, import-x/no-unresolved */
import { describe, expect, test } from 'bun:test';
import {
	validatePathParam,
	extractResourceLocatorValue,
	setIfDefined,
	parseLinkHeader,
	resolveEndpoint,
	buildQueryString,
} from '../nodes/Codeberg/utils/helpers';
import { ResourceRegistry } from '../nodes/Codeberg/utils/registry';
import { ENDPOINTS } from '../nodes/Codeberg/utils/constants';
import type { ResourceDefinition } from '../nodes/Codeberg/utils/types';

describe('validatePathParam', () => {
	test('accepts valid alphanumeric strings', () => {
		expect(validatePathParam('hello', 'test')).toBe('hello');
		expect(validatePathParam('Hello123', 'test')).toBe('Hello123');
	});

	test('accepts hyphens, underscores, dots, and plus', () => {
		expect(validatePathParam('my-repo', 'test')).toBe('my-repo');
		expect(validatePathParam('my_repo', 'test')).toBe('my_repo');
		expect(validatePathParam('file.txt', 'test')).toBe('file.txt');
		expect(validatePathParam('a+b', 'test')).toBe('a+b');
	});

	test('throws on empty string', () => {
		expect(() => validatePathParam('', 'test')).toThrow('Invalid test');
	});

	test('throws on invalid characters', () => {
		expect(() => validatePathParam('a/b', 'test')).toThrow('Invalid test');
		expect(() => validatePathParam('a b', 'test')).toThrow('Invalid test');
		expect(() => validatePathParam('a@b', 'test')).toThrow('Invalid test');
	});
});

describe('extractResourceLocatorValue', () => {
	test('extracts value from object', () => {
		expect(extractResourceLocatorValue({ mode: 'id', value: '123' })).toBe('123');
	});

	test('returns string directly', () => {
		expect(extractResourceLocatorValue('hello')).toBe('hello');
	});

	test('returns empty string for undefined', () => {
		expect(extractResourceLocatorValue(undefined)).toBe('');
	});

	test('returns empty string for object with no value', () => {
		expect(extractResourceLocatorValue({ mode: 'id', value: '' })).toBe('');
	});
});

describe('setIfDefined', () => {
	test('sets value when defined', () => {
		const obj: Record<string, unknown> = {};
		setIfDefined(obj, 'key', 'value');
		expect(obj.key).toBe('value');
	});

	test('sets boolean false', () => {
		const obj: Record<string, unknown> = {};
		setIfDefined(obj, 'key', false);
		expect(obj.key).toBe(false);
	});

	test('sets number zero', () => {
		const obj: Record<string, unknown> = {};
		setIfDefined(obj, 'key', 0);
		expect(obj.key).toBe(0);
	});

	test('skips undefined', () => {
		const obj: Record<string, unknown> = {};
		setIfDefined(obj, 'key', undefined);
		expect(obj).toEqual({});
	});

	test('skips empty string', () => {
		const obj: Record<string, unknown> = {};
		setIfDefined(obj, 'key', '');
		expect(obj).toEqual({});
	});

	test('skips null', () => {
		const obj: Record<string, unknown> = {};
		setIfDefined(obj, 'key', null);
		expect(obj).toEqual({});
	});
});

describe('parseLinkHeader', () => {
	test('parses single link', () => {
		const header = '<https://example.com?page=2>; rel="next"';
		const result = parseLinkHeader(header);
		expect(result.next).toBe('https://example.com?page=2');
	});

	test('parses multiple links', () => {
		const header =
			'<https://example.com?page=2>; rel="next", <https://example.com?page=5>; rel="last"';
		const result = parseLinkHeader(header);
		expect(result.next).toBe('https://example.com?page=2');
		expect(result.last).toBe('https://example.com?page=5');
	});

	test('returns empty object for undefined', () => {
		expect(parseLinkHeader(undefined)).toEqual({});
	});

	test('returns empty object for empty string', () => {
		expect(parseLinkHeader('')).toEqual({});
	});
});

describe('resolveEndpoint', () => {
	test('resolves single parameter', () => {
		expect(resolveEndpoint(ENDPOINTS.ORG, { owner: 'myorg' })).toBe('/orgs/myorg');
	});

	test('resolves multiple parameters', () => {
		expect(resolveEndpoint(ENDPOINTS.REPO, { owner: 'user', repo: 'project' })).toBe(
			'/repos/user/project',
		);
	});

	test('throws on missing parameter', () => {
		expect(() => resolveEndpoint(ENDPOINTS.REPO, { owner: 'user' })).toThrow(
			'Missing endpoint parameter: repo',
		);
	});

	test('throws on invalid path characters', () => {
		expect(() => resolveEndpoint(ENDPOINTS.REPO, { owner: 'us er', repo: 'test' })).toThrow(
			'Invalid owner',
		);
	});

	test('uses encodeURI for rawKeys', () => {
		const result = resolveEndpoint(
			ENDPOINTS.FILE_CONTENTS,
			{ owner: 'user', repo: 'project', filepath: 'path/to/file.txt' },
			new Set(['filepath']),
		);
		expect(result).toBe('/repos/user/project/contents/path/to/file.txt');
	});

	test('encodes special URI characters in rawKeys', () => {
		const result = resolveEndpoint(
			ENDPOINTS.FILE_CONTENTS,
			{ owner: 'user', repo: 'project', filepath: 'path/to/my file.txt' },
			new Set(['filepath']),
		);
		expect(result).toBe('/repos/user/project/contents/path/to/my%20file.txt');
	});
});

describe('buildQueryString', () => {
	test('includes defined values', () => {
		expect(buildQueryString({ q: 'test', limit: 10 })).toEqual({ q: 'test', limit: 10 });
	});

	test('excludes undefined values', () => {
		expect(buildQueryString({ q: 'test', sort: undefined })).toEqual({ q: 'test' });
	});

	test('excludes empty strings', () => {
		expect(buildQueryString({ q: 'test', sort: '' })).toEqual({ q: 'test' });
	});

	test('includes boolean false', () => {
		expect(buildQueryString({ draft: false })).toEqual({ draft: false });
	});

	test('includes zero', () => {
		expect(buildQueryString({ page: 0 })).toEqual({ page: 0 });
	});

	test('returns empty object for all undefined', () => {
		expect(buildQueryString({ a: undefined, b: undefined })).toEqual({});
	});
});

describe('ResourceRegistry', () => {
	function createTestResource(name: string): ResourceDefinition {
		return {
			name,
			operations: [
				{
					displayName: 'Operation',
					name: 'operation',
					type: 'options',
					options: [{ name: 'Get', value: 'get' }],
					default: 'get',
				},
			],
			fields: [],
			handlers: {
				get: async function (this: any, _index: number) {
					return [{ json: { resource: name } }];
				},
			},
		};
	}

	test('registers and retrieves handler', () => {
		const reg = new ResourceRegistry();
		reg.register(createTestResource('test'));
		const handler = reg.getHandler('test', 'get');
		expect(handler).toBeDefined();
	});

	test('returns undefined for missing resource', () => {
		const reg = new ResourceRegistry();
		expect(reg.getHandler('missing', 'get')).toBeUndefined();
	});

	test('returns undefined for missing operation', () => {
		const reg = new ResourceRegistry();
		reg.register(createTestResource('test'));
		expect(reg.getHandler('test', 'missing')).toBeUndefined();
	});

	test('getAllProperties returns all operations and fields', () => {
		const reg = new ResourceRegistry();
		const resource = createTestResource('test');
		resource.fields = [
			{ displayName: 'Field', name: 'field', type: 'string', default: '' },
		];
		reg.register(resource);
		const props = reg.getAllProperties();
		expect(props.length).toBe(2);
	});

	test('getResourceNames returns registered names', () => {
		const reg = new ResourceRegistry();
		reg.register(createTestResource('alpha'));
		reg.register(createTestResource('beta'));
		expect(reg.getResourceNames()).toEqual(['alpha', 'beta']);
	});

	test('buildResourceSelector creates options from resources', () => {
		const reg = new ResourceRegistry();
		reg.register(createTestResource('repository'));
		reg.register(createTestResource('pullRequest'));
		const selector = reg.buildResourceSelector();
		expect(selector.name).toBe('resource');
		expect(selector.type).toBe('options');
		expect((selector.options as any[]).length).toBe(2);
		expect((selector.options as any[])[0].value).toBe('repository');
		expect((selector.options as any[])[1].value).toBe('pullRequest');
	});

	test('getAllLoadOptions aggregates methods', () => {
		const reg = new ResourceRegistry();
		const resource = createTestResource('test');
		resource.methods = {
			loadOptions: {
				getThings: async function (this: any) {
					return [];
				},
			},
		};
		reg.register(resource);
		const opts = reg.getAllLoadOptions();
		expect(opts.getThings).toBeDefined();
	});
});
