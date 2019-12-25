import React, { ChangeEvent } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { OptionElement } from './OptionElement';
import { SelectedOptionElement } from './SelectedOptionElement';
import { Instructions } from './Instructions';
import { Message } from './Message';
import { OptionList } from './OptionList';

export const Ballot: React.FC = () => {
    const {list, selection, name, messageType, message, displayOptions} = useSelector((state: RootState) => state.preferenceReducer);
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

    const handleNameChange = React.useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const name = event.target.value;
            dispatch({type: "SET_NAME", payload: {name}});
        },
        [dispatch],
    )

    return <div>
        <Message type={messageType} message={message} />
        { displayOptions && <>
            <Instructions />
            <input type="text" value={name} onChange={handleNameChange} />
            <button onClick={handleSubmit}>Submit vote</button>

            <div style={{display: 'flex'}}>
                <OptionList list={list} elemView={OptionElement} />
                <OptionList list={selection} elemView={SelectedOptionElement} />
            </div>
        </>}
    </div>
}
