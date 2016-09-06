import FastSimplexNoise = require('fast-simplex-noise');

export class Terrain {
    sampler: FastSimplexNoise = new FastSimplexNoise();

    sample(x: number, y: number, z: number) {
        return this.sampler.in2D(x / 50, z / 50) * 8 + 8;
    }
}