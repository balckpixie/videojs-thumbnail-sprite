import videojs from 'video.js';
// ThumbnailSprite クラスを正しくインポート
import ThumbnailSprite from '../index'; 

// データ処理関数はプラグイン内で直接管理されるため、ここではインポートしません。
// import sortSprites from './sortSprites';
// import checkOverlap from './checkOverlap';
// import checkOptions from './checkOptions';

// generatePreview 関数は、プラグインインスタンスを引数として受け取るように変更済み
import generatePreview from './generatePreview';

/**
 * サムネイルスプライトの初期化とイベントリスナーの登録を行います。
 * この関数は、プレイヤーの準備ができたときに一度だけ呼び出されることを想定しています。
 * データ処理（ソート、チェック）は ThumbnailSprite クラスの _processSprites メソッドで行われます。
 * * @param player Video.jsプレイヤーインスタンス
 * @param pluginInstance ThumbnailSprite プラグインのインスタンス
 */
function initializeThumbnailSprite(player: videojs.Player, pluginInstance: ThumbnailSprite): void {
  // プラグインインスタンスからオプションにアクセス
  const options = pluginInstance.options;

  // オプションまたはスプライトデータがない場合は処理を中断
  // スプライト配列のチェックは _processSprites で行われるため、ここでは undefined のみチェック
  if (options.sprites === undefined) {
    console.warn("ThumbnailSprite: 初期スプライトオプションが未定義です。プレビューは初期化されません。");
    return;
  }

  // コントロールバーまたはプログレスコントロールが存在しない場合は処理を中断
  if (player.controlBar === undefined) {
    console.warn("ThumbnailSprite: コントロールバーが見つかりません。プレビューは初期化されません。");
    return;
  }
 
  // player.controlBar を ThumbnailSprite.IIndexableComponent 型にアサーション
  // これにより、'progressControl' プロパティに安全にアクセスできます。
  const controls: ThumbnailSprite.IIndexableComponent = player.controlBar as ThumbnailSprite.IIndexableComponent;
  
  if (controls['progressControl'] === undefined) {
    console.warn("ThumbnailSprite: プログレスコントロールが見つかりません。プレビューは初期化されません。");
    return;
  }
  
  const progressCtrl: ThumbnailSprite.IIndexableComponent = controls['progressControl'];

  // イベントリスナーを登録し、プラグインインスタンスを渡す
  // これにより、generatePreviewは常に最新のpluginInstance.options.spritesを参照できます。
  progressCtrl.on(`mousemove`, () => generatePreview(player, controls, pluginInstance));
  progressCtrl.on(`touchmove`, () => generatePreview(player, controls, pluginInstance));
  
  // スタイルを有効にするためのクラスを追加
  player.addClass(`vjs-sprite-thumbnails`);
}

export default initializeThumbnailSprite;
