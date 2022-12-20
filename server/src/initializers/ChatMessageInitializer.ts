import Initializer from "@block/shared/Initializer";
import {ComponentId} from "@block/shared/constants";


export default class ChatMessageInitializer extends Initializer {
    initialize(entity: string, components: Object): void {
        let msg = components[ComponentId.ChatMessage];
        this.entityManager.addComponentFromObject(entity, ComponentId.ChatMessage, msg);
    }
}
