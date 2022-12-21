import { TerrainChunkComponent } from './components/terrainChunkComponent';
import {TERRAIN_CHUNK_SIZE} from "./constants";

export const mod = (a: number, b: number) => ((a % b) + b) % b;

export const globalToChunk = (x: number) => {
    if (x < 0) return Math.ceil((x - TERRAIN_CHUNK_SIZE + 1) / TERRAIN_CHUNK_SIZE);
    else return Math.floor(x / TERRAIN_CHUNK_SIZE);
};

export const chunkKey = (x: number, y: number, z: number) => `${x}x${y}x${z}`;

export const deserializeTerrainChunk = (data: ArrayBuffer): [string, TerrainChunkComponent] => {
    let view = new DataView(data);
    let x = view.getInt32(0);
    let y = view.getInt32(Int32Array.BYTES_PER_ELEMENT);
    let z = view.getInt32(Int32Array.BYTES_PER_ELEMENT * 2);
    let chunkData = new Uint8Array(data.slice(Int32Array.BYTES_PER_ELEMENT * 3));

    let chunkComponent = new TerrainChunkComponent(x, y, z);
    chunkComponent.data = chunkData;
    return [`${x}x${y}x${z}`, chunkComponent]
};
