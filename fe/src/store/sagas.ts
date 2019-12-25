import { call, put, takeLatest, all, select } from 'redux-saga/effects';
import { apiFetchUser, apiSubmit } from '../api/api';
import { PreferenceState } from './state/PreferenceState';
import { RootState } from '.';

function* fetchList() {
    console.log('fetchList');
    try {
       const list = yield call(apiFetchUser);
       yield put({type: "FETCH_SUCCEEDED", payload: {list}});
    } catch (e) {
       yield put({type: "FETCH_FAILED"});
    }
 }

 function* submit() {
    console.log('f submit');
    const getState = (state:RootState) => state.preferenceReducer;
    const state:PreferenceState = yield select(getState);

    const data = [
        ...state.selection.map(e => e.id),
        [...state.list.map(e => e.id)],
    ];
    try {
       yield call(apiSubmit, {name: state.name, preferenceList: data});
       yield put({type: "SUBMIT_SUCCEEDED"});
    } catch (e) {
       yield put({type: "SUBMIT_FAILED"});
    }
 }

const mySagaFetch = function* mySaga() {
    yield takeLatest("FETCH_REQUESTED", fetchList);
}

const mySagaSubmit = function* mySaga() {
    yield takeLatest("SUBMIT_REQUESTED", submit);
}

export const mySagas = function* mySaga() {
    yield all([
        mySagaFetch(),
        mySagaSubmit(),
    ]);
}
