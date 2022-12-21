import { InputComponent } from '@block/shared/components/inputComponent';
import Initializer from "@block/shared/Initializer";
import {ComponentId} from "@block/shared/constants";
import { ComponentMap } from '@block/shared/interfaces';

export default class PlayerInputInitializer extends Initializer {
    initialize(entity: string, componentMap: ComponentMap): void {
        let input = componentMap[ComponentId.Input];
        let existingInput = this.entityManager.getComponent<InputComponent>(entity, ComponentId.Input);
        existingInput.update(input);
    }
}
