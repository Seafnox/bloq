import { BlockComponent } from '@block/shared/components/blockComponent';
import { RotationComponent } from '@block/shared/components/rotationComponent';
import { ComponentMap } from '@block/shared/interfaces';
import {ShaderMaterial, Mesh} from 'three';

import Initializer from "@block/shared/Initializer";
import {ComponentId} from "@block/shared/constants";
import { MeshComponent } from '../components/meshComponent';
import {buildBlockGeometry} from "../geometry/block";
import EntityManager from "@block/shared/EntityManager";


export default class BlockInitializer extends Initializer {
    material: ShaderMaterial;

    constructor(em: EntityManager, material: ShaderMaterial) {
        super(em);
        this.material = material;
    }

    initialize(entity: string, componentMap: ComponentMap) {
        let blockComponent = this.entityManager.addComponentFromObject(
            entity,
            ComponentId.Block,
            componentMap[ComponentId.Block]
        ) as BlockComponent;

        if(blockComponent.count === 0) {
            this.entityManager.removeEntity(entity);
        }

        // If block has position, it will be shown in the world.
        // Otherwise, it's in a player's inventory.
        if (componentMap[ComponentId.Position]) {
            this.entityManager.addComponentFromObject(
                entity,
                ComponentId.Position,
                componentMap[ComponentId.Position]
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
