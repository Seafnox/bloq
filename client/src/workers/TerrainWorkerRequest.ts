export interface TerrainWorkerRequest extends MessageEvent {
    data: {
        entity: string;
        data: Uint8Array;
        neighborData: Uint8Array[][][];
    };
}
