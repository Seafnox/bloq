import { ActionManager } from '@block/shared/actions/ActionManager';
import { MoveEntityAction } from '@block/shared/actions/MoveEntityAction';
import { RemoveEntitiesAction } from '@block/shared/actions/RemoveEntitiesAction';
import { SetBlocksAction } from '@block/shared/actions/SetBlocksAction';
import { UnsubscribeTerrainChunksAction } from '@block/shared/actions/UnsubscribeTerrainChunksAction';
import { PickUpEntityAction } from '@block/shared/actions/PickUpEntityAction';
import { BlockComponent } from '@block/shared/components/blockComponent';
import { InventoryComponent } from '@block/shared/components/inventoryComponent';
import { ActionId } from '@block/shared/constants/ActionId';
import { ComponentId } from '@block/shared/constants/ComponentId';
import EntityManager from '@block/shared/EntityManager';


export class ClientActionManager extends ActionManager {
    queueRawAction(id: number, data: Object) {
        switch (id) {
            case ActionId.UnsubscribeTerrainChunks:
                this.queue.push(new UnsubscribeTerrainChunksAction(data['chunkKeys']));
                break;
            case ActionId.SetBlocks:
                let blocks = data['blocks'].map(block => [block[0], block[1], block[2], block[3]]);
                this.queue.push(new SetBlocksAction(blocks));
                break;
            case ActionId.RemoveEntities:
                this.queue.push(new RemoveEntitiesAction(data['entities']));
                break;
            case ActionId.MoveEntity:
                this.queue.push(new MoveEntityAction(data['entity'], data['position'].map(num => parseFloat(num))));
                break;
            case ActionId.PickUpEntity:
                this.queue.push(new ClientPickUpEntityAction(data['player'], data['inventorySlot'], data['pickable']));
                break;
            default:
                console.warn('Unknown action ID: ', id);
                return;
        }
    }
}

class ClientPickUpEntityAction extends PickUpEntityAction {
    constructor(playerEntity: string, inventorySlot: number, pickableEntity: string) {
        super(playerEntity, inventorySlot, pickableEntity);
    }

    execute(entityManager: EntityManager) {
        let inventoryComponent = entityManager.getComponent<InventoryComponent>(this.player, ComponentId.Inventory);
        if(!inventoryComponent) return; // TODO: Might not even broadcast this event. Only send to one player.

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
