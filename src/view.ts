import { Node as ProseNode, Schema } from 'prosemirror-model';
import { EditorView, NodeView } from 'prosemirror-view';
import { showEditToolbar } from './commands';

export class HyperlinkMarkView<S extends Schema> implements NodeView {
	public dom: HTMLAnchorElement;

	constructor(node: ProseNode, view: EditorView<S>) {
		this.dom = document.createElement('a');

		// Reflect attributes to DOM
		Object.keys(node.attrs)
			.filter(name => node.attrs[name])
			.forEach(name => this.dom.setAttribute(name, node.attrs[name]));

		this.dom.addEventListener('click', () => {
			const pos = view.posAtDOM(this.dom, 0);
			showEditToolbar({
				pos,
			})(view.state, view.dispatch);
		});
	}

	stopEvent(): boolean {
		return true;
	}
}
