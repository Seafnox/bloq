import { ComponentId } from '../constants/componentId';
import { AbstractComponent, AbstractComponentData } from './abstractComponent';

export interface OnGroundComponentData extends AbstractComponentData {
    canJump: boolean;
}

export class OnGroundComponent extends AbstractComponent<OnGroundComponentData> implements OnGroundComponentData {
    static ID = ComponentId.OnGround;

    canJump: boolean = true;
}
