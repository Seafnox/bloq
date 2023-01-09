import { AbstractComponent, AbstractComponentData } from '@block/shared/components/abstractComponent';
import { ComponentId } from '@block/shared/constants/componentId';
import { MessageType } from '@block/shared/constants/messageType';
import { terrainChunkSize } from '@block/shared/constants/interaction.constants';
import { isString } from '@block/shared/helpers/isString';
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

    pushBuffer(msgType: MessageType, data: ArrayBuffer | string) {
        let bufferData: ArrayBuffer;
        if (isString(data)) {
            let encoder = new TextEncoder();
            bufferData = encoder.encode(data).buffer;
        } else {
            bufferData = data;
        }

        if (this.bufferPos + bufferData.byteLength + 2 * Uint16Array.BYTES_PER_ELEMENT > this.buffer.byteLength) {
            console.error('Buffer is too small!');
            return;
        }

        let view = new DataView(this.buffer);

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

    pushEntity(data: string) {
        this.pushBuffer(MessageType.Entity, data);
    }

    pushTerrainChunk(data: ArrayBuffer) {
        this.pushBuffer(MessageType.Terrain, data);
    }
}
