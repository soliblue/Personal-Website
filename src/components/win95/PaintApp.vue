<template>
  <div class="paint-app" tabindex="0" @keydown="onKeyDown">
    <div class="paint-commandbar">
      <button type="button" title="New picture" aria-label="New picture" @click="newDocument">
        <img src="../../assets/win95/new.svg" alt="">
      </button>
      <button
        type="button"
        title="Undo"
        aria-label="Undo"
        :disabled="!canUndo"
        @click="undo"
      >
        <img src="../../assets/win95/back.svg" alt="">
      </button>
      <button
        type="button"
        title="Redo"
        aria-label="Redo"
        :disabled="!canRedo"
        @click="redo"
      >
        <img src="../../assets/win95/forward.svg" alt="">
      </button>
      <button type="button" title="Save as PNG" aria-label="Save as PNG" @click="download">
        <img src="../../assets/win95/save.svg" alt="">
      </button>
      <span class="paint-divider"></span>
      <div class="paint-size-picker" aria-label="Brush size">
        <button
          v-for="size in brushSizes"
          :key="size"
          type="button"
          :class="{ active: brushSize === size }"
          :aria-label="`Brush size ${size}`"
          :aria-pressed="String(brushSize === size)"
          @click="setBrushSize(size)"
        >
          <span
            :style="{ width: `${Math.max(2, size)}px`, height: `${Math.max(2, size)}px` }"
          ></span>
        </button>
      </div>
    </div>

    <div class="paint-workspace">
      <div class="paint-toolbox" aria-label="Paint tools">
        <button
          v-for="item in tools"
          :key="item.id"
          type="button"
          :class="{ active: tool === item.id }"
          :title="item.label"
          :aria-label="item.label"
          :aria-pressed="String(tool === item.id)"
          @click="setTool(item.id)"
        >
          <span>{{ item.glyph }}</span>
        </button>
      </div>

      <div class="paint-stage">
        <canvas
          ref="canvas"
          :width="canvasWidth"
          :height="canvasHeight"
          :data-tool="tool"
          @pointerdown="startDrawing"
          @pointermove="continueDrawing"
          @pointerup="finishDrawing"
          @pointercancel="cancelDrawing"
          @contextmenu.prevent
        ></canvas>
      </div>
    </div>

    <div class="paint-palette-row">
      <div class="paint-current-colors" title="Foreground and background colors">
        <span class="secondary" :style="{ backgroundColor: secondaryColor }"></span>
        <span class="primary" :style="{ backgroundColor: primaryColor }"></span>
      </div>
      <div class="paint-palette" aria-label="Color palette">
        <button
          v-for="color in colors"
          :key="color"
          type="button"
          :style="{ backgroundColor: color }"
          :title="color"
          :aria-label="`Use ${color}`"
          @click="setPrimaryColor(color)"
          @contextmenu.prevent="setSecondaryColor(color)"
        ></button>
      </div>
    </div>

    <div class="paint-statusbar">
      <span>{{ status }}</span>
      <span>{{ cursor.x }}, {{ cursor.y }}px</span>
      <span>{{ canvasWidth }} x {{ canvasHeight }}</span>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-mixed-operators */
const STORAGE_KEY = 'soli95-paint-document';
const MAX_HISTORY = 20;

const isShapeTool = tool => ['line', 'rectangle', 'ellipse'].includes(tool);
const isFreehandTool = tool => ['pencil', 'brush', 'eraser'].includes(tool);

