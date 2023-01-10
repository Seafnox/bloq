import { AssetName } from '../three/AssetName';
import {State} from "./State";
import MenuState from "./MenuState";
import HTMLParser from "../three/HTMLParser";
import pickup from '../assets/sound/pickup.ogg';
import dig from '../assets/sound/dig.ogg';
import walk from '../assets/sound/walk.ogg';
import music from '../assets/sound/music.ogg';
import textures from '../assets/images/textures.png';
import playerObj from '../assets/player.glb';

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
        console.log(this.constructor.name, 'tick()');
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
        this.assetManager.addTexture(AssetName.BlockTexture, textures);

        // Meshes
        this.assetManager.addMesh('player', playerObj);

        // Music
        this.assetManager.addMusic(AssetName.BackgroundMusic, music);

        // Sound effects
        this.assetManager.addSound(AssetName.WalkSound, walk);
        this.assetManager.addSound(AssetName.DigSound, dig);
        this.assetManager.addSound(AssetName.PickupSound, pickup);

        this.assetManager.load((description: string, progress: number) => {
            this.progressDescription = description;
            this.progress = progress;

            if (this.progress >= 1.0) {
                this.transitionTo(new MenuState());
            }
        });
    }
}
