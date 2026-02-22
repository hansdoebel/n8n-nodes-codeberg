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

const pullRequestOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['pullRequest'],
			},
		},
		options: [
			{ name: 'Create', value: 'create', action: 'Create a pull request' },
			{ name: 'Get', value: 'get', action: 'Get a pull request' },
			{ name: 'List', value: 'list', action: 'List pull requests' },
			{ name: 'Merge', value: 'merge', action: 'Merge a pull request' },
			{ name: 'Update', value: 'update', action: 'Update a pull request' },
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
			resource: ['pullRequest'],
			operation: ['create', 'get', 'update', 'list', 'merge'],
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
			resource: ['pullRequest'],
			operation: ['create', 'get', 'update', 'list', 'merge'],
		},
	},
};

const pullNumberField: INodeProperties = {
	displayName: 'Pull Request Number',
	name: 'pullNumber',
	type: 'number',
	required: true,
	default: 0,
	displayOptions: {
		show: {
			resource: ['pullRequest'],
			operation: ['get', 'update', 'merge'],
		},
	},
};

const createFields: INodeProperties[] = [
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['pullRequest'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Head Branch',
		name: 'head',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['pullRequest'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Base Branch',
		name: 'base',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['pullRequest'],
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
				resource: ['pullRequest'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Assignees',
				name: 'assignees',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Body',
				name: 'body',
				type: 'string',
				typeOptions: { rows: 5 },
				default: '',
			},
			{
				displayName: 'Labels',
				name: 'labels',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Milestone',
				name: 'milestone',
				type: 'number',
				default: 0,
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
				resource: ['pullRequest'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Assignees',
				name: 'assignees',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Base Branch',
				name: 'base',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Body',
				name: 'body',
				type: 'string',
				typeOptions: { rows: 5 },
				default: '',
			},
			{
				displayName: 'Labels',
				name: 'labels',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Milestone',
				name: 'milestone',
				type: 'number',
				default: 0,
			},
			{
				displayName: 'State',
				name: 'state',
				type: 'options',
				options: [
					{ name: 'Closed', value: 'closed' },
					{ name: 'Open', value: 'open' },
				],
				default: 'open',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
			},
		],
	},
];

const listFields: INodeProperties[] = [
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['pullRequest'],
				operation: ['list'],
			},
		},
		options: [
			{
				displayName: 'Labels',
				name: 'labels',
				type: 'string',
				default: '',
			},
			// eslint-disable-next-line n8n-nodes-base/node-param-default-missing, n8n-nodes-base/node-param-description-missing-from-limit
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: { minValue: 1 },
				default: PAGINATION.DEFAULT_LIMIT,
			},
			{
				displayName: 'Milestone',
				name: 'milestone',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Sort',
				name: 'sort',
				type: 'options',
				options: [
					{ name: 'Created', value: 'created' },
					{ name: 'Oldest', value: 'oldest' },
					{ name: 'Priority', value: 'priority' },
					{ name: 'Updated', value: 'updated' },
				],
				default: 'created',
			},
			{
				displayName: 'State',
				name: 'state',
				type: 'options',
				options: [
					{ name: 'All', value: 'all' },
					{ name: 'Closed', value: 'closed' },
					{ name: 'Open', value: 'open' },
				],
				default: 'open',
			},
		],
	},
];

const mergeFields: INodeProperties[] = [
	{
		displayName: 'Merge Method',
		name: 'mergeMethod',
		type: 'options',
		required: true,
		options: [
			{ name: 'Merge', value: 'merge' },
			{ name: 'Rebase', value: 'rebase' },
			{ name: 'Squash', value: 'squash' },
		],
		default: 'merge',
		displayOptions: {
			show: {
				resource: ['pullRequest'],
				operation: ['merge'],
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
				resource: ['pullRequest'],
				operation: ['merge'],
			},
		},
		options: [
			{
				displayName: 'Delete Branch After Merge',
				name: 'delete_branch_after_merge',
				type: 'boolean',
				default: false,
			},
			{
				displayName: 'Merge Commit Message',
				name: 'merge_message_field',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Merge Title',
				name: 'merge_title_field',
				type: 'string',
				default: '',
			},
		],
	},
];

function parseCommaSeparated(value: string): string[] {
	return value
		.split(',')
		.map((s) => s.trim())
		.filter((s) => s.length > 0);
}

function parseNumberList(value: string): number[] {
	return value
		.split(',')
		.map((s) => parseInt(s.trim(), 10))
		.filter((n) => !isNaN(n));
}

