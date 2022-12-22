import { BlockComponent } from '@block/shared/components/blockComponent';
import { PositionComponent } from '@block/shared/components/positionComponent';
import { BlockId } from '@block/shared/constants/blockId';
import EntityManager from "@block/shared/EntityManager";
import { PickableComponent } from './components/pickableComponent';


export function initBlockEntity(em: EntityManager, x: number, y: number, z: number, kind: BlockId): string {
    let blockEntity = em.createEntity();
    let pos = new PositionComponent();
    pos.x = x;
    pos.y = y;
    pos.z = z;

    let block = new BlockComponent();
    block.kind = kind;
    em.addComponent(blockEntity, pos);
    em.addComponent(blockEntity, block);
    em.addComponent(blockEntity, new PickableComponent());

    return blockEntity;
}
