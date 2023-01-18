import EntityManager from '../EntityManager';
import { BlockComponent } from './blockComponent';
import { ChatMessageComponent } from './chatMessageComponent';
import { ChunkRequestComponent } from './chunkRequestComponent';
import { CurrentPlayerComponent } from './currentPlayerComponent';
import { InputComponent } from './inputComponent';
import { InventoryComponent } from './inventoryComponent';
import { OnGroundComponent } from './onGroundComponent';
import { PhysicsComponent } from './physicsComponent';
import { PlayerComponent } from './playerComponent';
import { PositionComponent } from './positionComponent';
import { RotationComponent } from './rotationComponent';
import { TerrainChunkComponent } from './terrainChunkComponent';
import { WallCollisionComponent } from './wallCollisionComponent';

export function registerSharedComponents(manager: EntityManager) {
    manager.registerComponentType(new PositionComponent());
    manager.registerComponentType(new RotationComponent());
    manager.registerComponentType(new PhysicsComponent());
    manager.registerComponentType(new OnGroundComponent());
    manager.registerComponentType(new InputComponent());
    manager.registerComponentType(new CurrentPlayerComponent());
    manager.registerComponentType(new WallCollisionComponent());
    manager.registerComponentType(new TerrainChunkComponent());
    manager.registerComponentType(new InventoryComponent());
    manager.registerComponentType(new BlockComponent());
    manager.registerComponentType(new ChatMessageComponent());
    manager.registerComponentType(new ChunkRequestComponent());
    manager.registerComponentType(new PlayerComponent());
}
