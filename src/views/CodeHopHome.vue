<template>
  <div ref="root" class="code-hop" :class="{ embedded }" :data-state="state.state"
    :data-airborne="String(state.airborne)" :data-world="state.world" :data-x="state.x"
    :data-score="state.score" :data-hearts="state.hearts" :data-y="state.y" tabindex="0">
    <div class="hop-hud">
      <div class="hud-brand"><img :src="mascot" alt=""><strong>CLAUDE HOPS</strong></div>
      <div class="hud-stats"><span>1-{{ state.world }}</span><span>★ {{ state.stars }}</span><span aria-label="Hearts">♥ {{ state.hearts }}</span><span>SCORE: {{ state.score }}</span></div>
      <button class="hud-button" :aria-label="soundOn ? 'Mute sound' : 'Enable sound'" @click="toggleSound">{{ soundOn ? '♪' : '♫' }}</button>
      <button class="hud-button" aria-label="Pause game" @click="command(state.state === 'paused' ? 'resume' : 'pause')">Ⅱ</button>
    </div>
    <div ref="stage" class="hop-stage"></div>
    <div class="hop-footer"><span>{{ state.name }}</span><span>{{ state.checkpoint ? 'Checkpoint saved' : 'World 1-' + state.world }}</span><span>BEST {{ best }}</span></div>
    <div class="touch-controls">
      <button aria-label="Move left" @pointerdown.prevent="press('left', $event)" @pointerup="release('left')" @pointercancel="release('left')" @lostpointercapture="release('left')">◀</button>
      <button aria-label="Move right" @pointerdown.prevent="press('right', $event)" @pointerup="release('right')" @pointercancel="release('right')" @lostpointercapture="release('right')">▶</button>
      <button class="jump-control" aria-label="Jump" @pointerdown.prevent="press('jump', $event)" @pointerup="release('jump')" @pointercancel="release('jump')" @lostpointercapture="release('jump')">↑</button>
    </div>
    <div v-if="state.state !== 'playing'" class="overlay">
      <div class="panel">
        <img :src="mascot" class="panel-mascot" alt="Claude">
        <h1>{{ heading }}</h1>
        <p>{{ subtitle }}</p>
        <div class="stage-dots" aria-label="Three worlds"><span v-for="n in 3" :key="n" :class="{ reached: state.world >= n }">1-{{ n }}</span></div>
        <div class="panel-actions">
          <button v-if="state.state === 'loading'" disabled>Loading...</button>
          <button v-else-if="state.state === 'error'" @click="reload">Reload game</button>
          <button v-else class="primary" @click="primaryAction">{{ actionLabel }}</button>
          <button v-if="['paused', 'gameover'].includes(state.state)" @click="command('start')">New adventure</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, reactive, ref } from 'vue';
import { safeStorage } from '@/utils/storage';
import mascot from '@/assets/codehop/claude-hops-icon.svg';

defineProps({ embedded: Boolean });
const root = ref(null);
const stage = ref(null);
const state = reactive({ state: 'loading', world: 1, name: 'Meadow.exe', hearts: 3, score: 0, stars: 0, airborne: false, x: 80, checkpoint: false });
const controls = { left: false, right: false, jump: false, jumpQueued: false };
const best = ref(Number(safeStorage.getItem('claudeHopsAdventureBest')) || 0);
const soundOn = ref(safeStorage.getItem('claudeHopsSound') !== 'off');
let game;
let audio;
let observer;
let disposed = false;
const heading = computed(() => ({ paused: 'PAUSED', gameover: 'ONE MORE HOP?', complete: 'BUILD COMPLETE!', won: 'YOU SHIPPED IT!' }[state.state] || 'CLAUDE HOPS'));
const subtitle = computed(() => ({ ready: 'Three little worlds. One big adventure.', paused: state.name, gameover: 'Your checkpoint is waiting.', complete: `${state.score} points. Next stop: ${state.world === 1 ? 'Cloud Cache' : 'The Final Build'}.`, won: `${state.stars} stars. ${state.score} points. A very good day.`, loading: 'Booting the meadow...', error: 'The game could not load.' }[state.state] || ''));
const actionLabel = computed(() => ({ paused: 'Resume', gameover: 'Retry checkpoint', complete: 'Next world', won: 'Play again' }[state.state] || 'START'));
function clearControls() { Object.keys(controls).forEach(key => { controls[key] = false; }); }
function sound(kind) {
  if (!soundOn.value) return;
  try {
    audio ||= new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === 'suspended') audio.resume();
    const notes = { jump: [320, 640], coin: [880, 1320], stomp: [220, 110], hurt: [160, 70], bonus: [660, 880, 1100] }[kind] || [440];
    notes.forEach((frequency, index) => {
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      const start = audio.currentTime + index * 0.06;
      oscillator.type = 'square'; oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.025, start); gain.gain.exponentialRampToValueAtTime(0.001, start + 0.1);
      oscillator.connect(gain); gain.connect(audio.destination); oscillator.start(start); oscillator.stop(start + 0.11);
    });
  } catch { /* Audio is optional in restricted browsers. */ }
}
function command(action) {
  clearControls();
  game?.scene.getScene('hops')?.command(action);
  root.value?.focus({ preventScroll: true });
}
function primaryAction() {
  sound('coin');
  command(({ paused: 'resume', gameover: 'retry', complete: 'next' })[state.state] || 'start');
}
function press(key, event) { event.target.setPointerCapture(event.pointerId); controls[key] = true; if (key === 'jump') controls.jumpQueued = true; root.value?.focus({ preventScroll: true }); }
function release(key) { controls[key] = false; }
function toggleSound() { soundOn.value = !soundOn.value; safeStorage.setItem('claudeHopsSound', soundOn.value ? 'on' : 'off'); sound('coin'); root.value?.focus({ preventScroll: true }); }
function pause() { clearControls(); if (state.state === 'playing') command('pause'); }
function visibility() { if (document.hidden) pause(); }
function reload() { window.location.reload(); }
onMounted(async () => {
  window.addEventListener('blur', pause);
  document.addEventListener('visibilitychange', visibility);
  try {
    const { createHopsGame } = await import('@/game/hops-scene');
    if (disposed) return;
    game = createHopsGame(stage.value, controls, (next) => {
      Object.assign(state, next);
      if (next.score > best.value) { best.value = next.score; safeStorage.setItem('claudeHopsAdventureBest', String(next.score)); }
    }, sound);
    observer = new ResizeObserver(() => {
      const width = Math.max(280, Math.min(900, stage.value.clientWidth / Math.max(1, stage.value.clientHeight) * 400));
      game?.scale.setGameSize(width, 400);
    });
    observer.observe(stage.value);
  } catch { state.state = 'error'; }
});
onBeforeUnmount(() => {
  disposed = true; observer?.disconnect(); clearControls(); game?.destroy(true); audio?.close();
  window.removeEventListener('blur', pause); document.removeEventListener('visibilitychange', visibility);
});
</script>

