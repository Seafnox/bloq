import { ActionManager } from '@block/shared/actions/ActionManager';
import { MoveEntityAction } from '@block/shared/actions/moveEntityAction';
import { RemoveEntitiesAction } from '@block/shared/actions/removeEntitiesAction';
import { SetBlocksAction } from '@block/shared/actions/setBlocksAction';
import { UnsubscribeTerrainChunksAction } from '@block/shared/actions/unsubscribeTerrainChunksAction';
import { ActionId } from '@block/shared/constants/actionId';
import { ClientPickUpEntityAction } from './clientPickUpEntityAction';

export class ClientActionManager extends ActionManager {
    queueRawAction(id: ActionId, data: Object) {
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
