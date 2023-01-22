import { RotationComponent } from '@block/shared/components/rotationComponent';
import { ComponentId } from '@block/shared/constants/ComponentId';
import { System } from '@block/shared/System';

export default class BlockSystem extends System {

    update(dt: number) {
        this.entityManager.getEntities(ComponentId.Block).forEach((component, entity) => {
            let rotComponent = this.entityManager.getComponent<RotationComponent>(entity, ComponentId.Rotation);
            rotComponent.x += dt / 2.0 % 360;
            rotComponent.y += dt % 360;
        });
    }
}
