import { all, call, put, select, takeLatest } from 'redux-saga/effects';
import { RootState } from '.';
import { apiFetchUser, apiSubmit } from '../api/api';
import { PreferenceState } from './state/PreferenceState';

function* fetchList() {
    try {
        const list = yield call(apiFetchUser);
        yield put({ type: 'FETCH_SUCCEEDED', payload: { list } });
    } catch (e) {
        yield put({ type: 'FETCH_FAILED' });
    }
}

function* submit() {
    const getState = (st: RootState) => st.preferenceReducer;
    const state: PreferenceState = yield select(getState);

    const data = [
        ...state.selection.map(e => e.id),
        [...state.list.map(e => e.id)],
    ];
    try {
        yield call(apiSubmit, { name: state.name, preferenceList: data });
        yield put({ type: 'SUBMIT_SUCCEEDED' });
    } catch (e) {
        yield put({ type: 'SUBMIT_FAILED' });
    }
}

const mySagaFetch = function* mySaga() {
    yield takeLatest('FETCH_REQUESTED', fetchList);
};

const mySagaSubmit = function* mySaga() {
    yield takeLatest('SUBMIT_REQUESTED', submit);
};

export const mySagas = function* mySaga() {
    yield all([mySagaFetch(), mySagaSubmit()]);
};
