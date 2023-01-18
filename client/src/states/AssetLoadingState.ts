import {State} from "./State";
import MenuState from "./MenuState";
import HTMLParser from "../three/HTMLParser";
import terrainTexture from '../../assets/textures.png';
import playerTexture from '../../assets/player.png';
import playerModel from '../../assets/player.mesh';
import backgroundMusic from '../../assets/sound/music.ogg';
import walkSound from '../../assets/sound/walk.ogg';
import digSound from '../../assets/sound/dig.ogg';
import pickupSound from '../../assets/sound/pickup.ogg';

const html = `
    <div id="loader">
        <style></style>
        <progress value="0" max="1"></progress>
    </div>
`;

export default class AssetLoadingState extends State {
    private progressDescription: string;
    private progress: number = 0;

    private loaderNode: Element;
    private styleNode: HTMLStyleElement;
    private progressNode: HTMLProgressElement;

    constructor() {
        super();
        let parser = new HTMLParser();
        this.loaderNode = parser.parse(html);
    }

    onEnter() {
        this.loadAssets();

        document.body.appendChild(this.loaderNode);
        this.styleNode = this.loaderNode.querySelector('style') as HTMLStyleElement;
        this.progressNode = this.loaderNode.querySelector('progress') as HTMLProgressElement;
    }

    onExit() {
        document.body.removeChild(this.loaderNode);
    }

    tick(dt: number) {
        // Update progress bar.
        if (this.progress != this.progressNode.value) {
            this.progressNode.value = this.progress;

            let percent = (this.progress * 100.0) | 0;
            this.styleNode.innerHTML = `
            #loader progress:before {
                content: 'Loading ${this.progressDescription} (${percent}%)'
            }`;
        }
    }

    private loadAssets() {
        // Textures
        this.assetManager.addTexture('terrain', terrainTexture);
        this.assetManager.addTexture('player', playerTexture);

        // Meshes
        this.assetManager.addMesh('player', playerModel);

        // Music
        this.assetManager.addMusic('music', backgroundMusic);

        // Sound effects
        this.assetManager.addSound('walk', walkSound);
        this.assetManager.addSound('dig', digSound);
        this.assetManager.addSound('pickup', pickupSound);

        this.assetManager.load((description, progress) => {
            this.progressDescription = description;
            this.progress = progress;

            if (this.progress >= 1.0) {
                this.transitionTo(new MenuState());
            }
        });
    }
}
