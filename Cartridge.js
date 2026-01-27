export class Cartridge {
  /** リセット処理 */
  static onReset({ pads, speakers, screens }) {
    this.pads = pads;
    this.speakers = speakers;
    this.screens = screens;

    // 画面設定 (160x120)
    this.SCREEN_WIDTH = 160;
    this.SCREEN_HEIGHT = 120;
    this.screens[0].setViewBox(0, 0, this.SCREEN_WIDTH, this.SCREEN_HEIGHT);

    // 定数
    this.GRAVITY = 0.15;
    this.JUMP_POWER = -2.5;
    this.MOVE_SPEED = 1.0;
    this.GROUND_Y = 100;
    this.TILE_SIZE = 8;
    this.MUSHROOM_SPEED = 0.2;
    this.MONSTER_SPEED = 0.4;

    // ステージデータ定義
    this.stages = [
      // ステージ1（草原）
      {
        groundColors: [null, 10, 6, 8],  // 緑、茶色系
        stairColors: [null, 8, 7],       // 灰色系
        castleColors: [null, 7, 0, 6],   // 灰色、黒、茶色
        bgColor: 12,                      // 明青（空）
        data: [
          1, 1, 1, 1, 1, 1, 1, 1,
          1, 1, 2, 2, 1, 1, 1, 1,
          1, 1, 3, 3, 3, 1, 1, 1,
          1, 1, 1, 1, 1, 1, 1, 1,
          1, 2, 2, 1, 1, 3, 3, 1,
          1, 1, 3, 3, 3, 3, 1, 1,
          1, 1, 1, 1, 1, 1, 1, 1,
          1, 2, 2, 1, 2, 2, 1, 1,
          1, 1, 1, 3, 3, 3, 3, 1,
          1, 1, 1, 1, 1, 1, 1, 1,
          1, 1, 2, 2, 1, 1, 2, 2,
          1, 1, 1, 3, 3, 1, 1, 1,
          1, 1, 1, 1, 1, 1, 1, 4,
        ],
        stairs: {
          18: 8, 19: 16, 20: 24,
          37: 8, 38: 16,
          42: 8, 43: 16, 44: 24, 45: 32,
          67: 8, 68: 16, 69: 24, 70: 32,
          91: 8, 92: 16,
        },
        enemies: [
          { x: 50 }, { x: 150 }, { x: 280 }, { x: 400 },
          { x: 520 }, { x: 650 }, { x: 750 },
        ],
      },
      // ステージ2（夕暮れ）
      {
        groundColors: [null, 3, 6, 1],   // 黄色、茶色、赤系
        stairColors: [null, 6, 3],       // 茶色、黄色
        castleColors: [null, 8, 0, 1],   // 暗灰色、黒、赤
        bgColor: 9,                       // 明赤（夕焼け）
        data: [
          1, 1, 1, 1, 1, 1, 1, 1,
          1, 2, 2, 1, 2, 2, 1, 1,
          1, 1, 3, 3, 3, 3, 3, 1,
          1, 1, 1, 1, 1, 1, 1, 1,
          1, 2, 2, 2, 1, 1, 3, 3,
          3, 3, 1, 1, 2, 2, 2, 1,
          1, 1, 1, 3, 3, 3, 1, 1,
          1, 2, 2, 1, 1, 2, 2, 1,
          1, 1, 3, 3, 3, 3, 3, 3,
          1, 1, 1, 1, 1, 1, 1, 1,
          1, 2, 2, 2, 1, 2, 2, 2,
          1, 1, 1, 3, 3, 3, 3, 1,
          1, 1, 1, 1, 1, 1, 1, 1,
          1, 2, 2, 1, 1, 1, 2, 2,
          1, 1, 1, 1, 1, 1, 1, 4,
        ],
        stairs: {
          18: 8, 19: 16, 20: 24, 21: 32, 22: 40,
          38: 8, 39: 16,
          40: 24, 41: 32,
          51: 8, 52: 16, 53: 24,
          66: 8, 67: 16, 68: 24, 69: 32, 70: 40, 71: 48,
          91: 8, 92: 16, 93: 24, 94: 32,
        },
        enemies: [
          { x: 40 }, { x: 120 }, { x: 200 }, { x: 300 },
          { x: 400 }, { x: 500 }, { x: 600 }, { x: 700 },
          { x: 800 }, { x: 900 },
        ],
      },
    ];

    // 現在のステージ
    this.currentStage = 0;

    // スプライト配列
    this.groundSprites = [];
    this.stairSprites = [];
    this.castleSprite = null;
    this.enemies = [];

    // ゲーム状態
    this.gameState = "title"; // "title", "playing", "gameover", "clear", "allclear"

    this.initSprites();
    this.showTitle();
  }

  /** ステージ読み込み */
  static loadStage(stageNum) {
    const stage = this.stages[stageNum];
    this.stageData = stage.data;
    this.stairHeights = stage.stairs;
    this.enemySpawns = stage.enemies;
    this.STAGE_LENGTH = this.stageData.length * this.TILE_SIZE;
    // 色情報
    this.groundColors = stage.groundColors;
    this.stairColors = stage.stairColors;
    this.castleColors = stage.castleColors;
    this.bgColor = stage.bgColor;
  }

  /** タイトル画面表示 */
  static showTitle() {
    this.gameState = "title";
    this.clearAllSprites();

    // 背景
    this.screens[0].setViewBox(0, 0, this.SCREEN_WIDTH, this.SCREEN_HEIGHT);

    // タイトル
    this.titleText = this.screens[0].addText("BEAR", {
      x: 56,
      y: 30,
      colorIds: [null, 6],
    });
    this.titleText2 = this.screens[0].addText("ADVENTURE", {
      x: 40,
      y: 42,
      colorIds: [null, 6],
    });

    // くまさん表示
    this.titleBear = this.screens[0].addSprite(this.bearPattern, {
      colorIds: [null, 16, 0, 1], // 茶色、黒(目)、赤(鼻/口)
      x: 76,
      y: 55,
    });

    // スタート案内
    this.startText = this.screens[0].addText("PRESS Z", {
      x: 52,
      y: 90,
      colorIds: [null, 15],
    });

    this.blinkTimer = 0;
  }

  /** 全スプライト削除 */
  static clearAllSprites() {
    this.bgSprites?.forEach((s) => s?.remove());
    this.groundSprites?.forEach((s) => s?.sprite?.remove());
    this.stairSprites?.forEach((s) => s?.sprite?.remove());
    this.castleSprite?.remove();
    this.enemies?.forEach((e) => e.sprite?.remove());
    // くまさんスプライト
    this.playerStand?.remove();
    this.playerWalk1?.remove();
    this.playerWalk2?.remove();
    this.hpText?.remove();
    this.stageText?.remove();
    this.titleText?.remove();
    this.titleText2?.remove();
    this.titleBear?.remove();
    this.startText?.remove();
    this.messageText?.remove();
    this.restartText?.remove();

    this.bgSprites = [];
    this.groundSprites = [];
    this.stairSprites = [];
    this.enemies = [];
  }

  /** スプライトパターン初期化 */
  static initSprites() {
    // くまさん 立ち (8x10)
    this.bearPattern = [
      [0, 1, 1, 0, 0, 1, 1, 0],
      [0, 1, 1, 0, 0, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [1, 2, 1, 1, 1, 1, 2, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 3, 3, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 0, 1, 0, 0, 1, 0, 0],
      [0, 1, 1, 0, 0, 1, 1, 0],
    ];

    // くまさん 歩き1 (左足前)
    this.bearWalk1 = [
      [0, 1, 1, 0, 0, 1, 1, 0],
      [0, 1, 1, 0, 0, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [1, 2, 1, 1, 1, 1, 2, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 3, 3, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 0, 0, 0, 1, 0],
      [1, 1, 0, 0, 0, 1, 1, 0],
    ];

    // くまさん 歩き2 (右足前)
    this.bearWalk2 = [
      [0, 1, 1, 0, 0, 1, 1, 0],
      [0, 1, 1, 0, 0, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [1, 2, 1, 1, 1, 1, 2, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 3, 3, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 1, 0, 0, 0, 1, 1, 0],
      [0, 1, 1, 0, 1, 1, 0, 0],
    ];

    // キノコ (8x8)
    this.mushroomPattern = [
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 2, 2, 1, 1, 0],
      [1, 1, 2, 1, 1, 2, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 3, 3, 3, 3, 0, 0],
      [0, 0, 3, 3, 3, 3, 0, 0],
      [0, 3, 3, 3, 3, 3, 3, 0],
      [0, 3, 0, 0, 0, 0, 3, 0],
    ];

    // 怪獣 (10x12)
    this.monsterPattern = [
      [0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 2, 2, 1, 1, 1, 1, 2, 2, 1],
      [1, 2, 3, 1, 1, 1, 1, 2, 3, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 4, 4, 4, 4, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
      [0, 1, 1, 0, 0, 0, 0, 1, 1, 0],
      [1, 1, 0, 0, 0, 0, 0, 0, 1, 1],
    ];

    // 地面タイル (8x8)
    this.groundPattern = [
      [1, 1, 1, 1, 1, 1, 1, 1],
      [2, 2, 2, 2, 2, 2, 2, 2],
      [2, 3, 2, 2, 2, 2, 3, 2],
      [2, 2, 2, 3, 2, 2, 2, 2],
      [2, 2, 2, 2, 2, 3, 2, 2],
      [3, 2, 2, 2, 2, 2, 2, 3],
      [2, 2, 3, 2, 2, 2, 2, 2],
      [2, 2, 2, 2, 3, 2, 2, 2],
    ];

    // 階段ブロック (8x8)
    this.stairPattern = [
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 2, 2, 2, 2, 2, 2, 1],
      [1, 2, 2, 2, 2, 2, 2, 1],
      [1, 2, 2, 2, 2, 2, 2, 1],
      [1, 2, 2, 2, 2, 2, 2, 1],
      [1, 2, 2, 2, 2, 2, 2, 1],
      [1, 2, 2, 2, 2, 2, 2, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
    ];

    // お城 (16x24)
    this.castlePattern = [
      [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
      [1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1],
      [1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 2, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2, 1],
      [1, 2, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 2, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2, 1],
      [1, 2, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
      [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
      [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
      [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
      [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
      [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
      [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
      [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
      [1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1],
    ];
  }

  /** ステージ初期化 */
  static initStage() {
    // 全スプライトをクリア
    this.clearAllSprites();

    // ステージデータ読み込み
    this.loadStage(this.currentStage);

    // 背景スプライト（大きな矩形で背景色を表現）
    this.bgPattern = [
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
    ];
    this.bgSprites = [];
    // 背景を敷き詰める
    for (let bx = 0; bx < this.STAGE_LENGTH + this.SCREEN_WIDTH; bx += 8) {
      for (let by = 0; by < this.GROUND_Y; by += 8) {
        const bg = this.screens[0].addSprite(this.bgPattern, {
          colorIds: [null, this.bgColor],
          x: bx,
          y: by,
        });
        this.bgSprites.push(bg);
      }
    }

    // ステージ描画
    for (let i = 0; i < this.stageData.length; i++) {
      const tile = this.stageData[i];
      const x = i * this.TILE_SIZE;

      if (tile === 1 || tile === 4) {
        // 通常地面
        const ground = this.screens[0].addSprite(this.groundPattern, {
          colorIds: this.groundColors,
          x: x,
          y: this.GROUND_Y,
        });
        this.groundSprites.push({ sprite: ground, x: x });
      }

      if (tile === 3) {
        // 階段
        const height = this.stairHeights[i] || 8;
        const ground = this.screens[0].addSprite(this.groundPattern, {
          colorIds: this.groundColors,
          x: x,
          y: this.GROUND_Y,
        });
        this.groundSprites.push({ sprite: ground, x: x });

        // 階段ブロック
        for (let h = 0; h < height; h += 8) {
          const stair = this.screens[0].addSprite(this.stairPattern, {
            colorIds: this.stairColors,
            x: x,
            y: this.GROUND_Y - 8 - h,
          });
          this.stairSprites.push({ sprite: stair, x: x, height: height });
        }
      }

      if (tile === 4) {
        // お城
        this.castleSprite = this.screens[0].addSprite(this.castlePattern, {
          colorIds: this.castleColors,
          x: x - 4,
          y: this.GROUND_Y - 24,
        });
        this.goalX = x;
      }
    }

    // くまさん作成（3パターン）
    const bearColors = [null, 16, 0, 1]; // 茶色、黒(目)、赤(鼻/口)
    this.playerStand = this.screens[0].addSprite(this.bearPattern, {
      colorIds: bearColors,
    });
    this.playerWalk1 = this.screens[0].addSprite(this.bearWalk1, {
      colorIds: bearColors,
    });
    this.playerWalk2 = this.screens[0].addSprite(this.bearWalk2, {
      colorIds: bearColors,
    });
    this.playerWalk1.visible = false;
    this.playerWalk2.visible = false;

    // プレイヤー参照（メインスプライト）
    this.player = this.playerStand;
    this.currentBearSprite = "stand";

    // UIテキスト
    this.messageText = null;
    this.restartText = null;
  }

  /** 敵スポーン */
  static spawnEnemies() {
    this.enemies.forEach((e) => e.sprite?.remove());
    this.enemies = [];

    for (const spawn of this.enemySpawns) {
      this.spawnMushroom(spawn.x);
    }
  }

  /** キノコ生成 */
  static spawnMushroom(x) {
    const sprite = this.screens[0].addSprite(this.mushroomPattern, {
      colorIds: [null, 1, 15, 15], // 赤、白(模様)、白(軸)
      x: x,
      y: this.GROUND_Y - 8,
    });
    this.enemies.push({
      sprite: sprite,
      x: x,
      y: this.GROUND_Y - 8,
      type: "mushroom",
      hp: 1,
      width: 8,
      height: 8,
      speed: this.MUSHROOM_SPEED,
      damageTimer: 0,
    });
  }

  /** キノコ→怪獣変身 */
  static transformToMonster(enemy) {
    const x = enemy.x;
    enemy.sprite.remove();

    const sprite = this.screens[0].addSprite(this.monsterPattern, {
      colorIds: [null, 5, 15, 0, 1], // 紫、白(目)、黒(瞳)、赤(口)
      x: x,
      y: this.GROUND_Y - 12,
    });

    enemy.sprite = sprite;
    enemy.y = this.GROUND_Y - 12;
    enemy.baseY = this.GROUND_Y - 12;
    enemy.type = "monster";
    enemy.hp = 3;
    enemy.width = 10;
    enemy.height = 12;
    enemy.speed = this.MONSTER_SPEED;
    enemy.damageTimer = 30; // 変身後の無敵時間

    this.playTransformSound();
  }

  /** 怪獣ダメージ */
  static damageMonster(enemy) {
    enemy.hp--;
    enemy.damageTimer = 15; // ダメージエフェクト15フレーム

    if (enemy.hp <= 0) {
      enemy.sprite.remove();
      const index = this.enemies.indexOf(enemy);
      if (index > -1) {
        this.enemies.splice(index, 1);
      }
      this.playDefeatSound();
    } else {
      this.playStompSound();
    }
  }

  /** くまさんスプライト切り替え */
  static switchBearSprite(type) {
    if (this.currentBearSprite === type) return;

    // 現在の状態を保存
    const state = {
      x: this.player.x,
      y: this.player.y,
      vy: this.player.vy || 0,
      onGround: this.player.onGround,
      facingRight: this.player.facingRight,
      hp: this.player.hp,
      invincibleTimer: this.player.invincibleTimer || 0,
      animOffset: this.player.animOffset || 0,
      visible: this.player.visible,
    };

    // 全て非表示にして画面外へ
    this.playerStand.visible = false;
    this.playerWalk1.visible = false;
    this.playerWalk2.visible = false;
    this.playerStand.x = -100;
    this.playerWalk1.x = -100;
    this.playerWalk2.x = -100;

    // 指定したスプライトを選択
    let newSprite;
    if (type === "walk1") {
      newSprite = this.playerWalk1;
    } else if (type === "walk2") {
      newSprite = this.playerWalk2;
    } else {
      newSprite = this.playerStand;
    }

    // 状態を復元
    newSprite.x = state.x;
    newSprite.y = state.y;
    newSprite.vy = state.vy;
    newSprite.onGround = state.onGround;
    newSprite.facingRight = state.facingRight;
    newSprite.hp = state.hp;
    newSprite.invincibleTimer = state.invincibleTimer;
    newSprite.animOffset = state.animOffset;
    newSprite.visible = state.visible;

    this.player = newSprite;
    this.currentBearSprite = type;
  }

  /** ゲーム開始 */
  static startGame() {
    this.gameState = "playing";
    this.initStage();
    this.restart();
  }

  /** リスタート */
  static restart() {
    this.gameState = "playing";

    // カメラ位置
    this.cameraX = 0;

    // プレイヤー初期位置
    this.player.x = 16;
    this.player.y = this.GROUND_Y - 10;
    this.player.vy = 0;
    this.player.onGround = true;
    this.player.facingRight = true;
    this.player.hp = 5;
    this.player.invincibleTimer = 0;

    this.messageText?.remove();
    this.restartText?.remove();
    this.hpText?.remove();
    this.stageText?.remove();
    this.messageText = null;
    this.restartText = null;

    // ステージ表示
    this.stageText = this.screens[0].addText("STAGE " + (this.currentStage + 1), {
      x: 2,
      y: 2,
      colorIds: [null, 11],
    });

    // HP表示
    this.hpText = this.screens[0].addText("HP:5", {
      x: 2,
      y: 12,
      colorIds: [null, 15],
    });

    // 敵を再配置
    this.spawnEnemies();

    this.updateCamera();
  }

  /** プレイヤーダメージ */
  static damagePlayer() {
    if (this.player.invincibleTimer > 0) return;

    this.player.hp--;
    this.player.invincibleTimer = 60; // 1秒間無敵
    this.player.vy = this.JUMP_POWER * 0.5; // 少しノックバック

    // HP表示更新
    this.hpText?.remove();
    this.hpText = this.screens[0].addText("HP:" + this.player.hp, {
      x: this.cameraX + 2,
      y: 12,
      colorIds: [null, this.player.hp <= 2 ? 1 : 15], // HP少ないと赤
    });

    this.playDamageSound();

    if (this.player.hp <= 0) {
      this.gameover();
    }
  }

  /** ダメージ音 */
  static playDamageSound() {
    this.sfx?.stop();
    this.sfx = this.speakers[0].play([
      [
        { noteNumber: 5, duration: 4 },
        { noteNumber: 0, duration: 4 },
      ],
    ]);
  }

  /** カメラ更新 */
  static updateCamera() {
    const targetCameraX = this.player.x - this.SCREEN_WIDTH / 3;
    this.cameraX = Math.max(
      0,
      Math.min(targetCameraX, this.STAGE_LENGTH - this.SCREEN_WIDTH)
    );

    this.screens[0].setViewBox(
      this.cameraX,
      0,
      this.SCREEN_WIDTH,
      this.SCREEN_HEIGHT
    );

    // UI表示位置をカメラに追従
    if (this.stageText) {
      this.stageText.x = this.cameraX + 2;
    }
    if (this.hpText) {
      this.hpText.x = this.cameraX + 2;
    }
  }

  /** 地面判定 */
  static getGroundY(x) {
    const tileIndex = Math.floor(x / this.TILE_SIZE);
    if (tileIndex < 0 || tileIndex >= this.stageData.length) {
      return null; // 範囲外
    }
    const tile = this.stageData[tileIndex];
    if (tile === 0 || tile === 2) {
      return null; // 空または穴
    }
    if (tile === 3) {
      // 階段
      const height = this.stairHeights[tileIndex] || 8;
      return this.GROUND_Y - height;
    }
    return this.GROUND_Y;
  }

  /** 移動可能判定（段差チェック） */
  static canMoveToX(nextX, maxStepHeight) {
    // 空中にいる場合は常に移動可能
    if (!this.player.onGround) {
      return true;
    }

    // 現在の地面の高さ
    const currentFootLeft = this.player.x + 2;
    const currentFootRight = this.player.x + 6;
    const currentGroundLeft = this.getGroundY(currentFootLeft);
    const currentGroundRight = this.getGroundY(currentFootRight);
    const currentGroundY =
      currentGroundLeft !== null && currentGroundRight !== null
        ? Math.min(currentGroundLeft, currentGroundRight)
        : currentGroundLeft || currentGroundRight || this.GROUND_Y;

    // 移動先の地面の高さ
    const nextFootLeft = nextX + 2;
    const nextFootRight = nextX + 6;
    const nextGroundLeft = this.getGroundY(nextFootLeft);
    const nextGroundRight = this.getGroundY(nextFootRight);

    // 移動先が穴の場合は移動可能（落ちる）
    if (nextGroundLeft === null && nextGroundRight === null) {
      return true;
    }

    const nextGroundY =
      nextGroundLeft !== null && nextGroundRight !== null
        ? Math.min(nextGroundLeft, nextGroundRight)
        : nextGroundLeft || nextGroundRight;

    // 登る場合の段差チェック（下がる場合は制限なし）
    const heightDiff = currentGroundY - nextGroundY; // 正なら登り
    if (heightDiff > maxStepHeight) {
      return false; // 段差が大きすぎて登れない
    }

    return true;
  }

  /** ジャンプ音 */
  static playJumpSound() {
    this.sfx?.stop();
    this.sfx = this.speakers[0].play([
      [
        { noteNumber: 14, duration: 2 },
        { noteNumber: 18, duration: 2 },
      ],
    ]);
  }

  /** 踏み音 */
  static playStompSound() {
    this.sfx?.stop();
    this.sfx = this.speakers[0].play([
      [
        { noteNumber: 8, duration: 3 },
        { noteNumber: 12, duration: 3 },
      ],
    ]);
  }

  /** 変身音 */
  static playTransformSound() {
    this.sfx?.stop();
    this.sfx = this.speakers[0].play([
      [
        { noteNumber: 0, duration: 4 },
        { noteNumber: -4, duration: 4 },
        { noteNumber: -8, duration: 4 },
        { noteNumber: -12, duration: 8 },
      ],
    ]);
  }

  /** 敵撃破音 */
  static playDefeatSound() {
    this.sfx?.stop();
    this.sfx = this.speakers[0].play([
      [
        { noteNumber: 12, duration: 4 },
        { noteNumber: 16, duration: 4 },
        { noteNumber: 19, duration: 4 },
        { noteNumber: 24, duration: 8 },
      ],
    ]);
  }

  /** ゲームオーバー音 */
  static playGameoverSound() {
    this.sfx?.stop();
    this.sfx = this.speakers[0].play([
      [
        { noteNumber: 12, duration: 8 },
        { noteNumber: 10, duration: 8 },
        { noteNumber: 7, duration: 8 },
        { noteNumber: 4, duration: 16 },
      ],
    ]);
  }

  /** クリア音 */
  static playClearSound() {
    this.sfx?.stop();
    this.sfx = this.speakers[0].play([
      [
        { noteNumber: 12, duration: 4 },
        { noteNumber: 14, duration: 4 },
        { noteNumber: 16, duration: 4 },
        { noteNumber: 17, duration: 4 },
        { noteNumber: 19, duration: 4 },
        { noteNumber: 21, duration: 4 },
        { noteNumber: 23, duration: 4 },
        { noteNumber: 24, duration: 16 },
      ],
    ]);
  }

  /** ゲームオーバー */
  static gameover() {
    this.gameState = "gameover";
    this.playGameoverSound();
    this.messageText = this.screens[0].addText("GAME OVER", {
      x: this.cameraX + 52,
      y: 50,
      colorIds: [null, 1],
    });
    this.restartText = this.screens[0].addText("X:TITLE", {
      x: this.cameraX + 56,
      y: 70,
      colorIds: [null, 15],
    });
  }

  /** ステージクリア */
  static clear() {
    // 次のステージがあるか確認
    if (this.currentStage + 1 < this.stages.length) {
      this.gameState = "clear";
      this.playClearSound();
      this.messageText = this.screens[0].addText("STAGE CLEAR!", {
        x: this.cameraX + 44,
        y: 50,
        colorIds: [null, 10],
      });
      this.restartText = this.screens[0].addText("X:NEXT STAGE", {
        x: this.cameraX + 40,
        y: 70,
        colorIds: [null, 15],
      });
    } else {
      // 全ステージクリア
      this.gameState = "allclear";
      this.playClearSound();
      this.messageText = this.screens[0].addText("ALL CLEAR!", {
        x: this.cameraX + 48,
        y: 50,
        colorIds: [null, 11],
      });
      this.restartText = this.screens[0].addText("X:TITLE", {
        x: this.cameraX + 56,
        y: 70,
        colorIds: [null, 15],
      });
    }
  }

  /** 敵更新 */
  static updateEnemies() {
    for (const enemy of this.enemies) {
      // アニメーションタイマー初期化
      if (enemy.animTimer === undefined) {
        enemy.animTimer = Math.floor(Math.random() * 60);
        enemy.baseY = enemy.y;
      }
      enemy.animTimer++;

      // ダメージエフェクト
      if (enemy.damageTimer > 0) {
        enemy.damageTimer--;
        // 点滅エフェクト
        enemy.sprite.visible = enemy.damageTimer % 4 < 2;
      } else if (enemy.sprite) {
        enemy.sprite.visible = true;
      }

      // プレイヤーに向かって移動
      if (enemy.x < this.player.x) {
        enemy.x += enemy.speed;
      } else {
        enemy.x -= enemy.speed;
      }

      // ホッピングアニメーション（移動中のみ）
      const hopHeight = enemy.type === "mushroom" ? 1 : 2;
      const hopSpeed = enemy.type === "mushroom" ? 8 : 6;
      const hop = Math.abs(Math.sin(enemy.animTimer / hopSpeed)) * hopHeight;

      enemy.sprite.x = enemy.x;
      enemy.sprite.y = enemy.baseY - hop;
    }
  }

  /** 衝突判定 */
  static checkCollisions() {
    // プレイヤー無敵中はスキップ
    if (this.player.invincibleTimer > 0) {
      return false;
    }

    const playerLeft = this.player.x + 1;
    const playerRight = this.player.x + 7;
    const playerTop = this.player.y;
    const playerBottom = this.player.y + 10;

    for (const enemy of this.enemies) {
      // ダメージタイマー中は衝突判定をスキップ
      if (enemy.damageTimer > 0) {
        continue;
      }

      const enemyLeft = enemy.x;
      const enemyRight = enemy.x + enemy.width;
      const enemyTop = enemy.y;
      const enemyBottom = enemy.y + enemy.height;

      // 衝突判定
      if (
        playerRight > enemyLeft &&
        playerLeft < enemyRight &&
        playerBottom > enemyTop &&
        playerTop < enemyBottom
      ) {
        // 上から踏んだかどうか（プレイヤーが落下中で、足が敵の頭付近にある）
        const isStomp =
          this.player.vy > 0 && playerBottom <= enemyTop + enemy.height / 2 + 2;

        if (isStomp) {
          // 踏んだ
          this.player.vy = this.JUMP_POWER * 0.6; // 小さくバウンド

          if (enemy.type === "mushroom") {
            // キノコ→怪獣に変身
            this.transformToMonster(enemy);
          } else {
            // 怪獣にダメージ
            this.damageMonster(enemy);
          }
        } else {
          // 横から当たった
          this.damagePlayer();
          if (this.gameState === "gameover") return true;
        }
      }
    }
    return false;
  }

  /** フレーム処理 */
  static onFrame() {
    const pad = this.pads[0].buttons;

    // タイトル画面
    if (this.gameState === "title") {
      // 点滅エフェクト
      this.blinkTimer++;
      if (this.startText) {
        this.startText.visible = this.blinkTimer % 40 < 30;
      }

      // Zキーでゲーム開始
      if (pad.b0.justPressed) {
        this.currentStage = 0;
        this.startGame();
      }
      return;
    }

    // プレイ中
    if (this.gameState === "playing") {
      // アニメーションタイマー
      if (this.playerAnimTimer === undefined) {
        this.playerAnimTimer = 0;
      }

      // 左右移動（段差チェック付き）
      let isMoving = false;
      const MAX_STEP_HEIGHT = 10; // 歩いて登れる最大段差

      if (pad.left.pressed && this.player.x > 0) {
        // 移動先の段差をチェック
        const nextX = this.player.x - this.MOVE_SPEED;
        const canMove = this.canMoveToX(nextX, MAX_STEP_HEIGHT);
        if (canMove) {
          this.player.x = nextX;
          this.player.facingRight = false;
          isMoving = true;
        }
      }
      if (pad.right.pressed) {
        // 移動先の段差をチェック
        const nextX = this.player.x + this.MOVE_SPEED;
        const canMove = this.canMoveToX(nextX, MAX_STEP_HEIGHT);
        if (canMove) {
          this.player.x = nextX;
          this.player.facingRight = true;
          isMoving = true;
        }
      }

      // 歩行アニメーション（スプライト切り替え）
      if (isMoving && this.player.onGround) {
        this.playerAnimTimer++;
        const walkFrame = Math.floor(this.playerAnimTimer / 6) % 2;
        this.switchBearSprite(walkFrame === 0 ? "walk1" : "walk2");
      } else if (this.player.onGround) {
        this.playerAnimTimer = 0;
        this.switchBearSprite("stand");
      }
      // ジャンプ中はスプライト切り替えしない

      // ジャンプ
      if (pad.b0.justPressed && this.player.onGround) {
        this.player.vy = this.JUMP_POWER;
        this.player.onGround = false;
        this.playJumpSound();
      }

      // 重力
      this.player.vy += this.GRAVITY;
      this.player.y += this.player.vy;

      // プレイヤーの足元の座標（中央寄りで判定）
      const footLeft = this.player.x + 2;
      const footRight = this.player.x + 6;
      const groundYLeft = this.getGroundY(footLeft);
      const groundYRight = this.getGroundY(footRight);

      // 地面判定（両足とも地面がある場合のみ立てる）
      const targetGroundY =
        groundYLeft !== null && groundYRight !== null
          ? Math.min(groundYLeft, groundYRight)
          : null; // 片方でも穴なら落ちる

      // 落下中（vy >= 0）のみ地面に着地できる
      if (targetGroundY !== null && this.player.vy >= 0 && this.player.y >= targetGroundY - 10) {
        this.player.y = targetGroundY - 10;
        this.player.vy = 0;
        this.player.onGround = true;
      } else if (this.player.vy < 0) {
        // 上昇中は空中判定を維持
        this.player.onGround = false;
      } else if (targetGroundY === null) {
        // 穴の上
        this.player.onGround = false;
      }

      // 穴に落ちたらゲームオーバー
      if (this.player.y > this.GROUND_Y + 20) {
        this.gameover();
        return;
      }

      // 無敵タイマー更新と点滅エフェクト
      if (this.player.invincibleTimer > 0) {
        this.player.invincibleTimer--;
        // 点滅エフェクト
        this.player.visible = this.player.invincibleTimer % 6 < 3;
      } else {
        this.player.visible = true;
      }

      // 敵更新
      this.updateEnemies();

      // 衝突判定
      if (this.checkCollisions()) {
        return;
      }

      // ゴール判定
      if (this.goalX && this.player.x >= this.goalX - 8) {
        this.clear();
        return;
      }

      // カメラ更新
      this.updateCamera();
      return;
    }

    // ゲームオーバー時
    if (this.gameState === "gameover" || this.gameState === "allclear") {
      if (pad.b1.justPressed) {
        this.currentStage = 0;
        this.showTitle();
      }
      return;
    }

    // ステージクリア時
    if (this.gameState === "clear") {
      if (pad.b1.justPressed) {
        this.currentStage++;
        this.startGame();
      }
      return;
    }
  }
}
