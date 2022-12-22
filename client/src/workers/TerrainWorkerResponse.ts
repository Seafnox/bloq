export interface TerrainWorkerResponse extends MessageEvent {
    data: {
        entity: string;
        materials: Float32Array;
        vertices: Float32Array;
        shadows: Float32Array;
    };
}
