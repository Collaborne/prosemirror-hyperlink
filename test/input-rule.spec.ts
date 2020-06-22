import { expect } from 'chai';
import 'mocha';

import { inputRules } from 'prosemirror-inputrules';
import { schema } from 'prosemirror-schema-basic';
import { EditorState } from 'prosemirror-state';
import { doc, p } from 'prosemirror-test-builder';
import { EditorView } from 'prosemirror-view';

import { linkRule } from '../src';

const URL = 'http://www.example.com';

export function insertText(view: EditorView, text: string, from?: number) {
	const pos = typeof from === 'number' ? from : view.state.selection.from;

	text.split('').forEach((character, index) => {
		if (!view.someProp('handleTextInput', f =>
			f(view, pos + index, pos + index, character),
		)) {
			view.dispatch(
				view.state.tr.insertText(character, pos + index, pos + index),
			);
		}
	});
}

describe('input-rule', () => {
	const place = document.body.appendChild(document.createElement('div'));

	it('should convert "www.example.com" to hyperlink', () => {
		const rule = linkRule(schema.marks.link);
		const editorView = new EditorView(place, {
			state: EditorState.create({
				doc: doc(p('')),
				plugins: [
					inputRules({
						rules: [ rule ],
					}),
				],
				schema,
			}),
		});

		insertText(editorView, `${URL} `, 1);

		const node = editorView.state.doc.nodeAt(1)!;
		expect(node.text).equals(URL, 'Keeps texts');
		
		const linkMark = node.marks.find(mark => mark.type === schema.marks.link)!;
		expect(linkMark.attrs.href).equals(URL, 'Adds marker for link');

		const nextNode = editorView.state.doc.nodeAt(1 + node.text!.length)!;
		expect(nextNode.text).equals(' ', 'Appends space after link');
	});
});
