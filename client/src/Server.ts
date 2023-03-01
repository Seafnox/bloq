import { ComponentId, componentNames } from '@block/shared/constants/ComponentId';
import { MessageType } from '@block/shared/constants/MessageType';
import { EntityMessage, ComponentMap } from '@block/shared/EntityMessage';
import { ComponentEventEmitter } from '@block/shared/EventEmitter';
import { deserializeTerrainChunk } from '@block/shared/helpers/deserializeTerrainChunk';
import PlayState from "./states/PlayState";
import {bufferToObject} from "./helpers";


export class Server {
    url: string;
    wsIn: WebSocket;
    wsOut: WebSocket;
    isRegistered = false;
    game: PlayState;
    eventEmitter: ComponentEventEmitter<ComponentMap> = new ComponentEventEmitter();

    constructor(game: PlayState, server: string, connCallback: (this: WebSocket, ev: Event) => any) {
        this.game = game;

        this.url = `ws://${server}`;

        this.wsOut = new WebSocket(`${this.url}/in`);
        this.wsOut.binaryType = 'arraybuffer';
        this.wsOut.onopen = connCallback;
        this.wsOut.onclose = this.onClose.bind(this);
        this.wsOut.onmessage = this.onOutMessage.bind(this);
        this.wsOut.onerror = this.onError.bind(this);

        this.wsIn = new WebSocket(`${this.url}/out`);
        this.wsIn.binaryType = 'arraybuffer';
        this.wsIn.onopen = connCallback;
        this.wsIn.onclose = this.onClose.bind(this);
        this.wsIn.onmessage = this.onInMessage.bind(this);
        this.wsIn.onerror = this.onError.bind(this);
    }

    close() {
        this.wsIn.close();
        this.wsOut.close();
    }

    send(message: ArrayBuffer) {
        const currentTime = Date.now();
        let decoder = new TextDecoder();
        console.log('--> Socket send', currentTime, decoder.decode(message));
        this.wsOut.send(message);
    }

    private onClose(evt: MessageEvent) {
        console.log('Socket close', evt);
    }

    private onOutMessage(evt: MessageEvent) {
        console.log('Out-coming receive');
        let decoder = new TextDecoder();
        console.log(decoder.decode(evt.data));
    }
    private onInMessage(evt: MessageEvent) {
        console.log('Incoming receive');
        if (!(evt.data instanceof ArrayBuffer)) {
            console.error('Not array buffer!', evt.data);
        }
        let decoder = new TextDecoder();
        console.log(decoder.decode(evt.data));

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
                    const usedComponentNames = componentNames.filter((name, id) => id in entityMessage.componentMap);
                    console.log('\tEntity', msgLength, entityMessage.entity, entityMessage.componentMap);
                    console.log('\tComponents', usedComponentNames);

                    Object.keys(entityMessage.componentMap).forEach(componentId => {
                        let key = parseInt(componentId);
                        if (!this.isRegistered && key === ComponentId.Player) {
                            let encoder = new TextEncoder();
                            console.log(decoder.decode(evt.data));
                            this.send(encoder.encode(JSON.stringify({register: entityMessage.entity})));
                            this.isRegistered = true;
                        }
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

    private onError(evt: MessageEvent) {
        console.log('Socket error', evt);
    }
}
