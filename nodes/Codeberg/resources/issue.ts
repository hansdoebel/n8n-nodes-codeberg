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

const issueOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['issue'],
			},
		},
		options: [
			{ name: 'Create', value: 'create', action: 'Create an issue' },
			{ name: 'Delete', value: 'delete', action: 'Delete an issue' },
			{ name: 'Get', value: 'get', action: 'Get an issue' },
			{ name: 'List', value: 'list', action: 'List issues' },
			{ name: 'Search', value: 'search', action: 'Search issues' },
			{ name: 'Update', value: 'update', action: 'Update an issue' },
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
			resource: ['issue'],
			operation: ['create', 'get', 'update', 'delete', 'list'],
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
			resource: ['issue'],
			operation: ['create', 'get', 'update', 'delete', 'list'],
		},
	},
};

const issueNumberField: INodeProperties = {
	displayName: 'Issue Number',
	name: 'issueNumber',
	type: 'number',
	required: true,
	default: 0,
	displayOptions: {
		show: {
			resource: ['issue'],
			operation: ['get', 'update', 'delete'],
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
				resource: ['issue'],
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
				resource: ['issue'],
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
				displayName: 'Deadline',
				name: 'due_date',
				type: 'dateTime',
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
				resource: ['issue'],
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
				displayName: 'Body',
				name: 'body',
				type: 'string',
				typeOptions: { rows: 5 },
				default: '',
			},
			{
				displayName: 'Deadline',
				name: 'due_date',
				type: 'dateTime',
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
					{ name: 'Open', value: 'open' },
					{ name: 'Closed', value: 'closed' },
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
				resource: ['issue'],
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
					{ name: 'Due Date', value: 'due_date' },
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

const searchFields: INodeProperties[] = [
	{
		displayName: 'Query',
		name: 'query',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['issue'],
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
				resource: ['issue'],
				operation: ['search'],
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
					{ name: 'Due Date', value: 'due_date' },
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

async function issueCreate(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const owner = this.getNodeParameter('owner', index) as string;
	const repo = this.getNodeParameter('repo', index) as string;
	const title = this.getNodeParameter('title', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;
	const body: IDataObject = { title };
	setIfDefined(body, 'body', additionalFields.body);
	setIfDefined(body, 'due_date', additionalFields.due_date);
	setIfDefined(body, 'milestone', additionalFields.milestone);
	if (additionalFields.assignees && typeof additionalFields.assignees === 'string') {
		body.assignees = parseCommaSeparated(additionalFields.assignees as string);
	}
	if (additionalFields.labels && typeof additionalFields.labels === 'string') {
		body.labels = parseNumberList(additionalFields.labels as string);
	}
	const endpoint = resolveEndpoint(ENDPOINTS.ISSUES, { owner, repo });
	const response = await codebergApiRequest.call(this, 'POST', endpoint, body);
	return [{ json: response }];
}

async function issueGet(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const owner = this.getNodeParameter('owner', index) as string;
	const repo = this.getNodeParameter('repo', index) as string;
	const issueNumber = this.getNodeParameter('issueNumber', index) as number;
	const endpoint = resolveEndpoint(ENDPOINTS.ISSUE, { owner, repo, index: String(issueNumber) });
	const response = await codebergApiRequest.call(this, 'GET', endpoint);
	return [{ json: response }];
}

async function issueUpdate(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const owner = this.getNodeParameter('owner', index) as string;
	const repo = this.getNodeParameter('repo', index) as string;
	const issueNumber = this.getNodeParameter('issueNumber', index) as number;
	const updateFieldsData = this.getNodeParameter('updateFields', index) as IDataObject;
	const body: IDataObject = {};
	setIfDefined(body, 'title', updateFieldsData.title);
	setIfDefined(body, 'body', updateFieldsData.body);
	setIfDefined(body, 'state', updateFieldsData.state);
	setIfDefined(body, 'due_date', updateFieldsData.due_date);
	setIfDefined(body, 'milestone', updateFieldsData.milestone);
	if (updateFieldsData.assignees && typeof updateFieldsData.assignees === 'string') {
		body.assignees = parseCommaSeparated(updateFieldsData.assignees as string);
	}
	if (updateFieldsData.labels && typeof updateFieldsData.labels === 'string') {
		body.labels = parseNumberList(updateFieldsData.labels as string);
	}
	const endpoint = resolveEndpoint(ENDPOINTS.ISSUE, { owner, repo, index: String(issueNumber) });
	const response = await codebergApiRequest.call(this, 'PATCH', endpoint, body);
	return [{ json: response }];
}

async function issueDelete(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const owner = this.getNodeParameter('owner', index) as string;
	const repo = this.getNodeParameter('repo', index) as string;
	const issueNumber = this.getNodeParameter('issueNumber', index) as number;
	const endpoint = resolveEndpoint(ENDPOINTS.ISSUE, { owner, repo, index: String(issueNumber) });
	await codebergApiRequest.call(this, 'DELETE', endpoint);
	return [{ json: { success: true } }];
}

async function issueList(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const owner = this.getNodeParameter('owner', index) as string;
	const repo = this.getNodeParameter('repo', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;
	const qs = buildQueryString({
		state: additionalFields.state as string,
		labels: additionalFields.labels as string,
		milestone: additionalFields.milestone as string,
		sort: additionalFields.sort as string,
		limit: additionalFields.limit as number,
	});
	const endpoint = resolveEndpoint(ENDPOINTS.ISSUES, { owner, repo });
	const response = await codebergApiRequest.call(this, 'GET', endpoint, {}, qs);
	if (Array.isArray(response)) {
		return response.map((item: IDataObject) => ({ json: item }));
	}
	return [{ json: response }];
}

async function issueSearch(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const query = this.getNodeParameter('query', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;
	const qs = buildQueryString({
		q: query,
		state: additionalFields.state as string,
		labels: additionalFields.labels as string,
		sort: additionalFields.sort as string,
		order: additionalFields.order as string,
		limit: additionalFields.limit as number,
	});
	const response = await codebergApiRequest.call(this, 'GET', ENDPOINTS.ISSUES_SEARCH, {}, qs);
	if (Array.isArray(response)) {
		return response.map((item: IDataObject) => ({ json: item }));
	}
	return [{ json: response }];
}

export const issueResource: ResourceDefinition = {
	name: 'issue',
	operations: issueOperations,
	fields: [
		ownerField,
		repoField,
		issueNumberField,
		...createFields,
		...updateFields,
		...listFields,
		...searchFields,
	],
	handlers: {
		create: issueCreate,
		get: issueGet,
		update: issueUpdate,
		delete: issueDelete,
		list: issueList,
		search: issueSearch,
	},
};
