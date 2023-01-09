import { InputComponent } from '@block/shared/components/inputComponent';
import { RotationComponent } from '@block/shared/components/rotationComponent';
import { ComponentId } from '@block/shared/constants/componentId';
import {System} from "@block/shared/System";
import { NetworkComponent } from '../components/networkComponent';


export default class BroadcastPlayerInputSystem extends System {
    update(dt: number) {
        let changedInputs = new Map();
        this.entityManager.getEntities(ComponentId.Input).forEach((component, entity) => {
            let inputComponent = component as InputComponent;
            if (inputComponent.isDirty()) {
                changedInputs.set(entity, this.entityManager.serializeEntity(entity, [ComponentId.Input, ComponentId.Position]));
            }
        });

        let changedRots = new Map();
        this.entityManager.getEntities(ComponentId.Rotation).forEach((component, entity) => {
            let rot = component as RotationComponent;
            if (rot.isDirty()) {
                changedRots.set(entity, this.entityManager.serializeEntity(entity, [ComponentId.Rotation]));
            }
        });

        if (changedInputs.size > 0) {
            this.entityManager.getEntities(ComponentId.Network).forEach((component, entity) => {
                let netComponent = component as NetworkComponent;
                changedInputs.forEach((serializedComponents, changedEntity) => {
                    if (changedEntity === entity) return;
                    netComponent.pushEntity(serializedComponents);
                });
            })
        }

        if (changedRots.size > 0) {
            this.entityManager.getEntities(ComponentId.Network).forEach((component, entity) => {
                let netComponent = component as NetworkComponent;
                changedRots.forEach((serializedRot, changedEntity) => {
                    if (changedEntity === entity) return;
                    netComponent.pushEntity(serializedRot);
                })
            })
        }
    }
}
