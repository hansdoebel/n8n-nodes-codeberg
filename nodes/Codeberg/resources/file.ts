import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import type { ResourceDefinition } from '../utils/types';
import { codebergApiRequest } from '../utils/apiRequest';
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

const fileOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['file'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a file in a repository',
				action: 'Create a file',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a file from a repository',
				action: 'Delete a file',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a file from a repository',
				action: 'Get a file',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List files in a directory',
				action: 'List files',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a file in a repository',
				action: 'Update a file',
			},
		],
		default: 'get',
	},
];

const createFields: INodeProperties[] = [
	{
		...ownerField,
		displayOptions: { show: { resource: ['file'], operation: ['create'] } },
	},
	{
		...repoField,
		displayOptions: { show: { resource: ['file'], operation: ['create'] } },
	},
	{
		displayName: 'File Path',
		name: 'filePath',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. docs/README.md',
		description: 'Path of the file to create in the repository',
		displayOptions: { show: { resource: ['file'], operation: ['create'] } },
	},
	{
		displayName: 'Content',
		name: 'content',
		type: 'string',
		typeOptions: { rows: 5 },
		required: true,
		default: '',
		description: 'The plain text content of the file (will be base64-encoded automatically)',
		displayOptions: { show: { resource: ['file'], operation: ['create'] } },
	},
	{
		displayName: 'Commit Message',
		name: 'commitMessage',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. Add new file',
		description: 'The commit message for creating the file',
		displayOptions: { show: { resource: ['file'], operation: ['create'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['file'], operation: ['create'] } },
		options: [
			{
				displayName: 'Author Email',
				name: 'authorEmail',
				type: 'string',
				default: '',
				description: 'Email of the commit author',
			},
			{
				displayName: 'Author Name',
				name: 'authorName',
				type: 'string',
				default: '',
				description: 'Name of the commit author',
			},
			{
				displayName: 'Branch',
				name: 'branch',
				type: 'string',
				default: '',
				description: 'The branch to commit to',
			},
			{
				displayName: 'New Branch',
				name: 'newBranch',
				type: 'string',
				default: '',
				description: 'Create a new branch from the specified branch and commit to it',
			},
		],
	},
];

const getFields: INodeProperties[] = [
	{
		...ownerField,
		displayOptions: { show: { resource: ['file'], operation: ['get'] } },
	},
	{
		...repoField,
		displayOptions: { show: { resource: ['file'], operation: ['get'] } },
	},
	{
		displayName: 'File Path',
		name: 'filePath',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. docs/README.md',
		description: 'Path of the file to retrieve',
		displayOptions: { show: { resource: ['file'], operation: ['get'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['file'], operation: ['get'] } },
		options: [
			{
				displayName: 'Ref',
				name: 'ref',
				type: 'string',
				default: '',
				placeholder: 'e.g. main, v1.0.0, or a commit SHA',
				description: 'The branch, tag, or commit to get the file from',
			},
		],
	},
];

const updateFields: INodeProperties[] = [
	{
		...ownerField,
		displayOptions: { show: { resource: ['file'], operation: ['update'] } },
	},
	{
		...repoField,
		displayOptions: { show: { resource: ['file'], operation: ['update'] } },
	},
	{
		displayName: 'File Path',
		name: 'filePath',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. docs/README.md',
		description: 'Path of the file to update',
		displayOptions: { show: { resource: ['file'], operation: ['update'] } },
	},
	{
		displayName: 'Content',
		name: 'content',
		type: 'string',
		typeOptions: { rows: 5 },
		required: true,
		default: '',
		description: 'The new plain text content of the file (will be base64-encoded automatically)',
		displayOptions: { show: { resource: ['file'], operation: ['update'] } },
	},
	{
		displayName: 'SHA',
		name: 'sha',
		type: 'string',
		required: true,
		default: '',
		description: 'The current SHA of the file (required to prevent conflicts)',
		displayOptions: { show: { resource: ['file'], operation: ['update'] } },
	},
	{
		displayName: 'Commit Message',
		name: 'commitMessage',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. Update file',
		description: 'The commit message for updating the file',
		displayOptions: { show: { resource: ['file'], operation: ['update'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['file'], operation: ['update'] } },
		options: [
			{
				displayName: 'Branch',
				name: 'branch',
				type: 'string',
				default: '',
				description: 'The branch to commit to',
			},
			{
				displayName: 'New Branch',
				name: 'newBranch',
				type: 'string',
				default: '',
				description: 'Create a new branch from the specified branch and commit to it',
			},
		],
	},
];

const deleteFields: INodeProperties[] = [
	{
		...ownerField,
		displayOptions: { show: { resource: ['file'], operation: ['delete'] } },
	},
	{
		...repoField,
		displayOptions: { show: { resource: ['file'], operation: ['delete'] } },
	},
	{
		displayName: 'File Path',
		name: 'filePath',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. docs/README.md',
		description: 'Path of the file to delete',
		displayOptions: { show: { resource: ['file'], operation: ['delete'] } },
	},
	{
		displayName: 'SHA',
		name: 'sha',
		type: 'string',
		required: true,
		default: '',
		description: 'The current SHA of the file (required to prevent conflicts)',
		displayOptions: { show: { resource: ['file'], operation: ['delete'] } },
	},
	{
		displayName: 'Commit Message',
		name: 'commitMessage',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. Delete file',
		description: 'The commit message for deleting the file',
		displayOptions: { show: { resource: ['file'], operation: ['delete'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['file'], operation: ['delete'] } },
		options: [
			{
				displayName: 'Branch',
				name: 'branch',
				type: 'string',
				default: '',
				description: 'The branch to commit to',
			},
			{
				displayName: 'New Branch',
				name: 'newBranch',
				type: 'string',
				default: '',
				description: 'Create a new branch from the specified branch and commit to it',
			},
		],
	},
];

const listFields: INodeProperties[] = [
	{
		...ownerField,
		displayOptions: { show: { resource: ['file'], operation: ['list'] } },
	},
	{
		...repoField,
		displayOptions: { show: { resource: ['file'], operation: ['list'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['file'], operation: ['list'] } },
		options: [
			{
				displayName: 'Directory Path',
				name: 'directoryPath',
				type: 'string',
				default: '',
				placeholder: 'e.g. src/components',
				description: 'Path of the directory to list (leave empty for root)',
			},
			{
				displayName: 'Ref',
				name: 'ref',
				type: 'string',
				default: '',
				placeholder: 'e.g. main, v1.0.0, or a commit SHA',
				description: 'The branch, tag, or commit to list files from',
			},
		],
	},
];

async function createHandler(this: IExecuteFunctions, index: number) {
	const owner = this.getNodeParameter('owner', index) as string;
	const repo = this.getNodeParameter('repo', index) as string;
	const filePath = this.getNodeParameter('filePath', index) as string;
	const content = this.getNodeParameter('content', index) as string;
	const commitMessage = this.getNodeParameter('commitMessage', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index) as {
		branch?: string;
		newBranch?: string;
		authorName?: string;
		authorEmail?: string;
	};

	const body: Record<string, unknown> = {
		content: Buffer.from(content).toString('base64'),
		message: commitMessage,
	};
	setIfDefined(body, 'branch', additionalFields.branch);
	setIfDefined(body, 'new_branch', additionalFields.newBranch);

	if (additionalFields.authorName || additionalFields.authorEmail) {
		const author: Record<string, unknown> = {};
		setIfDefined(author, 'name', additionalFields.authorName);
		setIfDefined(author, 'email', additionalFields.authorEmail);
		body.author = author;
	}

	const responseData = await codebergApiRequest.call(
		this,
		'POST',
		resolveEndpoint(ENDPOINTS.FILE_CONTENTS, { owner, repo, filepath: filePath }, new Set(['filepath'])),
		body as IDataObject,
	);
	return [{ json: responseData }];
}

async function getHandler(this: IExecuteFunctions, index: number) {
	const owner = this.getNodeParameter('owner', index) as string;
	const repo = this.getNodeParameter('repo', index) as string;
	const filePath = this.getNodeParameter('filePath', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index) as {
		ref?: string;
	};

	const qs = buildQueryString({
		ref: additionalFields.ref,
	});

	const responseData = await codebergApiRequest.call(
		this,
		'GET',
		resolveEndpoint(ENDPOINTS.FILE_CONTENTS, { owner, repo, filepath: filePath }, new Set(['filepath'])),
		{},
		qs,
	);
	return [{ json: responseData }];
}

async function updateHandler(this: IExecuteFunctions, index: number) {
	const owner = this.getNodeParameter('owner', index) as string;
	const repo = this.getNodeParameter('repo', index) as string;
	const filePath = this.getNodeParameter('filePath', index) as string;
	const content = this.getNodeParameter('content', index) as string;
	const sha = this.getNodeParameter('sha', index) as string;
	const commitMessage = this.getNodeParameter('commitMessage', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index) as {
		branch?: string;
		newBranch?: string;
	};

	const body: Record<string, unknown> = {
		content: Buffer.from(content).toString('base64'),
		message: commitMessage,
		sha,
	};
	setIfDefined(body, 'branch', additionalFields.branch);
	setIfDefined(body, 'new_branch', additionalFields.newBranch);

	const responseData = await codebergApiRequest.call(
		this,
		'PUT',
		resolveEndpoint(ENDPOINTS.FILE_CONTENTS, { owner, repo, filepath: filePath }, new Set(['filepath'])),
		body as IDataObject,
	);
	return [{ json: responseData }];
}

async function deleteHandler(this: IExecuteFunctions, index: number) {
	const owner = this.getNodeParameter('owner', index) as string;
	const repo = this.getNodeParameter('repo', index) as string;
	const filePath = this.getNodeParameter('filePath', index) as string;
	const sha = this.getNodeParameter('sha', index) as string;
	const commitMessage = this.getNodeParameter('commitMessage', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index) as {
		branch?: string;
		newBranch?: string;
	};

	const body: Record<string, unknown> = {
		message: commitMessage,
		sha,
	};
	setIfDefined(body, 'branch', additionalFields.branch);
	setIfDefined(body, 'new_branch', additionalFields.newBranch);

	const responseData = await codebergApiRequest.call(
		this,
		'DELETE',
		resolveEndpoint(ENDPOINTS.FILE_CONTENTS, { owner, repo, filepath: filePath }, new Set(['filepath'])),
		body as IDataObject,
	);
	return [{ json: responseData }];
}

async function listHandler(this: IExecuteFunctions, index: number) {
	const owner = this.getNodeParameter('owner', index) as string;
	const repo = this.getNodeParameter('repo', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index) as {
		directoryPath?: string;
		ref?: string;
	};

	const qs = buildQueryString({
		ref: additionalFields.ref,
	});

	const dirPath = additionalFields.directoryPath || '';
	const baseEndpoint = resolveEndpoint(ENDPOINTS.REPO, { owner, repo });
	const endpoint = dirPath
		? `${baseEndpoint}/contents/${encodeURI(dirPath)}`
		: `${baseEndpoint}/contents`;

	const responseData = await codebergApiRequest.call(
		this,
		'GET',
		endpoint,
		{},
		qs,
	);

	if (Array.isArray(responseData)) {
		return responseData.map((item: IDataObject) => ({ json: item }));
	}
	return [{ json: responseData }];
}

export const fileResource: ResourceDefinition = {
	name: 'file',
	operations: fileOperations,
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
