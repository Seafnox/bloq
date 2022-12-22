import { AbstractComponentData } from '@block/shared/components/abstractComponent';
import { SerializableComponentData } from '@block/shared/components/serializableComponent';
import { ComponentId } from '@block/shared/constants/componentId';
import { EntityMessage, ComponentMap } from '@block/shared/entityMessage';
import { NetworkComponentData } from '../components/networkComponent';

export interface ServerEntityMessage extends EntityMessage<ServerComponentMap> {}

export interface ServerComponentMap extends ComponentMap {
    // Server
    [ComponentId.Network]: NetworkComponentData;
    [ComponentId.NewPlayer]: AbstractComponentData;
    [ComponentId.Pickable]: SerializableComponentData;

}
