import { InputComponent } from '@block/shared/components/inputComponent';
import Initializer from "@block/shared/Initializer";
import {ComponentId} from "@block/shared/constants";
import { ServerComponentMap } from '../entityManager/serverEntityMessage';

export default class PlayerInputInitializer extends Initializer<ServerComponentMap> {
    initialize(entity: string, componentMap: ServerComponentMap): void {
        let input = componentMap[ComponentId.Input];
        let existingInput = this.entityManager.getComponent<InputComponent>(entity, ComponentId.Input);
        existingInput.update(input);
    }
}
