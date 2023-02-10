import { AbstractAction } from '@block/shared/actions/AbstractAction';
import { PlayerComponent } from '@block/shared/components/playerComponent';
import { ActionId } from '@block/shared/constants/ActionId';
import { ComponentId, componentNames } from '@block/shared/constants/ComponentId';
import { EntityMessage } from '@block/shared/EntityMessage';
import { WebSocketServer, WebSocket, RawData } from 'ws';
import { NetworkComponent } from './components/NetworkComponent';
import { ServerComponentMap } from './entityManager/serverEntityMessage';
import World from "./World";
import {ComponentEventEmitter} from "@block/shared/EventEmitter";

export default class BloqServer {
    wss: WebSocketServer;
    world: World;
    eventEmitter = new ComponentEventEmitter<ServerComponentMap>();

    private accumulator = 0.0;
    private expectedDt = 1.0 / 30.0;

    constructor() {
        this.world = new World(this);

        this.wss = new WebSocketServer({
            host: '0.0.0.0',
            port: 8081,
            perMessageDeflate: true,
        });

        this.wss.on('connection', this.onConnect.bind(this));
        this.wss.on('listening', this.onReady.bind(this));
        this.wss.on('error', this.onError.bind(this));
        this.wss.on('close', this.onClose.bind(this));

        this.startGameTick();
    }

    startGameTick(lastTime: number = performance.now()) {
        let newTime = performance.now();
        let frameTime = newTime - lastTime;

        this.accumulator += frameTime;

        while (this.accumulator >= this.expectedDt) {
            this.tick(this.expectedDt);
            this.accumulator -= this.expectedDt;
        }

        setTimeout(() => this.startGameTick(newTime), 1);
    }

    tick(dt: number) {
        this.world.tick(dt);
    }

    static sendAction(netComponent: NetworkComponent, actionId: ActionId, action: AbstractAction) {
        const encoder = new TextEncoder();
        let actionString = action.serialize();
        let bytes = encoder.encode(actionString);

        // Give room for message type and action ID.
        const extraSpace = Uint16Array.BYTES_PER_ELEMENT;
        let packet = new ArrayBuffer(bytes.byteLength + extraSpace);
        let packetView = new DataView(packet);

        // Set header data
        packetView.setUint16(0, actionId);

        // Copy over message data.
        for (let i = 0; i < bytes.byteLength; i++) {
            packetView.setUint8(i + extraSpace, bytes[i]);
        }

        netComponent.pushAction(packet);
    }

    private onConnect(ws: WebSocket) {
        console.log('Server onConnect:', ws.constructor.name);
        let playerEntity = this.world.entityManager.createEntity('player');

        let netComponent = new NetworkComponent();
        netComponent.websocket = ws;
        this.world.entityManager.addComponent(playerEntity, netComponent);
        this.world.entityManager.addComponent(playerEntity, new PlayerComponent());
        netComponent.pushEntity(this.world.entityManager.serializeEntity(playerEntity, [ComponentId.Player]));

        ws.on('message', this.onMessage.bind(this, playerEntity));
        ws.on('close', this.onPlayerWsClose.bind(this, playerEntity));
    }

    private onReady() {
        console.log('Server ready at:', this.wss.address());
    }

    private onError(error: Error) {
        console.log('Server error:');
        console.warn(error);
    }

    private onClose() {
        console.log('Server close at:', this.wss.address());
    }

    private onMessage(playerEntity: string, buffer: RawData): void {
        if (Array.isArray(buffer)) {
            return buffer.forEach(bufferItem => this.onMessage(playerEntity, bufferItem));
        }

         if (buffer instanceof Buffer) {
             return this.onMessage(playerEntity, this.toArrayBuffer(buffer));
         }

        console.log('<-- Socket receive', playerEntity, buffer.byteLength, 'byte');
        let pos = 0;
        let view = new DataView(buffer);
        let textDecoder = new TextDecoder();

        // Each message starts with its length, followed by that many bytes of content.
        // Length is always Uint16.
        while (pos < buffer.byteLength) {
            // Read length.
            let msgLength = view.getUint16(pos);
            pos += Uint16Array.BYTES_PER_ELEMENT;

            // Get message contents and decode JSON
            let msg = new Uint8Array(buffer.slice(pos, pos + msgLength));
            pos += msgLength;
            let text = textDecoder.decode(msg);
            let entityMessage: EntityMessage<ServerComponentMap> = JSON.parse(text);
            console.log('\tMessage', text);
            const usedComponentNames = componentNames.filter((name, id) => id in entityMessage.componentMap);
            console.log('\tComponents', usedComponentNames);

            // No one should be able to send data on behalf of others.
            // Really "obj" doesn't need an "entity" property, but might need it in the future.
            // Also, keeps interface between server and client in line.
            if (entityMessage.entity != playerEntity) continue;

            // Loop over all components received in packet, and emit events for them.
            // These events are used by the initializers to be processed further.
            for (let componentId in entityMessage.componentMap) {
                this.eventEmitter.emit(parseInt(componentId) as ComponentId, playerEntity, entityMessage.componentMap);
            }
        }
    }

    private toArrayBuffer(buf: Buffer): ArrayBuffer {
        const arrayBuffer = new ArrayBuffer(buf.length);
        const view = new Uint8Array(arrayBuffer);
        for (let i = 0; i < buf.length; ++i) {
            view[i] = buf[i];
        }
        return arrayBuffer;
    }

    private onPlayerWsClose(playerEntity: string) {
        console.log('--> Socket closed', playerEntity);
        this.world.entityManager.removeEntity(playerEntity)
    }
}
