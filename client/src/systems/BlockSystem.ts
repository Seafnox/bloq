import { RotationComponent } from '@block/shared/components/rotationComponent';
import { ComponentId } from '@block/shared/constants/componentId';
import {System} from "@block/shared/System";


export default class BlockSystem extends System {
    time: number = 0;

    update(dt: number) {
        this.entityManager.getEntities(ComponentId.Block).forEach((component, entity) => {
            let rotComponent = this.entityManager.getComponent<RotationComponent>(entity, ComponentId.Rotation);
            rotComponent.x += dt / 2.0;
            rotComponent.y += dt;
        });
        this.time += dt;
    }
}
