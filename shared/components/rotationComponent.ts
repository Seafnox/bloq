import { ComponentId } from '../constants/componentId';
import { Position } from '../Position';
import { SerializableComponent, SerializableComponentData } from './serializableComponent';

export interface RotationComponentData extends SerializableComponentData, Position {}

export class RotationComponent extends SerializableComponent<RotationComponentData> implements RotationComponentData {
    static ID = ComponentId.Rotation;

    x: number = 0.0;
    y: number = 0.0;
    z: number = 0.0;
}
