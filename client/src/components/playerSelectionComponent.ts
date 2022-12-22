import { ComponentId } from '@block/shared/constants/componentId';
import { Direction } from '@block/shared/constants/direction';
import { MeshComponent, MeshComponentData } from './meshComponent';

export interface PlayerSelectionComponentData extends MeshComponentData {
    target: [number, number, number];
    targetSide: Direction;
    targetValid: boolean;
}

export class PlayerSelectionComponent extends MeshComponent<PlayerSelectionComponentData> {
    static ID = ComponentId.PlayerSelection;

    target: [number, number, number] = [0, 0, 0];
    targetSide: Direction;
    targetValid: boolean = false;
}
