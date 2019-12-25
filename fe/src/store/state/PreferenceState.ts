import { Option } from "./Option";
import { MessageType } from "./MessageType";

export interface PreferenceState {
    list: Option[];
    selection: Option[];
    name: string;
    
    message: string;
    messageType: MessageType;
    displayOptions: boolean;
};
