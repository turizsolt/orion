import React from 'react';
import { Provider } from 'react-redux';
import { Ballot } from './components/Ballot';
import { store } from './store';

const App: React.FC = () => {
    return (
        <Provider store={store}>
            <Ballot />
        </Provider>
    );
};

export default App;