export default {
  name: 'PaintApp',

  data() {
    return {
      tools: [
        { id: 'pencil', label: 'Pencil', glyph: '/' },
        { id: 'brush', label: 'Brush', glyph: 'B' },
        { id: 'eraser', label: 'Eraser', glyph: 'E' },
        { id: 'fill', label: 'Fill with color', glyph: 'F' },
        { id: 'line', label: 'Line', glyph: '\\' },
        { id: 'rectangle', label: 'Rectangle', glyph: '[]' },
        { id: 'ellipse', label: 'Ellipse', glyph: '()' },
      ],
      colors: [
        '#000000', '#808080', '#800000', '#808000', '#008000', '#008080', '#000080',
        '#800080', '#c0c0c0', '#ffffff', '#ff0000', '#ffff00', '#00ff00', '#00ffff',
        '#0000ff', '#ff00ff', '#ff7f00', '#8b4513', '#d87655', '#1084d0',
      ],
      brushSizes: [1, 3, 6, 10],
      canvasWidth: 720,
      canvasHeight: 440,
      tool: 'pencil',
      brushSize: 3,
      primaryColor: '#000000',
      secondaryColor: '#ffffff',
      activeColor: '#000000',
      cursor: { x: 0, y: 0 },
      status: 'Ready',
      drawing: false,
      startPoint: null,
      lastPoint: null,
      previewImage: null,
      history: [],
      historyIndex: -1,
    };
  },

  computed: {
    canUndo() {
      return this.historyIndex > 0;
    },

    canRedo() {
      return this.historyIndex >= 0 && this.historyIndex < this.history.length - 1;
    },
  },

  mounted() {
    this.ctx = this.$refs.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
    this.restoreSavedDocument();
  },

  methods: {
    readSavedDocument() {
      try {
        return window.localStorage.getItem(STORAGE_KEY);
      } catch (error) {
        return null;
      }
    },

    writeSavedDocument(dataUrl) {
      try {
        window.localStorage.setItem(STORAGE_KEY, dataUrl);
      } catch (error) {
        this.status = 'Drawing saved for this session';
      }
    },

    restoreSavedDocument() {
      const saved = this.readSavedDocument();
      this.clearCanvas();
      if (!saved) {
        this.history = [this.$refs.canvas.toDataURL('image/png')];
        this.historyIndex = 0;
        return;
      }

      this.restoreDataUrl(saved, () => {
        this.history = [saved];
        this.historyIndex = 0;
        this.status = 'Recovered previous drawing';
      });
    },

    restoreDataUrl(dataUrl, done) {
      const image = new Image();
      image.onload = () => {
        this.clearCanvas();
        this.ctx.drawImage(image, 0, 0, this.canvasWidth, this.canvasHeight);
        if (done) done();
      };
      image.src = dataUrl;
    },

    clearCanvas() {
      this.ctx.save();
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
      this.ctx.restore();
    },

    newDocument() {
      this.clearCanvas();
      this.commitHistory('New picture');
      this.emitSound();
    },

    setTool(tool) {
      this.tool = tool;
      this.status = this.tools.find(item => item.id === tool).label;
      this.emitSound();
    },

    setBrushSize(size) {
      this.brushSize = size;
      this.status = `Brush size: ${size}px`;
      this.emitSound();
    },

    setPrimaryColor(color) {
      this.primaryColor = color;
      this.status = `Foreground: ${color}`;
      this.emitSound();
    },

    setSecondaryColor(color) {
      this.secondaryColor = color;
      this.status = `Background: ${color}`;
      this.emitSound();
    },

    getPoint(event) {
      const rect = this.$refs.canvas.getBoundingClientRect();
      return {
        x: Math.max(0, Math.min(
          this.canvasWidth,
          (event.clientX - rect.left) * (this.canvasWidth / rect.width),
        )),
        y: Math.max(0, Math.min(
          this.canvasHeight,
          (event.clientY - rect.top) * (this.canvasHeight / rect.height),
        )),
      };
    },

    startDrawing(event) {
      if (event.button !== 0 && event.button !== 2) return;
      this.$el.focus();
      const point = this.getPoint(event);
      this.cursor = { x: Math.round(point.x), y: Math.round(point.y) };
      this.activeColor = event.button === 2 ? this.secondaryColor : this.primaryColor;

      if (this.tool === 'fill') {
        this.floodFill(Math.floor(point.x), Math.floor(point.y), this.activeColor);
        this.commitHistory('Filled area');
        this.emitSound();
        return;
      }

      this.drawing = true;
      this.startPoint = point;
      this.lastPoint = point;
      this.$refs.canvas.setPointerCapture(event.pointerId);

      if (isShapeTool(this.tool)) {
        this.previewImage = this.ctx.getImageData(0, 0, this.canvasWidth, this.canvasHeight);
      } else if (isFreehandTool(this.tool)) {
        this.drawStroke(point, point);
      }
    },

    continueDrawing(event) {
      const point = this.getPoint(event);
      this.cursor = { x: Math.round(point.x), y: Math.round(point.y) };
      if (!this.drawing) return;

      if (isFreehandTool(this.tool)) {
        this.drawStroke(this.lastPoint, point);
        this.lastPoint = point;
      } else if (isShapeTool(this.tool)) {
        this.ctx.putImageData(this.previewImage, 0, 0);
        this.drawShape(this.startPoint, point);
      }
    },

    finishDrawing(event) {
      if (!this.drawing) return;
      const point = this.getPoint(event);
      if (isShapeTool(this.tool)) {
        this.ctx.putImageData(this.previewImage, 0, 0);
        this.drawShape(this.startPoint, point);
      }
      this.drawing = false;
      this.previewImage = null;
      this.commitHistory(`${this.tools.find(item => item.id === this.tool).label} stroke`);
      this.emitSound();
    },

    cancelDrawing() {
      if (this.drawing && this.previewImage) this.ctx.putImageData(this.previewImage, 0, 0);
      this.drawing = false;
      this.previewImage = null;
    },

    configureStroke(color, width, lineCap) {
      this.ctx.strokeStyle = color;
      this.ctx.fillStyle = color;
      this.ctx.lineWidth = width;
      this.ctx.lineCap = lineCap;
      this.ctx.lineJoin = lineCap === 'round' ? 'round' : 'miter';
    },

    drawStroke(from, to) {
      const erasing = this.tool === 'eraser';
      const width = this.tool === 'pencil'
        ? 1
        : this.brushSize * (erasing ? 2 : 1);
      this.configureStroke(erasing ? '#ffffff' : this.activeColor, width, 'round');
      this.ctx.beginPath();
      this.ctx.moveTo(from.x, from.y);
      this.ctx.lineTo(to.x, to.y);
      this.ctx.stroke();
      if (from.x === to.x && from.y === to.y) {
        this.ctx.beginPath();
        this.ctx.arc(from.x, from.y, Math.max(0.5, width / 2), 0, Math.PI * 2);
        this.ctx.fill();
      }
    },

    drawShape(from, to) {
      const x = Math.min(from.x, to.x);
      const y = Math.min(from.y, to.y);
      const width = Math.abs(to.x - from.x);
      const height = Math.abs(to.y - from.y);
      this.configureStroke(this.activeColor, this.brushSize, 'square');
      this.ctx.beginPath();

      if (this.tool === 'line') {
        this.ctx.moveTo(from.x, from.y);
        this.ctx.lineTo(to.x, to.y);
      } else if (this.tool === 'rectangle') {
        this.ctx.rect(x, y, width, height);
      } else if (this.tool === 'ellipse') {
        this.ctx.ellipse(
          x + width / 2,
          y + height / 2,
          Math.max(0.5, width / 2),
          Math.max(0.5, height / 2),
          0,
          0,
          Math.PI * 2,
        );
      }
      this.ctx.stroke();
    },

    colorToRgba(color) {
      return [
        parseInt(color.slice(1, 3), 16),
        parseInt(color.slice(3, 5), 16),
        parseInt(color.slice(5, 7), 16),
        255,
      ];
    },

    floodFill(x, y, color) {
      const image = this.ctx.getImageData(0, 0, this.canvasWidth, this.canvasHeight);
      const data = image.data;
      const startIndex = (y * this.canvasWidth + x) * 4;
      const target = [
        data[startIndex],
        data[startIndex + 1],
        data[startIndex + 2],
        data[startIndex + 3],
      ];
      const replacement = this.colorToRgba(color);
      if (target.every((value, index) => value === replacement[index])) return;

      const pixelCount = this.canvasWidth * this.canvasHeight;
      const stack = new Int32Array(pixelCount);
      const seen = new Uint8Array(pixelCount);
      const startPixel = y * this.canvasWidth + x;
      let stackSize = 1;
      stack[0] = startPixel;
      seen[startPixel] = 1;

      const matches = (pixel) => {
        const offset = pixel * 4;
        return data[offset] === target[0]
          && data[offset + 1] === target[1]
          && data[offset + 2] === target[2]
          && data[offset + 3] === target[3];
      };

      const queue = (pixel) => {
        if (pixel < 0 || pixel >= pixelCount || seen[pixel] || !matches(pixel)) return;
        seen[pixel] = 1;
        stack[stackSize] = pixel;
        stackSize += 1;
      };

      while (stackSize > 0) {
        stackSize -= 1;
        const pixel = stack[stackSize];
        const offset = pixel * 4;
        data[offset] = replacement[0];
        data[offset + 1] = replacement[1];
        data[offset + 2] = replacement[2];
        data[offset + 3] = replacement[3];
        const px = pixel % this.canvasWidth;
        if (px > 0) queue(pixel - 1);
        if (px < this.canvasWidth - 1) queue(pixel + 1);
        queue(pixel - this.canvasWidth);
        queue(pixel + this.canvasWidth);
      }

      this.ctx.putImageData(image, 0, 0);
    },

    commitHistory(status) {
      const dataUrl = this.$refs.canvas.toDataURL('image/png');
      if (this.history[this.historyIndex] === dataUrl) return;
      this.history = this.history.slice(0, this.historyIndex + 1);
      this.history.push(dataUrl);
      if (this.history.length > MAX_HISTORY) this.history.shift();
      this.historyIndex = this.history.length - 1;
      this.writeSavedDocument(dataUrl);
      this.status = status;
    },

    undo() {
      if (!this.canUndo) return;
      this.historyIndex -= 1;
      const dataUrl = this.history[this.historyIndex];
      this.restoreDataUrl(dataUrl);
      this.writeSavedDocument(dataUrl);
      this.status = 'Undo';
      this.emitSound();
    },

    redo() {
      if (!this.canRedo) return;
      this.historyIndex += 1;
      const dataUrl = this.history[this.historyIndex];
      this.restoreDataUrl(dataUrl);
      this.writeSavedDocument(dataUrl);
      this.status = 'Redo';
      this.emitSound();
    },

    download() {
      const link = document.createElement('a');
      link.download = 'soli-paint.png';
      link.href = this.$refs.canvas.toDataURL('image/png');
      link.click();
      this.status = 'Saved as soli-paint.png';
      this.emitSound();
    },

    onKeyDown(event) {
      if (!(event.ctrlKey || event.metaKey)) return;
      const key = event.key.toLowerCase();
      if (key === 'z' && event.shiftKey) {
        event.preventDefault();
        this.redo();
      } else if (key === 'z') {
        event.preventDefault();
        this.undo();
      } else if (key === 'y') {
        event.preventDefault();
        this.redo();
      } else if (key === 's') {
        event.preventDefault();
        this.download();
      }
    },

    emitSound() {
      this.$emit('sound', 'click');
    },
  },
};
</script>

