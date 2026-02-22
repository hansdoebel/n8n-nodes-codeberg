import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { codebergApiRequest } from '../utils/apiRequest';
import { ENDPOINTS, PAGINATION } from '../utils/constants';
import { buildQueryString, resolveEndpoint, setIfDefined } from '../utils/helpers';
import type { ResourceDefinition } from '../utils/types';

const repositoryOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['repository'],
			},
		},
		options: [
			{ name: 'Create', value: 'create', action: 'Create a repository' },
			{ name: 'Delete', value: 'delete', action: 'Delete a repository' },
			{ name: 'Fork', value: 'fork', action: 'Fork a repository' },
			{ name: 'Get', value: 'get', action: 'Get a repository' },
			{ name: 'List', value: 'list', action: 'List repositories' },
			{ name: 'Search', value: 'search', action: 'Search repositories' },
			{ name: 'Update', value: 'update', action: 'Update a repository' },
		],
		default: 'get',
	},
];

const ownerField: INodeProperties = {
	displayName: 'Owner',
	name: 'owner',
	type: 'string',
	required: true,
	default: '',
	displayOptions: {
		show: {
			resource: ['repository'],
			operation: ['get', 'update', 'delete', 'fork'],
		},
	},
};

const repoField: INodeProperties = {
	displayName: 'Repository Name',
	name: 'repo',
	type: 'string',
	required: true,
	default: '',
	displayOptions: {
		show: {
			resource: ['repository'],
			operation: ['get', 'update', 'delete', 'fork'],
		},
	},
};

const createFields: INodeProperties[] = [
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['repository'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['repository'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Auto Init',
				name: 'auto_init',
				type: 'boolean',
				default: false,
			},
			{
				displayName: 'Default Branch',
				name: 'default_branch',
				type: 'string',
				default: 'main',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Gitignores',
				name: 'gitignores',
				type: 'string',
				default: '',
			},
			{
				displayName: 'License',
				name: 'license',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Private',
				name: 'private',
				type: 'boolean',
				default: false,
			},
			{
				displayName: 'README',
				name: 'readme',
				type: 'string',
				default: '',
			},
		],
	},
];

const updateFields: INodeProperties[] = [
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['repository'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Default Branch',
				name: 'default_branch',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Has Issues',
				name: 'has_issues',
				type: 'boolean',
				default: true,
			},
			{
				displayName: 'Has Pull Requests',
				name: 'has_pull_requests',
				type: 'boolean',
				default: true,
			},
			{
				displayName: 'Has Wiki',
				name: 'has_wiki',
				type: 'boolean',
				default: true,
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Private',
				name: 'private',
				type: 'boolean',
				default: false,
			},
			{
				displayName: 'Website',
				name: 'website',
				type: 'string',
				default: '',
			},
		],
	},
];

const searchFields: INodeProperties[] = [
	{
		displayName: 'Query',
		name: 'query',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['repository'],
				operation: ['search'],
			},
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['repository'],
				operation: ['search'],
			},
		},
		options: [
			// eslint-disable-next-line n8n-nodes-base/node-param-default-missing, n8n-nodes-base/node-param-description-missing-from-limit
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: { minValue: 1 },
				default: PAGINATION.DEFAULT_LIMIT,
			},
			{
				displayName: 'Order',
				name: 'order',
				type: 'options',
				options: [
					{ name: 'Ascending', value: 'asc' },
					{ name: 'Descending', value: 'desc' },
				],
				default: 'desc',
			},
			{
				displayName: 'Sort',
				name: 'sort',
				type: 'options',
				options: [
					{ name: 'Created', value: 'created' },
					{ name: 'Forks', value: 'forks' },
					{ name: 'Size', value: 'size' },
					{ name: 'Stars', value: 'stars' },
					{ name: 'Updated', value: 'updated' },
				],
				default: 'updated',
			},
		],
	},
];

const listFields: INodeProperties[] = [
	// eslint-disable-next-line n8n-nodes-base/node-param-default-missing, n8n-nodes-base/node-param-description-missing-from-limit
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1 },
		default: PAGINATION.DEFAULT_LIMIT,
		displayOptions: {
			show: {
				resource: ['repository'],
				operation: ['list'],
			},
		},
	},
];

const forkFields: INodeProperties[] = [
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['repository'],
				operation: ['fork'],
			},
		},
		options: [
			{
				displayName: 'Organization',
				name: 'organization',
				type: 'string',
				default: '',
			},
		],
	},
];

