import { PlayerComponent } from '@block/shared/components/playerComponent';
import { ComponentId } from '@block/shared/constants/ComponentId';
import EntityManager from '@block/shared/EntityManager';
import { ComponentMap } from '@block/shared/EntityMessage';
import Initializer from '@block/shared/Initializer';
import {
    BoxBufferGeometry,
    Object3D,
    Mesh,
    PerspectiveCamera,
    ShaderMaterial
} from 'three';
import {
    PlayerSelectionComponent, PlayerChunkComponent, AnimatedMeshComponent
} from "../components";
import AnimatedMesh from "../three/AnimatedMesh";
import NetworkSystem from "../systems/NetworkSystem";
import AssetManager from "../three/AssetManager";

export default class PlayerInitializer extends Initializer<ComponentMap> {
    private netSystem: NetworkSystem;
    private camera: PerspectiveCamera;
    private assetManager: AssetManager;
    private selectionMaterial: ShaderMaterial;

    constructor(em: EntityManager, am: AssetManager, netSystem: NetworkSystem, camera: PerspectiveCamera, selectionMaterial: ShaderMaterial) {
        super(em);
        this.assetManager = am;
        this.netSystem = netSystem;
        this.camera = camera;
        this.selectionMaterial = selectionMaterial;
    }

    initialize(entity: string, components: Object) {
        // New player just joined. Set and send username.
        if (!components[ComponentId.Player]['name']) {
            let playerComponent = new PlayerComponent();
            playerComponent.name = localStorage.getItem('name');
            this.entityManager.addComponent(entity, playerComponent);

            this.netSystem.pushBuffer(this.entityManager.serializeEntity(entity));
            return;
        }

        // Initialize joining player.
        Object.keys(components).forEach((componentTypeStr) => {
            let componentType = parseInt(componentTypeStr) as ComponentId;
            let componentData = components[componentType];
            this.entityManager.addComponentFromData(entity, componentType, componentData);
        });

        // Only current player needs a camera attached.
        let playerMesh;
        if (ComponentId.CurrentPlayer in components) {
            playerMesh = new Object3D();
            this.camera.position.y = 2.5;
            playerMesh.add(this.camera);
        } else {
            let mesh = this.assetManager.getMesh('player');
            playerMesh = mesh.clone() as AnimatedMesh
        }

        let animMeshComponent = new AnimatedMeshComponent();
        animMeshComponent.mesh = playerMesh;
        this.entityManager.addComponent(entity, animMeshComponent);

        // Only show selection box for current player.
        if (ComponentId.CurrentPlayer in components) {
            console.log('Spawning current player');
            let selectionComponent = new PlayerSelectionComponent();

            // Need an underlying box for the Box helper to work.
            // Could also render this BoxGeometry in wireframe mode, but then we get diagonal lines,
            // as it renders triangles.
            let selectionGeom = new BoxBufferGeometry(1.0, 1.0, 1.0);

            // Update and add component.
            selectionComponent.mesh = new Mesh(selectionGeom, this.selectionMaterial);
            this.entityManager.addComponent(entity, selectionComponent);
        }

        this.entityManager.addComponent(entity, new PlayerChunkComponent());
    }
}
