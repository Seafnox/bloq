import EntityManager from "./EntityManager";
import {registerSharedComponents} from "./components";
import {System} from "./System";
import {ActionManager} from "./actions";
import PhysicsSystem from "./systems/PhysicsSystem";
import TerrainCollisionSystem from "./systems/TerrainCollisionSystem";
import PositionSystem from "./systems/PositionSystem";
import {CleanComponentsSystem} from "./systems/CleanComponentsSystem";
import {SystemOrder} from "./constants";

export default class BaseWorld {
    entityManager: EntityManager;
    actionManager: ActionManager;

    systems: Array<System> = [];
    systemsOrder: Array<number> = [];
    systemTimings: Array<number> = [];
    tickNumber: number = 0;

    constructor(uuid: () => string, ) {
        let em = new EntityManager(uuid);
        registerSharedComponents(em);

        this.entityManager = em;

        this.addSystem(new PhysicsSystem(em), SystemOrder.Physics);
        this.addSystem(new TerrainCollisionSystem(em), SystemOrder.TerrainCollision);
        this.addSystem(new PositionSystem(em), SystemOrder.Position);

        // Cleaning is the last thing we do in each tick.
        this.addSystem(new CleanComponentsSystem(em), SystemOrder.CleanComponents);
    }

    addSystem(system: System, order: number = 0.0) {
        let higher = this.systemsOrder.map((ord, idx) => {
            return [ord, idx]
        }).filter(zip => zip[0] > order);

        if (higher.length == 0) {
            this.systems.push(system);
            this.systemsOrder.push(order);
        } else {
            this.systems.splice(higher[0][1], 0, system);
            this.systemsOrder.splice(higher[0][1], 0, order);
        }

        this.systemTimings.push(0);
    }

    tick(dt) {
        let i = 0;
        let sumTime = 0;
        let frameTimes = new Float32Array(this.systems.length);
        this.systems.forEach(system => {
            let start = performance.now();
            system.update(dt);
            let time = performance.now() - start;
            frameTimes[i] = time;
            this.systemTimings[i] += time;
            sumTime += time;
            i++;
        });

        // if (this.tickNumber % 60 === 0) {
        //     console.log(`----\nTICK (${sumTime.toFixed(4)}ms)\n----`);
        //     for (var j = 0; j < this.systemTimings.length; j++) {
        //         let avgTime =(this.systemTimings[j]/this.tickNumber).toFixed(4);
        //         let currTime = frameTimes[j].toFixed(4);
        //         let sysName = this.systems[j].constructor.name;
        //         console.log(`${avgTime}ms\t ${currTime}ms\t ${sysName}`);
        //     }
        // }
        this.tickNumber++;
    }
}
