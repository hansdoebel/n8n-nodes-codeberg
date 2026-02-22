/* eslint-disable @typescript-eslint/no-explicit-any, @n8n/community-nodes/no-restricted-imports, import-x/no-unresolved */
import { describe, test, expect } from 'bun:test';
import { mockApiRequest, createContext, T, setupBeforeEach } from './testUtils';
import { fileResource } from '../nodes/Codeberg/resources/file';

setupBeforeEach();

describe('File', () => {
	test('create', async () => {
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			filePath: T.FILE_PATH,
			content: 'hello',
			commitMessage: 'Add file',
			additionalFields: {
				branch: 'main',
				newBranch: 'feature',
				authorName: 'Test User',
				authorEmail: 'test@example.com',
			},
		});
		const result = await fileResource.handlers.create.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith(
			'POST',
			`/repos/${T.OWNER}/${T.REPO}/contents/${T.FILE_PATH}`,
			{
				content: 'aGVsbG8=',
				message: 'Add file',
				branch: 'main',
				new_branch: 'feature',
				author: { name: 'Test User', email: 'test@example.com' },
			},
		);
	});

	test('create with empty additionalFields', async () => {
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			filePath: T.FILE_PATH,
			content: 'world',
			commitMessage: 'Create new file',
			additionalFields: {},
		});
		const result = await fileResource.handlers.create.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith(
			'POST',
			`/repos/${T.OWNER}/${T.REPO}/contents/${T.FILE_PATH}`,
			{ content: Buffer.from('world').toString('base64'), message: 'Create new file' },
		);
	});

	test('create with only authorName', async () => {
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			filePath: T.FILE_PATH,
			content: 'test',
			commitMessage: 'Add',
			additionalFields: { authorName: 'Someone' },
		});
		const result = await fileResource.handlers.create.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith(
			'POST',
			`/repos/${T.OWNER}/${T.REPO}/contents/${T.FILE_PATH}`,
			{
				content: Buffer.from('test').toString('base64'),
				message: 'Add',
				author: { name: 'Someone' },
			},
		);
	});

	test('get', async () => {
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			filePath: T.FILE_PATH,
			additionalFields: { ref: 'v1.0.0' },
		});
		const result = await fileResource.handlers.get.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith(
			'GET',
			`/repos/${T.OWNER}/${T.REPO}/contents/${T.FILE_PATH}`,
			{},
			{ ref: 'v1.0.0' },
		);
	});

	test('get with empty additionalFields', async () => {
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			filePath: T.FILE_PATH,
			additionalFields: {},
		});
		const result = await fileResource.handlers.get.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith(
			'GET',
			`/repos/${T.OWNER}/${T.REPO}/contents/${T.FILE_PATH}`,
			{},
			{},
		);
	});

	test('update', async () => {
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			filePath: T.FILE_PATH,
			content: 'updated content',
			sha: T.SHA,
			commitMessage: 'Update file',
			additionalFields: { branch: 'develop', newBranch: 'fix-branch' },
		});
		const result = await fileResource.handlers.update.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith(
			'PUT',
			`/repos/${T.OWNER}/${T.REPO}/contents/${T.FILE_PATH}`,
			{
				content: Buffer.from('updated content').toString('base64'),
				message: 'Update file',
				sha: T.SHA,
				branch: 'develop',
				new_branch: 'fix-branch',
			},
		);
	});

	test('update with empty additionalFields', async () => {
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			filePath: T.FILE_PATH,
			content: 'new stuff',
			sha: T.SHA,
			commitMessage: 'Edit',
			additionalFields: {},
		});
		const result = await fileResource.handlers.update.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith(
			'PUT',
			`/repos/${T.OWNER}/${T.REPO}/contents/${T.FILE_PATH}`,
			{
				content: Buffer.from('new stuff').toString('base64'),
				message: 'Edit',
				sha: T.SHA,
			},
		);
	});

	test('delete', async () => {
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			filePath: T.FILE_PATH,
			sha: T.SHA,
			commitMessage: 'Remove file',
			additionalFields: { branch: 'main', newBranch: 'cleanup' },
		});
		const result = await fileResource.handlers.delete.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith(
			'DELETE',
			`/repos/${T.OWNER}/${T.REPO}/contents/${T.FILE_PATH}`,
			{
				message: 'Remove file',
				sha: T.SHA,
				branch: 'main',
				new_branch: 'cleanup',
			},
		);
	});

	test('delete with empty additionalFields', async () => {
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			filePath: T.FILE_PATH,
			sha: T.SHA,
			commitMessage: 'Delete it',
			additionalFields: {},
		});
		const result = await fileResource.handlers.delete.call(ctx as any, 0);
		expect(result).toEqual([{ json: { id: 1 } }]);
		expect(mockApiRequest).toHaveBeenCalledWith(
			'DELETE',
			`/repos/${T.OWNER}/${T.REPO}/contents/${T.FILE_PATH}`,
			{ message: 'Delete it', sha: T.SHA },
		);
	});

	test('list with directoryPath', async () => {
		mockApiRequest.mockImplementation(() => Promise.resolve([{ name: 'file1.ts' }, { name: 'file2.ts' }]));
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			additionalFields: { directoryPath: 'src/components', ref: 'develop' },
		});
		const result = await fileResource.handlers.list.call(ctx as any, 0);
		expect(result).toEqual([{ json: { name: 'file1.ts' } }, { json: { name: 'file2.ts' } }]);
		expect(mockApiRequest).toHaveBeenCalledWith(
			'GET',
			`/repos/${T.OWNER}/${T.REPO}/contents/src/components`,
			{},
			{ ref: 'develop' },
		);
	});

	test('list without directoryPath', async () => {
		mockApiRequest.mockImplementation(() => Promise.resolve([{ name: 'README.md' }]));
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			additionalFields: {},
		});
		const result = await fileResource.handlers.list.call(ctx as any, 0);
		expect(result).toEqual([{ json: { name: 'README.md' } }]);
		expect(mockApiRequest).toHaveBeenCalledWith(
			'GET',
			`/repos/${T.OWNER}/${T.REPO}/contents`,
			{},
			{},
		);
	});

	test('list returns single item when response is not array', async () => {
		mockApiRequest.mockImplementation(() => Promise.resolve({ name: 'single-file.txt', type: 'file' }));
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			additionalFields: { directoryPath: 'single-file.txt' },
		});
		const result = await fileResource.handlers.list.call(ctx as any, 0);
		expect(result).toEqual([{ json: { name: 'single-file.txt', type: 'file' } }]);
	});

	test('list with directoryPath containing spaces', async () => {
		mockApiRequest.mockImplementation(() => Promise.resolve([{ name: 'doc.md' }]));
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			additionalFields: { directoryPath: 'my docs/sub folder' },
		});
		const result = await fileResource.handlers.list.call(ctx as any, 0);
		expect(result).toEqual([{ json: { name: 'doc.md' } }]);
		expect(mockApiRequest).toHaveBeenCalledWith(
			'GET',
			`/repos/${T.OWNER}/${T.REPO}/contents/my%20docs/sub%20folder`,
			{},
			{},
		);
	});

	test('create encodes content to base64', async () => {
		const ctx = createContext({
			owner: T.OWNER,
			repo: T.REPO,
			filePath: 'test.txt',
			content: 'Hello, World!',
			commitMessage: 'test',
			additionalFields: {},
		});
		await fileResource.handlers.create.call(ctx as any, 0);
		const callArgs = mockApiRequest.mock.calls[0];
		expect(callArgs[2].content).toBe(Buffer.from('Hello, World!').toString('base64'));
		expect(callArgs[2].content).toBe('SGVsbG8sIFdvcmxkIQ==');
	});
});
