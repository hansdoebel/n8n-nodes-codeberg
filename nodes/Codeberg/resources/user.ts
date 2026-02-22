import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { codebergApiRequest } from '../utils/apiRequest';
import { ENDPOINTS } from '../utils/constants';
import { buildQueryString, resolveEndpoint } from '../utils/helpers';
import type { ResourceDefinition } from '../utils/types';

const userOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['user'],
			},
		},
		options: [
			{ name: 'Get', value: 'get', action: 'Get authenticated user' },
			{ name: 'Get by Username', value: 'getByUsername', action: 'Get a user by username' },
			{ name: 'Search', value: 'search', action: 'Search users' },
		],
		default: 'get',
	},
];

const getByUsernameFields: INodeProperties[] = [
	{
		displayName: 'Username',
		name: 'username',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['getByUsername'],
			},
		},
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
				resource: ['user'],
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
				resource: ['user'],
				operation: ['search'],
			},
		},
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

async function userGet(this: IExecuteFunctions): Promise<INodeExecutionData[]> {
	const response = await codebergApiRequest.call(this, 'GET', ENDPOINTS.USER);
	return [{ json: response }];
}

async function userGetByUsername(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const username = this.getNodeParameter('username', index) as string;
	const endpoint = resolveEndpoint(ENDPOINTS.USER_BY_NAME, { owner: username });
	const response = await codebergApiRequest.call(this, 'GET', endpoint);
	return [{ json: response }];
}

async function userSearch(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const query = this.getNodeParameter('query', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;
	const qs = buildQueryString({
		q: query,
		limit: additionalFields.limit as number,
	});
	const response = await codebergApiRequest.call(this, 'GET', ENDPOINTS.USERS_SEARCH, {}, qs);
	const data = response.data || response;
	if (Array.isArray(data)) {
		return data.map((item: IDataObject) => ({ json: item }));
	}
	return [{ json: response }];
}

export const userResource: ResourceDefinition = {
	name: 'user',
	operations: userOperations,
	fields: [
		...getByUsernameFields,
		...searchFields,
	],
	handlers: {
		get: userGet,
		getByUsername: userGetByUsername,
		search: userSearch,
	},
};
