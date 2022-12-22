import { PlayerComponentData } from '@block/shared/components/playerComponent';
import { ComponentId } from '@block/shared/constants/componentId';
import { EntityMessage, ComponentMap } from '@block/shared/entityMessage';
import { MeshComponentData } from '../components/meshComponent';
import { PlayerChunkComponentData } from '../components/playerChunkComponent';
import { PlayerSelectionComponentData } from '../components/playerSelectionComponent';

export interface ClientEntityMessage extends EntityMessage<ClientComponentMap> {}

export interface ClientComponentMap extends ComponentMap {
    // Client
    [ComponentId.Mesh]: MeshComponentData;
    [ComponentId.AnimatedMesh]: MeshComponentData;
    [ComponentId.PlayerSelection]: PlayerSelectionComponentData;
    [ComponentId.PlayerChunk]: PlayerChunkComponentData;
}
