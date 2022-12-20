import Initializer from "@block/shared/Initializer";
import {ComponentId} from "@block/shared/constants";
import {RotationComponent} from "@block/shared/components";


export default class RotationInitializer extends Initializer {
    initialize(entity: string, components: any[]): void {
        let rot = components[ComponentId.Rotation];
        let existingRot = this.entityManager.getComponent<RotationComponent>(entity, ComponentId.Rotation);
        existingRot.update(rot);
    }
}
