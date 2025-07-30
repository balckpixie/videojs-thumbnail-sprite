import videojs from 'video.js';
// initializeThumbnailSpriteはイベントリスナーの登録のみを行うように変更
import initializeThumbnailSprite from './utils/initializeThumbnailSprite'; 
// データ処理関数はプラグイン内で直接管理
import sortSprites from './utils/sortSprites';
import checkOverlap from './utils/checkOverlap';
import checkOptions from './utils/checkOptions';

// Video.jsの基本プラグインクラスを取得
const Plugin = videojs.getPlugin('plugin');

/**
 * Video.jsのサムネイルスプライトプラグイン
 * プレイヤーのプログレスバーにサムネイルプレビューを表示します。
 */
class ThumbnailSprite extends Plugin {
  // プラグインのオプションを保持するプライベートプロパティ
  public options: ThumbnailSprite.Options; // generatePreviewからアクセスできるようにpublicに変更

  /**
   * ThumbnailSpriteプラグインのコンストラクタ
   * @param player Video.jsプレイヤーインスタンス
   * @param options プラグインの初期オプション
   */
  constructor(player: videojs.Player, options?: ThumbnailSprite.Options) {
    super(player); // 親クラスのコンストラクタを呼び出す

    // デフォルトの空のスプライト配列を定義
    const defaultSprites: Array<ThumbnailSprite.Sprite> = [];

const spritesFromOptions = options?.sprites;
this.options = {
  sprites: Array.isArray(spritesFromOptions) ? spritesFromOptions : defaultSprites,
};
    
    // 初期スプライトデータを処理
    this._processSprites();

    // プレイヤーの準備ができたときにプラグインを初期化（イベントリスナー登録など）
    // initializeThumbnailSpriteにプラグインインスタンス自身を渡す
    this.player.ready(() => {
      initializeThumbnailSprite(
        this.player, // 現在のプレイヤーインスタンス
        this,         // プラグインインスタンス自身を渡す
      );
    });
  }

  /**
   * スプライトデータをソートし、重複やオプションをチェックするヘルパーメソッド
   * スプライトデータが変更されるたびに呼び出されます。
   */
private _processSprites(): void {
  const sprites = this.options?.sprites ?? [];

  if (sprites.length === 0) {
    return;
  }

  sortSprites(sprites);
  checkOverlap(sprites);
  checkOptions(sprites);
}

  /**
   * サムネイルスプライトデータを更新します。
   * 新しいスプライトデータが提供されると、既存のデータを上書きし、表示を更新します。
   * @param options 更新するスプライトデータを含むオプションオブジェクト
   */
  public updateSprites(options?: ThumbnailSprite.Options): void { // 引数を変更
    const newSprites = options?.sprites; // オプションオブジェクトからスプライト配列を取得

    // newSprites が配列であることを確認します。
    if (!newSprites || !Array.isArray(newSprites)) {
      console.error("ThumbnailSprite: updateSprites に配列ではないデータ、または無効なオプションが渡されました。ThumbnailSprite.Options 型で sprites プロパティが必要です。", options);
      this.options.sprites = []; // エラーを防ぐために空の配列にリセット
      return; // エラーの場合は処理を中断
    } else {
      this.options.sprites = newSprites; // 内部のオプションを更新
    }
    
    // スプライトデータを更新後、再度処理を実行
    this._processSprites();

    // initializeThumbnailSpriteを再度呼び出す必要はありません。
    // イベントリスナーは既に登録されており、generatePreviewは最新のthis.options.spritesを参照します。
  }

}

// 'thumbnailSprite' という名前でプラグインをVideo.jsに登録
// これにより、player.thumbnailSprite() でこのプラグインにアクセスできるようになります。
videojs.registerPlugin('thumbnailSprite', ThumbnailSprite);

/**
 * ThumbnailSpriteプラグインに関連するインターフェースと型定義
 */
namespace ThumbnailSprite {
  /**
   * プラグインのオプションインターフェース
   * 今後の機能拡張（例：スタイル設定など）のために拡張可能です。
   */
  export interface Options {
    sprites: Array<Sprite>; // サムネイルスプライトのデータ配列
  }

  /**
   * 個々のサムネイルスプライトのインターフェース
   */
  export interface Sprite {
    url: string;        // サムネイルスプライト画像のURL
    start: number;      // ビデオ内のこのスプライトの開始タイムスタンプ（秒）
    duration: number;   // ビデオ内のこのスプライトの期間（秒）
    width: number;      // スプライトシート内の各プレビュー画像の幅（ピクセル）
    height: number;     // スプライトシート内の各プレビュー画像の高さ（ピクセル）
    interval: number;   // スプライトシート内の各プレビュー画像の間隔（秒）
  };

  /**
   * インデックス可能なVideo.jsコンポーネントのインターフェース
   * 動的なプロパティアクセスを可能にするために使用されます。
   */
  export interface IIndexableComponent extends videojs.Component {
    [key: string]: any; // 任意の文字列キーを持つプロパティを許可
  }
}

// ThumbnailSpriteクラスをデフォルトエクスポート
export default ThumbnailSprite;
