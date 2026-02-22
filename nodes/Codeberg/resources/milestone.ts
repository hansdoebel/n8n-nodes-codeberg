import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import type { ResourceDefinition } from '../utils/types';
import { codebergApiRequest, codebergApiRequestAllItems } from '../utils/apiRequest';
import { ENDPOINTS } from '../utils/constants';
import { setIfDefined, buildQueryString, resolveEndpoint } from '../utils/helpers';

const ownerField: INodeProperties = {
	displayName: 'Repository Owner',
	name: 'owner',
	type: 'string',
	required: true,
	default: '',
	placeholder: 'e.g. my-org',
	description: 'Owner of the repository',
};

const repoField: INodeProperties = {
	displayName: 'Repository Name',
	name: 'repo',
	type: 'string',
	required: true,
	default: '',
	placeholder: 'e.g. my-repo',
	description: 'Name of the repository',
};

const milestoneOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['milestone'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a milestone',
				action: 'Create a milestone',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a milestone',
				action: 'Delete a milestone',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a milestone',
				action: 'Get a milestone',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List milestones',
				action: 'List milestones',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a milestone',
				action: 'Update a milestone',
			},
		],
		default: 'create',
	},
];

const createFields: INodeProperties[] = [
	{
		...ownerField,
		displayOptions: { show: { resource: ['milestone'], operation: ['create'] } },
	},
	{
		...repoField,
		displayOptions: { show: { resource: ['milestone'], operation: ['create'] } },
	},
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		required: true,
		default: '',
		description: 'The title of the milestone',
		displayOptions: { show: { resource: ['milestone'], operation: ['create'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['milestone'], operation: ['create'] } },
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				typeOptions: { rows: 5 },
				default: '',
				description: 'Description of the milestone',
			},
			{
				displayName: 'Due Date',
				name: 'due_on',
				type: 'dateTime',
				default: '',
				description: 'The due date of the milestone',
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
				description: 'The state of the milestone',
			},
		],
	},
];

const getFields: INodeProperties[] = [
	{
		...ownerField,
		displayOptions: { show: { resource: ['milestone'], operation: ['get'] } },
	},
	{
		...repoField,
		displayOptions: { show: { resource: ['milestone'], operation: ['get'] } },
	},
	{
		displayName: 'Milestone ID',
		name: 'milestoneId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The ID of the milestone',
		displayOptions: { show: { resource: ['milestone'], operation: ['get'] } },
	},
];

const updateFields: INodeProperties[] = [
	{
		...ownerField,
		displayOptions: { show: { resource: ['milestone'], operation: ['update'] } },
	},
	{
		...repoField,
		displayOptions: { show: { resource: ['milestone'], operation: ['update'] } },
	},
	{
		displayName: 'Milestone ID',
		name: 'milestoneId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The ID of the milestone',
		displayOptions: { show: { resource: ['milestone'], operation: ['update'] } },
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['milestone'], operation: ['update'] } },
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				typeOptions: { rows: 5 },
				default: '',
				description: 'Description of the milestone',
			},
			{
				displayName: 'Due Date',
				name: 'due_on',
				type: 'dateTime',
				default: '',
				description: 'The due date of the milestone',
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
				description: 'The state of the milestone',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				description: 'The title of the milestone',
			},
		],
	},
];

const deleteFields: INodeProperties[] = [
	{
		...ownerField,
		displayOptions: { show: { resource: ['milestone'], operation: ['delete'] } },
	},
	{
		...repoField,
		displayOptions: { show: { resource: ['milestone'], operation: ['delete'] } },
	},
	{
		displayName: 'Milestone ID',
		name: 'milestoneId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The ID of the milestone',
		displayOptions: { show: { resource: ['milestone'], operation: ['delete'] } },
	},
];

