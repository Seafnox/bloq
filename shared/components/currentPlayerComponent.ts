import { ComponentId } from '../constants/ComponentId';
import { SerializableComponent, SerializableComponentData } from './serializableComponent';

export class CurrentPlayerComponent extends SerializableComponent<SerializableComponentData> {
    static ID = ComponentId.CurrentPlayer;
}
