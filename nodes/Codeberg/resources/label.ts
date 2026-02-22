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

const labelOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['label'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a label',
				action: 'Create a label',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a label',
				action: 'Delete a label',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a label',
				action: 'Get a label',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List labels',
				action: 'List labels',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a label',
				action: 'Update a label',
			},
		],
		default: 'create',
	},
];

const createFields: INodeProperties[] = [
	{
		...ownerField,
		displayOptions: { show: { resource: ['label'], operation: ['create'] } },
	},
	{
		...repoField,
		displayOptions: { show: { resource: ['label'], operation: ['create'] } },
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. bug',
		description: 'The name of the label',
		displayOptions: { show: { resource: ['label'], operation: ['create'] } },
	},
	{
		displayName: 'Color',
		name: 'color',
		type: 'color',
		required: true,
		default: '',
		placeholder: 'e.g. ee0701',
		description: 'Color of the label in hex format without the leading #',
		displayOptions: { show: { resource: ['label'], operation: ['create'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['label'], operation: ['create'] } },
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Description of the label',
			},
			{
				displayName: 'Exclusive',
				name: 'exclusive',
				type: 'boolean',
				default: false,
				description: 'Whether this label is exclusive with other labels in the same group',
			},
		],
	},
];

const getFields: INodeProperties[] = [
	{
		...ownerField,
		displayOptions: { show: { resource: ['label'], operation: ['get'] } },
	},
	{
		...repoField,
		displayOptions: { show: { resource: ['label'], operation: ['get'] } },
	},
	{
		displayName: 'Label ID',
		name: 'labelId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The ID of the label',
		displayOptions: { show: { resource: ['label'], operation: ['get'] } },
	},
];

const updateFields: INodeProperties[] = [
	{
		...ownerField,
		displayOptions: { show: { resource: ['label'], operation: ['update'] } },
	},
	{
		...repoField,
		displayOptions: { show: { resource: ['label'], operation: ['update'] } },
	},
	{
		displayName: 'Label ID',
		name: 'labelId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The ID of the label',
		displayOptions: { show: { resource: ['label'], operation: ['update'] } },
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['label'], operation: ['update'] } },
		options: [
			{
				displayName: 'Color',
				name: 'color',
				type: 'color',
				default: '',
				placeholder: 'e.g. ee0701',
				description: 'Color of the label in hex format without the leading #',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Description of the label',
			},
			{
				displayName: 'Exclusive',
				name: 'exclusive',
				type: 'boolean',
				default: false,
				description: 'Whether this label is exclusive with other labels in the same group',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'New name of the label',
			},
		],
	},
];

const deleteFields: INodeProperties[] = [
	{
		...ownerField,
		displayOptions: { show: { resource: ['label'], operation: ['delete'] } },
	},
	{
		...repoField,
		displayOptions: { show: { resource: ['label'], operation: ['delete'] } },
	},
	{
		displayName: 'Label ID',
		name: 'labelId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The ID of the label',
		displayOptions: { show: { resource: ['label'], operation: ['delete'] } },
	},
];

const listFields: INodeProperties[] = [
	{
		...ownerField,
		displayOptions: { show: { resource: ['label'], operation: ['list'] } },
	},
	{
		...repoField,
		displayOptions: { show: { resource: ['label'], operation: ['list'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['label'], operation: ['list'] } },
		options: [
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: { minValue: 1 },
				default: 50,
				description: 'Max number of results to return',
			},
		],
	},
];

async function createHandler(this: IExecuteFunctions, index: number) {
	const owner = this.getNodeParameter('owner', index) as string;
	const repo = this.getNodeParameter('repo', index) as string;
	const name = this.getNodeParameter('name', index) as string;
	const color = this.getNodeParameter('color', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index) as {
		description?: string;
		exclusive?: boolean;
	};

	const body: Record<string, unknown> = { name, color };
	setIfDefined(body, 'description', additionalFields.description);
	setIfDefined(body, 'exclusive', additionalFields.exclusive);

	const responseData = await codebergApiRequest.call(
		this,
		'POST',
		resolveEndpoint(ENDPOINTS.LABELS, { owner, repo }),
		body as IDataObject,
	);
	return [{ json: responseData }];
}

async function getHandler(this: IExecuteFunctions, index: number) {
	const owner = this.getNodeParameter('owner', index) as string;
	const repo = this.getNodeParameter('repo', index) as string;
	const labelId = this.getNodeParameter('labelId', index) as number;

	const responseData = await codebergApiRequest.call(
		this,
		'GET',
		resolveEndpoint(ENDPOINTS.LABEL, { owner, repo, id: String(labelId) }),
	);
	return [{ json: responseData }];
}

async function updateHandler(this: IExecuteFunctions, index: number) {
	const owner = this.getNodeParameter('owner', index) as string;
	const repo = this.getNodeParameter('repo', index) as string;
	const labelId = this.getNodeParameter('labelId', index) as number;
	const updateFieldsParam = this.getNodeParameter('updateFields', index) as {
		name?: string;
		color?: string;
		description?: string;
		exclusive?: boolean;
	};

	const body: Record<string, unknown> = {};
	setIfDefined(body, 'name', updateFieldsParam.name);
	setIfDefined(body, 'color', updateFieldsParam.color);
	setIfDefined(body, 'description', updateFieldsParam.description);
	setIfDefined(body, 'exclusive', updateFieldsParam.exclusive);

	const responseData = await codebergApiRequest.call(
		this,
		'PATCH',
		resolveEndpoint(ENDPOINTS.LABEL, { owner, repo, id: String(labelId) }),
		body as IDataObject,
	);
	return [{ json: responseData }];
}

async function deleteHandler(this: IExecuteFunctions, index: number) {
	const owner = this.getNodeParameter('owner', index) as string;
	const repo = this.getNodeParameter('repo', index) as string;
	const labelId = this.getNodeParameter('labelId', index) as number;

	await codebergApiRequest.call(
		this,
		'DELETE',
		resolveEndpoint(ENDPOINTS.LABEL, { owner, repo, id: String(labelId) }),
	);
	return [{ json: { success: true } }];
}

async function listHandler(this: IExecuteFunctions, index: number) {
	const owner = this.getNodeParameter('owner', index) as string;
	const repo = this.getNodeParameter('repo', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index) as {
		limit?: number;
	};

	const qs = buildQueryString({
		limit: additionalFields.limit,
	});

	const responseData = await codebergApiRequestAllItems.call(
		this,
		'GET',
		resolveEndpoint(ENDPOINTS.LABELS, { owner, repo }),
		{},
		qs,
	);
	return responseData.map((item) => ({ json: item }));
}

export const labelResource: ResourceDefinition = {
	name: 'label',
	operations: labelOperations,
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
