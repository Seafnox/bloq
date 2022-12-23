import { terrainChunkSize } from '@block/shared/constants/interaction.constants';
import { parentPort } from 'node:worker_threads';
import { FastSimplexNoise } from './FastSimplexNoise';

// TODO: Alow specifying a seed, and modify these values somehow.
const groundSampler = new FastSimplexNoise({
    min: -12,
    max: 12,
    frequency: 0.010,
    octaves: 2,
});
const groundDetailSampler = new FastSimplexNoise({
    frequency: 0.014,
    min: -10,
    max: 10,
});
const caveSampler = new FastSimplexNoise({
    frequency: 0.075,
    persistence: 0.6,
});
const bigCaveSampler = new FastSimplexNoise({
    frequency: 0.03,
    octaves: 2,
    persistence: 0.3,
    min: 0,
    max: 1,
});
const mountainSampler = new FastSimplexNoise({
    frequency: 0.0075,
    octaves: 3,
    min: -20,
    max: 5,
});
const bottomSampler = new FastSimplexNoise({
    frequency: 0.02,
    min: -92,
    max: -64,
});

const sample3d = (x: number, y: number, z: number): number => {
    if(y < bottomSampler.raw2D(x, z)) return 3;

    if (caveSampler.raw3D(x, y, z) + bigCaveSampler.raw3D(x, y, z) - Math.max(-0.1, y/10) > 0.45 + 0.4) {
        return 0;
    }

    let groundLevel = (groundSampler.raw2D(x, z) + groundDetailSampler.raw3D(x, y, z));
    if(y < groundLevel + mountainSampler.raw2D(x, z)) {
        return 3;
    }
    if (y < groundLevel) {
        // -5 gives us grass near the surface, and dirt on the ground in caves.
        if(y > groundLevel-5 && sample3d(x, y+1, z) === 0) return 2;

        return 1;
    }


    // Air.
    return 0;
};

parentPort.on("message", (event: MessageEvent) => {
    console.log(__filename, 'onMessage', event.data)
    let {x, y, z} = event.data;

    let data = new Uint8Array(terrainChunkSize * terrainChunkSize * terrainChunkSize);
    for (let lz = 0; lz < terrainChunkSize; lz++) {
        for (let ly = 0; ly < terrainChunkSize; ly++) {
            for (let lx = 0; lx < terrainChunkSize; lx++) {
                data[ly * terrainChunkSize * terrainChunkSize + lz * terrainChunkSize + lx] = sample3d(x * terrainChunkSize + lx, y * terrainChunkSize + ly, z * terrainChunkSize + lz);
            }
        }
    }

    parentPort.postMessage({
        x: x,
        y: y,
        z: z,
        data: Array.from(data) // Convert to normal array so it isn't serialized to a JSON object.
    });
})
