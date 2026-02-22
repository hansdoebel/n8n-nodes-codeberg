import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';
import { registry } from './resources';

export class Codeberg implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Codeberg',
		name: 'codeberg',
		icon: 'file:../../icons/codeberg.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with the Codeberg API',
		defaults: {
			name: 'Codeberg',
		},
		usableAsTool: true,
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'codebergApi',
				required: true,
				displayOptions: {
					show: { authentication: ['codebergApi'] },
				},
			},
			{
				name: 'codebergOAuth2Api',
				required: true,
				displayOptions: {
					show: { authentication: ['oAuth2'] },
				},
			},
		],
		properties: [
			{
				displayName: 'Authentication',
				name: 'authentication',
				type: 'options',
				options: [
					{ name: 'Access Token', value: 'codebergApi' },
					{ name: 'OAuth2', value: 'oAuth2' },
				],
				default: 'codebergApi',
			},
			registry.buildResourceSelector(),
			...registry.getAllProperties(),
		],
	};

	methods = {
		loadOptions: registry.getAllLoadOptions(),
		listSearch: registry.getAllListSearch(),
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;
				const handler = registry.getHandler(resource, operation);

				if (!handler) {
					throw new NodeOperationError(
						this.getNode(),
						`Unsupported operation: ${resource}.${operation}`,
					);
				}

				const result = await handler.call(this, i);
				returnData.push(...result);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
					});
					continue;
				}
				throw new NodeApiError(this.getNode(), error as JsonObject);
			}
		}

		return [returnData];
	}
}
