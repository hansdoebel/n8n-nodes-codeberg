import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class CodebergApi implements ICredentialType {
	name = 'codebergApi';

	displayName = 'Codeberg API';

	icon: Icon = 'file:../icons/codeberg.svg';

	documentationUrl = 'https://codeberg.org/user/settings/applications';

	properties: INodeProperties[] = [
		{
			displayName: 'Access Token',
			name: 'accessToken',
			type: 'string',
			typeOptions: { password: true },
			default: '',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=token {{$credentials?.accessToken}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://codeberg.org/api/v1',
			url: '/user',
			method: 'GET',
		},
	};
}
