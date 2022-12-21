import {
    Scene,
    PerspectiveCamera,
    ShaderMaterial,
    Vector3
} from 'three';
import { BaseWorld } from "@block/shared/BaseWorld";
import { UtilsManager } from "@block/shared/UtilsManager";
import { registerClientComponents } from './components/registerClientComponents';
import PlayState from "./states/PlayState";
import {ClientActionManager} from "./actions";
import ActionExecutionSystem from "@block/shared/systems/ActionExecutionSystem";
import TerrainChunkSystem from "./systems/TerrainChunkSystem";
import PlayerInputSystem from "./systems/PlayerInputSystem";
import PlayerInputSyncSystem from "./systems/PlayerInputSyncSystem";
import MeshSystem from "./systems/MeshSystem";
import PlayerMeshSystem from "./systems/PlayerMeshSystem";
import PlayerSelectionSystem from "./systems/PlayerSelectionSystem";
import MouseManager from "../lib/MouseManager";
import KeyboardManager from "../lib/KeyboardManager";
import InventoryUISystem from "./systems/InventoryUISystem";
import BlockSystem from "./systems/BlockSystem";
import {ComponentId, SystemOrder} from "@block/shared/constants";
import BlockInitializer from "./initializers/BlockInitializer";
import TerrainChunkInitializer from "./initializers/TerrainChunkInitializer";
import PlayerInitializer from "./initializers/PlayerInitializer";
import InputInitializer from "./initializers/InputInitializer";
import NetworkSystem from "./systems/NetworkSystem";
import ChatSystem from "./systems/ChatSystem";
import ChatMessageInitializer from "./initializers/ChatMessageInitializer";
import InitializerSystem from "@block/shared/systems/InitializerSystem";
import ChunkSystem from "./systems/ChunkSystem";
import SoundSystem from "./systems/SoundSystem";
import {v4} from 'uuid';
import blockFragShader from '../assets/shaders/block_frag.glsl';
import blockVertShader from '../assets/shaders/block_vert.glsl';
import selectionFragShader from '../assets/shaders/selection_frag.glsl';
import selectionVertShader from '../assets/shaders/selection_vert.glsl';
import terrainFragShader from '../assets/shaders/terrain_frag.glsl';
import terrainVertShader from '../assets/shaders/terrain_vert.glsl';

export default class World extends BaseWorld {
    scene: Scene;
    camera: PerspectiveCamera;
    terrainMaterial: ShaderMaterial;
    selectionMaterial: ShaderMaterial;
    blockMaterial: ShaderMaterial;

    game: PlayState;

    constructor(game: PlayState, guiNode: Element) {
        super(new UtilsManager(v4, performance.now, console));
        this.actionManager = new ClientActionManager();
        this.game = game;

        registerClientComponents(this.entityManager);


        this.scene = new Scene();

        this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 10000);
        this.camera.name = 'camera'; // Used to look up camera from e.g. player's Object3D.

        this.terrainMaterial = new ShaderMaterial({
            uniforms: {
                texture: {
                    value: this.game.assetManager.getTexture('terrain')
                }
            },
            vertexShader: terrainVertShader,
            fragmentShader: terrainFragShader,
            vertexColors: true
        });

        this.selectionMaterial = new ShaderMaterial({
            uniforms: {
                globalPosition: {
                    value: new Vector3(0, 0, 0)
                }
            },
            vertexShader: selectionVertShader,
            fragmentShader: selectionFragShader
        });

        this.blockMaterial = new ShaderMaterial({
            uniforms: {
                texture: {
                    value: this.game.assetManager.getTexture('terrain')
                }
            },
            vertexShader: blockVertShader,
            fragmentShader: blockFragShader,
            vertexColors: true
        });

        this.addSystems(guiNode);
    }

    addSystems(guiNode: Element) {
        let netSystem = new NetworkSystem(this.entityManager, this.game.server);
        // TODO: Store system orders as constants in one place.
        this.addSystem(new ActionExecutionSystem(this.entityManager, this.actionManager), SystemOrder.ActionExecution); // Always process first

        let initializerSystem = new InitializerSystem(this.entityManager, this.game.server.eventEmitter);
        initializerSystem.addInitializer(ComponentId.TerrainChunk, new TerrainChunkInitializer(this.entityManager));
        initializerSystem.addInitializer(
            ComponentId.Player,
            new PlayerInitializer(
                this.entityManager,
                this.game.assetManager,
                netSystem,
                this.camera,
                this.selectionMaterial
            )
        );
        initializerSystem.addInitializer(ComponentId.Block, new BlockInitializer(this.entityManager, this.blockMaterial));
        let inputInitializer = new InputInitializer(this.entityManager);
        initializerSystem.addInitializer(ComponentId.Input, inputInitializer);
        initializerSystem.addInitializer(ComponentId.Rotation, inputInitializer);
        initializerSystem.addInitializer(ComponentId.ChatMessage, new ChatMessageInitializer(this.entityManager));
        this.addSystem(initializerSystem, SystemOrder.Initializer);

        this.addSystem(new TerrainChunkSystem(this.entityManager, this.scene, this.terrainMaterial), SystemOrder.TerrainChunk);
        this.addSystem(new BlockSystem(this.entityManager), SystemOrder.Block);

        let keyboardManager = new KeyboardManager(this.game.renderer.domElement);
        let mouseManager = new MouseManager(this.game.renderer.domElement);
        this.addSystem(new ChatSystem(this.entityManager, guiNode, keyboardManager, netSystem), SystemOrder.Chat);
        this.addSystem(new PlayerInputSystem(this.entityManager, mouseManager, keyboardManager), SystemOrder.PlayerInput);

        this.addSystem(new PlayerInputSyncSystem(this.entityManager, netSystem), SystemOrder.PlayerInputSync);
        this.addSystem(new MeshSystem(this.entityManager, this.scene), SystemOrder.Mesh);
        this.addSystem(new PlayerMeshSystem(this.entityManager, this.scene), SystemOrder.PlayerMesh);
        this.addSystem(new PlayerSelectionSystem(this.entityManager, this.scene), SystemOrder.PlayerSelection);
        this.addSystem(new ChunkSystem(this.entityManager, netSystem), SystemOrder.Chunk);

        this.addSystem(new SoundSystem(this.entityManager, this.game.assetManager), SystemOrder.Sound);
        this.addSystem(new InventoryUISystem(this.entityManager, guiNode), SystemOrder.InventoryUI);
        // this.addSystem(new DebugTextSystem(this.entityManager, this.game.renderer), SystemOrder.DebugText);
        this.addSystem(netSystem, SystemOrder.Network);
    }

    tick(dt: number) {
        super.tick(dt);
    }
}
