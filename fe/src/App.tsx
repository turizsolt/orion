import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { Ballot } from './components/Ballot';

const App: React.FC = () => {
  return <Provider store={store}>
    <Ballot />
  </Provider>;
}

export default App;
