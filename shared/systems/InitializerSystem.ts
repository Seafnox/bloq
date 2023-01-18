import { ComponentId } from '../constants/ComponentId';
import {System} from "../System";
import Initializer from "../Initializer";
import EntityManager from "../EntityManager";
import { EntityMessage, ComponentMap } from '../EntityMessage';
import {ComponentEventEmitter} from "../EventEmitter";


export default class InitializerSystem<TComponentMap extends ComponentMap> extends System {
    private componentQueue: Map<ComponentId, EntityMessage<TComponentMap>[]> = new Map<ComponentId, EntityMessage<TComponentMap>[]>();
    private initializers: Map<ComponentId, Initializer<TComponentMap>> = new Map<ComponentId, Initializer<TComponentMap>>();
    private eventEmitter: ComponentEventEmitter<TComponentMap>;

    constructor(em: EntityManager, eventEmitter: ComponentEventEmitter<TComponentMap>) {
        super(em);
        this.eventEmitter = eventEmitter;
    }

    update(dt: number) {
        this.componentQueue.forEach((messages: EntityMessage<TComponentMap>[], componentType: ComponentId) => {
            let initializer = this.initializers.get(componentType);
            messages.forEach(entityMessage => {
                initializer.initialize(entityMessage.entity, entityMessage.componentMap);
            });
        });

        this.componentQueue.clear();
    }

    addInitializer(componentId: ComponentId, initializer: Initializer<TComponentMap>) {
        this.initializers.set(componentId, initializer);

        this.eventEmitter.addEventListener(componentId, (entity: string, componentMap: TComponentMap) => {
            let compQueue = this.componentQueue.get(componentId);
            if (!compQueue) {
                compQueue = [];
                this.componentQueue.set(componentId, compQueue)
            }

            compQueue.push({
                entity,
                componentMap,
            })
        });
    }
}
