import { AnyAction } from 'redux';
import { PreferenceState } from './state/PreferenceState';

const initialState: PreferenceState = {
    list: [],
    selection: [],
    name: '',
    messageType: 'none',
    message: '',
    displayOptions: false,
};

export const preferenceReducer = (
    state: PreferenceState = initialState,
    action: AnyAction,
): PreferenceState => {
    switch (action.type) {
        case 'FETCH_REQUESTED':
            return {
                ...state,
                messageType: 'waiting',
                message: 'Please wait, ballot is loading...',
            };

        case 'FETCH_SUCCEEDED':
            return {
                ...state,
                list: action.payload.list,
                messageType: 'none',
                message: '',
                displayOptions: true,
            };

        case 'FETCH_FAILED':
            return {
                ...state,
                list: [],
                messageType: 'error',
                message: 'Not able to connect server. Refresh and try again.',
                displayOptions: false,
            };

        case 'SUBMIT_REQUESTED':
            return {
                ...state,
                messageType: 'waiting',
                message: 'Uploading your vote to the server...',
                displayOptions: false,
            };

        case 'SUBMIT_SUCCEEDED':
            return {
                ...state,
                messageType: 'success',
                message: 'Submitted, thank you.',
                displayOptions: false,
            };

        case 'SUBMIT_FAILED':
            return {
                ...state,
                messageType: 'error',
                message: 'Failed to submit, wait and try again.',
                displayOptions: true,
            };

        case 'SELECT':
            const { index } = action.payload;
            const elem = state.list.find(e => e.id === index);
            return {
                ...state,
                list: state.list.filter(e => e.id !== index),
                selection: [
                    ...state.selection,
                    ...(elem !== undefined ? [elem] : []),
                ],
            };

        case 'UNSELECT':
            const { index: index2 } = action.payload;
            const elem2 = state.selection.find(e => e.id === index2);
            return {
                ...state,
                selection: state.selection.filter(e => e.id !== index2),
                list: [...state.list, ...(elem2 !== undefined ? [elem2] : [])],
            };

        case 'TOP':
            const { index: index3 } = action.payload;
            const elem3 = state.selection.find(e => e.id === index3);
            return {
                ...state,
                selection: [
                    ...(elem3 !== undefined ? [elem3] : []),
                    ...state.selection.filter(e => e.id !== index3),
                ],
            };

        case 'BOTTOM':
            const { index: index4 } = action.payload;
            const elem4 = state.selection.find(e => e.id === index4);
            return {
                ...state,
                selection: [
                    ...state.selection.filter(e => e.id !== index4),
                    ...(elem4 !== undefined ? [elem4] : []),
                ],
            };

        case 'UP':
            const { index: index5 } = action.payload;
            const position = state.selection.findIndex(e => e.id === index5);

            if (position < 1) {
                return state;
            } else {
                return {
                    ...state,
                    selection: [
                        ...state.selection.slice(0, position - 1),
                        state.selection[position],
                        state.selection[position - 1],
                        ...state.selection.slice(position + 1),
                    ],
                };
            }

        case 'DOWN':
            const { index: index6 } = action.payload;
            const position2 = state.selection.findIndex(e => e.id === index6);

            if (position2 > state.selection.length - 2) {
                return state;
            } else {
                return {
                    ...state,
                    selection: [
                        ...state.selection.slice(0, position2),
                        state.selection[position2 + 1],
                        state.selection[position2],
                        ...state.selection.slice(position2 + 2),
                    ],
                };
            }

        case 'SET_NAME':
            const { name } = action.payload;

            return {
                ...state,
                name,
            };

        default:
            return state;
    }
};
