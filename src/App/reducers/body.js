import { combineReducers } from 'redux';
import * as types from '../actions/types';

import { randomRange } from '../lib/number';
import { findObjectValueInArray } from '../lib/object';


const defaults = {
	setting: {
		width: 100,
		height: 100,
		maxColumn: 5,
		outerMargin: 10,
		innerMargin: 10,
	},
	visibleToolbarButtons: {
		setting: true,
		shuffle: true,
		add: true,
		edit: false,
		removeImage: false,
		duplicate: false,
		removeBlock: false,
		editColor: false,
	}
};
let lastGridId = null;
let shuffleIndex = 0;


function setting(state=defaults.setting, action)
{
	switch(action.type)
	{
		case types.INIT_PLE:
			return {
				...state,
				...action.value.preference.body.setting,
			};
			break;

		case types.GRID_SETTING_UPDATE:
			return {
				...state,
				...action.value,
			};
	}
	return state;
}

function visibleToolbarButtons(state=defaults.visibleToolbarButtons, action)
{
	switch(action.type) {
		case types.GRID_ACTIVE_BLOCK:
			if (action.value !== null)
			{
				return Object.assign({},
					state,
					{
						duplicate: true,
						removeBlock: true,
						editColor: true,
					},
					action.isImage ? {
						edit: true,
						removeImage: true,
					} : {
						edit: false,
						removeImage: false,
					}
				);
			}
			else
			{
				return {
					...state,
					edit: false,
					removeImage: false,
					duplicate: false,
					removeBlock: false,
					editColor: false,
				};
			}

		case types.GRID_REMOVE_BLOCK:
			return {
				...state,
				edit: false,
				removeImage: false,
				duplicate: false,
				removeBlock: false,
				editColor: false,
			}
	}
	return state;
}

function grid(state=[], action)
{
	let newState = null;
	let n = null;

	switch (action.type)
	{
		case types.INIT_PLE:
			return (action.value.preference.body.grid || state).map((o, k) => {
				lastGridId = lastGridId === null ? 0 : lastGridId + 1;
				return {
					color: null,
					...o,
					index: lastGridId,
					indexPrefix: shuffleIndex,
				};
			});

		case types.GRID_ADD_BLOCK:
			lastGridId = lastGridId === null ? 0 : lastGridId + 1;
			return state.concat({
				color: null,
				layout: { x: Infinity, y: Infinity, w: 1, h: 1 },
				...action.value,
				index: lastGridId,
				indexPrefix: shuffleIndex,
			});

		case types.GRID_REMOVE_BLOCK:
			if (!action.index || !action.index.length) return state;
			newState = Object.assign([], state);
			for (let i=0; i<action.index.length; i++)
			{
				const n = findObjectValueInArray(newState, 'index', action.index[i]);
				newState.splice(n, 1);
			}
			return newState;

		case types.GRID_SHUFFLE_BLOCKS:
			shuffleIndex++;
			newState = Object.assign([], state);
			return newState.map((o, k) => {
				return {
					...o,
					layout: {
						x: randomRange(0, action.value.x - 1),
						y: randomRange(0, action.value.y - 1),
						w: randomRange(1, action.value.w),
						h: randomRange(1, action.value.h),
					},
					indexPrefix: shuffleIndex,
				};
			});

		case types.GRID_DUPLICATE_BLOCK:
			n = findObjectValueInArray(state, 'index', action.index);
			if (!state[n]) return state;
			lastGridId = lastGridId === null ? 0 : lastGridId + 1;
			return state.concat({
				...state[n],
				index: lastGridId,
			});

		case types.GRID_CHANGE_COLOR:
			newState = Object.assign([], state);
			n = findObjectValueInArray(newState, 'index', action.item);
			if (newState[n]) newState[n].color = action.color;
			return newState;

		case types.ATTACH_IMAGES:
			if (!action.value || !action.value.length) return state;

			newState = Object.assign([], state);
			newState.forEach((o) => {
				if (o.image) return;
				if (!action.value || !action.value.length) return;
				o.image = {
					src: action.value.splice(0,1),
					position: '50% 50%',
					size: 'cover',
				};
			});
			if (action.value.length)
			{
				action.value.forEach((o, k) => {
					lastGridId = lastGridId === null ? 0 : lastGridId + 1;
					newState = newState.concat({
						color: null,
						layout: {
							x: (state.length + k) % action.columns,
							y: Infinity,
							w: 1,
							h: 1
						},
						image: {
							src: o,
							position: '50% 50%',
							size: 'cover',
						},
						index: lastGridId,
					});
				});
			}
			return newState;

		case types.REMOVE_IMAGES:
			newState = Object.assign([], state);
			action.value.forEach((o) => {
				n = findObjectValueInArray(newState, 'index', o);
				if (newState[n] && newState[n].image)
				{
					delete newState[n].image;
				}
			});
			return newState;

		case types.GRID_UPDATE_BLOCKS:
			return Object.assign([], state, action.value);

		case types.CROPPER_CLOSE:
			// TODO : 크로퍼가 끝날때 grid 정보 업데이트 하기
			return state;
	}

	return state;
}

function activeBlock(state=null, action)
{
	switch (action.type)
	{
		case types.GRID_ACTIVE_BLOCK:
			return action.value;

		case types.GRID_REMOVE_BLOCK:
			return null;
	}

	return state;
}


export default combineReducers({
	setting,
	visibleToolbarButtons,
	grid,
	activeBlock,
});