/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as assert from 'assert';
import { Platform } from 'vs/base/common/platform';
import { TerminalLinkHandler, LineColumnInfo } from 'vs/workbench/contrib/terminal/electron-browser/terminalLinkHandler';
import * as strings from 'vs/base/common/strings';
import * as path from 'path';
import * as sinon from 'sinon';

class TestTerminalLinkHandler extends TerminalLinkHandler {
	public get localLinkRegex(): RegExp {
		return this._localLinkRegex;
	}
	public get gitDiffLinkPreImageRegex(): RegExp {
		return this._gitDiffPreImageRegex;
	}
	public get gitDiffLinkPostImageRegex(): RegExp {
		return this._gitDiffPostImageRegex;
	}
	public preprocessPath(link: string): string | null {
		return this._preprocessPath(link);
	}
}

class TestXterm {
	public webLinksInit() { }
	public registerLinkMatcher() { }
}

interface LinkFormatInfo {
	urlFormat: string;
	line?: string;
	column?: string;
}

suite('Workbench - TerminalLinkHandler', () => {
	suite('localLinkRegex', () => {
		test('Windows', () => {
			const terminalLinkHandler = new TestTerminalLinkHandler(new TestXterm(), Platform.Windows, null!, null!, null!, null!);
			function testLink(link: string, linkUrl: string, lineNo?: string, columnNo?: string) {
				assert.equal(terminalLinkHandler.extractLinkUrl(link), linkUrl);
				assert.equal(terminalLinkHandler.extractLinkUrl(`:${link}:`), linkUrl);
				assert.equal(terminalLinkHandler.extractLinkUrl(`;${link};`), linkUrl);
				assert.equal(terminalLinkHandler.extractLinkUrl(`(${link})`), linkUrl);

				if (lineNo) {
					const lineColumnInfo: LineColumnInfo = terminalLinkHandler.extractLineColumnInfo(link);
					assert.equal(lineColumnInfo.lineNumber, lineNo);

					if (columnNo) {
						assert.equal(lineColumnInfo.columnNumber, columnNo);
					}
				}
			}

			function generateAndTestLinks() {
				const linkUrls = [
					'c:\\foo',
					'c:/foo',
					'.\\foo',
					'./foo',
					'..\\foo',
					'~\\foo',
					'~/foo',
					'c:/a/long/path',
					'c:\\a\\long\\path',
					'c:\\mixed/slash\\path',
					'a/relative/path',
					'plain/path',
					'plain\\path'
				];

				const supportedLinkFormats: LinkFormatInfo[] = [
					{ urlFormat: '{0}' },
					{ urlFormat: '{0} on line {1}', line: '5' },
					{ urlFormat: '{0} on line {1}, column {2}', line: '5', column: '3' },
					{ urlFormat: '{0}:line {1}', line: '5' },
					{ urlFormat: '{0}:line {1}, column {2}', line: '5', column: '3' },
					{ urlFormat: '{0}({1})', line: '5' },
					{ urlFormat: '{0} ({1})', line: '5' },
					{ urlFormat: '{0}({1},{2})', line: '5', column: '3' },
					{ urlFormat: '{0} ({1},{2})', line: '5', column: '3' },
					{ urlFormat: '{0}({1}, {2})', line: '5', column: '3' },
					{ urlFormat: '{0} ({1}, {2})', line: '5', column: '3' },
					{ urlFormat: '{0}:{1}', line: '5' },
					{ urlFormat: '{0}:{1}:{2}', line: '5', column: '3' },
					{ urlFormat: '{0}[{1}]', line: '5' },
					{ urlFormat: '{0} [{1}]', line: '5' },
					{ urlFormat: '{0}[{1},{2}]', line: '5', column: '3' },
					{ urlFormat: '{0} [{1},{2}]', line: '5', column: '3' },
					{ urlFormat: '{0}[{1}, {2}]', line: '5', column: '3' },
					{ urlFormat: '{0} [{1}, {2}]', line: '5', column: '3' }
				];

				linkUrls.forEach(linkUrl => {
					supportedLinkFormats.forEach(linkFormatInfo => {
						testLink(
							strings.format(linkFormatInfo.urlFormat, linkUrl, linkFormatInfo.line, linkFormatInfo.column),
							linkUrl,
							linkFormatInfo.line,
							linkFormatInfo.column
						);
					});
				});
			}

			generateAndTestLinks();
		});

		test('Linux', () => {
			const terminalLinkHandler = new TestTerminalLinkHandler(new TestXterm(), Platform.Linux, null!, null!, null!, null!);
			function testLink(link: string, linkUrl: string, lineNo?: string, columnNo?: string) {
				assert.equal(terminalLinkHandler.extractLinkUrl(link), linkUrl);
				assert.equal(terminalLinkHandler.extractLinkUrl(`:${link}:`), linkUrl);
				assert.equal(terminalLinkHandler.extractLinkUrl(`;${link};`), linkUrl);
				assert.equal(terminalLinkHandler.extractLinkUrl(`(${link})`), linkUrl);

				if (lineNo) {
					const lineColumnInfo: LineColumnInfo = terminalLinkHandler.extractLineColumnInfo(link);
					assert.equal(lineColumnInfo.lineNumber, lineNo);

					if (columnNo) {
						assert.equal(lineColumnInfo.columnNumber, columnNo);
					}
				}
			}

			function generateAndTestLinks() {
				const linkUrls = [
					'/foo',
					'~/foo',
					'./foo',
					'../foo',
					'/a/long/path',
					'a/relative/path'
				];

				const supportedLinkFormats: LinkFormatInfo[] = [
					{ urlFormat: '{0}' },
					{ urlFormat: '{0} on line {1}', line: '5' },
					{ urlFormat: '{0} on line {1}, column {2}', line: '5', column: '3' },
					{ urlFormat: '{0}:line {1}', line: '5' },
					{ urlFormat: '{0}:line {1}, column {2}', line: '5', column: '3' },
					{ urlFormat: '{0}({1})', line: '5' },
					{ urlFormat: '{0} ({1})', line: '5' },
					{ urlFormat: '{0}({1},{2})', line: '5', column: '3' },
					{ urlFormat: '{0} ({1},{2})', line: '5', column: '3' },
					{ urlFormat: '{0}:{1}', line: '5' },
					{ urlFormat: '{0}:{1}:{2}', line: '5', column: '3' },
					{ urlFormat: '{0}[{1}]', line: '5' },
					{ urlFormat: '{0} [{1}]', line: '5' },
					{ urlFormat: '{0}[{1},{2}]', line: '5', column: '3' },
					{ urlFormat: '{0} [{1},{2}]', line: '5', column: '3' }
				];

				linkUrls.forEach(linkUrl => {
					supportedLinkFormats.forEach(linkFormatInfo => {
						// console.log('linkFormatInfo: ', linkFormatInfo);
						testLink(
							strings.format(linkFormatInfo.urlFormat, linkUrl, linkFormatInfo.line, linkFormatInfo.column),
							linkUrl,
							linkFormatInfo.line,
							linkFormatInfo.column
						);
					});
				});
			}

			generateAndTestLinks();
		});
	});

	suite('preprocessPath', () => {
		test('Windows', () => {
			const linkHandler = new TestTerminalLinkHandler(new TestXterm(), Platform.Windows, null!, null!, null!, null!);
			linkHandler.processCwd = 'C:\\base';

			let stub = sinon.stub(path, 'join', function (arg1: string, arg2: string) {
				return arg1 + '\\' + arg2;
			});
			assert.equal(linkHandler.preprocessPath('./src/file1'), 'C:\\base\\./src/file1');
			assert.equal(linkHandler.preprocessPath('src\\file2'), 'C:\\base\\src\\file2');
			assert.equal(linkHandler.preprocessPath('C:\\absolute\\path\\file3'), 'C:\\absolute\\path\\file3');

			stub.restore();
		});
		test('Windows - spaces', () => {
			const linkHandler = new TestTerminalLinkHandler(new TestXterm(), Platform.Windows, null!, null!, null!, null!);
			linkHandler.processCwd = 'C:\\base dir';

			let stub = sinon.stub(path, 'join', function (arg1: string, arg2: string) {
				return arg1 + '\\' + arg2;
			});
			assert.equal(linkHandler.preprocessPath('./src/file1'), 'C:\\base dir\\./src/file1');
			assert.equal(linkHandler.preprocessPath('src\\file2'), 'C:\\base dir\\src\\file2');
			assert.equal(linkHandler.preprocessPath('C:\\absolute\\path\\file3'), 'C:\\absolute\\path\\file3');

			stub.restore();
		});

		test('Linux', () => {
			const linkHandler = new TestTerminalLinkHandler(new TestXterm(), Platform.Linux, null!, null!, null!, null!);
			linkHandler.processCwd = '/base';

			let stub = sinon.stub(path, 'join', function (arg1: string, arg2: string) {
				return arg1 + '/' + arg2;
			});

			assert.equal(linkHandler.preprocessPath('./src/file1'), '/base/./src/file1');
			assert.equal(linkHandler.preprocessPath('src/file2'), '/base/src/file2');
			assert.equal(linkHandler.preprocessPath('/absolute/path/file3'), '/absolute/path/file3');
			stub.restore();
		});

		test('No Workspace', () => {
			const linkHandler = new TestTerminalLinkHandler(new TestXterm(), Platform.Linux, null!, null!, null!, null!);

			assert.equal(linkHandler.preprocessPath('./src/file1'), null);
			assert.equal(linkHandler.preprocessPath('src/file2'), null);
			assert.equal(linkHandler.preprocessPath('/absolute/path/file3'), '/absolute/path/file3');
		});
	});

	test('gitDiffLinkRegex', () => {
		// The platform is irrelevant because the links generated by Git are the same format regardless of platform
		const linkHandler = new TestTerminalLinkHandler(new TestXterm(), Platform.Linux, null!, null!, null!, null!);

		function assertAreGoodMatches(matches: RegExpMatchArray | null) {
			if (matches) {
				assert.equal(matches.length, 2);
				assert.equal(matches[1], 'src/file1');
			} else {
				assert.fail();
			}
		}

		// Happy cases
		assertAreGoodMatches('--- a/src/file1'.match(linkHandler.gitDiffLinkPreImageRegex));
		assertAreGoodMatches('--- a/src/file1             '.match(linkHandler.gitDiffLinkPreImageRegex));
		assertAreGoodMatches('+++ b/src/file1'.match(linkHandler.gitDiffLinkPostImageRegex));
		assertAreGoodMatches('+++ b/src/file1             '.match(linkHandler.gitDiffLinkPostImageRegex));

		// Make sure /dev/null isn't a match
		assert.equal(linkHandler.gitDiffLinkPreImageRegex.test('--- /dev/null'), false);
		assert.equal(linkHandler.gitDiffLinkPreImageRegex.test('--- /dev/null           '), false);
		assert.equal(linkHandler.gitDiffLinkPostImageRegex.test('+++ /dev/null'), false);
		assert.equal(linkHandler.gitDiffLinkPostImageRegex.test('+++ /dev/null          '), false);
	});
});
