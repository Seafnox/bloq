import { InputComponent } from '@block/shared/components/inputComponent';
import { InventoryComponent } from '@block/shared/components/inventoryComponent';
import { RotationComponent } from '@block/shared/components/rotationComponent';
import { ComponentId } from '@block/shared/constants/ComponentId';
import { positionSyncTime } from '@block/shared/constants/interaction.constants';
import EntityManager from '@block/shared/EntityManager';
import { System } from '@block/shared/System';
import NetworkSystem from "./NetworkSystem";


export default class PlayerInputSyncSystem extends System {
    private netSystem: NetworkSystem;
    private timeSincePositionSync: number = 0.0;

    constructor(em: EntityManager, netSystem: NetworkSystem) {
        super(em);
        this.netSystem = netSystem;
    }

    update(dt: number) {
        this.entityManager.getEntities(ComponentId.CurrentPlayer).forEach((component, entity) => {
            let positionSync = false;
            let input = this.entityManager.getComponent<InputComponent>(entity, ComponentId.Input);

            if (input.isDirty()) {
                this.netSystem.pushBuffer(this.entityManager.serializeEntity(entity, [
                    ComponentId.Position,
                    ComponentId.Input
                ]));
                positionSync = true;
            }

            let rot = this.entityManager.getComponent<RotationComponent>(entity, ComponentId.Rotation);
            if (rot.isDirty()) {
                this.netSystem.pushBuffer(this.entityManager.serializeEntity(entity, [
                    ComponentId.Rotation
                ]))
            }

            let inventory = this.entityManager.getComponent<InventoryComponent>(entity, ComponentId.Inventory);
            if (inventory.isDirty()) {
                this.netSystem.pushBuffer(this.entityManager.serializeEntity(entity, [
                    ComponentId.Inventory
                ]))
            }

            if(!positionSync) {
                if(this.timeSincePositionSync > positionSyncTime) {
                    this.netSystem.pushBuffer(this.entityManager.serializeEntity(entity, [
                        ComponentId.Position
                    ]));
                    this.timeSincePositionSync = 0;
                }
                this.timeSincePositionSync += dt;
            }
        });


    }
}
