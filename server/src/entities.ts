import EntityManager from "@block/shared/EntityManager";
import {
    PositionComponent,
    BlockComponent
} from "@block/shared/components";
import {
    PickableComponent
} from "./components";
import {BlockId} from "@block/shared/constants";


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
