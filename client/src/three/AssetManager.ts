import { TextureLoader, NearestFilter, Texture } from 'three';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { getAnimatedMesh, AnimatedMesh } from './AnimatedMesh';
import { AssetName } from './AssetName';
import Sound from "./Sound";


export default class AssetManager {
    private isLoaded: boolean;
    private filesDone: number = 0;
    private totalFiles: number = 0;

    // Type specific loaders
    private textureLoader: TextureLoader = new TextureLoader();
    private objectLoader: GLTFLoader = new GLTFLoader();

    // Where and how to direct sounds to
    private audioContext: AudioContext;
    private gain: GainNode;

    private queue: {
        textures: Array<[string, string]>,
        objects: Array<[string, string]>,
        music: Array<[string, string]>,
        sounds: Array<[string, string]>
    };

    private assets: {
        textures: Map<string, Texture>,
        objects: Map<string, AnimatedMesh>,
        music: Map<string, HTMLAudioElement>,
        sounds: Map<string, Sound>
    };

    constructor(audioContext: AudioContext, gain: GainNode) {
        this.audioContext = audioContext;
        this.gain = gain;

        this.queue = {
            textures: [],
            objects: [],
            music: [],
            sounds: [],
        };
        this.assets = {
            textures: new Map<string, Texture>(),
            objects: new Map<string, AnimatedMesh>(),
            music: new Map<string, HTMLAudioElement>(),
            sounds: new Map<string, Sound>()
        };
    }

    addTexture(name: string, url: string) {
        this.queue.textures.push([name, url]);
    }

    addMesh(name: string, url: string) {
        this.queue.objects.push([name, url]);
    }

    addMusic(name: string, url: string) {
        this.queue.music.push([name, url]);
    }

    addSound(name: string, url: string) {
        this.queue.sounds.push([name, url]);
    }

    private getQueueLength() {
        return this.queue.textures.length + this.queue.objects.length + this.queue.music.length + this.queue.sounds.length;
    }

    load(callback: Function) {
        if (this.isLoaded) return;

        this.filesDone = 0;
        this.totalFiles = this.getQueueLength() + 1;

        this.loadTextures(callback, () => {
            this.queue.textures = [];
            this.loadMeshes(callback, () => {
                this.queue.objects = [];
                this.loadMusic(callback, () => {
                    this.queue.music = [];
                    this.loadSounds(callback, () => {
                        this.queue.sounds = [];
                        this.isLoaded = true;
                        callback('complete', 1.0);
                    });
                });
            });
        });
    }

    private loadTextures(progress: Function, done: Function) {
        let filesDone = 0;

        this.queue.textures.forEach(pair => {
            let [name, url] = pair;
            this.textureLoader.load(url, texture => {
                texture.minFilter = NearestFilter;
                texture.magFilter = NearestFilter;
                this.assets.textures.set(name, texture);

                filesDone++;
                this.filesDone++;
                progress('textures', this.filesDone / this.totalFiles);

                if (filesDone == this.queue.textures.length) done();
            });
        });
    }

    private loadMeshes(progress: Function, done: Function) {
        let filesDone = 0;

        const _done = (name: string) => {
            filesDone++;
            this.filesDone++;
            progress('models', this.filesDone / this.totalFiles);
            console.log('MeshLoadDone', name, '\t', this.filesDone, '/', this.totalFiles)

            if (filesDone == this.queue.objects.length) done();
        };

        this.queue.objects.forEach(pair => {
            let [name, url] = pair;
            console.log('MeshLoadStart', name, url);
            this.objectLoader.load(
                url,
                this.onMeshLoaded.bind(this, name, _done),
                this.onMeshProgress.bind(this, name),
                this.onMeshError.bind(this, name),
            );
        });
    }

    private onMeshLoaded(name: string, done: (name: string) => void, imported: GLTF) {
        // TODO possibly not work
        this.assets.objects.set(name, getAnimatedMesh(imported.scene, imported.animations, imported));
        done(name);
    }

    private onMeshProgress(name: string, request: ProgressEvent) {
        console.log('MeshLoadProgress', name, request);
    }
    private onMeshError(name: string, error: ErrorEvent) {
        console.log('MeshLoadError', name, error);
    }

    private loadMusic(progress: Function, done: Function) {
        let filesDone = 0;

        this.queue.music.forEach(pair => {
            let [name, url] = pair;

            let el = document.createElement('audio');
            el.setAttribute('src', url);
            el.load();

            let canPlayThrough = () => {
                this.assets.music.set(name, el);

                filesDone++;
                this.filesDone++;
                progress(AssetName.BackgroundMusic, this.filesDone / this.totalFiles);
                el.removeEventListener('canplaythrough', canPlayThrough, false);

                if (filesDone == this.queue.music.length) done();
            };

            el.addEventListener('canplaythrough', canPlayThrough, false);
        });
    }

    private loadSounds(progress: Function, done: Function) {
        let filesDone = 0;
        let audioCtx = new AudioContext();

        this.queue.sounds.forEach(pair => {
            let [name, url] = pair;
            let req = new XMLHttpRequest();
            req.responseType = 'arraybuffer';
            req.addEventListener('load', () => {
                let data = req.response;
                audioCtx.decodeAudioData(data, (buffer) => {
                    this.assets.sounds.set(name, new Sound(this.audioContext, buffer, this.gain));

                    filesDone++;
                    this.filesDone++;
                    progress('sounds', this.filesDone / this.totalFiles);

                    if (filesDone == this.queue.sounds.length) done();
                });
            });
            req.open('GET', url);
            req.send();
        });
    }

    getTexture(name: string): Texture {
        return this.assets.textures.get(name);
    }

    getObject(name: string): AnimatedMesh {
        return this.assets.objects.get(name);
    }

    getMusic(name: string): HTMLAudioElement {
        return this.assets.music.get(name);
    }

    getSound(name: string): Sound {
        return this.assets.sounds.get(name);
    }
}
