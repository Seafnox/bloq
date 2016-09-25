import BaseWorld from "../../shared/BaseWorld";
import {registerServerComponents} from "./components";
import {Terrain} from "./terrain";
import {ServerActionManager} from "./actions";

import ActionExecutionSystem from "../../shared/systems/ActionExecutionSystem";
import InformNewPlayersSystem from "./systems/InformNewPlayersSystem";
import BroadcastPlayerInputSystem from "./systems/BroadcastPlayerInputSystem";
import ChunkSubscriptionSystem from "./systems/ChunkSubscriptionSystem";
import PlayerActionSystem from "./systems/PlayerActionSystem";
import PickUpSystem from "./systems/PickUpSystem";
import {EntityManagerEvent} from "../../shared/EntityManager";
import BroadcastEntitySystem from "./systems/BroadcastEntitySystem";


export default class World extends BaseWorld {
    terrain = new Terrain();

    constructor() {
        super();
        this.actionManager = new ServerActionManager();

        registerServerComponents(this.entityManager);

        this.addSystem(new ActionExecutionSystem(this.entityManager, this.actionManager), -1000); // Always process first
        this.addSystem(new InformNewPlayersSystem(this.entityManager), -9);
        this.addSystem(new BroadcastPlayerInputSystem(this.entityManager), -8);
        this.addSystem(new ChunkSubscriptionSystem(this.entityManager, this.terrain), 100);
        this.addSystem(new PlayerActionSystem(this.entityManager, this.actionManager), 101);
        this.addSystem(new PickUpSystem(this.entityManager), 102);
        this.addSystem(new BroadcastEntitySystem(this.entityManager), 103);

        console.log(this.systems);
        console.log(this.systemsOrder)
    }


    tick(dt) {
        super.tick(dt);
    }
}