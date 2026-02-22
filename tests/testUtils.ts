/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @n8n/community-nodes/no-restricted-imports, import-x/no-unresolved */
import { mock, beforeEach } from 'bun:test';

export { ENDPOINTS } from '../nodes/Codeberg/utils/constants';

export const mockApiRequest = mock<any>(() => Promise.resolve({ id: 1 }));
export const mockApiRequestAllItems = mock<any>(() => Promise.resolve([{ id: 1 }, { id: 2 }]));

mock.module('../nodes/Codeberg/utils/apiRequest', () => ({
	codebergApiRequest: mockApiRequest,
	codebergApiRequestAllItems: mockApiRequestAllItems,
}));

export const T = {
	OWNER: 'testowner',
	REPO: 'testrepo',
	ISSUE_NUM: 42,
	PULL_NUM: 7,
	COMMENT_ID: 99,
	LABEL_ID: 5,
	MILESTONE_ID: 3,
	RELEASE_ID: 10,
	BRANCH: 'feature-branch',
	SOURCE_BRANCH: 'main',
	FILE_PATH: 'docs/README.md',
	SHA: 'abc123def456',
	ORG: 'testorg',
	USERNAME: 'testuser',
} as const;

export function createContext(params: Record<string, unknown>) {
	return {
		getNodeParameter: mock((name: string, _index: number) => {
			if (!(name in params)) throw new Error(`Parameter ${name} not configured`);
			return params[name];
		}),
		getNode: mock(() => ({ name: 'Codeberg' })),
	};
}

export function setupBeforeEach() {
	beforeEach(() => {
		mockApiRequest.mockReset();
		mockApiRequest.mockImplementation(() => Promise.resolve({ id: 1 }));
		mockApiRequestAllItems.mockReset();
		mockApiRequestAllItems.mockImplementation(() => Promise.resolve([{ id: 1 }, { id: 2 }]));
	});
}
