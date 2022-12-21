import {AbstractComponent} from "./components/abstractComponent";
import { SerializableComponent } from './components/serializableComponent';
import {ComponentId} from "./constants";
import { Logger } from './Logger';
import { UtilsManager } from './UtilsManager';
import { UuidGenerator } from './uuidGenerator';

let componentProxyHandler: ProxyHandler<AbstractComponent> = {
    set: (obj: any, prop: string, value: any) => {
        if (prop !== 'dirtyFields' && obj[prop] !== value) {
            (obj as AbstractComponent).dirtyFields.add(prop);
            obj[prop] = value;
        }
        return true;
    }
};

export const enum EntityManagerEvent {
    EntityCreated,
    EntityRemoved,
    ComponentAdded,
    ComponentReplaced,
    ComponentRemoved,

    NumEvents, // Used to initialize event handler array. Not a real event.
}

export default class EntityManager {
    private components: Map<ComponentId, Map<string, AbstractComponent>> = new Map<ComponentId, Map<string, AbstractComponent>>();
    private componentConstructors: Map<ComponentId, Function> = new Map<ComponentId, Function>();
    private removedEntities: Set<string> = new Set<string>();
    private utilsManager: UtilsManager;

    private eventHandlers: Function[][] = [];

    constructor(utilsManager: UtilsManager) {
        this.utilsManager = utilsManager;

        for (let i = 0; i < EntityManagerEvent.NumEvents; i++) {
            this.eventHandlers.push([]);
        }
    }

    get utils(): UtilsManager {
        return this.utilsManager;
    }

    get logger(): Logger {
        return this.utils.logger;
    }

    registerComponentType(instance: AbstractComponent) {
        let type = instance.typeName();
        if (this.componentConstructors.has(type)) {
            this.logger.warn(`Component type "${type} already registered.`);
            return;
        }
        this.componentConstructors.set(type, instance.constructor);
        this.components.set(type, new Map<string, AbstractComponent>());
    }

    getRegisteredComponentTypes(): Iterator<ComponentId> {
        return this.componentConstructors.keys();
    }

    createEntity() {
        let entity = this.utils.uuid();
        this.emit(EntityManagerEvent.EntityCreated, entity);
        return entity;
    }

    serializeEntity(entity: string, componentIds: ComponentId[] = null) {
        // Each component needs to be serialized individually, then a JSON string is manually created.
        // Just using JSON.stringify would cause each component's serialized string to be escaped.

        if (!componentIds) componentIds = Array.from(this.componentConstructors.keys());

        let components: string[] = [];
        componentIds.forEach(componentId => {
            let component = this.components.get(componentId).get(entity);
            if (component instanceof SerializableComponent) {
                components.push(`"${componentId}":${component.serialize()}`);
            } else if (component) {
                this.logger.warn(`Tried to serialize non-serializeable component: "${component.typeName()}"`)
            }
        });

        return `{"entity":"${entity}","components":{${components.join(',')}}}`;
    }

    // Only schedules for removal.
    // Entities (and their components) are fully removed once cleanComponents() is called.
    removeEntity(entity: string) {
        this.removedEntities.add(entity);
        this.emit(EntityManagerEvent.EntityRemoved, entity);
    }

    getEntities(componentType: ComponentId): Map<string, AbstractComponent> {
        return this.components.get(componentType);
    }

    getFirstEntity<T>(componentType: ComponentId): [string, T] {
        let ec = this.components.get(componentType).entries().next();
        if (!ec.done) return (ec.value as any) as [string, T]; // Double cast to make TS compiler understand.
        return [null, null];
    }

    hasComponent(entity: string, componentType: ComponentId): boolean {
        return this.components.get(componentType).has(entity);
    }

    getComponent<T>(entity: string, componentType: ComponentId): T {
        return (this.components.get(componentType).get(entity) as any) as T; // Have to double cast to force it to be T.
    }

    addComponent(entity: string, component: AbstractComponent): AbstractComponent {
        let event;
        if (this.components.get(component.ID).has(entity)) event = EntityManagerEvent.ComponentReplaced;
        else event = EntityManagerEvent.ComponentAdded;

        this.components.get(component.ID).set(entity, new Proxy(component, componentProxyHandler));

        this.emit(event, entity, component.ID);
        return component;
    }

    addComponentFromObject(entity: string, componentType: ComponentId, componentData: Object): AbstractComponent {
        let componentConstructor = this.componentConstructors.get(componentType);
        if (!componentConstructor) {
            this.logger.warn('Tried to add non-registered component type from object:', componentType);
            return;
        }

        let component = new (componentConstructor as any)();
        component.update(componentData);

        return this.addComponent(entity, component);
    }

    removeComponentType(entity: string, type: ComponentId) {
        let componentEntities = this.components.get(type);
        let component = componentEntities.get(entity);
        if (component) {
            component.dispose(this); // Hook into component in case it needs to do some cleanup.
            componentEntities.delete(entity);
            this.emit(EntityManagerEvent.ComponentRemoved, entity, type);
        }
    }

    removeComponent(entity: string, component: AbstractComponent) {
        this.removeComponentType(entity, component.typeName());
    }

    cleanComponents() {
        // Remove entities marked for removal.
        this.removedEntities.forEach(entity => {
            this.components.forEach((entities, type) => {
                if (entities.has(entity)) this.removeComponentType(entity, type);
            });
        });
        this.removedEntities.clear();

        // Reset dirty state for all components.
        this.components.forEach(entityComponent => {
            entityComponent.forEach((component) => {
                component.dirtyFields.clear();
            });
        });
    }

    // Event related
    addEventListener(eventType: EntityManagerEvent, callback: Function) {
        this.eventHandlers[eventType].push(callback);
    }

    private emit(eventType: EntityManagerEvent, entity: string, data?: any) {
        this.eventHandlers[eventType].forEach((callback) => {
            callback(entity, data);
        })
    }
}
