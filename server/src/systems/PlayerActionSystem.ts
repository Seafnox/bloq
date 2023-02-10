import { RemoveEntitiesAction } from '@block/shared/actions/RemoveEntitiesAction';
import { SetBlocksAction } from '@block/shared/actions/SetBlocksAction';
import { BlockComponent } from '@block/shared/components/blockComponent';
import { InputComponent } from '@block/shared/components/inputComponent';
import { InventoryComponent } from '@block/shared/components/inventoryComponent';
import { ActionId } from '@block/shared/constants/ActionId';
import { ComponentId } from '@block/shared/constants/ComponentId';
import { Direction } from '@block/shared/constants/Direction';
import { globalToChunk } from '@block/shared/helpers/globalToChunk';
import {System} from "@block/shared/System";
import {ServerActionManager} from "../actions/ServerActionManager";
import EntityManager from "@block/shared/EntityManager";
import { NetworkComponent } from '../components/NetworkComponent';
import { broadcastAction } from '../helpers/broadcastAction';
import {initBlockEntity} from "../initBlockEntity";
import {getValueGlobal} from "../getValueGlobal";
import BloqServer from "../BloqServer";


export default class PlayerActionSystem extends System {
    actionManager: ServerActionManager;

    constructor(entityManager: EntityManager, actionManager: ServerActionManager) {
        super(entityManager);
        this.actionManager = actionManager;
    }

    update(dt: number): any {
        this.entityManager.getEntities(ComponentId.Input).forEach((component, entity) => {
            let inputComponent = component as InputComponent;

            let modifiedBlocks: [number, number, number, number][] = [];
            if (inputComponent.isDirty('primaryAction') && inputComponent.primaryAction) {
                let target = inputComponent.target;
                modifiedBlocks.push([target[0], target[1], target[2], 0]);

                // Find what block type is currently at dug position, and init a pickable block there if not air.
                let currentKind = getValueGlobal(this.entityManager, target[0], target[1], target[2]);
                if (currentKind !== 0) initBlockEntity(this.entityManager, target[0], target[1], target[2], currentKind);
            }

            if (inputComponent.isDirty('secondaryAction') && inputComponent.secondaryAction) {
                let target = inputComponent.target;

                let add = [0, 0, 0];
                switch (inputComponent.targetSide) {
                    case Direction.Top:
                        add[1] = 1;
                        break;
                    case Direction.North:
                        add[2] = 1;
                        break;
                    case Direction.East:
                        add[0] = 1;
                        break;
                    case Direction.South:
                        add[2] = -1;
                        break;
                    case Direction.West:
                        add[0] = -1;
                        break;
                    case Direction.Bottom:
                        add[1] = -1;
                        break;
                }

                // TODO: Subtract from inventory when building.
                let inventory = this.entityManager.getComponent<InventoryComponent>(entity, ComponentId.Inventory);
                let inventoryBlockEntity = inventory.slots[inventory.activeSlot];
                let block = this.entityManager.getComponent<BlockComponent>(inventoryBlockEntity, ComponentId.Block);
                if (block) {
                    modifiedBlocks.push([target[0] + add[0], target[1] + add[1], target[2] + add[2], block.kind]);
                    block.count--;

                    let netComponent = this.entityManager.getComponent<NetworkComponent>(entity, ComponentId.Network);
                    netComponent.pushEntity(this.entityManager.serializeEntity(inventoryBlockEntity, [ComponentId.Block]));

                    if (block.count <= 0) {
                        this.entityManager.removeEntity(inventoryBlockEntity);
                        inventory.slots[inventory.activeSlot] = null;
                        netComponent.pushEntity(this.entityManager.serializeEntity(entity, [ComponentId.Inventory]));

                        let action = new RemoveEntitiesAction([inventoryBlockEntity]);
                        BloqServer.sendAction(netComponent, ActionId.RemoveEntities, action);
                        this.actionManager.queueAction(action); // Queue on server as well.
                    }
                }

            }

            // Broadcast so it's queued on clients.
            if (modifiedBlocks.length > 0) {
                let action = new SetBlocksAction(modifiedBlocks);
                let [cx, cy, cz] = inputComponent.target.map(globalToChunk);
                broadcastAction(this.entityManager, [cx, cy, cz], ActionId.SetBlocks, action);
                this.actionManager.queueAction(action); // Queue on server as well.
            }
        });
    }
}
