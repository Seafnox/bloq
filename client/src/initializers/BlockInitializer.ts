import { BlockComponent } from '@block/shared/components/blockComponent';
import { RotationComponent } from '@block/shared/components/rotationComponent';
import { ComponentId } from '@block/shared/constants/ComponentId';
import EntityManager from '@block/shared/EntityManager';
import Initializer from '@block/shared/Initializer';
import {ShaderMaterial, Mesh} from 'three';

import {MeshComponent} from "../components";
import {buildBlockGeometry} from "../geometry/block";


// TODO edit any
export default class BlockInitializer extends Initializer<any> {
    material: ShaderMaterial;

    constructor(em: EntityManager, material: ShaderMaterial) {
        super(em);
        this.material = material;
    }

    initialize(entity: string, components: Object) {
        let blockComponent = this.entityManager.addComponentFromData(
            entity,
            ComponentId.Block,
            components[ComponentId.Block]
        ) as BlockComponent;

        if(blockComponent.count === 0) {
            this.entityManager.removeEntity(entity);
        }

        // If block has position, it will be shown in the world.
        // Otherwise it's in a player's inventory.
        if (components[ComponentId.Position]) {
            this.entityManager.addComponentFromData(
                entity,
                ComponentId.Position,
                components[ComponentId.Position]
            );

            let geom = buildBlockGeometry(blockComponent.kind);

            let meshComponent = new MeshComponent();
            meshComponent.mesh = new Mesh(geom, this.material);
            meshComponent.mesh.scale.set(0.25, 0.25, 0.25);

            this.entityManager.addComponent(entity, meshComponent);
            this.entityManager.addComponent(entity, new RotationComponent());
        }
    }
}
