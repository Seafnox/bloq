import { ComponentId } from '@block/shared/constants/componentId';
import { MessageType } from '@block/shared/constants/messageType';
import { deserializeTerrainChunk } from '@block/shared/helpers/deserializeTerrainChunk';
import { ClientComponentMap } from './emtityManager/clientEntityMessage';
import { bufferToObject } from './helpers/bufferToObject';
import PlayState from "./states/PlayState";
import {ComponentEventEmitter} from "@block/shared/EventEmitter";
import {EntityMessage} from "@block/shared/entityMessage";


export class Server {
    url: string;
    ws: WebSocket;
    game: PlayState;
    eventEmitter = new ComponentEventEmitter<ClientComponentMap>();

    constructor(game: PlayState, server: string, connCallback: ((this: WebSocket, ev: Event) => any)) {
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

        let buf: ArrayBuffer = evt.data;
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
                case MessageType.Entity: return this.handleEntityMessage(msgData);
                case MessageType.Terrain: return this.handleTerrainMessage(msgData);
                case MessageType.Action: return this.handleActionMessage(msgData);
                default:
                    console.warn('Unknown message type: ', msgType, msgData.byteLength)
            }
        }
    }

    private handleEntityMessage(message: ArrayBuffer): void {
        const entityMessage = bufferToObject<EntityMessage<ClientComponentMap>>(message);

        Object.keys(entityMessage.componentMap).forEach(componentId => {
            let key = parseInt(componentId);
            this.eventEmitter.emit(key as ComponentId, entityMessage.entity, entityMessage.componentMap);
        });
    }

    private handleTerrainMessage(message: ArrayBuffer): void {
        let [entity, component] = deserializeTerrainChunk(message);

        let componentsObj: Partial<ClientComponentMap> = {};
        componentsObj[ComponentId.TerrainChunk] = component;
        this.eventEmitter.emit(ComponentId.TerrainChunk, entity, componentsObj);
    }

    private handleActionMessage(message: ArrayBuffer): void {
        let actionId = new DataView(message).getUint16(0);
        let data = message.slice(Uint16Array.BYTES_PER_ELEMENT);

        const obj = bufferToObject(data);

        // Queue action directly. No "event" to be emitted.
        this.game.world.actionManager.queueRawAction(actionId, obj);
    }

    private onError(evt: MessageEvent) {
        console.log('error');
    }
}
