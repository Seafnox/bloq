import { OnGroundComponent } from '../components/onGroundComponent';
import { PhysicsComponent } from '../components/physicsComponent';
import { PositionComponent } from '../components/positionComponent';
import { TerrainChunkComponent } from '../components/terrainChunkComponent';
import { WallCollisionComponent } from '../components/wallCollisionComponent';
import { ComponentId } from '../constants/ComponentId';
import { PlayerJumpVelocity } from '../constants/physics.constants';
import { terrainChunkSize } from '../constants/interaction.constants';
import { chunkKey } from '../helpers/chunkKey';
import { globalToChunk } from '../helpers/globalToChunk';
import { mod } from '../helpers/mod';
import {System} from "../System";


export default class TerrainCollisionSystem extends System {
    update(dt: number): any {
        this.entityManager.getEntities(ComponentId.Physics).forEach((component, entity) => {
            const posComponent = this.entityManager.getComponent<PositionComponent>(entity, ComponentId.Position);
            const onGroundComponent = this.entityManager.getComponent<OnGroundComponent>(entity, ComponentId.OnGround);
            const physComponent = component as PhysicsComponent;

            // Find the chunk coordinates based on current global position (16 -> 0 etc.)
            let [cx, cy, cz] = posComponent.toChunk();
//            const entityChunkKey = chunkKey(cx, cy, cz);

            // Build a list of all neighbor chunks. These are the only ones we can possibly collide with.
            let chunks: Record<string, TerrainChunkComponent> = {};
            for (let nz = -1; nz <= 1; nz++) {
                for (let ny = -1; ny <= 1; ny++) {
                    for (let nx = -1; nx <= 1; nx++) {
                        let key = chunkKey(cx + nx, cy + ny, cz + nz);
                        let chunkComponent = this.entityManager.getComponent<TerrainChunkComponent>(key, ComponentId.TerrainChunk);
                        if (chunkComponent) chunks[key] = chunkComponent;
                    }
                }
            }

            // Helper function for collision checks below.
            let checkCollisionAt = (nx: number, ny: number, nz: number): boolean => {
                let [gx, gy, gz] = [posComponent.x + nx, posComponent.y + ny, posComponent.z + nz].map(c => Math.round(Math.abs(c)) * Math.sign(c));
                let [lx, ly, lz] = [
                    mod(gx, terrainChunkSize),
                    mod(gy, terrainChunkSize),
                    mod(gz, terrainChunkSize)
                ];

                let cx = globalToChunk(gx);
                let cy = globalToChunk(gy);
                let cz = globalToChunk(gz);


                let key = chunkKey(cx, cy, cz);
                let chunk = chunks[key];
                if (!chunk) return true;

                return !!chunk.getValue(lx, ly, lz)
            };

            // Check and handle ground collisions. If player velY === PlayerJumpVelocity it means player jumped this
            // frame, and should not be anchored to ground again (have new OnGroundComponent assigned).
            let yOffsetFromBlock = mod(posComponent.y, 1); // Player position offset compared to real ground level / block level.

            if (physComponent.velY !== PlayerJumpVelocity && checkCollisionAt(0, -yOffsetFromBlock, 0)) {
                // Clamp to ground, so player doesn't hover.
                if(physComponent.velY < 0) {
                    posComponent.y = posComponent.y-yOffsetFromBlock+0.5;
                    physComponent.velY = 0.0;
                }

                let onGround = onGroundComponent || new OnGroundComponent();
                !onGroundComponent && this.entityManager.addComponent(entity, onGround);
                onGround.canJump = !checkCollisionAt(0, 3.1, 0); // Only able to jump unless there is a block overhead
            } else {
                this.entityManager.removeComponentType(entity, ComponentId.OnGround);
            }

            // If there's a block above the player, never allow upward movement.
            if (checkCollisionAt(0, 3, 0)) {
                physComponent.velY = Math.min(physComponent.velY, 0.0);
            }

            // Check and update block collision component (wall collisions).
            let bcComponent = this.entityManager.getComponent<WallCollisionComponent>(entity, ComponentId.WallCollision);
            bcComponent.px = !!(checkCollisionAt(0.5, 0.5, 0) || checkCollisionAt(0.5, 1.5, 0) || checkCollisionAt(0.5, 2.5, 0));
            bcComponent.nx = !!(checkCollisionAt(-0.5, 0.5, 0) || checkCollisionAt(-0.5, 1.5, 0) || checkCollisionAt(-0.5, 2.5, 0));
            bcComponent.pz = !!(checkCollisionAt(0, 0.5, 0.5) || checkCollisionAt(0, 1.5, 0.5) || checkCollisionAt(0, 2.5, 0.5));
            bcComponent.nz = !!(checkCollisionAt(0, 0.5, -0.5) || checkCollisionAt(0, 1.5, -0.5) || checkCollisionAt(0, 2.5, -0.5));
        })
    }
}
