import React from 'react';
import { Option } from '../store/state/Option';
import { useDispatch } from 'react-redux';

interface Props {
    elem: Option;
}

export const OptionElement: React.FC<Props> = (props) => {
    const { elem } = props;
    const dispatch = useDispatch();

    const handleAction = React.useCallback(
        (type: string, index:number) => () => {
            dispatch({type, payload: {index}})
        },
        [dispatch],
    );

    return (
        <li key={elem.id}>
            <button onClick={handleAction("SELECT", elem.id)}>→</button>
            {elem.name} ({elem.id})
        </li>
    );
}
