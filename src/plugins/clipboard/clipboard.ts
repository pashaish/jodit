/*!
 * Jodit Editor (https://xdsoft.net/jodit/)
 * Released under MIT see LICENSE.txt in the project root for license information.
 * Copyright (c) 2013-2020 Valeriy Chupurnov. All rights reserved. https://xdsoft.net
 */

import { IJodit, IPlugin } from '../../types';
import { TEXT_HTML, TEXT_PLAIN } from '../../core/constants';
import { stripTags } from '../../core/helpers';
import { getDataTransfer } from './paste/helpers';

export const pluginKey = 'clipboard';

/**
 * Clipboard plugin - cut and copy functionality
 */
export class clipboard implements IPlugin {
	jodit!: IJodit;

	init(editor: IJodit): void {
		editor.e
			.off(`copy.${pluginKey} cut.${pluginKey}`)
			.on(`copy.${pluginKey} cut.${pluginKey}`, (event: ClipboardEvent):
				| false
				| void => {
				const selectedText = editor.s.html;

				const clipboardData =
					getDataTransfer(event) ||
					getDataTransfer(editor.ew as any) ||
					getDataTransfer((event as any).originalEvent);

				if (clipboardData) {
					clipboardData.setData(TEXT_PLAIN, stripTags(selectedText));
					clipboardData.setData(TEXT_HTML, selectedText);
				}

				editor.buffer.set(pluginKey, selectedText);
				editor.e.fire('pasteStack', {
					html: selectedText,
					action: editor.o.defaultActionOnPaste
				});

				if (event.type === 'cut') {
					editor.s.remove();
					editor.s.focus();
				}

				event.preventDefault();

				editor?.events?.fire('afterCopy', selectedText);
			});
	}

	destruct(editor: IJodit): void {
		editor?.buffer?.set(pluginKey, '');
		editor?.events?.off('.' + pluginKey);
	}
}