async function repositoryCreate(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const name = this.getNodeParameter('name', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;
	const body: IDataObject = { name };
	setIfDefined(body, 'description', additionalFields.description);
	setIfDefined(body, 'private', additionalFields.private);
	setIfDefined(body, 'auto_init', additionalFields.auto_init);
	setIfDefined(body, 'gitignores', additionalFields.gitignores);
	setIfDefined(body, 'license', additionalFields.license);
	setIfDefined(body, 'default_branch', additionalFields.default_branch);
	setIfDefined(body, 'readme', additionalFields.readme);
	const response = await codebergApiRequest.call(this, 'POST', ENDPOINTS.USER_REPOS, body);
	return [{ json: response }];
}

async function repositoryGet(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const owner = this.getNodeParameter('owner', index) as string;
	const repo = this.getNodeParameter('repo', index) as string;
	const endpoint = resolveEndpoint(ENDPOINTS.REPO, { owner, repo });
	const response = await codebergApiRequest.call(this, 'GET', endpoint);
	return [{ json: response }];
}

async function repositoryUpdate(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const owner = this.getNodeParameter('owner', index) as string;
	const repo = this.getNodeParameter('repo', index) as string;
	const updateFieldsData = this.getNodeParameter('updateFields', index) as IDataObject;
	const body: IDataObject = {};
	setIfDefined(body, 'name', updateFieldsData.name);
	setIfDefined(body, 'description', updateFieldsData.description);
	setIfDefined(body, 'private', updateFieldsData.private);
	setIfDefined(body, 'default_branch', updateFieldsData.default_branch);
	setIfDefined(body, 'website', updateFieldsData.website);
	setIfDefined(body, 'has_issues', updateFieldsData.has_issues);
	setIfDefined(body, 'has_pull_requests', updateFieldsData.has_pull_requests);
	setIfDefined(body, 'has_wiki', updateFieldsData.has_wiki);
	const endpoint = resolveEndpoint(ENDPOINTS.REPO, { owner, repo });
	const response = await codebergApiRequest.call(this, 'PATCH', endpoint, body);
	return [{ json: response }];
}

async function repositoryDelete(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const owner = this.getNodeParameter('owner', index) as string;
	const repo = this.getNodeParameter('repo', index) as string;
	const endpoint = resolveEndpoint(ENDPOINTS.REPO, { owner, repo });
	await codebergApiRequest.call(this, 'DELETE', endpoint);
	return [{ json: { success: true } }];
}

async function repositorySearch(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const query = this.getNodeParameter('query', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;
	const qs = buildQueryString({
		q: query,
		sort: additionalFields.sort as string,
		order: additionalFields.order as string,
		limit: additionalFields.limit as number,
	});
	const response = await codebergApiRequest.call(this, 'GET', ENDPOINTS.REPOS_SEARCH, {}, qs);
	const data = response.data || response;
	if (Array.isArray(data)) {
		return data.map((item: IDataObject) => ({ json: item }));
	}
	return [{ json: response }];
}

async function repositoryList(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const limit = this.getNodeParameter('limit', index) as number;
	const qs = buildQueryString({ limit });
	const response = await codebergApiRequest.call(this, 'GET', ENDPOINTS.USER_REPOS, {}, qs);
	if (Array.isArray(response)) {
		return response.map((item: IDataObject) => ({ json: item }));
	}
	return [{ json: response }];
}

async function repositoryFork(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const owner = this.getNodeParameter('owner', index) as string;
	const repo = this.getNodeParameter('repo', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;
	const body: IDataObject = {};
	setIfDefined(body, 'organization', additionalFields.organization);
	const endpoint = resolveEndpoint(ENDPOINTS.REPO_FORKS, { owner, repo });
	const response = await codebergApiRequest.call(this, 'POST', endpoint, body);
	return [{ json: response }];
}

export const repositoryResource: ResourceDefinition = {
	name: 'repository',
	operations: repositoryOperations,
	fields: [
		ownerField,
		repoField,
		...createFields,
		...updateFields,
		...searchFields,
		...listFields,
		...forkFields,
	],
	handlers: {
		create: repositoryCreate,
		get: repositoryGet,
		update: repositoryUpdate,
		delete: repositoryDelete,
		search: repositorySearch,
		list: repositoryList,
		fork: repositoryFork,
	},
};
