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

const organizationOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['organization'],
			},
		},
		options: [
			{ name: 'Create', value: 'create', action: 'Create an organization' },
			{ name: 'Delete', value: 'delete', action: 'Delete an organization' },
			{ name: 'Get', value: 'get', action: 'Get an organization' },
			{ name: 'List', value: 'list', action: 'List organizations' },
			{ name: 'List Members', value: 'listMembers', action: 'List organization members' },
			{ name: 'Update', value: 'update', action: 'Update an organization' },
		],
		default: 'get',
	},
];

const orgNameField: INodeProperties = {
	displayName: 'Organization Name',
	name: 'orgName',
	type: 'string',
	required: true,
	default: '',
	displayOptions: {
		show: {
			resource: ['organization'],
			operation: ['get', 'update', 'delete', 'listMembers'],
		},
	},
};

const createFields: INodeProperties[] = [
	{
		displayName: 'Username',
		name: 'username',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['organization'],
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
				resource: ['organization'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Full Name',
				name: 'full_name',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Location',
				name: 'location',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Visibility',
				name: 'visibility',
				type: 'options',
				options: [
					{ name: 'Limited', value: 'limited' },
					{ name: 'Private', value: 'private' },
					{ name: 'Public', value: 'public' },
				],
				default: 'public',
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

const updateFields: INodeProperties[] = [
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['organization'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Full Name',
				name: 'full_name',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Location',
				name: 'location',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Visibility',
				name: 'visibility',
				type: 'options',
				options: [
					{ name: 'Limited', value: 'limited' },
					{ name: 'Private', value: 'private' },
					{ name: 'Public', value: 'public' },
				],
				default: 'public',
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
				resource: ['organization'],
				operation: ['list'],
			},
		},
	},
];

const listMembersFields: INodeProperties[] = [
	// eslint-disable-next-line n8n-nodes-base/node-param-default-missing, n8n-nodes-base/node-param-description-missing-from-limit
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1 },
		default: PAGINATION.DEFAULT_LIMIT,
		displayOptions: {
			show: {
				resource: ['organization'],
				operation: ['listMembers'],
			},
		},
	},
];

async function organizationCreate(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const username = this.getNodeParameter('username', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;
	const body: IDataObject = { username };
	setIfDefined(body, 'full_name', additionalFields.full_name);
	setIfDefined(body, 'description', additionalFields.description);
	setIfDefined(body, 'website', additionalFields.website);
	setIfDefined(body, 'location', additionalFields.location);
	setIfDefined(body, 'visibility', additionalFields.visibility);
	const response = await codebergApiRequest.call(this, 'POST', ENDPOINTS.ORGS, body);
	return [{ json: response }];
}

async function organizationGet(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const orgName = this.getNodeParameter('orgName', index) as string;
	const endpoint = resolveEndpoint(ENDPOINTS.ORG, { owner: orgName });
	const response = await codebergApiRequest.call(this, 'GET', endpoint);
	return [{ json: response }];
}

async function organizationUpdate(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const orgName = this.getNodeParameter('orgName', index) as string;
	const updateFieldsData = this.getNodeParameter('updateFields', index) as IDataObject;
	const body: IDataObject = {};
	setIfDefined(body, 'full_name', updateFieldsData.full_name);
	setIfDefined(body, 'description', updateFieldsData.description);
	setIfDefined(body, 'website', updateFieldsData.website);
	setIfDefined(body, 'location', updateFieldsData.location);
	setIfDefined(body, 'visibility', updateFieldsData.visibility);
	const endpoint = resolveEndpoint(ENDPOINTS.ORG, { owner: orgName });
	const response = await codebergApiRequest.call(this, 'PATCH', endpoint, body);
	return [{ json: response }];
}

async function organizationDelete(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const orgName = this.getNodeParameter('orgName', index) as string;
	const endpoint = resolveEndpoint(ENDPOINTS.ORG, { owner: orgName });
	await codebergApiRequest.call(this, 'DELETE', endpoint);
	return [{ json: { success: true } }];
}

async function organizationList(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const limit = this.getNodeParameter('limit', index) as number;
	const qs = buildQueryString({ limit });
	const response = await codebergApiRequest.call(this, 'GET', ENDPOINTS.USER_ORGS, {}, qs);
	if (Array.isArray(response)) {
		return response.map((item: IDataObject) => ({ json: item }));
	}
	return [{ json: response }];
}

async function organizationListMembers(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const orgName = this.getNodeParameter('orgName', index) as string;
	const limit = this.getNodeParameter('limit', index) as number;
	const qs = buildQueryString({ limit });
	const endpoint = resolveEndpoint(ENDPOINTS.ORG_MEMBERS, { owner: orgName });
	const response = await codebergApiRequest.call(this, 'GET', endpoint, {}, qs);
	if (Array.isArray(response)) {
		return response.map((item: IDataObject) => ({ json: item }));
	}
	return [{ json: response }];
}

export const organizationResource: ResourceDefinition = {
	name: 'organization',
	operations: organizationOperations,
	fields: [
		orgNameField,
		...createFields,
		...updateFields,
		...listFields,
		...listMembersFields,
	],
	handlers: {
		create: organizationCreate,
		get: organizationGet,
		update: organizationUpdate,
		delete: organizationDelete,
		list: organizationList,
		listMembers: organizationListMembers,
	},
};
