import { InventoryComponent } from '@block/shared/components/inventoryComponent';
import { ComponentId } from '@block/shared/constants/componentId';
import Initializer from "@block/shared/Initializer";
import { ServerComponentMap } from '../entityManager/serverEntityMessage';


export default class InventoryInitializer extends Initializer<ServerComponentMap> {
    initialize(entity: string, componentMap: ServerComponentMap): void {
        let inventoryData = componentMap[ComponentId.Inventory];
        let inventory = this.entityManager.getComponent<InventoryComponent>(entity, ComponentId.Inventory);

        // Should only trust activeSlot, so the player can't add arbitrary entities to their inventory, and have
        // server accept it.
        inventory.activeSlot = inventoryData.activeSlot;
    }
}
