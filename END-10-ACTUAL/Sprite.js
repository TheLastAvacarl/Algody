class Sprite {
  constructor(config) {
    // Set up the image
    this.image = new Image();
    this.image.src = config.src;
    this.image.onload = () => {
      this.isLoaded = true;
    }

    // Shadow
    this.shadow = new Image();
    this.useShadow = config.useShadow || false;
    if (this.useShadow) {
      this.shadow.src = config.shadow || "images/characters/shadow.png";
    }
    this.shadow.onload = () => {
      this.isShadowLoaded = true;
    }

    this.highlighted = false; 
    this.highlightColor = "white"; 
    this.transitionProgress = 0;

    // Configure Animation & Initial State
    this.useAnimation = config.useAnimation || false;
    this.animations = config.animations || {
      "idle-down": [[0, 0]],
      "idle-right": [[0, 1]],
      "idle-up": [[0, 2]],
      "idle-left": [[0, 3]],
      "walk-down": [[1, 0], [0, 0], [3, 0], [0, 0]],
      "walk-right": [[1, 1], [0, 1], [3, 1], [0, 1]],
      "walk-up": [[1, 2], [0, 2], [3, 2], [0, 2]],
      "walk-left": [[1, 3], [0, 3], [3, 3], [0, 3]]
    };
    this.currentAnimation = config.currentAnimation || "idle-right";
    this.currentAnimationFrame = 0;

    this.animationFrameLimit = config.animationFrameLimit || 8;
    this.animationFrameProgress = this.animationFrameLimit;

    // Reference the game object
    this.gameObject = config.gameObject;
  }

  get frame() {
    return this.useAnimation
      ? this.animations[this.currentAnimation][this.currentAnimationFrame]
      : [Math.floor(this.gameObject.value % 10), Math.floor(this.gameObject.value / 10)];
  }

  setAnimation(key) {
    if (this.useAnimation && this.currentAnimation !== key) {
      this.currentAnimation = key;
      this.currentAnimationFrame = 0;
      this.animationFrameProgress = this.animationFrameLimit;
    }
  }

  updateAnimationProgress() {
    if (this.useAnimation) {
      if (this.animationFrameProgress > 0) {
        this.animationFrameProgress -= 1;
        return;
      }

      this.animationFrameProgress = this.animationFrameLimit;
      this.currentAnimationFrame += 1;

      if (this.frame === undefined) {
        this.currentAnimationFrame = 0;
      }
    }
  }

  highlight(color = "white") {
    this.highlighted = true;
    this.highlightColor = color;
    this.transitionProgress = 0;

    const colorMap = {
      "green": [0, 255, 0],
      "red": [255, 0, 0],
      "blue": [0, 0, 255],
      "yellow": [255, 255, 0],
      "purple": [128, 0, 128],
      "cyan": [0, 255, 255],
      "orange": [255, 165, 0],
      "pink": [255, 192, 203],
      "brown": [165, 42, 42],
      "gray": [128, 128, 128],
      "white": [255, 255, 255]
    };

    if (colorMap[color]) {
      this.transitionToColor(colorMap[color]);
    } else {
      this.transitionToColor(colorMap["white"]);
    }
  }

  transitionToColor(targetRgb) {
    const transitionDuration = 1000;
    this.transitionProgress = 0;

    const step = () => {
      this.transitionProgress += 16;
      const t = Math.min(this.transitionProgress / transitionDuration, 1);

      const r = Math.round(255 * (1 - t) + targetRgb[0] * t);
      const g = Math.round(255 * (1 - t) + targetRgb[1] * t);
      const b = Math.round(255 * (1 - t) + targetRgb[2] * t);

      this.highlightColor = `rgb(${r}, ${g}, ${b})`;

      if (this.transitionProgress < transitionDuration) {
        requestAnimationFrame(step);
      }
    };
    
    requestAnimationFrame(step);
  }

  removeHighlight() {
    this.highlighted = false;
    this.transitionProgress = 0;
  }

  draw(ctx) {
    const x = this.gameObject.x - 8;
    const y = this.gameObject.y - 18;

    if (this.highlighted) {
      ctx.strokeStyle = this.highlightColor;
      ctx.lineWidth = 4;
    
      const lineY = y + 30;
      ctx.beginPath();
      ctx.moveTo(x + 9, lineY);
      ctx.lineTo(x + 23, lineY);
      ctx.stroke();
    }

    this.isShadowLoaded && ctx.drawImage(this.shadow, x, y);

    const [frameX, frameY] = this.frame;

    this.isLoaded && ctx.drawImage(this.image,
      frameX * 32, frameY * 32,
      32, 32,
      x, y,
      32, 32
    );

    this.updateAnimationProgress();
  }
}
