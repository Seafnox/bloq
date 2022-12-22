import { AbstractComponent, AbstractComponentData } from '@block/shared/components/abstractComponent';
import { ComponentId } from '@block/shared/constants/componentId';
import { Position } from '@block/shared/Position';
export interface PlayerChunkComponentData extends AbstractComponentData, Position {}
export class PlayerChunkComponent extends AbstractComponent<PlayerChunkComponentData> {
    static ID = ComponentId.PlayerChunk;

    x: number = 0;
    y: number = 0;
    z: number = 0;
}
