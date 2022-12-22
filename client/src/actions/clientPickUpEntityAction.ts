import { PickUpEntityAction } from '@block/shared/actions/pickUpEntityAction';
import { BlockComponent } from '@block/shared/components/blockComponent';
import { InventoryComponent } from '@block/shared/components/inventoryComponent';
import { ComponentId } from '@block/shared/constants/componentId';
import EntityManager from '@block/shared/EntityManager';

export class ClientPickUpEntityAction extends PickUpEntityAction {
    constructor(playerEntity: string, inventorySlot: number, pickableEntity: string) {
        super(playerEntity, inventorySlot, pickableEntity);
    }

    execute(entityManager: EntityManager) {
        let inventoryComponent = entityManager.getComponent<InventoryComponent>(this.player, ComponentId.Inventory);
        if (!inventoryComponent) return; // TODO: Might not even broadcast this event. Only send to one player.

        let existingEntity = inventoryComponent.getEntity(this.inventorySlot);
        if (existingEntity) {
            let pickableBlock = entityManager.getComponent<BlockComponent>(this.pickable, ComponentId.Block);
            let existingBlock = entityManager.getComponent<BlockComponent>(existingEntity, ComponentId.Block);
            if (existingBlock && pickableBlock && existingBlock.kind === pickableBlock.kind) {
                existingBlock.count++;
            }
        } else {
            inventoryComponent.setEntity(this.pickable, this.inventorySlot);
            entityManager.removeComponentType(this.pickable, ComponentId.Mesh);
        }
    }
}
