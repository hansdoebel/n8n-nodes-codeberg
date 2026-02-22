import type { Icon, ICredentialType, INodeProperties } from 'n8n-workflow';

export class CodebergOAuth2Api implements ICredentialType {
	name = 'codebergOAuth2Api';

	extends = ['oAuth2Api'];

	displayName = 'Codeberg OAuth2 API';

	icon: Icon = 'file:../icons/codeberg.svg';

	documentationUrl = 'https://forgejo.org/docs/latest/user/oauth2-provider/';

	properties: INodeProperties[] = [
		{
			displayName: 'Grant Type',
			name: 'grantType',
			type: 'hidden',
			default: 'authorizationCode',
		},
		{
			displayName: 'Authorization URL',
			name: 'authUrl',
			type: 'hidden',
			default: 'https://codeberg.org/login/oauth/authorize',
		},
		{
			displayName: 'Access Token URL',
			name: 'accessTokenUrl',
			type: 'hidden',
			default: 'https://codeberg.org/login/oauth/access_token',
		},
		{
			displayName: 'Scope',
			name: 'scope',
			type: 'hidden',
			default: '',
		},
		{
			displayName: 'Auth URI Query Parameters',
			name: 'authQueryParameters',
			type: 'hidden',
			default: '',
		},
		{
			displayName: 'Authentication',
			name: 'authentication',
			type: 'hidden',
			default: 'header',
		},
	];
}
