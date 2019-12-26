import React from 'react';
import { useDispatch } from 'react-redux';
import { Option } from '../store/state/Option';

interface Props {
    elem: Option;
}

export const SelectedOptionElement: React.FC<Props> = props => {
    const { elem } = props;
    const dispatch = useDispatch();

    const handleAction = React.useCallback(
        (type: string, index: number) => () => {
            dispatch({ type, payload: { index } });
        },
        [dispatch],
    );

    return (
        <li key={elem.id}>
            <button onClick={handleAction('UNSELECT', elem.id)}>←</button>
            <button onClick={handleAction('TOP', elem.id)}>↟</button>
            <button onClick={handleAction('UP', elem.id)}>↑</button>
            <button onClick={handleAction('DOWN', elem.id)}>↓</button>
            <button onClick={handleAction('BOTTOM', elem.id)}>↡</button>
            {elem.name} ({elem.id})
        </li>
    );
};
