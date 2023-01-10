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
        console.log('close', evt);
    }

    private onMessage(evt: MessageEvent) {
        if (!(evt.data instanceof ArrayBuffer)) {
            console.error('Not array buffer!', evt.data);
        }

        console.log('receive', evt.data);

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
                case MessageType.Entity:
                    console.log('parsed', 'Entity', msgLength, msgType, msgData);
                    console.log('left', buf);
                    return this.handleEntityMessage(msgData);
                case MessageType.Terrain:
                    console.log('parsed', 'Terrain', msgLength, msgType, msgData);
                    console.log('left', buf);
                    return this.handleTerrainChunkMessage(msgData);
                case MessageType.Action:
                    console.log('parsed', 'Action', msgLength, msgType, msgData);
                    console.log('left', buf);
                    return this.handleActionMessage(msgData);
                default:
                    console.warn('Unknown message type: ', msgType, msgData.byteLength)
            }
        }
    }

    private handleEntityMessage(message: ArrayBuffer): void {
        const entityMessage = bufferToObject<EntityMessage<ClientComponentMap>>(message);
        console.log('handleEntityMessage', entityMessage);
        console.log('ComponentIds', Object.keys(entityMessage.componentMap).map(key => [key, ComponentId[key as any]].join(' - ')));

        Object.keys(entityMessage.componentMap)
            .forEach(componentId => this.eventEmitter.emit(+componentId as ComponentId, entityMessage.entity, entityMessage.componentMap));
    }

    private handleTerrainChunkMessage(message: ArrayBuffer): void {
        let [entity, component] = deserializeTerrainChunk(message);
        console.log('handleTerrainChunkMessage', entity, component);

        const componentsObj: Partial<ClientComponentMap> = {
            [ComponentId.TerrainChunk]: component,
        };
        this.eventEmitter.emit(ComponentId.TerrainChunk, entity, componentsObj);
    }

    private handleActionMessage(message: ArrayBuffer): void {
        let actionId = new DataView(message).getUint16(0);
        let actionBuffer = message.slice(Uint16Array.BYTES_PER_ELEMENT);

        const actionData = bufferToObject(actionBuffer);
        console.log('handleActionMessage', actionId, actionData);

        // Queue action directly. No "event" to be emitted.
        this.game.world.actionManager.queueRawAction(actionId, actionData);
    }

    private onError(evt: MessageEvent) {
        console.log('error', evt);
    }
}
