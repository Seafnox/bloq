import { ComponentId } from '../constants/componentId';
import EntityManager from '../EntityManager';
import { SerializableComponent, SerializableComponentData } from './serializableComponent';

export interface InventoryComponentData extends SerializableComponentData {
    slots: string[];
    activeSlot: number;
}

export class InventoryComponent extends SerializableComponent<InventoryComponentData> implements InventoryComponentData {
    static ID = ComponentId.Inventory;

    slots: string[] = [null, null, null, null, null, null, null, null, null, null];
    activeSlot: number = 0;

    setEntity(entity: string, position?: number): number {
        // No position specified, so find first available.
        if (!position) position = this.slots.indexOf(null);
        if (position === -1) return -1; // inventory is full.

        this.slots[position] = entity;
        this.dirtyFields.add('slots'); // Force dirty because we're mutating an array.
        return position;
    }

    getEntity(slot: number): string {
        return this.slots[slot];
    }

    dispose(entityManager: EntityManager): void {
        // When inventory is deleted, remove all its contents to avoid unused junk.
        // This will probably change when players' data is saved between play sessions.
        for (let i = 0; i < this.slots.length; i++) {
            let entity = this.slots[i];
            if (entity !== null) {
                entityManager.removeEntity(entity);
            }
        }
    }
}
