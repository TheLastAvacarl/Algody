class Item extends GameObject {
    constructor(config) {
      super(config);
      this.value = config.value || 0;
      this.set = config.set || false;
      this.isChecking = config.isChecking || false;
      this.compareValue = config.compareValue;
      this.comparisonSign = config.comparisonSign || "==";
      this.parent = null;
      this.offset = 0;
  
      // The size of each sprite box
      this.boxSize = 16;
  
      // The image source for the sprite sheet
      this.image = new Image();
      this.image.src = config.src; // Sprite sheet source
      this.image.onload = () => {
        this.isLoaded = true;
      }

    }
  
    checkItem() {
      if (this.isChecking) {
        let comparisonResult = false;
        switch (this.comparisonSign) {
          // Comparison logic or smthng
        }
        console.log(`Comparison result: ${comparisonResult}`);
        return comparisonResult;
      }
    }
  
    update() {
      this.checkItem();
      if (this.parent) {
        this.x = this.parent.x - ((this.parent.attachedItems.length - 1) * 8) + (this.parent.attachedItems.indexOf(this) * 16);
        this.y = this.parent.y - 16;
        this.zIndex = this.parent.zIndex + 1;
      }
    }
  
    draw(ctx) {
      const col = this.value % 10; // Column index (0-9)
      const row = Math.floor(this.value / 10); // Row index (0-9)
  
      const x = this.x - (this.boxSize / 2);
      const y = this.y - (this.boxSize / 2);


    

  
      this.isLoaded && ctx.drawImage(this.image,
        col * this.boxSize, row * this.boxSize, // Source X and Y on the sprite sheet
        this.boxSize, this.boxSize,              // Source width and height
        x, y,                                    // Destination X and Y on the canvas
        this.boxSize, this.boxSize               // Destination width and height
      );
    }
  }
  