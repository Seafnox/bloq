import { ComponentId } from '../constants/ComponentId';
import { SerializableComponent, SerializableComponentData } from './serializableComponent';

export interface WallCollisionComponentData extends SerializableComponentData {
    px: boolean;
    pz: boolean;
    nx: boolean;
    nz: boolean;
}

// TODO: Use setters or something for these values, and use on server as well.
export class WallCollisionComponent extends SerializableComponent<WallCollisionComponentData> implements WallCollisionComponentData {
    static ID = ComponentId.WallCollision;

    px: boolean = false;
    pz: boolean = false;
    nx: boolean = false;
    nz: boolean = false;

    isColliding() {
        return this.px || this.pz || this.nx || this.nz;
    }
}
