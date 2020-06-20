import { Schema } from 'prosemirror-model';
import { Transaction } from 'prosemirror-state';

import { ActionType } from './action-types';
import { pluginKey, ToolbarState, PluginState } from './state';

function toolbarReducer<S extends Schema>(tr: Transaction<S>, state: ToolbarState): ToolbarState {
	const meta = tr.getMeta(pluginKey);
	const action = meta && meta.type as ActionType;
	switch (action) {
		case ActionType.SHOW_INSERT_TOOLBAR:
			return {
				status: 'insert',
				from: meta.from,
				to: meta.to,
			};
		case ActionType.SHOW_EDIT_TOOLBAR:
			return {
				status: 'edit',
				pos: meta.pos,
			};
		case ActionType.HIDE_TOOLBAR:
			return {
				status: 'closed',
			};
		default:
			// Don't close on mouse events
			if (tr.getMeta('pointer')) {
				return state;
			}

			// Automatically close if the editor state changes. This removes the need to
			// track position changes.
			// TODO: Track position changes to allow for collaborative editing
			// (or other actions that might change the editor state)

			// Trigger object change only if the value changes
			return state.status !== 'closed' ? {
				status: 'closed',
			} : state;
	}
}

export const reducer = <S extends Schema>(tr: Transaction<S>, state: PluginState) => ({
	toolbar: toolbarReducer(tr, state.toolbar),
});
