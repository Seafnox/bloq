import { ComponentId } from '../constants/componentId';
import { Side } from '../constants/side';
import { SerializableComponent, SerializableComponentData } from './serializableComponent';

export interface InputComponentData extends SerializableComponentData {
    moveForward: boolean;
    moveLeft: boolean;
    moveRight: boolean;
    moveBackward: boolean;
    jump: boolean;

    primaryAction: boolean;
    secondaryAction: boolean;
    target: [number, number, number];
    targetSide: Side;

    scrollDirection: number;

}
export class InputComponent extends SerializableComponent<InputComponentData> implements InputComponentData {
    static ID = ComponentId.Input;

    moveForward: boolean = false;
    moveLeft: boolean = false;
    moveRight: boolean = false;
    moveBackward: boolean = false;
    jump: boolean = false;

    primaryAction: boolean = false; // Left mouse button
    secondaryAction: boolean = false; // Right mouse button
    target: [number, number, number] = [0, 0, 0]; // Where in space the action is performed.
    targetSide: Side = null;

    scrollDirection: number = 0;
}