async function pullRequestCreate(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const owner = this.getNodeParameter('owner', index) as string;
	const repo = this.getNodeParameter('repo', index) as string;
	const title = this.getNodeParameter('title', index) as string;
	const head = this.getNodeParameter('head', index) as string;
	const base = this.getNodeParameter('base', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;
	const body: IDataObject = { title, head, base };
	setIfDefined(body, 'body', additionalFields.body);
	setIfDefined(body, 'milestone', additionalFields.milestone);
	if (additionalFields.assignees && typeof additionalFields.assignees === 'string') {
		body.assignees = parseCommaSeparated(additionalFields.assignees as string);
	}
	if (additionalFields.labels && typeof additionalFields.labels === 'string') {
		body.labels = parseNumberList(additionalFields.labels as string);
	}
	const endpoint = resolveEndpoint(ENDPOINTS.PULLS, { owner, repo });
	const response = await codebergApiRequest.call(this, 'POST', endpoint, body);
	return [{ json: response }];
}

async function pullRequestGet(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const owner = this.getNodeParameter('owner', index) as string;
	const repo = this.getNodeParameter('repo', index) as string;
	const pullNumber = this.getNodeParameter('pullNumber', index) as number;
	const endpoint = resolveEndpoint(ENDPOINTS.PULL, { owner, repo, index: String(pullNumber) });
	const response = await codebergApiRequest.call(this, 'GET', endpoint);
	return [{ json: response }];
}

async function pullRequestUpdate(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const owner = this.getNodeParameter('owner', index) as string;
	const repo = this.getNodeParameter('repo', index) as string;
	const pullNumber = this.getNodeParameter('pullNumber', index) as number;
	const updateFieldsData = this.getNodeParameter('updateFields', index) as IDataObject;
	const body: IDataObject = {};
	setIfDefined(body, 'title', updateFieldsData.title);
	setIfDefined(body, 'body', updateFieldsData.body);
	setIfDefined(body, 'state', updateFieldsData.state);
	setIfDefined(body, 'base', updateFieldsData.base);
	setIfDefined(body, 'milestone', updateFieldsData.milestone);
	if (updateFieldsData.assignees && typeof updateFieldsData.assignees === 'string') {
		body.assignees = parseCommaSeparated(updateFieldsData.assignees as string);
	}
	if (updateFieldsData.labels && typeof updateFieldsData.labels === 'string') {
		body.labels = parseNumberList(updateFieldsData.labels as string);
	}
	const endpoint = resolveEndpoint(ENDPOINTS.PULL, { owner, repo, index: String(pullNumber) });
	const response = await codebergApiRequest.call(this, 'PATCH', endpoint, body);
	return [{ json: response }];
}

async function pullRequestList(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const owner = this.getNodeParameter('owner', index) as string;
	const repo = this.getNodeParameter('repo', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;
	const qs = buildQueryString({
		state: additionalFields.state as string,
		sort: additionalFields.sort as string,
		labels: additionalFields.labels as string,
		milestone: additionalFields.milestone as string,
		limit: additionalFields.limit as number,
	});
	const endpoint = resolveEndpoint(ENDPOINTS.PULLS, { owner, repo });
	const response = await codebergApiRequest.call(this, 'GET', endpoint, {}, qs);
	if (Array.isArray(response)) {
		return response.map((item: IDataObject) => ({ json: item }));
	}
	return [{ json: response }];
}

async function pullRequestMerge(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const owner = this.getNodeParameter('owner', index) as string;
	const repo = this.getNodeParameter('repo', index) as string;
	const pullNumber = this.getNodeParameter('pullNumber', index) as number;
	const mergeMethod = this.getNodeParameter('mergeMethod', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;
	const body: IDataObject = { Do: mergeMethod };
	setIfDefined(body, 'merge_message_field', additionalFields.merge_message_field);
	setIfDefined(body, 'merge_title_field', additionalFields.merge_title_field);
	setIfDefined(body, 'delete_branch_after_merge', additionalFields.delete_branch_after_merge);
	const endpoint = resolveEndpoint(ENDPOINTS.PULL_MERGE, { owner, repo, index: String(pullNumber) });
	const response = await codebergApiRequest.call(this, 'POST', endpoint, body);
	return [{ json: response || { success: true } }];
}

export const pullRequestResource: ResourceDefinition = {
	name: 'pullRequest',
	operations: pullRequestOperations,
	fields: [
		ownerField,
		repoField,
		pullNumberField,
		...createFields,
		...updateFields,
		...listFields,
		...mergeFields,
	],
	handlers: {
		create: pullRequestCreate,
		get: pullRequestGet,
		update: pullRequestUpdate,
		list: pullRequestList,
		merge: pullRequestMerge,
	},
};
