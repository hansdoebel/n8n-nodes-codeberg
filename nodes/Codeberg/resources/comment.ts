import type { IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import type { ResourceDefinition } from '../utils/types';
import { codebergApiRequest, codebergApiRequestAllItems } from '../utils/apiRequest';
import { ENDPOINTS } from '../utils/constants';
import { buildQueryString, resolveEndpoint } from '../utils/helpers';

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

const commentOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['comment'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a comment on an issue',
				action: 'Create a comment',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a comment',
				action: 'Delete a comment',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a comment',
				action: 'Get a comment',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List comments on an issue',
				action: 'List comments',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a comment',
				action: 'Update a comment',
			},
		],
		default: 'create',
	},
];

const createFields: INodeProperties[] = [
	{
		...ownerField,
		displayOptions: { show: { resource: ['comment'], operation: ['create'] } },
	},
	{
		...repoField,
		displayOptions: { show: { resource: ['comment'], operation: ['create'] } },
	},
	{
		displayName: 'Issue Number',
		name: 'issueNumber',
		type: 'number',
		required: true,
		default: 0,
		description: 'The issue number to comment on',
		displayOptions: { show: { resource: ['comment'], operation: ['create'] } },
	},
	{
		displayName: 'Body',
		name: 'body',
		type: 'string',
		typeOptions: { rows: 5 },
		required: true,
		default: '',
		description: 'The content of the comment',
		displayOptions: { show: { resource: ['comment'], operation: ['create'] } },
	},
];

const getFields: INodeProperties[] = [
	{
		...ownerField,
		displayOptions: { show: { resource: ['comment'], operation: ['get'] } },
	},
	{
		...repoField,
		displayOptions: { show: { resource: ['comment'], operation: ['get'] } },
	},
	{
		displayName: 'Comment ID',
		name: 'commentId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The ID of the comment',
		displayOptions: { show: { resource: ['comment'], operation: ['get'] } },
	},
];

const updateFields: INodeProperties[] = [
	{
		...ownerField,
		displayOptions: { show: { resource: ['comment'], operation: ['update'] } },
	},
	{
		...repoField,
		displayOptions: { show: { resource: ['comment'], operation: ['update'] } },
	},
	{
		displayName: 'Comment ID',
		name: 'commentId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The ID of the comment',
		displayOptions: { show: { resource: ['comment'], operation: ['update'] } },
	},
	{
		displayName: 'Body',
		name: 'body',
		type: 'string',
		typeOptions: { rows: 5 },
		required: true,
		default: '',
		description: 'The new content of the comment',
		displayOptions: { show: { resource: ['comment'], operation: ['update'] } },
	},
];

const deleteFields: INodeProperties[] = [
	{
		...ownerField,
		displayOptions: { show: { resource: ['comment'], operation: ['delete'] } },
	},
	{
		...repoField,
		displayOptions: { show: { resource: ['comment'], operation: ['delete'] } },
	},
	{
		displayName: 'Comment ID',
		name: 'commentId',
		type: 'number',
		required: true,
		default: 0,
		description: 'The ID of the comment',
		displayOptions: { show: { resource: ['comment'], operation: ['delete'] } },
	},
];

const listFields: INodeProperties[] = [
	{
		...ownerField,
		displayOptions: { show: { resource: ['comment'], operation: ['list'] } },
	},
	{
		...repoField,
		displayOptions: { show: { resource: ['comment'], operation: ['list'] } },
	},
	{
		displayName: 'Issue Number',
		name: 'issueNumber',
		type: 'number',
		required: true,
		default: 0,
		description: 'The issue number to list comments for',
		displayOptions: { show: { resource: ['comment'], operation: ['list'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['comment'], operation: ['list'] } },
		options: [
			{
				displayName: 'Since',
				name: 'since',
				type: 'dateTime',
				default: '',
				description: 'Only show comments updated after the given time',
			},
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
	const issueNumber = this.getNodeParameter('issueNumber', index) as number;
	const body = this.getNodeParameter('body', index) as string;

	const responseData = await codebergApiRequest.call(
		this,
		'POST',
		resolveEndpoint(ENDPOINTS.ISSUE_COMMENTS, { owner, repo, index: String(issueNumber) }),
		{ body },
	);
	return [{ json: responseData }];
}

async function getHandler(this: IExecuteFunctions, index: number) {
	const owner = this.getNodeParameter('owner', index) as string;
	const repo = this.getNodeParameter('repo', index) as string;
	const commentId = this.getNodeParameter('commentId', index) as number;

	const responseData = await codebergApiRequest.call(
		this,
		'GET',
		resolveEndpoint(ENDPOINTS.ISSUE_COMMENT, { owner, repo, id: String(commentId) }),
	);
	return [{ json: responseData }];
}

async function updateHandler(this: IExecuteFunctions, index: number) {
	const owner = this.getNodeParameter('owner', index) as string;
	const repo = this.getNodeParameter('repo', index) as string;
	const commentId = this.getNodeParameter('commentId', index) as number;
	const body = this.getNodeParameter('body', index) as string;

	const responseData = await codebergApiRequest.call(
		this,
		'PATCH',
		resolveEndpoint(ENDPOINTS.ISSUE_COMMENT, { owner, repo, id: String(commentId) }),
		{ body },
	);
	return [{ json: responseData }];
}

async function deleteHandler(this: IExecuteFunctions, index: number) {
	const owner = this.getNodeParameter('owner', index) as string;
	const repo = this.getNodeParameter('repo', index) as string;
	const commentId = this.getNodeParameter('commentId', index) as number;

	await codebergApiRequest.call(
		this,
		'DELETE',
		resolveEndpoint(ENDPOINTS.ISSUE_COMMENT, { owner, repo, id: String(commentId) }),
	);
	return [{ json: { success: true } }];
}

async function listHandler(this: IExecuteFunctions, index: number) {
	const owner = this.getNodeParameter('owner', index) as string;
	const repo = this.getNodeParameter('repo', index) as string;
	const issueNumber = this.getNodeParameter('issueNumber', index) as number;
	const additionalFields = this.getNodeParameter('additionalFields', index) as {
		since?: string;
		limit?: number;
	};

	const qs = buildQueryString({
		since: additionalFields.since,
		limit: additionalFields.limit,
	});

	const responseData = await codebergApiRequestAllItems.call(
		this,
		'GET',
		resolveEndpoint(ENDPOINTS.ISSUE_COMMENTS, { owner, repo, index: String(issueNumber) }),
		{},
		qs,
	);
	return responseData.map((item) => ({ json: item }));
}

export const commentResource: ResourceDefinition = {
	name: 'comment',
	operations: commentOperations,
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
