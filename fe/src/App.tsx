import React, { ChangeEvent } from 'react';
import { createStore, combineReducers, AnyAction, applyMiddleware } from 'redux';
import { Provider, useSelector, useDispatch } from 'react-redux';
import createSagaMiddleware from 'redux-saga';
import { call, put, takeLatest, all, select } from 'redux-saga/effects';

interface Option {
    id: number;
    name: string;
}

interface AlmafaState {
    list: Option[];
    selection: Option[];
    name: string;
    fetching: boolean;
    submitting: boolean;
    submitted: boolean;
    error: string;
};

const initialState:AlmafaState = {list: [], fetching: false, selection: [], name: '', submitting: false, submitted: false, error: ''};

const almafaReducer = (state: AlmafaState=initialState, action: AnyAction): AlmafaState => {
    switch(action.type) {
        case "SUBMIT_REQUESTED":
            return { ...state, submitting: true, error: '' };

        case "SUBMIT_SUCCEEDED":
            return { ...state, submitting: false, submitted: true };

        case "SUBMIT_FAILED":
            return { ...state, submitting: false, error: 'Failed to submit, wait and try again.' };

        case "FETCH_REQUESTED":
            return { ...state, fetching: true, error: '' };

        case "FETCH_SUCCEEDED":
            return { ...state, list: action.payload.list, fetching: false };

        case "FETCH_FAILED":
            return { ...state, list: [], fetching: false, error: 'Not able to connect server. Refresh and try again.' };

        case "SELECT":
            const { index } = action.payload;
            const elem = state.list.find((elem) => elem.id === index);
            console.log(index, elem);
            return {
                ...state,
                list: state.list.filter((elem) => elem.id !== index),
                selection: [...state.selection, ...(elem !== undefined ? [elem] : [])],
            };

        case "UNSELECT":
            const { index: index2 } = action.payload;
            const elem2 = state.selection.find((elem) => elem.id === index2);
            console.log(index2, elem2);
            return {
                ...state,
                selection: state.selection.filter((elem) => elem.id !== index2),
                list: [...state.list, ...(elem2 !== undefined ? [elem2] : [])],
            };

        case "TOP":
            const { index: index3 } = action.payload;
            const elem3 = state.selection.find((elem) => elem.id === index3);
            console.log(index3, elem3);
            return {
                ...state,
                selection: [
                    ...(elem3 !== undefined ? [elem3] : []),
                    ...state.selection.filter((elem) => elem.id !== index3),
                ],
            };

        case "BOTTOM":
            const { index: index4 } = action.payload;
            const elem4 = state.selection.find((elem) => elem.id === index4);
            console.log(index4, elem4);
            return {
                ...state,
                selection: [
                    ...state.selection.filter((elem) => elem.id !== index4),
                    ...(elem4 !== undefined ? [elem4] : []),
                ],
            };

        case "UP":
            const { index: index5 } = action.payload;
            const position = state.selection.findIndex((elem) => elem.id === index5);

            if(position < 1) {
                return state;
            } else {
                return {
                    ...state,
                    selection: [
                        ...state.selection.slice(0, position-1),
                        state.selection[position],
                        state.selection[position-1],
                        ...state.selection.slice(position+1),
                    ],
                };    
            };

        case "DOWN":
            const { index: index6 } = action.payload;
            const position2 = state.selection.findIndex((elem) => elem.id === index6);

            if(position2 > state.selection.length-2) {
                return state;
            } else {
                return {
                    ...state,
                    selection: [
                        ...state.selection.slice(0, position2),
                        state.selection[position2+1],
                        state.selection[position2],
                        ...state.selection.slice(position2+2),
                    ],
                };    
            };

        case "SET_NAME":
            const { name } = action.payload;
            
            return {
                ...state,
                name,
            };

        default:
            return state;
    }
};

const rootReducer = combineReducers({ almafaReducer });

type RootState = ReturnType<typeof rootReducer>;

const sagaMiddleware = createSagaMiddleware();

const store = createStore(rootReducer, applyMiddleware(sagaMiddleware));

async function apiFetchUser() {
    const result = await fetch('http://api.condorcet.zsiri.eu/election/1/');
    const data = await result.json();
    console.log(data);

    return data.options.map((elem:string, idx:number) => ({id: idx, name: elem}));
};

async function apiSubmit(arr: any) {
    await fetch('http://api.condorcet.zsiri.eu/election/1/vote', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(arr),
    })
};

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
    const getState = (state:RootState) => state.almafaReducer;
    const state:AlmafaState = yield select(getState);

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

const mySagas = function* mySaga() {
    yield all([
        mySagaFetch(),
        mySagaSubmit(),
    ]);
}

sagaMiddleware.run(mySagas);
store.dispatch({type: "FETCH_REQUESTED"});

const App: React.FC = () => {
  return <Provider store={store}>
    <Almafa />
  </Provider>;
}

export default App;

const Almafa: React.FC = () => {
    const {list, selection, name, error, submitted, submitting, fetching} = useSelector((state: RootState) => state.almafaReducer);
    const dispatch = useDispatch();

    const handleSubmit = React.useCallback(
        () => {
            if(name) {
                dispatch({type: 'SUBMIT_REQUESTED'});
            } else {
                alert('You should write a name in, before submit');
            }
        },
        [dispatch, name]
    );

    const handleFetch = React.useCallback(
        () => {
            dispatch({type: 'FETCH_REQUESTED'});
        },
        [dispatch]
    );

    const handleAction = React.useCallback(
        (type: string, index:number) => () => {
            dispatch({type, payload: {index}})
        },
        [dispatch],
    );

    const handleNameChange = React.useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const name = event.target.value;
            dispatch({type: "SET_NAME", payload: {name}});
        },
        [dispatch],
    )

    return <div>
        {submitted && <div>Submitted, thank you.</div>}
        {!submitted && (submitting || fetching) && <div>In progress...</div>}
        {!submitted && !submitting && !fetching && <>

        {error && <div>Message: {error}</div>}
        {false && <button onClick={handleFetch}>Fetch</button>}
        {(selection.length > 0 || list.length > 0) &&
        <>
        <div>
            A felsorolt hozzávalók közül válaszd ki és rangsorold azokat, amelyeket szívesen látnál a pizzádon a következő pizza partin. A bal oldali nyilakra kattintva tudod őket kiválasztani, majd ezután a fel-le nyilakkal tudsz módosítani a sorrenden. Amikor elkészültél, add meg a neved, és küldd be a sorrendedet a submit vote gombra kattintva.
        </div>
        <input type="text" value={name} onChange={handleNameChange} />
        <button onClick={handleSubmit}>Submit vote</button>
        </>}
    <div style={{display: 'flex'}}>
        <div style={{width: '300px'}}>
            <ul>
                {list.map(elem => (
                    <li key={elem.id}>
                        <button onClick={handleAction("SELECT", elem.id)}>→</button>
                        {elem.name} ({elem.id})
                    </li>
                ))}
            </ul>
        </div>
        <div>
            <ul>
                {selection.map(elem => (
                    <li key={elem.id}>
                        <button onClick={handleAction("UNSELECT", elem.id)}>←</button>
                        <button onClick={handleAction("TOP", elem.id)}>↟</button>
                        <button onClick={handleAction("UP", elem.id)}>↑</button>
                        <button onClick={handleAction("DOWN", elem.id)}>↓</button>
                        <button onClick={handleAction("BOTTOM", elem.id)}>↡</button>
                        {elem.name} ({elem.id})
                    </li>
                ))}
            </ul>
        </div>
    </div>
    </>}
    </div>
}

