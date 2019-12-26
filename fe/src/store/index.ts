import { applyMiddleware, combineReducers, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { preferenceReducer } from './reducer';
import { mySagas } from './sagas';

const rootReducer = combineReducers({ preferenceReducer });

export type RootState = ReturnType<typeof rootReducer>;

const sagaMiddleware = createSagaMiddleware();

export const store = createStore(rootReducer, applyMiddleware(sagaMiddleware));

sagaMiddleware.run(mySagas);
store.dispatch({ type: 'FETCH_REQUESTED' });
