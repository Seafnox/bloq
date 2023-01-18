import { AbstractComponentData } from '@block/shared/components/abstractComponent';
import { SerializableComponentData } from '@block/shared/components/serializableComponent';
import { ComponentId } from '@block/shared/constants/ComponentId';
import { EntityMessage, ComponentMap } from '@block/shared/EntityMessage';
import { NetworkComponentData } from '../components/NetworkComponent';

export interface ServerEntityMessage extends EntityMessage<ServerComponentMap> {}

export interface ServerComponentMap extends ComponentMap {
    // Server
    [ComponentId.Network]: NetworkComponentData;
    [ComponentId.NewPlayer]: AbstractComponentData;
    [ComponentId.Pickable]: SerializableComponentData;

}
