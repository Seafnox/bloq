import uuid = require('node-uuid');

import {Component, SerializableComponent, PositionComponent} from "./components";
import {ComponentId} from "./constants";

let componentProxyHandler = {
    // get: (target, name) => {
    //     return target[name];
    // },
    set: (obj, prop, value) => {
        if (prop != 'dirtyFields' && obj[prop] !== value) {
            if (prop === 'primaryAction') console.log('New: ', value, "Old: ", obj[prop]);
            (obj as Component).dirtyFields[prop] = true;
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
    private components: Map<ComponentId, Map<string, Component>>;
    private componentConstructors: Map<ComponentId, Function>;

    private eventHandlers: Array<Array<Function>> = [];

    constructor() {
        this.components = new Map<ComponentId, Map<string, Component>>();
        this.componentConstructors = new Map<ComponentId, Function>();

        for(let i = 0; i < EntityManagerEvent.NumEvents; i++) {
            this.eventHandlers.push([]);
        }
    }

    registerComponentType(instance: Component) {
        let type = instance.typeName();
        if (this.componentConstructors.has(type)) {
            console.warn(`Component type "${type} already registered.`);
            return;
        }
        this.componentConstructors.set(type, instance.constructor);
        this.components.set(type, new Map<string, Component>());
    }

    getRegisteredComponentTypes(): Iterator<ComponentId> {
        return this.componentConstructors.keys();
    }

    createEntity() {
        let entity = uuid.v4();
        this.emit(EntityManagerEvent.EntityCreated, entity);
        return entity;
    }

    serializeEntity(entity: string, withComponents: Array<ComponentId> = null) {
        // Each component needs to be serialized individually, then a JSON string is manually created.
        // Just using JSON.stringify would cause each component's serialized string to be escaped.

        if (!withComponents) withComponents = Array.from(this.componentConstructors.keys());

        let components = [];
        withComponents.forEach(typeName => {
            let component = this.components.get(typeName).get(entity);
            if (component instanceof SerializableComponent) {
                components.push(`"${typeName}":${component.serialize()}`);
            } else if (!component) {
                console.error(`Tried to serialize ${component}`)
            } else {
                console.warn(`Tried to serialize non-serializeable component: "${component.typeName()}"`)
            }
        });

        return `{"entity":"${entity}","components":{${components.join(',')}}}`;
    }

    deserializeAndSetEntity(json: string) {
        let obj = JSON.parse(json);

        // Extract entity UUID and component data.
        let entity = obj['entity'];
        let components = obj['components'];

        // Loop over and construct new instances of components.
        for (let type in components) {
            if (!components.hasOwnProperty(type)) continue;
            let typeI = parseInt(type);

            let data = components[type];
            let constructor = this.componentConstructors.get(typeI as ComponentId);
            if (!constructor) {
                console.error('Tried to deserialize unknown component:', type);
                continue;
            }

            let instance = new (constructor as any)();
            instance.update(data);

            // Finally, add / set component in entity manager.
            this.addComponent(entity, instance);
        }
    }

    removeEntity(entity: string) {
        let entityExisted = false;
        let inChunk = null;
        this.components.forEach((entities, type) => {
            if (entities.has(entity)) {
                // I don't like having to reference a specific component inside the EntityManager,
                // but the event handlers need to know from what chunk the entity was removed,
                // to broadcast the info to clients efficiently.
                // An alternative solution would be to not remove the entity in removeEntity, but only
                // schedule for removal.
                if(type === ComponentId.Position) {
                    inChunk = this.getComponent<PositionComponent>(entity, ComponentId.Position).toChunk();
                }
                this.removeComponentType(entity, type);
                entityExisted = true;
            }
        });

        if (entityExisted && inChunk) {
            this.emit(EntityManagerEvent.EntityRemoved, entity, inChunk);
        }
    }

    getEntities(componentType: ComponentId): Map<string, Component> {
        return this.components.get(componentType);
    }

    hasComponent(entity: string, componentType: ComponentId): boolean {
        return this.components.get(componentType).has(entity);
    }

    getComponent<T>(entity: string, componentType: ComponentId): T {
        return this.components.get(componentType).get(entity) as T;
    }

    addComponent(entity: string, component: Component): Component {
        let event;
        if (this.components.get(component.ID).has(entity)) event = EntityManagerEvent.ComponentReplaced;
        else event = EntityManagerEvent.ComponentAdded;

        this.components.get(component.ID).set(entity, new Proxy(component, componentProxyHandler));

        this.emit(event, entity, component.ID);
        return component;
    }

    removeComponentType(entity: string, type: ComponentId) {
        let componentEntities = this.components.get(type);
        let component = componentEntities.get(entity);
        if (component) {
            component.dispose(); // Hook into component in case it needs to do some cleanup.
            componentEntities.delete(entity);
            this.emit(EntityManagerEvent.ComponentRemoved, entity, type);
        }
    }

    removeComponent(entity, component: Component) {
        this.removeComponentType(entity, component.typeName());
    }

    cleanComponents() {
        this.components.forEach((entityComponent) => {
            entityComponent.forEach((component) => {
                Object.keys(component.dirtyFields).forEach(key => {
                    if (component.dirtyFields[key]) component.dirtyFields[key] = false;
                });
            })
        })
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