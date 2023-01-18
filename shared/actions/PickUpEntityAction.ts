import { AbstractAction } from './AbstractAction';

export class PickUpEntityAction extends AbstractAction {
    player: string; // entity
    inventorySlot: number; // inventory slot to place entity in.
    pickable: string; // entity

    constructor(playerEntity: string, inventorySlot: number, pickableEntity: string) {
        super();
        this.player = playerEntity;
        this.inventorySlot = inventorySlot;
        this.pickable = pickableEntity;
    }
}
