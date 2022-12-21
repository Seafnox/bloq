import { RotationComponent } from '@block/shared/components/rotationComponent';
import Initializer from "@block/shared/Initializer";
import {ComponentId} from "@block/shared/constants";
import { ComponentMap } from '@block/shared/interfaces';

export default class RotationInitializer extends Initializer {
    initialize(entity: string, componentMap: ComponentMap): void {
        let rot = componentMap[ComponentId.Rotation];
        let existingRot = this.entityManager.getComponent<RotationComponent>(entity, ComponentId.Rotation);
        existingRot.update(rot);
    }
}
