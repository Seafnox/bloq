import { AbstractComponent, AbstractComponentData } from '@block/shared/components/abstractComponent';
import { ComponentId } from '@block/shared/constants/componentId';
export interface PlayerChunkComponentData extends AbstractComponentData {
    x: number;
    y: number;
    z: number;
}
export class PlayerChunkComponent extends AbstractComponent<PlayerChunkComponentData> {
    static ID = ComponentId.PlayerChunk;

    x: number = 0;
    y: number = 0;
    z: number = 0;
}
