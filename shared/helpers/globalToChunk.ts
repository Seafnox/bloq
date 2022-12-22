import { terrainChunkSize } from '../constants/TerrainChunkSize';

export const globalToChunk = (x: number) => {
    if (x < 0) return Math.ceil((x - terrainChunkSize + 1) / terrainChunkSize);
    else return Math.floor(x / terrainChunkSize);
};
