import { ComponentId, TERRAIN_CHUNK_SIZE } from '../constants';
import { AbstractComponent, AbstractComponentData } from './abstractComponent';

export interface TerrainChunkComponentData extends AbstractComponentData {
    x: number;
    y: number;
    z: number;
    data: Uint8Array;
}

export class TerrainChunkComponent extends AbstractComponent<TerrainChunkComponentData> implements TerrainChunkComponentData {
    static ID = ComponentId.TerrainChunk;

    x: number;
    y: number;
    z: number;
    data: Uint8Array = new Uint8Array(TERRAIN_CHUNK_SIZE * TERRAIN_CHUNK_SIZE * TERRAIN_CHUNK_SIZE);

    constructor(x?: number, y?: number, z?: number) {
        super();

        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
    }

    // Used when block just next to this chunk is changed, to force refresh of this chunk's mesh.
    forceDirtyData(state: boolean) {
        if (state) this.dirtyFields.add('data');
        else this.dirtyFields.delete('data');
    }

    getValue(x: number, y: number, z: number) {
        if (x < 0 || y < 0 || z < 0 || x >= TERRAIN_CHUNK_SIZE || y >= TERRAIN_CHUNK_SIZE || z >= TERRAIN_CHUNK_SIZE) return 0;
        return this.data[(y | 0) * TERRAIN_CHUNK_SIZE * TERRAIN_CHUNK_SIZE + (z | 0) * TERRAIN_CHUNK_SIZE + (x | 0)];
    }

    setValue(x: number, y: number, z: number, mat: number): boolean {
        if (x < 0 || y < 0 || z < 0 || x >= TERRAIN_CHUNK_SIZE || y >= TERRAIN_CHUNK_SIZE || z >= TERRAIN_CHUNK_SIZE) return false;
        this.data[(y | 0) * TERRAIN_CHUNK_SIZE * TERRAIN_CHUNK_SIZE + (z | 0) * TERRAIN_CHUNK_SIZE + (x | 0)] = mat;

        // Implicit dirty detection only works when setting attributes, not mutating child structures like an array.
        this.dirtyFields.add('data');
    }

    serialize(): Uint8Array {
        // Copy chunk data at an offset of 3 Int32 (chunk coordinates).
        let arr = new Uint8Array(Int32Array.BYTES_PER_ELEMENT * 3 + this.data.length);
        arr.set(this.data, Int32Array.BYTES_PER_ELEMENT * 3);

        // Set three Int32 for chunk coordinates at the beginning of the underlying buffer.
        let coordView = new DataView(arr.buffer);
        coordView.setInt32(0, this.x);
        coordView.setInt32(Int32Array.BYTES_PER_ELEMENT, this.y);
        coordView.setInt32(Int32Array.BYTES_PER_ELEMENT * 2, this.z);

        // Return as buffer for Node to transfer it correctly.
        return arr;
    }
}
