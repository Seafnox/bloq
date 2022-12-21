import { ComponentId } from '../constants';
import { SerializableComponent, SerializableComponentData } from './serializableComponent';

export interface ChatMessageComponentData extends SerializableComponentData {
    from: string;
    text: string;
}
export class ChatMessageComponent extends SerializableComponent<ChatMessageComponentData> implements ChatMessageComponentData {
    static ID = ComponentId.ChatMessage;

    from: string;
    text: string;
}
