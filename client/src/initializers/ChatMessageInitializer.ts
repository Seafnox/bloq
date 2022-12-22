import { ChatMaxLength, ChatLogSize } from '@block/shared/constants/chat';
import { ComponentId } from '@block/shared/constants/componentId';
import Initializer from "@block/shared/Initializer";
import EntityManager from "@block/shared/EntityManager";
import { ComponentMap } from '@block/shared/entityMessage';
import { ClientComponentMap } from '../emtityManager/clientEntityMessage';


// ChatMessageInitializer doesn't initialize entity in EntityManager, but uses entity data to update DOM.
// We never need to reference this entity again, so therefore we can ignore it.
export default class ChatMessageInitializer extends Initializer<ClientComponentMap> {
    constructor(em: EntityManager) {
        super(em);
    }

    initialize(entity: string, componentMap: ComponentMap) {
        let msgData = componentMap[ComponentId.ChatMessage];

        let playerNameEl = document.createElement('strong');
        let playerName = msgData['from'];
        if (playerName.length > 14) playerName = `${playerName.substr(0, 11)}...`;
        playerNameEl.innerText = playerName;

        let msgTextEl = document.createElement('span');
        msgTextEl.innerText = msgData['text'].substr(0, ChatMaxLength);

        let msgEl = document.createElement('li');
        msgEl.appendChild(playerNameEl);
        msgEl.appendChild(msgTextEl);

        let messageLog = document.querySelector('#chat-log') as HTMLUListElement;
        if(messageLog.children.length > ChatLogSize) {
            messageLog.removeChild(messageLog.children[ChatLogSize]);
        }

        let firstChild = messageLog.children[0];
        if (firstChild) {
            messageLog.insertBefore(msgEl, firstChild);
        } else {
            messageLog.appendChild(msgEl);
        }
    }
}
