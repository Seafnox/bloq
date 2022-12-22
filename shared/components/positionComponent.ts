import { ComponentId } from '../constants/componentId';
import { globalToChunk } from '../helpers/globalToChunk';
import { Position } from '../Position';
import { SerializableComponent, SerializableComponentData } from './serializableComponent';

export interface PositionComponentData extends SerializableComponentData, Position {}

export class PositionComponent extends SerializableComponent<PositionComponentData> implements PositionComponentData {
    static ID = ComponentId.Position;

    x: number = 0;
    y: number = 0;
    z: number = 0;

    toChunk(): [number, number, number] {
        return [globalToChunk(this.x), globalToChunk(this.y), globalToChunk(this.z)];
    }
}
