import Initializer from "@block/shared/Initializer";
import {ComponentId} from "@block/shared/constants";
import {InventoryComponent} from "@block/shared/components";


export default class InventoryInitializer extends Initializer {
    initialize(entity: string, components: any[]): void {
        let inventoryData = components[ComponentId.Inventory];
        let inventory = this.entityManager.getComponent<InventoryComponent>(entity, ComponentId.Inventory);

        // Should only trust activeSlot, so the player can't add arbitrary entities to their inventory, and have
        // server accept it.
        inventory.activeSlot = inventoryData.activeSlot;
    }
}
