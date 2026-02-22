import type { IDataObject } from 'n8n-workflow';
import type { ResourceLocatorValue } from './types';

const SAFE_PATH_PARAM = /^[a-zA-Z0-9_.+-]+$/;

export function validatePathParam(value: string, name: string): string {
	if (!value || !SAFE_PATH_PARAM.test(value)) {
		throw new Error(
			`Invalid ${name}: must contain only letters, numbers, hyphens, underscores, dots, or plus signs`,
		);
	}
	return value;
}

export function extractResourceLocatorValue(
	value: string | ResourceLocatorValue | undefined,
): string {
	if (typeof value === 'object' && value !== null) {
		return value.value || '';
	}
	return value || '';
}

export function setIfDefined<T extends Record<string, unknown>>(
	target: T,
	key: string,
	value: unknown,
): void {
	if (value !== undefined && value !== '' && value !== null) {
		(target as Record<string, unknown>)[key] = value;
	}
}

export function parseLinkHeader(header?: string): Record<string, string> {
	const links: Record<string, string> = {};

	for (const part of header?.split(',') ?? []) {
		const section = part.trim();
		const match = section.match(/^<([^>]+)>\s*;\s*rel="?([^"]+)"?/);
		if (match) {
			const [, url, rel] = match;
			links[rel] = url;
		}
	}

	return links;
}

export function resolveEndpoint(
	template: string,
	params: Record<string, string>,
	rawKeys?: Set<string>,
): string {
	return template.replace(/\{(\w+)\}/g, (_, key) => {
		const value = params[key];
		if (value === undefined) {
			throw new Error(`Missing endpoint parameter: ${key}`);
		}
		if (rawKeys?.has(key)) {
			return encodeURI(value);
		}
		return validatePathParam(value, key);
	});
}

export function buildQueryString(
	params: Record<string, string | number | boolean | undefined>,
): IDataObject {
	const qs: IDataObject = {};
	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined && value !== '' && value !== null) {
			qs[key] = value;
		}
	}
	return qs;
}
