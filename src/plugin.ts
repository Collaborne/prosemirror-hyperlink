import { MarkType, Schema } from 'prosemirror-model';
import { Plugin } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

import { reducer } from './reducer';
import { EditState, InsertState, pluginKey, PluginState } from './state';
import { HyperlinkMarkView } from './view';

export interface ToolbarOptions {
	visible: boolean;
	/**
	 * Dom node of the link that triggered the toolbar
	 */
	dom?: Node;
	href?: string;
	text?: string;
}
type ConfigureToolbar = (options: ToolbarOptions) => void;

export class HyperlinkPlugin<S extends Schema> extends Plugin<PluginState, S> {
	constructor(private linkMarkType: MarkType, private configureToolbar: ConfigureToolbar) {
		super({
			key: pluginKey,
			state: {
				init: () => ({
					toolbar: {
						status: 'closed',
					},
				}),
				apply: reducer,
			},
			props: {
				nodeViews: {
					link: (node, view) => new HyperlinkMarkView(node, view),
				},
			},
			view: () => ({
				update: (view: EditorView<S>) => {
					/* eslint-disable no-case-declarations */
					const { toolbar: toolbarState } = this.getState(view.state);
					switch (toolbarState.status) {
						case 'insert':
							return this.createInsertToolbarOptions(view, toolbarState);
						case 'edit':
							return this.createEditToolbarOptions(view, toolbarState);
						case 'closed':
							return configureToolbar({
								visible: false,
							});
						default:
							throw new Error(`Unsupported toolbar status ${JSON.stringify(toolbarState)}`);
					}
					/* eslint-enable no-case-declarations */
				},
			}),
		});
	}

	private createEditToolbarOptions<S extends Schema>(view: EditorView<S>, state: EditState) {
		const dom = view.domAtPos(state.pos).node;
		const currentNode = view.state.doc.nodeAt(state.pos);
		if (!currentNode) {
			throw new Error(`Node can't be found at position ${state.pos}`);
		}
		const linkMark = currentNode.marks.find(mark => mark.type === this.linkMarkType);
		if (!linkMark) {
			throw new Error(`Node found at position ${state.pos} isn't marked as link`);
		}
	
		return this.configureToolbar({
			dom,
			href: linkMark.attrs.href,
			text: currentNode.text!,
			visible: true,
		});
	}

	private createInsertToolbarOptions<S extends Schema>(view: EditorView<S>, state: InsertState) {
		const insertDom = view.domAtPos(state.from).node;
		const text = view.state.doc.textBetween(state.from, state.to);

		return this.configureToolbar({
			dom: insertDom,
			text,
			visible: true,
		});
	}
}
