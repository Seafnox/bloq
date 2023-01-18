export enum ComponentId {
    // Shared
    None,
    Position,
    Rotation,
    Physics,
    OnGround,
    WallCollision,
    Input,
    CurrentPlayer,
    TerrainChunk,
    Inventory,
    Block,
    ChatMessage,
    ChunkRequest,

    // Client
    Mesh,
    AnimatedMesh,
    PlayerSelection,
    Player,
    PlayerChunk,

    // Server
    Network,
    NewPlayer,
    Pickable,
}

export const componentNames = Array(20).fill(0).map((_, id) => `${id} - ${ComponentId[id]}`);
