import Initializer from "@block/shared/Initializer";
import {ComponentId} from "@block/shared/constants";
import {InputComponent} from "@block/shared/components";


export default class PlayerInputInitializer extends Initializer {
    initialize(entity: string, components: any[]): void {
        let input = components[ComponentId.Input];
        let existingInput = this.entityManager.getComponent<InputComponent>(entity, ComponentId.Input);
        existingInput.update(input);
    }
}
