import { ComponentId } from '@block/shared/constants/componentId';
import {System} from "@block/shared/System";
import { NetworkComponent } from '../components/networkComponent';


export default class InformNewPlayersSystem extends System {
    update(dt: number) {
        // Will ~99.999% only ever be one new player per tick.
        let syncComponents = [
            ComponentId.Position,
            ComponentId.Rotation,
            ComponentId.Physics,
            ComponentId.Input,
            ComponentId.Player,
            ComponentId.WallCollision
        ];

        this.entityManager.getEntities(ComponentId.NewPlayer).forEach((component, newEntity) => {
            let newPlayerData = this.entityManager.serializeEntity(newEntity, syncComponents);
            console.log(newPlayerData);
            let existingPlayerDatas: string[] = [];

            // Send info about new player to existing players.
            this.entityManager.getEntities(ComponentId.Player).forEach((component, existingEntity) => {
                if (existingEntity == newEntity) return; // Never send info about the new player to themselves.
                let netComponent = this.entityManager.getComponent<NetworkComponent>(existingEntity, ComponentId.Network);
                netComponent.pushEntity(newPlayerData);

                existingPlayerDatas.push(this.entityManager.serializeEntity(existingEntity, syncComponents));
            });

            // Inform new player about existing players.
            let netComponent = this.entityManager.getComponent<NetworkComponent>(newEntity, ComponentId.Network);
            existingPlayerDatas.forEach(data => {
                netComponent.pushEntity(data);
            });

            this.entityManager.getEntities(ComponentId.Pickable).forEach((component, pickableEntity) => {
                netComponent.pushEntity(this.entityManager.serializeEntity(pickableEntity));
            });

            console.log('New player informed.');
            this.entityManager.removeComponent(newEntity, component);
        });
    }
}
