import { AbstractComponent, AbstractComponentData } from '@block/shared/components/abstractComponent';
import { ComponentId } from '@block/shared/constants/componentId';
import { MessageType } from '@block/shared/constants/messageType';
import { terrainChunkSize } from '@block/shared/constants/interaction.constants';
import { WebSocket } from 'ws';

export interface NetworkComponentData extends AbstractComponentData {
    websocket: WebSocket;
    bufferPos: number;
    buffer: ArrayBuffer;
}
export class NetworkComponent extends AbstractComponent<NetworkComponentData> {
    static ID = ComponentId.Network;

    websocket: WebSocket;
    bufferPos: number = 0;
    buffer: ArrayBuffer = new ArrayBuffer(Math.pow(terrainChunkSize, 3) * 3);

    bytesLeft(): number {
        return this.buffer.byteLength - this.bufferPos;
    }

    isClosed(): boolean {
        return this.websocket.readyState == WebSocket.CLOSED;
    }

    flush() {
        // Nothing in buffer to send
        if(this.bufferPos === 0) return;

        const buffer = this.buffer.slice(0, this.bufferPos);
        console.log('Socket send', buffer.byteLength,  buffer);
        console.log('Socket', Object.keys(this.websocket));
        this.websocket.send(buffer, error => error && console.log('Socket falure', error.message));
        this.bufferPos = 0;
    }

    pushEntity(data: string) {
        this.pushBuffer(MessageType.Entity, this.encodeString(data));
    }

    pushTerrainChunk(data: ArrayBuffer) {
        this.pushBuffer(MessageType.Terrain, data);
    }

    pushAction(data: ArrayBuffer) {
        this.pushBuffer(MessageType.Action, data);
    }

    private pushBuffer(msgType: MessageType, bufferData: ArrayBuffer) {
        if (this.bufferPos + bufferData.byteLength + 2 * Uint16Array.BYTES_PER_ELEMENT > this.buffer.byteLength) {
            console.error('Buffer is too small!');
            return;
        }

        const view = new DataView(this.buffer);

        // Insert length
        view.setUint16(this.bufferPos, bufferData.byteLength);
        this.bufferPos += Uint16Array.BYTES_PER_ELEMENT;

        // Message type
        view.setUint16(this.bufferPos, msgType);
        this.bufferPos += Uint16Array.BYTES_PER_ELEMENT;

        // Copy data
        let bufferArray = new Uint8Array(bufferData);
        for (let i = 0; i < bufferData.byteLength; i++) {
            view.setUint8(this.bufferPos++, bufferArray[i]);
        }
    }

    private encodeString(data: string): ArrayBuffer {
        const encoder = new TextEncoder();
        return encoder.encode(data).buffer;
    }
}
