import { ComponentId, BlockId } from '../constants';
import { SerializableComponent, SerializableComponentData } from './serializableComponent';

export interface BlockComponentData extends SerializableComponentData {
    kind: BlockId;
    count: number;
}

// Extended on client and server (client adds mesh). Therefore, not registered as shared component.
export class BlockComponent extends SerializableComponent<BlockComponentData> implements BlockComponentData {
    static ID = ComponentId.Block;

    kind: BlockId;
    count: number = 1;
}