<style scoped>
.code-hop { position: fixed; inset: 0; display: flex; flex-direction: column; background: #183b35; color: #fff8cf; font: bold 13px 'Courier New', monospace; overflow: hidden; outline: none; }
.code-hop.embedded { position: relative; width: 100%; height: 100%; min-height: 0; }
.hop-hud { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; padding: 10px 12px; z-index: 2; background: #183b35; border-bottom: 3px solid #4c7866; }
.hud-brand { display: flex; gap: 8px; align-items: center; }
.hud-brand img { width: 28px; height: 24px; object-fit: contain; image-rendering: pixelated; }
.hud-stats { display: flex; flex: 1; gap: 16px; justify-content: flex-end; white-space: nowrap; }
.hud-button { min-width: 30px; min-height: 30px; padding: 3px; font: bold 16px monospace; color: #183b35; background: #f4ecc8; border: 2px outset #f4ecc8; border-radius: 0; }
.hop-stage { position: relative; flex: 1; min-height: 0; width: 100%; overflow: hidden; background: #9ddce5; }
.hop-stage :deep(canvas) { image-rendering: pixelated; }
.hop-footer { display: flex; justify-content: space-between; gap: 10px; padding: 8px 12px; font-size: 11px; }
.overlay { position: absolute; inset: 55px 0 28px; display: grid; place-items: center; background: #183b3530; z-index: 4; overflow: auto; }
.panel { text-align: center; padding: 24px 20px; max-width: 480px; color: #153e35; background: #f4f9e9f0; border: 4px double #436857; box-shadow: 5px 5px #183b3560; margin: 16px; }
.panel h1 { font-size: 28px; margin: 12px 0; letter-spacing: 0; line-height: 1.15; }
.panel p { font-size: 13px; line-height: 1.5; }
.panel-mascot { width: 76px; height: 64px; object-fit: contain; image-rendering: pixelated; }
.stage-dots { display: flex; gap: 16px; justify-content: center; margin: 20px 0; }
.stage-dots span { padding: 6px; border-bottom: 3px solid #a5b9ab; color: #6c8275; }
.stage-dots .reached { border-color: #d37552; color: #153e35; }
.panel-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; }
.panel-actions button { padding: 10px 16px; background: #e5edcf; border: 3px outset #e5edcf; font: bold 14px 'Courier New', monospace; color: #153e35; border-radius: 0; cursor: pointer; }
.panel-actions .primary { background: #ffdd72; border-color: #ffdd72; }
.touch-controls { display: none; padding: 12px 18px 18px; gap: 14px; background: #183b35; }
.touch-controls button { width: 64px; height: 54px; padding: 0; font-size: 24px; background: #e1edd9; color: #16392f; border: 3px outset #e1edd9; border-radius: 0; touch-action: none; user-select: none; }
.touch-controls .jump-control { margin-left: auto; background: #ffdd72; border-color: #ffdd72; width: 76px; }
@media (pointer: coarse) { .touch-controls { display: flex; } .overlay { top: 88px; bottom: 108px; } .hud-stats { order: 2; flex: 0 0 100%; justify-content: space-between; font-size: 12px; } .hud-brand { flex: 1; } .hop-footer { font-size: 10px; } }
@media (max-height: 480px) { .panel { padding: 10px 18px; } .panel-mascot, .stage-dots { display: none; } .touch-controls { padding: 4px 14px; } .touch-controls button { height: 38px; } }
</style>
