import { combineReducers, applyMiddleware, createStore } from "redux";
import { preferenceReducer } from "./reducer";
import createSagaMiddleware from "redux-saga";
import { mySagas } from "./sagas";

const rootReducer = combineReducers({ preferenceReducer });

export type RootState = ReturnType<typeof rootReducer>;

const sagaMiddleware = createSagaMiddleware();

export const store = createStore(rootReducer, applyMiddleware(sagaMiddleware));

sagaMiddleware.run(mySagas);
store.dispatch({type: "FETCH_REQUESTED"});