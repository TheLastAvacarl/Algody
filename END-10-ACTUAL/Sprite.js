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
      this.shadow.src = config.shadow|| "images/characters/shadow.png";
    }
    this.shadow.onload = () => {
      this.isShadowLoaded = true;
    }


    this.highlighted = false; 
    this.highlightColor = "white"; 
    this.transitionProgress = 0;

    // Configure Animation & Initial State
    this.useAnimation = config.useAnimation || false; // New property
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
      // Downtick frame progress
      if (this.animationFrameProgress > 0) {
        this.animationFrameProgress -= 1;
        return;
      }

      // Reset the counter
      this.animationFrameProgress = this.animationFrameLimit;
      this.currentAnimationFrame += 1;

      if (this.frame === undefined) {
        this.currentAnimationFrame = 0;
      }
    }
  }

 
  highlight(color = "white") {
    this.highlighted = true; // Start highlighting
    this.highlightColor = color; // Set the initial highlight color
    this.transitionProgress = 0; // Reset transition progress

    if (color === "green") {
      this.transitionToColor("green");
    } else if (color === "red") {
      this.transitionToColor("red");
    } else {
      this.transitionToColor("white");
    }
  }
  transitionToColor(targetColor) {
    const transitionDuration = 1000; // 1 second transition
    this.transitionProgress = 0; // Reset transition progress
  
    const step = () => {
      this.transitionProgress += 16; // Approx. 60 FPS
      const t = Math.min(this.transitionProgress / transitionDuration, 1); // Clamp t to [0, 1]
  
      // Determine the target RGB values
      let targetRgb;
      if (targetColor === "green") {
        targetRgb = [0, 255, 0]; // Target green color
      } else if (targetColor === "red") {
        targetRgb = [255, 0, 0]; // Target red color
      } else {
        targetRgb = [255, 255, 255]; // Default to white
      }
  
      // Interpolate between white (255, 255, 255) and target color
      const r = Math.round(255 * (1 - t) + targetRgb[0] * t);
      const g = Math.round(255 * (1 - t) + targetRgb[1] * t);
      const b = Math.round(255 * (1 - t) + targetRgb[2] * t);
  
      this.highlightColor = `rgb(${r}, ${g}, ${b})`; // Set the interpolated color
  
      if (this.transitionProgress < transitionDuration) {
        requestAnimationFrame(step);
      }
    };
    
    requestAnimationFrame(step);
  }

  removeHighlight() {
    this.highlighted = false;
    this.transitionProgress = 0; // Reset progress when removing highlight
  }

  draw(ctx) {
    const x = this.gameObject.x - 8;
    const y = this.gameObject.y - 18;

    if (this.highlighted) {
      ctx.strokeStyle = this.highlightColor;
      ctx.lineWidth = 4;
      ctx.strokeRect(x, y, 32, 32); // Draw highlight outline
    }

    this.isShadowLoaded && ctx.drawImage(this.shadow, x, y);

    const [frameX, frameY] = this.frame;

    this.isLoaded && ctx.drawImage(this.image,
      frameX * 32, frameY * 32,
      32, 32,
      x, y,
      32, 32
    );



 // Update highlight color if highlighted

    this.updateAnimationProgress();
        // this.updateHighlightColor(); // Update highlight color if highlighted

  }
}
