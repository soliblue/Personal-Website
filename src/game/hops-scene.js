import Phaser from 'phaser';
import mascot from '@/assets/codehop/claude-hops-icon.svg';
import { HOPS_LEVELS, HOPS_PHYSICS, LEVEL_WIDTH, FLOOR_Y, levelGround } from './hops-levels';

const art = import.meta.glob('../assets/codehop/platformer/*.png', { eager: true, query: '?url', import: 'default' });

export function createHopsGame(parent, controls, report, sound) {
  class HopsScene extends Phaser.Scene {
    constructor() { super('hops'); }
    preload() {
      this.load.image('claude', mascot);
      for (const [path, url] of Object.entries(art)) this.load.image(path.split('/').pop().replace('.png', ''), url);
    }
    create() {
      this.stage = 0;
      this.score = 0;
      this.stars = 0;
      this.hearts = 3;
      this.status = 'ready';
      this.keys = this.input.keyboard.addKeys('LEFT,RIGHT,SPACE,UP,A,D,W,P,ESC');
      this.loadLevel();
    }
    publish() {
      this.input.keyboard.manager.preventDefault = this.status === 'playing';
      report({ state: this.status, score: this.score, stars: this.stars, hearts: this.hearts,
        world: this.stage + 1, name: HOPS_LEVELS[this.stage].name,
        airborne: !this.player.body.blocked.down, x: Math.round(this.player.x), y: Math.round(this.player.y),
        progress: Math.min(100, Math.round(this.player.x / (LEVEL_WIDTH - 120) * 100)),
        checkpoint: this.checkpoint > 80 });
    }
    loadLevel() {
      this.physics.world.colliders.destroy();
      this.children.removeAll(true);
      this.tweens.killAll();
      this.time.removeAllEvents();
      const level = HOPS_LEVELS[this.stage];
      this.cameras.main.setBackgroundColor(level.sky);
      this.cameras.main.setBounds(0, 0, LEVEL_WIDTH, 400);
      this.physics.world.setBounds(0, -200, LEVEL_WIDTH, 820);
      this.checkpoint = 80;
      this.invincible = 0;
      this.coyote = 0;
      this.buffer = 0;
      this.jumpHeld = false;
      this.stompCombo = 0;
      this.finishPending = false;
      this.elapsed = 0;
      for (let x = 0; x < 1800; x += 710) {
        this.add.image(x, 0, 'background').setOrigin(0).setDisplaySize(712, 400)
          .setScrollFactor(0.08).setTint([0xffffff, 0xdadfff, 0xffd3dd][this.stage]);
      }

      this.platforms = this.physics.add.staticGroup();
      this.blocks = this.physics.add.staticGroup();
      this.coins = this.physics.add.staticGroup();
      this.enemies = this.physics.add.group();
      for (const [x, width] of levelGround(level)) this.platform(x, FLOOR_Y, width, 60);
      for (const [x, y, width] of [...level.platforms, [2710, 282, 64], [2790, 226, 64], [2870, 170, 64]]) {
        this.platform(x, y, width, 28);
        for (let cx = x + 24; cx < x + width; cx += 32) this.star(cx, y - 30);
      }
      for (const x of [190, 580, 1180, 1850, 2460]) {
        const nearbyLedges = level.platforms.filter(([px, , width]) => x > px - 40 && x < px + width + 40);
        const y = Math.min(238, ...nearbyLedges.map(([, py]) => py - 90));
        const block = this.blocks.create(x, y, 'bonus').setDisplaySize(32, 32).refreshBody();
        block.setData('used', false);
      }
      for (const [start, width] of levelGround(level)) {
        for (let x = start + 160; x < start + width - 45; x += 140) this.star(x, FLOOR_Y - 28);
      }
      for (const x of [610, 1200, 1530, 2020, 2750]) {
        if (level.gaps.some(([gx, gw]) => x > gx - 70 && x < gx + gw + 70)) continue;
        const enemy = this.enemies.create(x, FLOOR_Y - 17, 'bug').setDisplaySize(30, 26);
        enemy.body.setSize(enemy.width * 0.8, enemy.height * 0.85, true);
        enemy.setData('home', x).setData('direction', -1);
      }
      this.physics.add.collider(this.enemies, this.platforms);
      this.flag = this.physics.add.staticImage(1400, FLOOR_Y - 31, 'checkpoint').setDisplaySize(40, 54).refreshBody();
      this.goal = this.physics.add.staticImage(3010, FLOOR_Y - 35, 'goal').setDisplaySize(66, 64).refreshBody();
      this.player = this.physics.add.sprite(80, FLOOR_Y - 23, 'claude').setDisplaySize(42, 35).setDepth(5);
      this.player.body.setSize(this.player.width * 0.78, this.player.height * 0.85, true);
      this.player.setMaxVelocity(HOPS_PHYSICS.run, 650).setDragX(1600);
      this.player.setCollideWorldBounds(true);
      this.physics.add.collider(this.player, this.platforms, undefined, (player, platform) =>
        !platform.getData('oneWay') || (player.body.velocity.y >= 0 && player.body.prev.y + player.body.height <= platform.body.top + 8));
      this.physics.add.collider(this.player, this.blocks, (player, block) => {
        if (!player.body.blocked.up || block.getData('used')) return;
        block.setData('used', true).setTint(0xaeb5b6);
        this.score += 100;
        this.stars += 1;
        if (this.hearts < 3) this.hearts += 1;
        this.popup(block.x, block.y - 25, '+100');
        sound('bonus');
      });
      this.physics.add.overlap(this.player, this.coins, (player, coin) => {
        coin.disableBody(true, true);
        this.score += 25;
        this.stars += 1;
        this.popup(coin.x, coin.y, '+25');
        sound('coin');
      });
      this.physics.add.overlap(this.player, this.flag, () => {
        if (this.checkpoint > 80) return;
        this.checkpoint = 1400;
        this.flag.setTint(0xfff2a8);
        this.hearts = 3;
        this.popup(this.flag.x, this.flag.y - 40, 'SAVED!');
        sound('bonus');
      });
      this.physics.add.overlap(this.player, this.goal, () => this.finish());
      this.physics.add.overlap(this.player, this.enemies, (player, enemy) => {
        if (this.invincible > 0 || !enemy.active) return;
        if (player.body.velocity.y > 40 && player.body.bottom < enemy.body.center.y + 12) {
          enemy.disableBody(true, true);
          player.setVelocityY(-320);
          this.stompCombo += 1;
          const bonus = 100 * Math.min(5, this.stompCombo);
          this.score += bonus;
          this.popup(enemy.x, enemy.y - 20, `+${bonus}`);
          sound('stomp');
        } else this.hurt(false);
      });
      this.cameras.main.startFollow(this.player, true, 0.12, 0.12, -90, 0);
      this.cameras.main.roundPixels = true;
      if (this.status !== 'playing') this.physics.pause();
      else this.physics.resume();
      this.publish();
    }
    platform(x, y, width, height) {
      const zone = this.add.zone(x + width / 2, y + height / 2, width, height);
      zone.setData('oneWay', y < FLOOR_Y);
      this.platforms.add(zone);
      for (let dx = 0; dx < width; dx += 32) {
        this.add.image(x + dx, y, 'ground').setOrigin(0).setDisplaySize(Math.min(32, width - dx), height);
      }
    }
    star(x, y) { this.coins.create(x, y, 'star').setDisplaySize(20, 20).refreshBody(); }
    popup(x, y, label) {
      const text = this.add.text(x, y, label, { fontFamily: 'monospace', fontSize: '14px', fontStyle: 'bold', color: '#183a36', backgroundColor: '#fff4b8', padding: { x: 3, y: 2 } }).setOrigin(0.5).setDepth(9);
      this.tweens.add({ targets: text, y: y - 32, alpha: 0, duration: 850, onComplete: () => text.destroy() });
    }
    hurt(fell) {
      if (!fell && this.invincible > 0) return;
      this.hearts -= 1;
      this.invincible = 1600;
      sound('hurt');
      if (this.hearts <= 0) {
        this.status = 'gameover';
        this.physics.pause();
      } else if (fell) {
        this.player.body.reset(this.checkpoint, FLOOR_Y - 25);
        this.cameras.main.centerOn(this.checkpoint, 200);
      } else {
        this.player.setVelocity(-this.player.body.velocity.x * 0.5, -200);
      }
      this.publish();
    }
    finish() {
      if (this.finishPending || this.status !== 'playing') return;
      this.finishPending = true;
      this.score += 500 + this.hearts * 100;
      this.status = this.stage === HOPS_LEVELS.length - 1 ? 'won' : 'complete';
      this.physics.pause();
      sound('bonus');
      this.publish();
    }
    command(action) {
      if (action === 'start') {
        this.score = 0; this.stars = 0; this.hearts = 3; this.stage = 0;
        this.status = 'playing'; this.loadLevel();
      } else if (action === 'retry') {
        this.hearts = 3; this.status = 'playing'; this.invincible = 1500;
        this.player.body.reset(this.checkpoint, FLOOR_Y - 25);
        this.physics.resume();
      } else if (action === 'next') {
        this.stage += 1; this.hearts = 3; this.status = 'playing'; this.loadLevel();
      } else if (action === 'pause' && this.status === 'playing') {
        this.status = 'paused'; this.physics.pause();
      } else if (action === 'resume' && this.status === 'paused') {
        this.status = 'playing'; this.physics.resume();
      }
      this.keys && this.input.keyboard.resetKeys();
      this.publish();
    }
    update(time, delta) {
      if (!this.player) return;
      const host = parent.closest('.win95-window');
      const active = !host || (host.classList.contains('active') && host.getClientRects().length > 0);
      this.input.keyboard.enabled = active;
      if (!active && this.status === 'playing') this.command('pause');
      if (!active) return;
      if (Phaser.Input.Keyboard.JustDown(this.keys.P) || Phaser.Input.Keyboard.JustDown(this.keys.ESC)) this.command(this.status === 'paused' ? 'resume' : 'pause');
      if (this.status !== 'playing') return;
      const dt = Math.min(delta, 32);
      this.elapsed += dt;
      this.invincible = Math.max(0, this.invincible - dt);
      const grounded = this.player.body.blocked.down;
      if (grounded) { this.coyote = 110; this.stompCombo = 0; }
      else this.coyote -= dt;
      const held = controls.jump || this.keys.SPACE.isDown || this.keys.UP.isDown || this.keys.W.isDown;
      if ((held && !this.jumpHeld) || controls.jumpQueued) this.buffer = 140;
      controls.jumpQueued = false;
      this.buffer -= dt;
      if (this.buffer > 0 && this.coyote > 0) {
        this.player.setVelocityY(HOPS_PHYSICS.jump);
        this.coyote = 0; this.buffer = 0;
        sound('jump');
      }
      if (!held && this.jumpHeld && this.player.body.velocity.y < -180) this.player.setVelocityY(-180);
      this.jumpHeld = held;
      const direction = Number(controls.right || this.keys.RIGHT.isDown || this.keys.D.isDown) - Number(controls.left || this.keys.LEFT.isDown || this.keys.A.isDown);
      this.player.setAccelerationX(direction * HOPS_PHYSICS.acceleration);
      if (direction) this.player.setFlipX(direction < 0);
      this.player.setAlpha(this.invincible > 0 && Math.floor(this.elapsed / 90) % 2 ? 0.45 : 1);
      this.player.setAngle(grounded && direction ? Math.sin(this.elapsed / 65) * 5 : 0);
      for (const enemy of this.enemies.getChildren()) {
        if (!enemy.active) continue;
        let direction = enemy.getData('direction');
        if (enemy.x < enemy.getData('home') - 50) direction = 1;
        if (enemy.x > enemy.getData('home') + 50) direction = -1;
        enemy.setData('direction', direction).setVelocityX(direction * HOPS_LEVELS[this.stage].speed).setFlipX(direction > 0);
      }
      if (this.player.y > 430) this.hurt(true);
      this.publish();
    }
  }
  return new Phaser.Game({ type: Phaser.CANVAS, parent, width: Math.max(280, Math.min(900, parent.clientWidth / parent.clientHeight * 400)), height: 400,
    pixelArt: true, roundPixels: true, backgroundColor: '#9ddce5',
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    input: { keyboard: { target: parent.parentElement } },
    physics: { default: 'arcade', arcade: { gravity: { y: HOPS_PHYSICS.gravity }, fixedStep: true } },
    scene: HopsScene, audio: { noAudio: true }, banner: false });
}
