import { ComponentId, Side } from '@block/shared/constants';
import { MeshComponent, MeshComponentData } from './meshComponent';

export interface PlayerSelectionComponentData extends MeshComponentData {
    target: [number, number, number];
    targetSide: Side;
    targetValid: boolean;
}

export class PlayerSelectionComponent extends MeshComponent<PlayerSelectionComponentData> {
    static ID = ComponentId.PlayerSelection;

    target: [number, number, number] = [0, 0, 0];
    targetSide: Side;
    targetValid: boolean = false;
}