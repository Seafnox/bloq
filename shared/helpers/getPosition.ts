import { Position } from '../Position';

export function getPosition<T extends Position>(entity: T): Position {
    return {
        x: entity.x,
        y: entity.y,
        z: entity.z,
    }
}
