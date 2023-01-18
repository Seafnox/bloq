import { ComponentId } from '@block/shared/constants/ComponentId';
import Initializer from "@block/shared/Initializer";
import { ServerComponentMap } from '../entityManager/serverEntityMessage';


export default class ChatMessageInitializer extends Initializer<ServerComponentMap> {
    initialize(entity: string, componentMap: ServerComponentMap): void {
        let msg = componentMap[ComponentId.ChatMessage];
        this.entityManager.addComponentFromData(entity, ComponentId.ChatMessage, msg);
    }
}
