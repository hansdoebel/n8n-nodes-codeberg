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

const branchOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['branch'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a branch',
				action: 'Create a branch',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a branch',
				action: 'Delete a branch',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a branch',
				action: 'Get a branch',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List branches',
				action: 'List branches',
			},
		],
		default: 'create',
	},
];

const createFields: INodeProperties[] = [
	{
		...ownerField,
		displayOptions: { show: { resource: ['branch'], operation: ['create'] } },
	},
	{
		...repoField,
		displayOptions: { show: { resource: ['branch'], operation: ['create'] } },
	},
	{
		displayName: 'New Branch Name',
		name: 'newBranchName',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. feature/my-feature',
		description: 'The name of the new branch',
		displayOptions: { show: { resource: ['branch'], operation: ['create'] } },
	},
	{
		displayName: 'Source Branch',
		name: 'oldBranchName',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. main',
		description: 'The source branch to create from',
		displayOptions: { show: { resource: ['branch'], operation: ['create'] } },
	},
];

const getFields: INodeProperties[] = [
	{
		...ownerField,
		displayOptions: { show: { resource: ['branch'], operation: ['get'] } },
	},
	{
		...repoField,
		displayOptions: { show: { resource: ['branch'], operation: ['get'] } },
	},
	{
		displayName: 'Branch Name',
		name: 'branchName',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. main',
		description: 'The name of the branch',
		displayOptions: { show: { resource: ['branch'], operation: ['get'] } },
	},
];

const deleteFields: INodeProperties[] = [
	{
		...ownerField,
		displayOptions: { show: { resource: ['branch'], operation: ['delete'] } },
	},
	{
		...repoField,
		displayOptions: { show: { resource: ['branch'], operation: ['delete'] } },
	},
	{
		displayName: 'Branch Name',
		name: 'branchName',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. feature/my-feature',
		description: 'The name of the branch to delete',
		displayOptions: { show: { resource: ['branch'], operation: ['delete'] } },
	},
];

const listFields: INodeProperties[] = [
	{
		...ownerField,
		displayOptions: { show: { resource: ['branch'], operation: ['list'] } },
	},
	{
		...repoField,
		displayOptions: { show: { resource: ['branch'], operation: ['list'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['branch'], operation: ['list'] } },
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
	const newBranchName = this.getNodeParameter('newBranchName', index) as string;
	const oldBranchName = this.getNodeParameter('oldBranchName', index) as string;

	const responseData = await codebergApiRequest.call(
		this,
		'POST',
		resolveEndpoint(ENDPOINTS.BRANCHES, { owner, repo }),
		{
			new_branch_name: newBranchName,
			old_branch_name: oldBranchName,
		},
	);
	return [{ json: responseData }];
}

async function getHandler(this: IExecuteFunctions, index: number) {
	const owner = this.getNodeParameter('owner', index) as string;
	const repo = this.getNodeParameter('repo', index) as string;
	const branchName = this.getNodeParameter('branchName', index) as string;

	const responseData = await codebergApiRequest.call(
		this,
		'GET',
		resolveEndpoint(ENDPOINTS.BRANCH, { owner, repo, branch: branchName }),
	);
	return [{ json: responseData }];
}

async function deleteHandler(this: IExecuteFunctions, index: number) {
	const owner = this.getNodeParameter('owner', index) as string;
	const repo = this.getNodeParameter('repo', index) as string;
	const branchName = this.getNodeParameter('branchName', index) as string;

	await codebergApiRequest.call(
		this,
		'DELETE',
		resolveEndpoint(ENDPOINTS.BRANCH, { owner, repo, branch: branchName }),
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
		resolveEndpoint(ENDPOINTS.BRANCHES, { owner, repo }),
		{},
		qs,
	);
	return responseData.map((item) => ({ json: item }));
}

export const branchResource: ResourceDefinition = {
	name: 'branch',
	operations: branchOperations,
	fields: [
		...createFields,
		...getFields,
		...deleteFields,
		...listFields,
	],
	handlers: {
		create: createHandler,
		get: getHandler,
		delete: deleteHandler,
		list: listHandler,
	},
};
