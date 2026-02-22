import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';
import { CODEBERG_URLS, PAGINATION } from './constants';

export function getAuthenticationType(
	context: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
	itemIndex = 0,
): string {
	try {
		if ('getCurrentNodeParameter' in context) {
			return (context as ILoadOptionsFunctions).getCurrentNodeParameter(
				'authentication',
			) as string;
		} else if ('getNodeParameter' in context) {
			return (context as IExecuteFunctions).getNodeParameter(
				'authentication',
				itemIndex,
			) as string;
		}
	} catch {
		return 'codebergApi';
	}
	return 'codebergApi';
}

export async function codebergApiRequest(
	this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
) {
	const authentication = getAuthenticationType(this);

	const options: IHttpRequestOptions = {
		method,
		qs,
		url: `${CODEBERG_URLS.API_BASE}${endpoint}`,
		json: true,
	};

	if (Object.keys(body).length) {
		options.body = body;
	}

	const credentialType =
		authentication === 'oAuth2' ? 'codebergOAuth2Api' : 'codebergApi';

	try {
		return await this.helpers.httpRequestWithAuthentication.call(
			this,
			credentialType,
			options,
		);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error);
	}
}

export async function codebergApiRequestAllItems(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<IDataObject[]> {
	const returnData: IDataObject[] = [];

	qs.limit = qs.limit || PAGINATION.DEFAULT_LIMIT;
	qs.page = 1;

	let responseData: IDataObject[];
	do {
		responseData = await codebergApiRequest.call(this, method, endpoint, body, qs) as IDataObject[];
		returnData.push(...responseData);
		qs.page = (qs.page as number) + 1;
	} while (responseData.length === (qs.limit as number));

	return returnData;
}
