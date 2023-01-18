import { ComponentId } from '../constants/componentId';
import { SerializableComponent, SerializableComponentData } from './serializableComponent';

export interface PlayerComponentData extends SerializableComponentData {
    name: string;
}

export class PlayerComponent extends SerializableComponent<PlayerComponentData> implements PlayerComponentData {
    static ID = ComponentId.Player;

    name: string;
}
