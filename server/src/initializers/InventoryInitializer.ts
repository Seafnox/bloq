import { InventoryComponent } from '@block/shared/components/inventoryComponent';
import Initializer from "@block/shared/Initializer";
import {ComponentId} from "@block/shared/constants";
import { ComponentMap } from '@block/shared/interfaces';


export default class InventoryInitializer extends Initializer {
    initialize(entity: string, componentMap: ComponentMap): void {
        let inventoryData = componentMap[ComponentId.Inventory];
        let inventory = this.entityManager.getComponent<InventoryComponent>(entity, ComponentId.Inventory);

        // Should only trust activeSlot, so the player can't add arbitrary entities to their inventory, and have
        // server accept it.
        inventory.activeSlot = inventoryData.activeSlot;
    }
}
