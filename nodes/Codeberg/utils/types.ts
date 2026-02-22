import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodeListSearchResult,
	INodePropertyOptions,
	INodeProperties,
} from 'n8n-workflow';

export type OperationHandler = (
	this: IExecuteFunctions,
	index: number,
) => Promise<INodeExecutionData[]>;

export type LoadOptionsFunction = (this: ILoadOptionsFunctions) => Promise<INodePropertyOptions[]>;

export type ListSearchFunction = (
	this: ILoadOptionsFunctions,
	filter?: string,
) => Promise<INodeListSearchResult>;

export interface ResourceMethods {
	loadOptions?: Record<string, LoadOptionsFunction>;
	listSearch?: Record<string, ListSearchFunction>;
}

export interface ResourceDefinition {
	name: string;
	operations: INodeProperties[];
	fields: INodeProperties[];
	handlers: Record<string, OperationHandler>;
	methods?: ResourceMethods;
}

export interface ResourceLocatorValue {
	mode: string;
	value: string;
}
