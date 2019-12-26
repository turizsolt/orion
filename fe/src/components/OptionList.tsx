import React from 'react';
import { Option } from '../store/state/Option';

interface Props {
    list: Option[];
    elemView: React.FC<{ elem: Option }>;
}

export const OptionList: React.FC<Props> = props => {
    const { list, elemView: ElemView } = props;

    return (
        <div style={{ width: '300px' }}>
            <ul>
                {list.map(elem => (
                    <ElemView key={elem.id} elem={elem} />
                ))}
            </ul>
        </div>
    );
};