<style scoped>
.paint-app {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 0;
  overflow: hidden;
  background: #c0c0c0;
  color: #000000;
  font-family: "MS Sans Serif", Tahoma, sans-serif;
  outline: none;
}

.paint-commandbar {
  display: flex;
  align-items: center;
  min-height: 34px;
  gap: 3px;
  padding: 3px 5px;
  border-top: 1px solid #ffffff;
  border-bottom: 1px solid #808080;
}

.paint-commandbar button,
.paint-toolbox button,
.paint-size-picker button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 26px;
  padding: 2px;
  border: 2px outset #dfdfdf;
  border-radius: 0;
  background: #c0c0c0;
  color: #000000;
  font-family: inherit;
  cursor: pointer;
}

.paint-commandbar button:active,
.paint-commandbar button.active,
.paint-toolbox button:active,
.paint-toolbox button.active,
.paint-size-picker button:active,
.paint-size-picker button.active {
  border-style: inset;
  background: #ffffff;
}

.paint-commandbar button:disabled {
  color: #808080;
  cursor: default;
}

.paint-commandbar img {
  width: 18px;
  height: 18px;
  image-rendering: pixelated;
}

.paint-divider {
  width: 1px;
  height: 24px;
  margin: 0 3px;
  border-left: 1px solid #808080;
  border-right: 1px solid #ffffff;
}

