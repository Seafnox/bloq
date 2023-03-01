import { AbstractAction } from '@block/shared/actions/AbstractAction';
import { PlayerComponent } from '@block/shared/components/playerComponent';
import { ActionId } from '@block/shared/constants/ActionId';
import { ComponentId, componentNames } from '@block/shared/constants/ComponentId';
import { EntityMessage } from '@block/shared/EntityMessage';
import { createServer } from 'http';
import { parse } from 'url';
import { WebSocketServer, WebSocket, RawData } from 'ws';
import { NetworkComponent } from './components/NetworkComponent';
import { ServerComponentMap } from './entityManager/serverEntityMessage';
import World from "./World";
import {ComponentEventEmitter} from "@block/shared/EventEmitter";

export default class BloqServer {
    wssIn = new WebSocketServer({ noServer: true });
    wssOut = new WebSocketServer({ noServer: true });
    world: World;
    eventEmitter = new ComponentEventEmitter<ServerComponentMap>();

    private accumulator = 0.0;
    private expectedDt = 1.0 / 30.0;

    constructor() {
        this.world = new World(this);

        const server = createServer();

        server.on('listening', this.onReady.bind(this));
        server.on('upgrade', (request, socket, head) => {
            const { pathname } = parse(request.url);

            if (pathname === '/in') {
                this.wssIn.handleUpgrade(request, socket, head, (ws: WebSocket) => {
                    this.wssIn.emit('connection', ws, request);
                });
            } else if (pathname === '/out') {
                this.wssOut.handleUpgrade(request, socket, head, (ws: WebSocket) => {
                    this.wssOut.emit('connection', ws, request);
                });
            } else {
                socket.destroy();
            }
        });

        server.listen(8081, '0.0.0.0');

        this.wssIn.on('connection', this.onInConnect.bind(this));
        this.wssOut.on('connection', this.onOutConnect.bind(this));
        this.wssIn.on('error', this.onError.bind(this));
        this.wssOut.on('error', this.onError.bind(this));
        this.wssIn.on('close', this.onClose.bind(this));
        this.wssOut.on('close', this.onClose.bind(this));

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

    private onInConnect(ws: WebSocket) {
        console.log('Server onInConnect:', ws.constructor.name);

        ws.on('message', (buffer: RawData) => {
            if (Array.isArray(buffer)) {
                //@ts-ignore
                return buffer.forEach(bufferItem => this.onInMessage(bufferItem, ws['bloqEntity'] as string));
            }

            if (buffer instanceof Buffer) {
                buffer = this.toArrayBuffer(buffer);
            }

            const dataStr = Buffer.from(buffer).toString();
            console.log('<-- Incoming receive', dataStr);

            if (dataStr.includes('register')) {
                const message = JSON.parse(dataStr);
                //@ts-ignore
                ws['bloqEntity'] = message.register;
                return;
            }

            //@ts-ignore
            this.onInMessage(buffer, ws['bloqEntity'] as string)
        });
    }
    private onOutConnect(ws: WebSocket) {
        console.log('Server onOutConnect:', ws.constructor.name);
        let playerEntity = this.world.entityManager.createEntity('player');

        let netComponent = new NetworkComponent(playerEntity);
        netComponent.setWsOut(ws);
        this.world.entityManager.addComponent(playerEntity, netComponent);
        this.world.entityManager.addComponent(playerEntity, new PlayerComponent());
        netComponent.pushEntity(this.world.entityManager.serializeEntity(playerEntity, [ComponentId.Player]));

        ws.on('message', this.onOutMessage.bind(this, playerEntity));
    }

    private onReady() {
        console.log('Server ready');
    }

    private onError(error: Error) {
        console.log('Server error:');
        console.warn(error);
    }

    private onClose() {
        console.log('Server close');
    }

    private onOutMessage(buffer: RawData): void {
        if (Array.isArray(buffer)) {
            return buffer.forEach(bufferItem => this.onOutMessage(bufferItem));
        }

        if (buffer instanceof Buffer) {
            return this.onOutMessage(this.toArrayBuffer(buffer));
        }

        console.log('<-- Outcoming receive', Buffer.from(buffer).toString())
    }

    private onInMessage(buffer: ArrayBuffer, entity?: string): void {
        if (!entity) {
            console.log(`No entity (${entity}) receive for buffer`);
        }
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
            if (entityMessage.entity != entity) continue;

            // Loop over all components received in packet, and emit events for them.
            // These events are used by the initializers to be processed further.
            for (let componentId in entityMessage.componentMap) {
                this.eventEmitter.emit(parseInt(componentId) as ComponentId, entity, entityMessage.componentMap);
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
}
