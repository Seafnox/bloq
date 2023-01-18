import { ComponentId } from '../constants/componentId';
import { SerializableComponent, SerializableComponentData } from './serializableComponent';

export interface PhysicsComponentData extends SerializableComponentData {
    velX: number;
    velY: number;
    velZ: number;
}

export class PhysicsComponent extends SerializableComponent<PhysicsComponentData> implements PhysicsComponentData {
    static ID = ComponentId.Physics;

    velX: number = 0;
    velY: number = 0;
    velZ: number = 0;

    isMovingHorizontally() {
        return Math.abs(this.velX) > 0.01 || Math.abs(this.velZ) > 0.01;
    }
}
