import Initializer from "@block/shared/Initializer";
import {ComponentId} from "@block/shared/constants";
import { ComponentMap } from '@block/shared/interfaces';


export default class ChatMessageInitializer extends Initializer {
    initialize(entity: string, componentMap: ComponentMap): void {
        let msg = componentMap[ComponentId.ChatMessage];
        this.entityManager.addComponentFromObject(entity, ComponentId.ChatMessage, msg);
    }
}