const listFields: INodeProperties[] = [
	{
		...ownerField,
		displayOptions: { show: { resource: ['milestone'], operation: ['list'] } },
	},
	{
		...repoField,
		displayOptions: { show: { resource: ['milestone'], operation: ['list'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['milestone'], operation: ['list'] } },
		options: [
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: { minValue: 1 },
				default: 50,
				description: 'Max number of results to return',
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
				description: 'Filter by milestone state',
			},
		],
	},
];

async function createHandler(this: IExecuteFunctions, index: number) {
	const owner = this.getNodeParameter('owner', index) as string;
	const repo = this.getNodeParameter('repo', index) as string;
	const title = this.getNodeParameter('title', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index) as {
		description?: string;
		state?: string;
		due_on?: string;
	};

	const body: Record<string, unknown> = { title };
	setIfDefined(body, 'description', additionalFields.description);
	setIfDefined(body, 'state', additionalFields.state);
	setIfDefined(body, 'due_on', additionalFields.due_on);

	const responseData = await codebergApiRequest.call(
		this,
		'POST',
		resolveEndpoint(ENDPOINTS.MILESTONES, { owner, repo }),
		body as IDataObject,
	);
	return [{ json: responseData }];
}

async function getHandler(this: IExecuteFunctions, index: number) {
	const owner = this.getNodeParameter('owner', index) as string;
	const repo = this.getNodeParameter('repo', index) as string;
	const milestoneId = this.getNodeParameter('milestoneId', index) as number;

	const responseData = await codebergApiRequest.call(
		this,
		'GET',
		resolveEndpoint(ENDPOINTS.MILESTONE, { owner, repo, id: String(milestoneId) }),
	);
	return [{ json: responseData }];
}

async function updateHandler(this: IExecuteFunctions, index: number) {
	const owner = this.getNodeParameter('owner', index) as string;
	const repo = this.getNodeParameter('repo', index) as string;
	const milestoneId = this.getNodeParameter('milestoneId', index) as number;
	const updateFieldsParam = this.getNodeParameter('updateFields', index) as {
		title?: string;
		description?: string;
		state?: string;
		due_on?: string;
	};

	const body: Record<string, unknown> = {};
	setIfDefined(body, 'title', updateFieldsParam.title);
	setIfDefined(body, 'description', updateFieldsParam.description);
	setIfDefined(body, 'state', updateFieldsParam.state);
	setIfDefined(body, 'due_on', updateFieldsParam.due_on);

	const responseData = await codebergApiRequest.call(
		this,
		'PATCH',
		resolveEndpoint(ENDPOINTS.MILESTONE, { owner, repo, id: String(milestoneId) }),
		body as IDataObject,
	);
	return [{ json: responseData }];
}

async function deleteHandler(this: IExecuteFunctions, index: number) {
	const owner = this.getNodeParameter('owner', index) as string;
	const repo = this.getNodeParameter('repo', index) as string;
	const milestoneId = this.getNodeParameter('milestoneId', index) as number;

	await codebergApiRequest.call(
		this,
		'DELETE',
		resolveEndpoint(ENDPOINTS.MILESTONE, { owner, repo, id: String(milestoneId) }),
	);
	return [{ json: { success: true } }];
}

async function listHandler(this: IExecuteFunctions, index: number) {
	const owner = this.getNodeParameter('owner', index) as string;
	const repo = this.getNodeParameter('repo', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index) as {
		state?: string;
		limit?: number;
	};

	const qs = buildQueryString({
		state: additionalFields.state,
		limit: additionalFields.limit,
	});

	const responseData = await codebergApiRequestAllItems.call(
		this,
		'GET',
		resolveEndpoint(ENDPOINTS.MILESTONES, { owner, repo }),
		{},
		qs,
	);
	return responseData.map((item) => ({ json: item }));
}

export const milestoneResource: ResourceDefinition = {
	name: 'milestone',
	operations: milestoneOperations,
	fields: [
		...createFields,
		...getFields,
		...updateFields,
		...deleteFields,
		...listFields,
	],
	handlers: {
		create: createHandler,
		get: getHandler,
		update: updateHandler,
		delete: deleteHandler,
		list: listHandler,
	},
};
