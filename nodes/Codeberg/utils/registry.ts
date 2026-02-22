import type { INodeProperties } from 'n8n-workflow';
import type {
	ResourceDefinition,
	OperationHandler,
	LoadOptionsFunction,
	ListSearchFunction,
} from './types';

export class ResourceRegistry {
	private resources = new Map<string, ResourceDefinition>();

	register(resource: ResourceDefinition): void {
		this.resources.set(resource.name, resource);
	}

	getHandler(resource: string, operation: string): OperationHandler | undefined {
		const resourceDef = this.resources.get(resource);
		return resourceDef?.handlers[operation];
	}

	getAllProperties(): INodeProperties[] {
		const properties: INodeProperties[] = [];
		for (const resource of this.resources.values()) {
			properties.push(...resource.operations);
			properties.push(...resource.fields);
		}
		return properties;
	}

	getAllLoadOptions(): Record<string, LoadOptionsFunction> {
		const allOptions: Record<string, LoadOptionsFunction> = {};
		for (const resource of this.resources.values()) {
			if (resource.methods?.loadOptions) {
				Object.assign(allOptions, resource.methods.loadOptions);
			}
		}
		return allOptions;
	}

	getAllListSearch(): Record<string, ListSearchFunction> {
		const allSearch: Record<string, ListSearchFunction> = {};
		for (const resource of this.resources.values()) {
			if (resource.methods?.listSearch) {
				Object.assign(allSearch, resource.methods.listSearch);
			}
		}
		return allSearch;
	}

	getResourceNames(): string[] {
		return Array.from(this.resources.keys());
	}

	buildResourceSelector(): INodeProperties {
		const options = Array.from(this.resources.values()).map((r) => ({
			name: r.name.charAt(0).toUpperCase() + r.name.slice(1).replace(/([A-Z])/g, ' $1'),
			value: r.name,
		}));

		// eslint-disable-next-line n8n-nodes-base/node-param-default-missing
		return {
			displayName: 'Resource',
			name: 'resource',
			type: 'options',
			noDataExpression: true,
			options,
			default: options[0]?.value ?? '',
		};
	}
}
