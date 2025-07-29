import videojs from 'video.js';
import sortSprites from './utils/sortSprites';
import checkOverlap from './utils/checkOverlap';
import checkOptions from './utils/checkOptions';
import generatePreview from './utils/generatePreview';

const Plugin = videojs.getPlugin('plugin');

class ThumbnailSprite extends Plugin {
  private sprites: ThumbnailSprite.Sprite[] = [];
  private controls?: ThumbnailSprite.IIndexableComponent;
  private progressCtrl?: ThumbnailSprite.IIndexableComponent;

  constructor(player: videojs.Player, options?: ThumbnailSprite.Options) {
    super(player);

    const sprites = options?.sprites || [];

    // 先に player にメソッドをバインド
    (player as any).thumbnailSprite = (opts: ThumbnailSprite.Options) => {
      if (this.sprites.length > 0) {
        this.removeEventHandlers();
        player.removeClass('vjs-sprite-thumbnails');
        const previewEl = player.el().querySelector('.vjs-thumbnail-preview');
        if (previewEl?.parentNode) {
          previewEl.parentNode.removeChild(previewEl);
        }
        this.sprites = [];
      }
      if (opts?.sprites) {
        this.setupSprites(opts.sprites);
      }
    };

    (player as any).resetThumbnailSprite = () => {
      this.removeEventHandlers();
      player.removeClass('vjs-sprite-thumbnails');
      const previewEl = player.el().querySelector('.vjs-thumbnail-preview');
      if (previewEl?.parentNode) {
        previewEl.parentNode.removeChild(previewEl);
      }
      this.sprites = [];
    };

    (player as any).hasThumbnailSprites = () => {
      return this.sprites.length > 0;
    };

    // DOMがreadyになったらUI部品にアクセス
    this.player.ready(() => {
      if (!player.controlBar) return;

      this.controls = player.controlBar as ThumbnailSprite.IIndexableComponent;
      if (!this.controls['progressControl']) return;

      this.progressCtrl = this.controls['progressControl'] as ThumbnailSprite.IIndexableComponent;

      if (sprites.length > 0) {
        this.setupSprites(sprites);
      }
    });
  }

  private setupSprites(sprites: ThumbnailSprite.Sprite[]) {
    this.sprites = sprites;

    sortSprites(this.sprites);
    checkOverlap(this.sprites);
    checkOptions(this.sprites);

    this.removeEventHandlers();
    this.addEventHandlers();

    this.player.addClass('vjs-sprite-thumbnails');
  }

  private addEventHandlers() {
    if (!this.progressCtrl) return;
    const handler = () => generatePreview(this.player, this.controls!, this.sprites);
    this.progressCtrl.on('mousemove', handler);
    this.progressCtrl.on('touchmove', handler);
  }

  private removeEventHandlers() {
    if (!this.progressCtrl) return;
    this.progressCtrl.off('mousemove');
    this.progressCtrl.off('touchmove');
  }
}

videojs.registerPlugin('thumbnailSprite', ThumbnailSprite);

namespace ThumbnailSprite {
  export interface Options {
    sprites: Array<Sprite>;
  }

  export interface Sprite {
    url: string;
    start: number;
    duration: number;
    width: number;
    height: number;
    interval: number;
  }

  export interface IIndexableComponent extends videojs.Component {
    [key: string]: any;
  }
}

export default ThumbnailSprite;
