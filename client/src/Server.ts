import { ComponentId, componentNames } from '@block/shared/constants/ComponentId';
import { MessageType } from '@block/shared/constants/MessageType';
import { EntityMessage, ComponentMap } from '@block/shared/EntityMessage';
import { ComponentEventEmitter } from '@block/shared/EventEmitter';
import { deserializeTerrainChunk } from '@block/shared/helpers/deserializeTerrainChunk';
import PlayState from "./states/PlayState";
import {bufferToObject} from "./helpers";
import { Socket, io } from "socket.io-client";

export class Server {
    url: string;
    ws: Socket;
    game: PlayState;
    eventEmitter: ComponentEventEmitter<ComponentMap> = new ComponentEventEmitter();

    constructor(game: PlayState, server: string, connCallback: () => any) {
        this.game = game;

        this.url = `ws://${server}`;

        this.ws = io(this.url);
//        this.ws.binaryType = 'arraybuffer';
        this.ws.on('connect', connCallback);
//        this.ws.onopen = connCallback;
        this.ws.on('close', this.onClose.bind(this));
        this.ws.on('disconnect', this.onClose.bind(this));
//        this.ws.onclose = this.onClose.bind(this);
        this.ws.on('message', this.onMessage.bind(this));
//        this.ws.onmessage = this.onMessage.bind(this);
        this.ws.on('connect_error', this.onError.bind(this));
//        this.ws.onerror = this.onError.bind(this);
    }

    close() {
        this.ws.close();
    }

    private onClose(evt: unknown) {
        console.log('Socket close', evt);
    }

    private onMessage(eventData: ArrayBuffer) {
        console.log('Socket receive');
        if (!(eventData instanceof ArrayBuffer)) {
            console.error('Not array buffer!', eventData);
        }

        let buf = eventData;
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
                    const usedComponentNames = componentNames.filter((name, id) => id in entityMessage.componentMap);
                    console.log('\tEntity', msgLength, entityMessage.entity, entityMessage.componentMap);
                    console.log('\tComponents', usedComponentNames);

                    Object.keys(entityMessage.componentMap).forEach(componentId => {
                        let key = parseInt(componentId);
                        this.eventEmitter.emit(key as ComponentId, entityMessage.entity, entityMessage.componentMap);
                    });
                    break;

                case MessageType.Terrain:
                    const [entity, component] = deserializeTerrainChunk(msgData);
                    const {x,y,z} = component;
                    console.log('\tTerrain', msgLength, entity, {x,y,z});
                    console.log('\tComponents', ComponentId[ComponentId.TerrainChunk]);

                    let componentsObj = {};
                    componentsObj[ComponentId.TerrainChunk] = component;
                    this.eventEmitter.emit(ComponentId.TerrainChunk, entity, componentsObj);
                    break;

                case MessageType.Action:
                    let actionId = new DataView(msgData).getUint16(0);
                    let data = msgData.slice(Uint16Array.BYTES_PER_ELEMENT);
                    const actionData = bufferToObject(data);
                    console.log('\tAction', msgLength, actionId, actionData);


                    // Queue action directly. No "event" to be emitted.
                    this.game.world.actionManager.queueRawAction(actionId, actionData);
                    break;

                default:
                    console.warn('Unknown message type: ', msgType, msgData.byteLength)
            }
        }
    }

    private onError(evt: unknown) {
        console.log('Socket error', evt);
    }
}
