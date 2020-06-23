import { expect } from 'chai';
import 'mocha';

import { EditorState } from 'prosemirror-state';
import { doc, p, a, schema, TaggedProsemirrorNode, TaggedFlatObject } from 'prosemirror-test-builder';
import { EditorView } from 'prosemirror-view';

import { HyperlinkPlugin, showInsertToolbar, showEditToolbar, hideToolbar } from '../src';
import { EditState, InsertState, pluginKey } from '../src/state';

function createEditor(content: string | TaggedProsemirrorNode | TaggedFlatObject) {
	const place = document.body.appendChild(document.createElement('div'));
	return new EditorView(place, {
		state: EditorState.create({
			doc: doc(p(content)),
			plugins: [
				new HyperlinkPlugin(schema.marks.link, () => []),
			],
			schema,
		}),
	});
}

describe('commands', () => {
	describe('showInsertToolbar', () => {
		it('updates state', () => {
			const from = 0;
			const to = 2;
			const editorView = createEditor('foo');
			
			showInsertToolbar({ from, to })(editorView.state, editorView.dispatch);
			
			const state = pluginKey.getState(editorView.state)!.toolbar as InsertState;
			expect(state.status).equals('insert');
			expect(state.from).equals(from);
			expect(state.to).equals(to);
		});
	});

	describe('showEditToolbar', () => {
		it('updates state', () => {
			const pos = 1;
			const editorView = createEditor(a('foo'));

			showEditToolbar({ pos })(editorView.state, editorView.dispatch);

			const state = pluginKey.getState(editorView.state)!.toolbar as EditState;
			expect(state.status).equals('edit');
			expect(state.pos).equals(pos);
		});
	});

	describe('hideToolbar', () => {
		it('updates state', () => {
			const editorView = createEditor(a('foo'));

			showEditToolbar({ pos: 1 })(editorView.state, editorView.dispatch);
			const preState = pluginKey.getState(editorView.state)!.toolbar as EditState;
			expect(preState.status).equals('edit', 'Pre-condition');

			hideToolbar()(editorView.state, editorView.dispatch);
			const state = pluginKey.getState(editorView.state)!.toolbar as EditState;
			expect(state.status).equals('closed');
		});
	});
});
