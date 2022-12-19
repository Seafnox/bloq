export default class MouseManager {
    x: number = 0;
    y: number = 0;
    scroll: number = 0;
    private buttonsPressed: [boolean, boolean, boolean] =  [false, false, false];

    constructor(target: Element) {
        target.addEventListener('mousemove', evt => {
            this.x += (evt as MouseEvent).movementX;
            this.y += (evt as MouseEvent).movementY;
        }, false);

        target.addEventListener('mousedown', evt => {
            this.buttonsPressed[(evt as MouseEvent).button] = true;
        }, false);

        target.addEventListener('mouseup', evt => {
            this.buttonsPressed[(evt as MouseEvent).button] = false;
        }, false);

        target.addEventListener('wheel', (event: WheelEvent) => {
            if(event.deltaY < 0) this.scroll = -1;
            else if(event.deltaY > 0) this.scroll = 1;
        }, false);
    }

    // Return difference from last call
    delta(): [number, number, number] {
        let [dx, dy, scroll] = [this.x, this.y, this.scroll];
        this.x = 0;
        this.y = 0;
        this.scroll = 0;
        return [dx, dy, scroll];
    }

    isLeftButtonPressed() { return this.buttonsPressed[0]; }
    isMiddleButtonPressed() { return this.buttonsPressed[1]; }
    isRightButtonPressed() { return this.buttonsPressed[2]; }
}
