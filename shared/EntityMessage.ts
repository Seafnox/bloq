import { AbstractComponentData } from './components/abstractComponent';
import { BlockComponentData } from './components/blockComponent';
import { ChatMessageComponentData } from './components/chatMessageComponent';
import { ChunkRequestComponentData } from './components/chunkRequestComponent';
import { InputComponentData } from './components/inputComponent';
import { InventoryComponentData } from './components/inventoryComponent';
import { OnGroundComponentData } from './components/onGroundComponent';
import { PhysicsComponentData } from './components/physicsComponent';
import { PlayerComponentData } from './components/playerComponent';
import { PositionComponentData } from './components/positionComponent';
import { RotationComponentData } from './components/rotationComponent';
import { SerializableComponentData } from './components/serializableComponent';
import { TerrainChunkComponentData } from './components/terrainChunkComponent';
import { WallCollisionComponentData } from './components/wallCollisionComponent';
import { ComponentId } from './constants/ComponentId';

export interface EntityMessage<T extends Partial<ComponentMap> = Partial<ComponentMap>> {
    entity: string;
    componentMap: T;
}

export interface ComponentMap extends Record<ComponentId, AbstractComponentData> {
    [ComponentId.None]: AbstractComponentData;
    [ComponentId.Position]: PositionComponentData;
    [ComponentId.Rotation]: RotationComponentData;
    [ComponentId.Physics]: PhysicsComponentData;
    [ComponentId.OnGround]: OnGroundComponentData;
    [ComponentId.WallCollision]: WallCollisionComponentData;
    [ComponentId.Input]: InputComponentData;
    [ComponentId.CurrentPlayer]: SerializableComponentData;
    [ComponentId.TerrainChunk]: TerrainChunkComponentData;
    [ComponentId.Inventory]: InventoryComponentData;
    [ComponentId.Block]: BlockComponentData;
    [ComponentId.ChatMessage]: ChatMessageComponentData;
    [ComponentId.ChunkRequest]: ChunkRequestComponentData;
    [ComponentId.Player]: PlayerComponentData;
}
