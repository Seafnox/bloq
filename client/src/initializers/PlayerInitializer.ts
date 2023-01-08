import { PlayerComponent } from '@block/shared/components/playerComponent';
import { ComponentId } from '@block/shared/constants/componentId';
import {
    Mesh,
    PerspectiveCamera,
    ShaderMaterial,
    BoxGeometry,
} from 'three';
import Initializer from "@block/shared/Initializer";
import { AnimatedMeshComponent } from '../components/animatedMeshComponent';
import EntityManager from "@block/shared/EntityManager";
import { PlayerChunkComponent } from '../components/playerChunkComponent';
import { PlayerSelectionComponent } from '../components/playerSelectionComponent';
import { ClientComponentMap } from '../emtityManager/clientEntityMessage';
import NetworkSystem from "../systems/NetworkSystem";
import { AnimatedMesh, getAnimatedMesh } from '../three/AnimatedMesh';
import AssetManager from "../three/AssetManager";

export default class PlayerInitializer extends Initializer<ClientComponentMap> {
    private netSystem: NetworkSystem;
    private readonly camera: PerspectiveCamera;
    private assetManager: AssetManager;
    private readonly selectionMaterial: ShaderMaterial;

    constructor(em: EntityManager, am: AssetManager, netSystem: NetworkSystem, camera: PerspectiveCamera, selectionMaterial: ShaderMaterial) {
        super(em);
        this.assetManager = am;
        this.netSystem = netSystem;
        this.camera = camera;
        this.selectionMaterial = selectionMaterial;
    }

    initialize(entity: string, componentMap: ClientComponentMap) {
        // New player just joined. Set and send username.
        if (!componentMap[ComponentId.Player]['name']) {
            let playerComponent = new PlayerComponent();
            playerComponent.name = localStorage.getItem('name');
            this.entityManager.addComponent(entity, playerComponent);

            this.netSystem.pushBuffer(this.entityManager.serializeEntity(entity));
            return;
        }

        // Initialize joining player.
        Object.keys(componentMap)
            .forEach(componentIdStr => {
                let componentId = parseInt(componentIdStr) as ComponentId;
                let componentData = componentMap[componentId];
                this.entityManager.addComponentFromData(entity, componentId, componentData);
            });

        // Only current player needs a camera attached.
        let playerCharacter: AnimatedMesh;
        if (ComponentId.CurrentPlayer in componentMap) {
            playerCharacter = getAnimatedMesh(new Mesh());
            this.camera.position.y = 2.5;
            playerCharacter.add(this.camera);
        } else {
            let object = this.assetManager.getObject('player');
            playerCharacter = object.clone();
        }

        const animMeshComponent = new AnimatedMeshComponent();
        animMeshComponent.mesh = playerCharacter;
        this.entityManager.addComponent(entity, animMeshComponent);

        // Only show selection box for current player.
        if (ComponentId.CurrentPlayer in componentMap) {
            console.log('Spawning current player');
            let selectionComponent = new PlayerSelectionComponent();

            // Need an underlying box for the Box helper to work.
            // Could also render this BoxGeometry in wireframe mode, but then we get diagonal lines,
            // as it renders triangles.
            let selectionGeom = new BoxGeometry(1.0, 1.0, 1.0);

            // Update and add component.
            selectionComponent.mesh = new Mesh(selectionGeom, this.selectionMaterial);
            this.entityManager.addComponent(entity, selectionComponent);
        }

        this.entityManager.addComponent(entity, new PlayerChunkComponent());
    }
}