.paint-size-picker {
  display: flex;
  gap: 2px;
}

.paint-size-picker button span {
  display: block;
  min-width: 2px;
  min-height: 2px;
  background: #000000;
}

.paint-workspace {
  display: flex;
  min-height: 0;
  flex: 1;
}

.paint-toolbox {
  display: grid;
  align-content: start;
  grid-template-columns: repeat(2, 30px);
  width: 66px;
  padding: 5px 3px;
  border-right: 1px solid #808080;
  gap: 2px;
}

.paint-toolbox button {
  width: 30px;
  height: 30px;
  font-family: "Courier New", monospace;
  font-size: 13px;
  font-weight: 700;
}

.paint-stage {
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow: auto;
  padding: 5px 14px 14px 5px;
  background-color: #808080;
  background-image:
    linear-gradient(45deg, #777777 25%, transparent 25%),
    linear-gradient(-45deg, #777777 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #777777 75%),
    linear-gradient(-45deg, transparent 75%, #777777 75%);
  background-position: 0 0, 0 5px, 5px -5px, -5px 0;
  background-size: 10px 10px;
}

.paint-stage canvas {
  display: block;
  width: min(100%, 720px);
  height: auto;
  border-right: 2px solid #404040;
  border-bottom: 2px solid #404040;
  background: #ffffff;
  image-rendering: pixelated;
  cursor: crosshair;
  touch-action: none;
}

.paint-palette-row {
  display: flex;
  align-items: center;
  min-height: 46px;
  gap: 8px;
  padding: 4px 6px;
  border-top: 1px solid #ffffff;
  border-bottom: 1px solid #808080;
}

.paint-current-colors {
  position: relative;
  width: 42px;
  height: 34px;
  border: 2px inset #dfdfdf;
}

.paint-current-colors span {
  position: absolute;
  width: 22px;
  height: 20px;
  border: 1px solid #000000;
}

.paint-current-colors .secondary {
  right: 3px;
  bottom: 3px;
}

.paint-current-colors .primary {
  top: 3px;
  left: 3px;
}

.paint-palette {
  display: grid;
  grid-template-columns: repeat(10, 18px);
  gap: 2px;
}

.paint-palette button {
  width: 18px;
  height: 18px;
  padding: 0;
  border: 2px outset #dfdfdf;
  border-radius: 0;
  cursor: pointer;
}

.paint-palette button:active {
  border-style: inset;
}

.paint-statusbar {
  display: grid;
  grid-template-columns: minmax(120px, 1fr) 100px 110px;
  gap: 3px;
  min-height: 22px;
  padding: 2px 3px;
}

.paint-statusbar span {
  min-width: 0;
  padding: 2px 5px;
  overflow: hidden;
  border: 1px inset #dfdfdf;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 560px) {
  .paint-palette {
    grid-template-columns: repeat(5, 18px);
  }

  .paint-palette-row {
    min-height: 82px;
  }

  .paint-statusbar {
    grid-template-columns: minmax(100px, 1fr) 74px;
  }

  .paint-statusbar span:last-child {
    display: none;
  }
}
</style>
