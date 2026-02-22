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

const releaseOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['release'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a release',
				action: 'Create a release',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a release',
				action: 'Delete a release',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a release',
				action: 'Get a release',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List releases',
				action: 'List releases',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a release',
				action: 'Update a release',
			},
		],
		default: 'create',
	},
];

const createFields: INodeProperties[] = [
	{
		...ownerField,
		displayOptions: { show: { resource: ['release'], operation: ['create'] } },
	},
	{
		...repoField,
		displayOptions: { show: { resource: ['release'], operation: ['create'] } },
	},
	{
		displayName: 'Tag Name',
		name: 'tagName',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. v1.0.0',
		description: 'The tag name for the release',
		displayOptions: { show: { resource: ['release'], operation: ['create'] } },
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. Release v1.0.0',
		description: 'The title of the release',
		displayOptions: { show: { resource: ['release'], operation: ['create'] } },
	},
	{
		displayName: 'Body',
		name: 'body',
		type: 'string',
		typeOptions: { rows: 5 },
		required: true,
		default: '',
		description: 'The description/body of the release',
		displayOptions: { show: { resource: ['release'], operation: ['create'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['release'], operation: ['create'] } },
		options: [
			{
				displayName: 'Draft',
				name: 'draft',
				type: 'boolean',
				default: false,
				description: 'Whether this is a draft release',
			},
			{
				displayName: 'Prerelease',
				name: 'prerelease',
				type: 'boolean',
				default: false,
				description: 'Whether this is a prerelease',
			},
			{
				displayName: 'Target Commitish',
				name: 'target_commitish',
				type: 'string',
				default: '',
				placeholder: 'e.g. main',
				description: 'The branch or commit SHA to tag. Defaults to the default branch.',
			},
		],
	},
];

const getFields: INodeProperties[] = [
	{
		...ownerField,
		displayOptions: { show: { resource: ['release'], operation: ['get'] } },
	},
	{
		...repoField,
		displayOptions: { show: { resource: ['release'], operation: ['get'] } },
	},
	{
		displayName: 'Release ID',
		name: 'releaseId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The ID of the release',
		displayOptions: { show: { resource: ['release'], operation: ['get'] } },
	},
];

const updateFields: INodeProperties[] = [
	{
		...ownerField,
		displayOptions: { show: { resource: ['release'], operation: ['update'] } },
	},
	{
		...repoField,
		displayOptions: { show: { resource: ['release'], operation: ['update'] } },
	},
	{
		displayName: 'Release ID',
		name: 'releaseId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The ID of the release',
		displayOptions: { show: { resource: ['release'], operation: ['update'] } },
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['release'], operation: ['update'] } },
		options: [
			{
				displayName: 'Body',
				name: 'body',
				type: 'string',
				typeOptions: { rows: 5 },
				default: '',
				description: 'The description/body of the release',
			},
			{
				displayName: 'Draft',
				name: 'draft',
				type: 'boolean',
				default: false,
				description: 'Whether this is a draft release',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'The title of the release',
			},
			{
				displayName: 'Prerelease',
				name: 'prerelease',
				type: 'boolean',
				default: false,
				description: 'Whether this is a prerelease',
			},
			{
				displayName: 'Tag Name',
				name: 'tag_name',
				type: 'string',
				default: '',
				description: 'The tag name for the release',
			},
		],
	},
];

const deleteFields: INodeProperties[] = [
	{
		...ownerField,
		displayOptions: { show: { resource: ['release'], operation: ['delete'] } },
	},
	{
		...repoField,
		displayOptions: { show: { resource: ['release'], operation: ['delete'] } },
	},
	{
		displayName: 'Release ID',
		name: 'releaseId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The ID of the release',
		displayOptions: { show: { resource: ['release'], operation: ['delete'] } },
	},
];

const listFields: INodeProperties[] = [
	{
		...ownerField,
		displayOptions: { show: { resource: ['release'], operation: ['list'] } },
	},
	{
		...repoField,
		displayOptions: { show: { resource: ['release'], operation: ['list'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['release'], operation: ['list'] } },
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
	const tagName = this.getNodeParameter('tagName', index) as string;
	const name = this.getNodeParameter('name', index) as string;
	const bodyText = this.getNodeParameter('body', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index) as {
		draft?: boolean;
		prerelease?: boolean;
		target_commitish?: string;
	};

	const body: Record<string, unknown> = {
		tag_name: tagName,
		name,
		body: bodyText,
	};
	setIfDefined(body, 'draft', additionalFields.draft);
	setIfDefined(body, 'prerelease', additionalFields.prerelease);
	setIfDefined(body, 'target_commitish', additionalFields.target_commitish);

	const responseData = await codebergApiRequest.call(
		this,
		'POST',
		resolveEndpoint(ENDPOINTS.RELEASES, { owner, repo }),
		body as IDataObject,
	);
	return [{ json: responseData }];
}

async function getHandler(this: IExecuteFunctions, index: number) {
	const owner = this.getNodeParameter('owner', index) as string;
	const repo = this.getNodeParameter('repo', index) as string;
	const releaseId = this.getNodeParameter('releaseId', index) as number;

	const responseData = await codebergApiRequest.call(
		this,
		'GET',
		resolveEndpoint(ENDPOINTS.RELEASE, { owner, repo, id: String(releaseId) }),
	);
	return [{ json: responseData }];
}

async function updateHandler(this: IExecuteFunctions, index: number) {
	const owner = this.getNodeParameter('owner', index) as string;
	const repo = this.getNodeParameter('repo', index) as string;
	const releaseId = this.getNodeParameter('releaseId', index) as number;
	const updateFieldsParam = this.getNodeParameter('updateFields', index) as {
		tag_name?: string;
		name?: string;
		body?: string;
		draft?: boolean;
		prerelease?: boolean;
	};

	const body: Record<string, unknown> = {};
	setIfDefined(body, 'tag_name', updateFieldsParam.tag_name);
	setIfDefined(body, 'name', updateFieldsParam.name);
	setIfDefined(body, 'body', updateFieldsParam.body);
	setIfDefined(body, 'draft', updateFieldsParam.draft);
	setIfDefined(body, 'prerelease', updateFieldsParam.prerelease);

	const responseData = await codebergApiRequest.call(
		this,
		'PATCH',
		resolveEndpoint(ENDPOINTS.RELEASE, { owner, repo, id: String(releaseId) }),
		body as IDataObject,
	);
	return [{ json: responseData }];
}

async function deleteHandler(this: IExecuteFunctions, index: number) {
	const owner = this.getNodeParameter('owner', index) as string;
	const repo = this.getNodeParameter('repo', index) as string;
	const releaseId = this.getNodeParameter('releaseId', index) as number;

	await codebergApiRequest.call(
		this,
		'DELETE',
		resolveEndpoint(ENDPOINTS.RELEASE, { owner, repo, id: String(releaseId) }),
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
		resolveEndpoint(ENDPOINTS.RELEASES, { owner, repo }),
		{},
		qs,
	);
	return responseData.map((item) => ({ json: item }));
}

export const releaseResource: ResourceDefinition = {
	name: 'release',
	operations: releaseOperations,
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
