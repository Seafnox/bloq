import { PositionComponent } from '@block/shared/components/positionComponent';
import { TerrainChunkComponent } from '@block/shared/components/terrainChunkComponent';
import { ComponentId } from '@block/shared/constants/componentId';
import { terrainChunkSize } from '@block/shared/constants/interaction.constants';
import { chunkKey } from '@block/shared/helpers/chunkKey';
import { getPosition } from '@block/shared/helpers/getPosition';
import { Position } from '@block/shared/Position';
import {Scene, ShaderMaterial, Mesh, Vector3} from 'three';

import {System} from "@block/shared/System";
import {ViewDistance} from "@block/shared/constants/visual.constants";
import EntityManager from '@block/shared/EntityManager';
import { MeshComponent } from '../components/meshComponent';
import { PlayerChunkComponent } from '../components/playerChunkComponent';
import {geometryFromArrays} from "../geometry/terrain";
import { isMesh } from '../three/isMesh';
import { TerrainWorkerRequest } from '../workers/TerrainWorkerRequest';
import { TerrainWorkerResponse } from '../workers/TerrainWorkerResponse';

export default class TerrainChunkSystem extends System {
    scene: Scene;
    material: ShaderMaterial;
    worker: Worker;

    renderQueue: Position[] = []; // Pseudo queue. Gets reordered.
    readyQueue: TerrainWorkerResponse['data'][] = [];

    constructor(em: EntityManager, scene: Scene, material: ShaderMaterial) {
        super(em);
        this.scene = scene;
        this.material = material;
        this.worker = new Worker('/terrain.worker.js', { type: "module" });

        // Receive generated geometry arrays from worker:
        this.worker.onmessage = (e: TerrainWorkerResponse) => {
            this.readyQueue.push(e.data);
        }
    }

    update(dt: number) {
        // Add dirty chunks to System queue.
        let preLength = this.renderQueue.length;

        let [playerEntity, playerChunk] = this.entityManager.getFirstEntity<PlayerChunkComponent>(ComponentId.PlayerChunk);
        if (!playerEntity) return;

        this.entityManager.getEntities(ComponentId.TerrainChunk).forEach((component, entity) => {
            let chunkComponent = component as TerrainChunkComponent;
            // Remove chunks outside view distance.
            if (Math.sqrt(Math.pow(playerChunk.x - chunkComponent.x, 2) + Math.pow(playerChunk.y - chunkComponent.y, 2) + Math.pow(playerChunk.z - chunkComponent.z, 2)) >= ViewDistance) {
                this.entityManager.removeEntity(entity);
            } else if (chunkComponent.isDirty()) {
                this.renderQueue.push(getPosition(chunkComponent));
            }
        });

        // If any chunks were added to dirty queue, sort by distance from player, so closest
        // chunks render first.
        if (this.renderQueue.length > preLength) {
            // Get current player (First key of iterator. There will always only be one CurrentPlayer)
            let playerEntity = this.entityManager.getEntities(ComponentId.CurrentPlayer).keys().next().value;
            let positionComponent = this.entityManager.getComponent<PositionComponent>(playerEntity, ComponentId.Position);
            let [cx, cy, cz] = positionComponent.toChunk();
            let vec = new Vector3(cx, cy, cz);
            this.renderQueue.sort((a, b) => vec.distanceTo(new Vector3(b.x, b.y, b.z)));
        }

        // Shift off queue until we have used 4 ms (half of available frame time) or no chunks are left in queue.
        let cumTime = 0.0;
        let startTime = performance.now();
        while (cumTime < 4 && this.readyQueue.length > 0) {
            let {entity, materials, vertices, shadows} = this.readyQueue.pop();
            if (!vertices.length) continue;

            // Chunk may have been unsubscribed between when it was added to queue, and now.
            let chunkComponent = this.entityManager.getComponent<TerrainChunkComponent>(entity, ComponentId.TerrainChunk);
            if (!chunkComponent) continue;

            let chunkGeom = geometryFromArrays(materials, vertices, shadows);

            let meshComponent = this.entityManager.getComponent<MeshComponent>(entity, ComponentId.Mesh);
            if (!meshComponent) meshComponent = this.entityManager.addComponent(entity, new MeshComponent());
            let mesh = meshComponent.mesh;
            if (mesh && isMesh(mesh)) {
                mesh.geometry.dispose();
                mesh.geometry = chunkGeom;
            }
            else {
                if (!!mesh) {
                    console.error(new Error('Try to change geometry in no mesh object (see below)'));
                    console.log(mesh);
                }
                mesh = new Mesh(chunkGeom, this.material);
            }

            if (!meshComponent.mesh) {
                meshComponent.mesh = mesh;
                this.scene.add(mesh);
            }

            // Set chunk position. Add offsets so displayed mesh corresponds with collision detection and
            // lookups on the underlying data for the terrain chunk.
            mesh.position.x = chunkComponent.x * terrainChunkSize;
            mesh.position.y = chunkComponent.y * terrainChunkSize;
            mesh.position.z = chunkComponent.z * terrainChunkSize;

            let endTime = performance.now();
            cumTime += (endTime - startTime);
            startTime = endTime;
        }

        startTime = performance.now();
        while (cumTime < 4 && this.renderQueue.length > 0) {
            let { x: cx, y: cy, z: cz } = this.renderQueue.pop();
            let entity = chunkKey(cx, cy, cz);
            let chunkComponent = this.entityManager.getComponent<TerrainChunkComponent>(entity, ComponentId.TerrainChunk);

            // If chunk was removed after it was queued.
            if (!chunkComponent) continue;

            // Get all neighbors' chunk data.
            let neighborData = [-1, 0, 1].map(z => {
                return [-1, 0, 1].map(y => {
                    return [-1, 0, 1].map(x => {
                        if (x === 0 && y === 0 && z === 0) return null;

                        let entity = chunkKey(cx + x, cy + y, cz + z);
                        let chunk = this.entityManager.getComponent<TerrainChunkComponent>(entity, ComponentId.TerrainChunk);
                        if (chunk) return chunk.data;
                        else return null;
                    })
                })
            });

            this.worker.postMessage({
                entity: entity,
                data: chunkComponent.data,
                neighborData: neighborData
            } as TerrainWorkerRequest['data']);

            let endTime = performance.now();
            cumTime += (endTime - startTime);
            startTime = endTime;
        }
    }
}

