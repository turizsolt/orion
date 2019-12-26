import React from 'react';
import { MessageType } from '../store/state/MessageType';

interface Props {
    type: MessageType;
    message: string;
}

export const Message: React.FC<Props> = props => {
    const { type, message } = props;

    return (
        <div>
            {type === 'waiting' && '⌛'}
            {type === 'error' && '❌'}
            {type === 'success' && '✓'}
            {type !== 'none' && ' ' + message}
        </div>
    );
};
