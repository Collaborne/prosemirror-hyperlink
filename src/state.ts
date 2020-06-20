import { PluginKey } from 'prosemirror-state';

export interface InsertState {
	status: 'insert';
	from: number;
	to: number;
}
export interface EditState {
	status: 'edit';
	/**
	 * Coordinate of the node next to which the toolbox should be shown
	 */
	pos: number;
}
export interface ClosedState {
	status: 'closed';
}
export type ToolbarState = ClosedState | EditState | InsertState;
export interface PluginState {
	toolbar: ToolbarState;
}

export const pluginKey = new PluginKey<PluginState, any>('hyperlink');
