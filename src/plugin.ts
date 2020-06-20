import { MarkType, Schema } from 'prosemirror-model';
import { Plugin } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

import { reducer } from './reducer';
import { pluginKey, PluginState } from './state';
import { HyperlinkMarkView } from './view';

export interface ToolbarOptions {
	visible: boolean;
	top?: number;
	left?: number;
	href?: string;
	text?: string;
}
type ConfigureToolbar = (options: ToolbarOptions) => void;

export class HyperlinkPlugin<S extends Schema> extends Plugin<PluginState, S> {
	constructor(linkMarkType: MarkType, configureToolbar: ConfigureToolbar) {
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
						case 'edit':
							const { bottom, left } = view.coordsAtPos(toolbarState.pos);
							const currentNode = view.state.doc.nodeAt(toolbarState.pos);
							if (!currentNode) {
								throw new Error(`Node can't be found at position ${toolbarState.pos}`);
							}
							const linkMark = currentNode.marks.find(mark => mark.type === linkMarkType);
							if (!linkMark) {
								throw new Error(`Node found at position ${toolbarState.pos} isn't marked as link`);
							}

							return configureToolbar({
								href: linkMark.attrs.href,
								left,
								text: currentNode.text!,
								top: bottom,
								visible: true,
							});
						case 'insert':
							const text = view.state.doc.textBetween(toolbarState.from, toolbarState.to);

							const coords = view.coordsAtPos(toolbarState.from);

							return configureToolbar({
								href: undefined,
								left: coords.left,
								text,
								top: coords.bottom,
								visible: true,
							});
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
}
