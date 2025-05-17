class Game2048 extends Phaser.Scene {
  constructor() {
    super("Game2048");
    this.tileSize = 100;
    this.gridSize = 4;
    this.gridSpacing = 10;
    this.score = 0;
    this.fourProbability = 0.1;
    this.isMoving = false;
    this.audioCtx = null;
    this.ambientOsc = null;
  }

  init() {
    this.theme = window.themes[window.currentThemeIndex] || window.themes[0];
  }

  create() {
    this.score = 0;
    this.cameras.main.setBackgroundColor(this.theme.backgroundColor);
    document.body.style.backgroundColor = this.theme.backgroundColor;
    this.createGrid();
    this.createTiles();
    this.addRandomTile();
    this.addRandomTile();
    this.createScoreText();
    this.input.keyboard.on("keydown", this.handleKey, this);
    this.input.on("pointerup", this.handleSwipe, this);
    this.input.once("pointerdown", this.initAudio, this);
    this.input.keyboard.once("keydown", this.initAudio, this);
  }

  createGrid() {
    const graphics = this.add.graphics();
    graphics.fillStyle(this.theme.gridBackground, 1);
    graphics.fillRoundedRect(
      0,
      0,
      this.tileSize * this.gridSize + this.gridSpacing * (this.gridSize + 1),
      this.tileSize * this.gridSize + this.gridSpacing * (this.gridSize + 1),
      10
    );

    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        graphics.fillStyle(this.theme.emptyTile, 1);
        graphics.fillRoundedRect(
          this.gridSpacing + col * (this.tileSize + this.gridSpacing),
          this.gridSpacing + row * (this.tileSize + this.gridSpacing),
          this.tileSize,
          this.tileSize,
          10
        );
      }
    }
  }

  createTiles() {
    this.tiles = [];
    for (let row = 0; row < this.gridSize; row++) {
      this.tiles[row] = [];
      for (let col = 0; col < this.gridSize; col++) {
        this.tiles[row][col] = null;
      }
    }
  }

  createScoreText() {
    this.scoreText = this.add.text(
      10,
      this.tileSize * this.gridSize +
        this.gridSpacing * (this.gridSize + 1) +
        10,
      "Score: 0",
      { fontSize: "24px", fill: this.theme.scoreColor }
    );
  }

  addRandomTile() {
    const emptyCells = [];
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        if (this.tiles[row][col] === null) {
          emptyCells.push({ row, col });
        }
      }
    }

    if (emptyCells.length > 0) {
      const { row, col } = Phaser.Utils.Array.GetRandom(emptyCells);
      const value = Math.random() < this.fourProbability ? 4 : 2;
      this.addTile(row, col, value);
    }
  }

  addTile(row, col, value) {
    const x =
      this.gridSpacing +
      col * (this.tileSize + this.gridSpacing) +
      this.tileSize / 2;
    const y =
      this.gridSpacing +
      row * (this.tileSize + this.gridSpacing) +
      this.tileSize / 2;

    const tile = this.add.graphics();
    const color = this.getTileColor(value);
    tile.fillStyle(color);
    tile.fillRoundedRect(
      -this.tileSize / 2,
      -this.tileSize / 2,
      this.tileSize,
      this.tileSize,
      10
    );
    tile.setPosition(x, y);

    const textColor = value <= 4 ? this.theme.tileTextDark : this.theme.tileTextLight;
    const text = this.add
      .text(x, y, value.toString(), {
        fontSize: "32px",
        fill: textColor,
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.tiles[row][col] = { tile, text, value };

    tile.setScale(0);
    tile.setAlpha(0);
    text.setScale(0);
    text.setAlpha(0);
    this.tweens.add({
      targets: tile,
      scale: 1,
      alpha: 1,
      angle: 360,
      duration: 300,
      ease: "Back.easeOut",
    });
    this.tweens.add({
      targets: text,
      scale: 1,
      alpha: 1,
      duration: 300,
      ease: "Back.easeOut",
    });
    this.playSpawnSound();
  }

  getTileColor(value) {
    return this.theme.tileColors[value] || 0x3c3a32;
  }

  handleKey(event) {
    if (this.isMoving) return;

    switch (event.code) {
      case "ArrowLeft":
        this.move("left");
        break;
      case "ArrowRight":
        this.move("right");
        break;
      case "ArrowUp":
        this.move("up");
        break;
      case "ArrowDown":
        this.move("down");
        break;
    }
  }

  handleSwipe(pointer) {
    if (this.isMoving) return;

    const swipeTime = pointer.upTime - pointer.downTime;
    const swipe = new Phaser.Geom.Point(
      pointer.upX - pointer.downX,
      pointer.upY - pointer.downY
    );
    const swipeMagnitude = Phaser.Geom.Point.GetMagnitude(swipe);
    const swipeNormal = new Phaser.Geom.Point(
      swipe.x / swipeMagnitude,
      swipe.y / swipeMagnitude
    );

    if (
      swipeMagnitude > 20 &&
      swipeTime < 1000 &&
      Math.abs(swipeNormal.y) > 0.8
    ) {
      if (swipeNormal.y > 0.8) {
        this.move("down");
      } else if (swipeNormal.y < -0.8) {
        this.move("up");
      }
    } else if (
      swipeMagnitude > 20 &&
      swipeTime < 1000 &&
      Math.abs(swipeNormal.x) > 0.8
    ) {
      if (swipeNormal.x > 0.8) {
        this.move("right");
      } else if (swipeNormal.x < -0.8) {
        this.move("left");
      }
    }
  }

  move(direction) {
    if (this.isMoving) return;
    this.isMoving = true;
    let moved = false;

    const vector = {
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 },
      up: { x: 0, y: -1 },
      down: { x: 0, y: 1 },
    }[direction];

    const positions = [];
    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        const row = direction === "down" ? this.gridSize - 1 - i : i;
        const col = direction === "right" ? this.gridSize - 1 - j : j;
        positions.push({ row, col });
      }
    }

    let movePromises = [];

    positions.forEach((pos) => {
      const { row, col } = pos;
      if (this.tiles[row][col] !== null) {
        let newRow = row + vector.y;
        let newCol = col + vector.x;
        let merged = false;

        while (
          newRow >= 0 &&
          newRow < this.gridSize &&
          newCol >= 0 &&
          newCol < this.gridSize
        ) {
          if (this.tiles[newRow][newCol] === null) {
            newRow += vector.y;
            newCol += vector.x;
          } else if (
            !merged &&
            this.tiles[newRow][newCol].value === this.tiles[row][col].value
          ) {
            movePromises.push(this.mergeTiles(row, col, newRow, newCol));
            merged = true;
            moved = true;
            break;
          } else {
            break;
          }
        }

        newRow -= vector.y;
        newCol -= vector.x;

        if (!merged && (newRow !== row || newCol !== col)) {
          movePromises.push(this.moveTile(row, col, newRow, newCol));
          moved = true;
        }
      }
    });

    Promise.all(movePromises).then(() => {
      if (moved) {
        this.addRandomTile();
      }
      this.isMoving = false;
      this.checkGameOver();
    });
  }

  moveTile(fromRow, fromCol, toRow, toCol) {
    return new Promise((resolve) => {
      const tile = this.tiles[fromRow][fromCol];
      if (!tile) {
        console.error("Attempt to move non-existent tile");
        resolve();
        return;
      }
      this.tiles[toRow][toCol] = tile;
      this.tiles[fromRow][fromCol] = null;

      const x =
        this.gridSpacing +
        toCol * (this.tileSize + this.gridSpacing) +
        this.tileSize / 2;
      const y =
        this.gridSpacing +
        toRow * (this.tileSize + this.gridSpacing) +
        this.tileSize / 2;

      this.tweens.add({
        targets: [tile.tile, tile.text],
        x: x,
        y: y,
        duration: 200,
        ease: "Quad.easeOut",
        onComplete: resolve,
      });
      this.playMoveSound();
    });
  }

  mergeTiles(fromRow, fromCol, toRow, toCol) {
    return new Promise((resolve) => {
      const fromTile = this.tiles[fromRow][fromCol];
      const toTile = this.tiles[toRow][toCol];

      if (!fromTile || !toTile) {
        console.error("Attempt to merge non-existent tiles");
        resolve();
        return;
      }

      const newValue = fromTile.value * 2;
      this.score += newValue;
      this.scoreText.setText("Score: " + this.score);
      this.playMergeSound();

      const x =
        this.gridSpacing +
        toCol * (this.tileSize + this.gridSpacing) +
        this.tileSize / 2;
      const y =
        this.gridSpacing +
        toRow * (this.tileSize + this.gridSpacing) +
        this.tileSize / 2;

      this.tweens.add({
        targets: [fromTile.tile, fromTile.text],
        x: x,
        y: y,
        duration: 200,
        ease: "Quad.easeOut",
        onComplete: () => {
          fromTile.tile.destroy();
          fromTile.text.destroy();
          this.tiles[fromRow][fromCol] = null;

          toTile.value = newValue;
          const newColor = this.getTileColor(newValue);
          toTile.tile.clear();
          toTile.tile.fillStyle(newColor);
          toTile.tile.fillRoundedRect(
            -this.tileSize / 2,
            -this.tileSize / 2,
            this.tileSize,
            this.tileSize,
            10
          );

          toTile.text.setText(newValue.toString());
          const textColor =
            newValue <= 4 ? this.theme.tileTextDark : this.theme.tileTextLight;
          toTile.text.setColor(textColor);

          this.tweens.add({
            targets: [toTile.tile, toTile.text],
            scale: 1.1,
            duration: 100,
            yoyo: true,
            onComplete: () => {
              if (newValue === 2048) {
                this.gameOver(true);
              }
              resolve();
            },
          });
        },
      });
    });
  }

  checkGameOver() {
    let canMove = false;
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        if (this.tiles[row][col] === null) {
          canMove = true;
          break;
        }
        const value = this.tiles[row][col].value;
        if (
          (row < this.gridSize - 1 &&
            this.tiles[row + 1][col] &&
            this.tiles[row + 1][col].value === value) ||
          (col < this.gridSize - 1 &&
            this.tiles[row][col + 1] &&
            this.tiles[row][col + 1].value === value)
        ) {
          canMove = true;
          break;
        }
      }
      if (canMove) break;
    }

    if (!canMove) {
      this.gameOver(false);
    }
  }

  gameOver(win) {
    this.isMoving = true;
    const message = win ? "Уровень пройден" : "Нельзя сделать ход";
    alert(message);
    this.stopAmbient();
    this.scene.restart();
  }

  initAudio() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      this.startAmbient();
    }
  }

  startAmbient() {
    if (!this.audioCtx) return;
    this.ambientOsc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    gain.gain.value = 0.02;
    this.ambientOsc.type = "sine";
    this.ambientOsc.frequency.value = 220;
    this.ambientOsc.connect(gain).connect(this.audioCtx.destination);
    this.ambientOsc.start();
  }

  stopAmbient() {
    if (this.ambientOsc) {
      this.ambientOsc.stop();
      this.ambientOsc.disconnect();
      this.ambientOsc = null;
    }
  }

  playBeep(freq, duration = 0.1, volume = 0.1) {
    if (!this.audioCtx) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.frequency.value = freq;
    osc.type = "sine";
    gain.gain.value = volume;
    osc.connect(gain).connect(this.audioCtx.destination);
    osc.start();
    osc.stop(this.audioCtx.currentTime + duration);
  }

  playMoveSound() {
    this.playBeep(200, 0.05, 0.05);
  }

  playMergeSound() {
    this.playBeep(440, 0.15, 0.1);
  }

  playSpawnSound() {
    this.playBeep(660, 0.05, 0.05);
  }
}
