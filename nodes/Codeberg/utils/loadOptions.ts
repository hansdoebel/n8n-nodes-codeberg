import type { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
import { codebergApiRequest } from './apiRequest';

async function getRepositories(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const response = await codebergApiRequest.call(this, 'GET', '/user/repos');
	if (!Array.isArray(response)) {
		return [];
	}
	return response.map((repo: { full_name: string }) => ({
		name: repo.full_name,
		value: repo.full_name,
	}));
}

async function getLabels(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const owner = this.getNodeParameter('owner', '') as string;
	const repo = this.getNodeParameter('repositoryName', '') as string;
	if (!owner || !repo) {
		return [];
	}
	const response = await codebergApiRequest.call(
		this,
		'GET',
		`/repos/${owner}/${repo}/labels`,
	);
	if (!Array.isArray(response)) {
		return [];
	}
	return response.map((label: { name: string; id: number }) => ({
		name: label.name,
		value: label.id,
	}));
}

async function getMilestones(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const owner = this.getNodeParameter('owner', '') as string;
	const repo = this.getNodeParameter('repositoryName', '') as string;
	if (!owner || !repo) {
		return [];
	}
	const response = await codebergApiRequest.call(
		this,
		'GET',
		`/repos/${owner}/${repo}/milestones`,
	);
	if (!Array.isArray(response)) {
		return [];
	}
	return response.map((milestone: { title: string; id: number }) => ({
		name: milestone.title,
		value: milestone.id,
	}));
}

async function getOrganizations(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const response = await codebergApiRequest.call(this, 'GET', '/user/orgs');
	if (!Array.isArray(response)) {
		return [];
	}
	return response.map((org: { username: string }) => ({
		name: org.username,
		value: org.username,
	}));
}

async function getBranches(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const owner = this.getNodeParameter('owner', '') as string;
	const repo = this.getNodeParameter('repositoryName', '') as string;
	if (!owner || !repo) {
		return [];
	}
	const response = await codebergApiRequest.call(
		this,
		'GET',
		`/repos/${owner}/${repo}/branches`,
	);
	if (!Array.isArray(response)) {
		return [];
	}
	return response.map((branch: { name: string }) => ({
		name: branch.name,
		value: branch.name,
	}));
}

async function getUsers(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const owner = this.getNodeParameter('owner', '') as string;
	const repo = this.getNodeParameter('repositoryName', '') as string;
	if (!owner || !repo) {
		return [];
	}
	const response = await codebergApiRequest.call(
		this,
		'GET',
		`/repos/${owner}/${repo}/assignees`,
	);
	if (!Array.isArray(response)) {
		return [];
	}
	return response.map((user: { login: string }) => ({
		name: user.login,
		value: user.login,
	}));
}

export const loadOptionsMethods = {
	getRepositories,
	getLabels,
	getMilestones,
	getOrganizations,
	getBranches,
	getUsers,
};
