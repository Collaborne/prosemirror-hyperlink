import { Mark, Node as ProseNode, ResolvedPos, Schema } from 'prosemirror-model';
import { EditorState, Transaction } from 'prosemirror-state';

import { pluginKey } from './state';
import { ActionType } from './action-types';

export interface ShowInsertToolbarOptions {
	from: number;
	to: number;
}
export interface ShowEditToolbarOptions {
	pos: number;
}
export interface UpdateLinkOptions {
	href?: string;
	text: string;
	to?: number;
}

type Dispatch<S extends Schema> = (tr: Transaction<S>) => void;

export function showInsertToolbar(options: ShowInsertToolbarOptions) {
	return <S extends Schema>(state: EditorState<S>, dispatch: Dispatch<S>) => {
		const tr = state.tr.setMeta(pluginKey, {
			type: ActionType.SHOW_INSERT_TOOLBAR,
			from: options.from,
			to: options.to,
		});
		dispatch(tr);
	};
}

export function showEditToolbar(options: ShowEditToolbarOptions) {
	return <S extends Schema>(state: EditorState<S>, dispatch: Dispatch<S>) => {
		const tr = state.tr.setMeta(pluginKey, {
			type: ActionType.SHOW_EDIT_TOOLBAR,
			pos: options.pos,
		});
		dispatch(tr);
	};
}

export function hideToolbar() {
	return <S extends Schema>(state: EditorState<S>, dispatch: Dispatch<S>) => {
		const tr = state.tr.setMeta(pluginKey, {
			type: ActionType.HIDE_TOOLBAR,
		});
		dispatch(tr);
	};
}

export function updateLink(options: UpdateLinkOptions) {
	return <S extends Schema>(state: EditorState<S>, dispatch: Dispatch<S>) => {
		const { toolbar: toolbarState } = pluginKey.getState(state)!;
		if (toolbarState.status !== 'insert' && toolbarState.status !== 'edit') {
			throw new Error(`Can't update link if toolbar isn't opened`);
		}

		const linkMark = state.schema.marks.link;

		let from;
		let to;
		if (toolbarState.status === 'insert') {
			from = toolbarState.from;
			to = toolbarState.to;
		} else {
			const { pos } = toolbarState;

			const $pos: ResolvedPos = state.doc.resolve(pos);
			const node: ProseNode | null | undefined = state.doc.nodeAt(pos);
			if (!node) {
				return false;
			}

			from = pos;
			to = options.to && pos !== options.to ? options.to : pos - $pos.textOffset + node.nodeSize;
		}

		const tr = state.tr
			.insertText(options.text, from, to)
			.setMeta(pluginKey, {
				type: ActionType.HIDE_TOOLBAR,
			});
		// Only add link mark if there is link
		if (options.href && options.href.trim().length > 0) {
			const linkAttrs = {
				href: options.href,
				title: options.href,
			};
			const mark = linkMark.create(linkAttrs) as Mark<S>;
			tr.addMark(from, from + options.text.length, mark);
		}
		dispatch(tr);
	};
}
