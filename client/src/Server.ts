import { ComponentId } from '@block/shared/constants/ComponentId';
import { MessageType } from '@block/shared/constants/MessageType';
import { EntityMessage, ComponentMap } from '@block/shared/EntityMessage';
import { ComponentEventEmitter } from '@block/shared/EventEmitter';
import { deserializeTerrainChunk } from '@block/shared/helpers/deserializeTerrainChunk';
import PlayState from "./states/PlayState";
import {bufferToObject} from "./helpers";


export class Server {
    url: string;
    ws: WebSocket;
    game: PlayState;
    eventEmitter: ComponentEventEmitter<ComponentMap> = new ComponentEventEmitter();

    constructor(game: PlayState, server: string, connCallback: (this: WebSocket, ev: Event) => any) {
        this.game = game;

        this.url = `ws://${server}`;

        this.ws = new WebSocket(this.url);
        this.ws.binaryType = 'arraybuffer';
        this.ws.onopen = connCallback;
        this.ws.onclose = this.onClose.bind(this);
        this.ws.onmessage = this.onMessage.bind(this);
        this.ws.onerror = this.onError.bind(this);
    }

    close() {
        this.ws.close();
    }

    private onClose(evt: MessageEvent) {
        console.log('close');
    }

    private onMessage(evt: MessageEvent) {
        if (!(evt.data instanceof ArrayBuffer)) {
            console.error('Not array buffer!', evt.data);
        }

        let buf = evt.data;
        let bufView = new DataView(buf);
        let bufPos = 0;

        while (bufPos < buf.byteLength) {
            let msgLength = bufView.getUint16(bufPos);
            bufPos += Uint16Array.BYTES_PER_ELEMENT;

            let msgType = bufView.getUint16(bufPos);
            bufPos += Uint16Array.BYTES_PER_ELEMENT;

            let msgData = buf.slice(bufPos, bufPos + msgLength);
            bufPos += msgLength;

            switch (msgType) {
                case MessageType.Entity:
                    const entityMessage = bufferToObject(msgData) as EntityMessage;

                    Object.keys(entityMessage.componentMap).forEach(componentId => {
                        let key = parseInt(componentId);
                        this.eventEmitter.emit(key as ComponentId, entityMessage.entity, entityMessage.componentMap);
                    });
                    break;

                case MessageType.Terrain:
                    let [entity, component] = deserializeTerrainChunk(msgData);

                    let componentsObj = {};
                    componentsObj[ComponentId.TerrainChunk] = component;
                    this.eventEmitter.emit(ComponentId.TerrainChunk, entity, componentsObj);
                    break;

                case MessageType.Action:
                    let actionId = new DataView(msgData).getUint16(0);
                    let data = msgData.slice(Uint16Array.BYTES_PER_ELEMENT);

                    // Queue action directly. No "event" to be emitted.
                    this.game.world.actionManager.queueRawAction(actionId, bufferToObject(data));
                    break;

                default:
                    console.warn('Unknown message type: ', msgType, msgData.byteLength)
            }
        }
    }

    private onError(evt: MessageEvent) {
        console.log('error');
    }
}
