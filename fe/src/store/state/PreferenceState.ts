import { MessageType } from './MessageType';
import { Option } from './Option';

export interface PreferenceState {
    list: Option[];
    selection: Option[];
    name: string;

    message: string;
    messageType: MessageType;
    displayOptions: boolean;
}
