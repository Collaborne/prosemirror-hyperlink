import { expect } from 'chai';
import 'mocha';

import { inputRules } from 'prosemirror-inputrules';
import { Node as ProsemirrorNode } from 'prosemirror-model';
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
	let node: ProsemirrorNode | undefined | null;
	let nextNode: ProsemirrorNode | undefined | null;

	before(() => {
		const place = document.body.appendChild(document.createElement('div'));
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

		node = editorView.state.doc.nodeAt(1);
		nextNode = editorView.state.doc.nodeAt(1 + node!.text!.length);
	});

	it('preserves hyperlink text', () => {
		expect(node!.text).equals(URL);
	});

	it('adds marker for link', () => {
		const linkMark = node!.marks.find(mark => mark.type === schema.marks.link)!;
		expect(linkMark.attrs.href).equals(URL, 'Adds marker for link');
	});

	it('appends space after link', () => {
		expect(nextNode!.text).equals(' ');
	});
});
