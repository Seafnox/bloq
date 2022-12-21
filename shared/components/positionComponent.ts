import { ComponentId } from '../constants';
import { globalToChunk } from '../helpers';
import { SerializableComponent, SerializableComponentData } from './serializableComponent';

export interface PositionComponentData extends SerializableComponentData {
    x: number;
    y: number;
    z: number;
}

export class PositionComponent extends SerializableComponent<PositionComponentData> implements PositionComponentData {
    static ID = ComponentId.Position;

    x: number = 0;
    y: number = 0;
    z: number = 0;

    toChunk(): [number, number, number] {
        return [globalToChunk(this.x), globalToChunk(this.y), globalToChunk(this.z)];
    }
}
