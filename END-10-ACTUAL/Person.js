class Person extends GameObject {
  constructor(config) {
    super(config);
    this.movingProgressRemaining = 0;
    this.isStanding = false;


    this.isPlayerControlled = config.isPlayerControlled || false;

    this.directionUpdate = {
      "up": ["y", -1],
      "down": ["y", 1],
      "left": ["x", -1],
      "right": ["x", 1],
    }

    this.attachedItems = [];
    this.level = config.level || 1;
  }

  update(state) {
    if (this.movingProgressRemaining > 0) {
      this.updatePosition();
    } else {

      //Case: We're keyboard ready and have an arrow pressed
      if (!state.map.isCutscenePlaying && this.isPlayerControlled && state.arrow) {
        this.startBehavior(state, {
          type: "walk",
          direction: state.arrow
        })
      }
      this.updateSprite(state);
    }
  }

  startBehavior(state, behavior) {
    //Set character direction to whatever behavior has
    this.direction = behavior.direction;
    
    if (behavior.type === "walk") {
      //Stop here if space is not free
      if (state.map.isSpaceTaken(this.x, this.y, this.direction)) {

        behavior.retry && setTimeout(() => {
          this.startBehavior(state, behavior)
        }, 10);

        return;
      }

      //Ready to walk!
      state.map.moveWall(this.x, this.y, this.direction);
      this.movingProgressRemaining = 16;
      this.updateSprite(state);
    }

    if (behavior.type === "stand") {
      this.isStanding = true;
      setTimeout(() => {
        utils.emitEvent("PersonStandComplete", {
          whoId: this.id
        })
        this.isStanding = false;
      }, behavior.time)
    }

    

  }

  updatePosition() {
      const [property, change] = this.directionUpdate[this.direction];
      this[property] += change;
      this.movingProgressRemaining -= 1;

      if (this.movingProgressRemaining === 0) {
        //We finished the walk!
        utils.emitEvent("PersonWalkingComplete", {
          whoId: this.id
        })

      }
  }

  updateSprite() {
    if (this.movingProgressRemaining > 0) {
      this.sprite.setAnimation("walk-"+this.direction);
      return;
    }
    this.sprite.setAnimation("idle-"+this.direction);    
  }


  getNextPosition() {
    const [property, change] = this.directionUpdate[this.direction];
    const pixelChange = 16;

    const nextX = property === "x" ? this.x + (this.direction === "right" ? pixelChange : (this.direction === "left" ? -pixelChange : 0)) : this.x;
    const nextY = property === "y" ? this.y + (this.direction === "down" ? pixelChange : (this.direction === "up" ? -pixelChange : 0)) : this.y;

    return { nextX, nextY };
  }
  
  pickUp(state) {
    const { nextX, nextY } = this.getNextPosition();

    console.log(`Attempting to pick up item at: nextX=${nextX}, nextY=${nextY}`);
    // console.log(verworld.level)

    const itemInFront = Object.values(state.map.gameObjects).find(object =>
      object.x === nextX && object.y === nextY && object instanceof Item
    );

    if (itemInFront) {
        console.log(`Item picked up! Value: ${itemInFront.value}`);
        this.level = 1;
        console.log("level is", this.level);

        // Animate the item being picked up
        const targetY = this.y - 16;
        const stepSize = 1;

        const animate = () => {
            if (itemInFront.y > targetY) {
                itemInFront.y -= stepSize;
                // itemInFront.x -= stepSize;
                requestAnimationFrame(animate);
            } else {
                // Ensure the item is at the correct position after the animation
                itemInFront.y = targetY;

                // Set the item as a child of the person
                itemInFront.parent = this;
                itemInFront.zIndex = this.zIndex + 1;

                console.log("Item animation complete");

                // Adjust removeWall based on direction
                const itemToMoveX = (this.direction === "right") ? this.x + 16 : 
                                    (this.direction === "left") ? this.x - 16 : 
                                    this.x;
                const itemToMoveY = (this.direction === "down") ? this.y + 16 : 
                                    (this.direction === "up") ? this.y - 16 : 
                                    this.y;
                
                // Remove the wall or obstacle
                state.map.removeWall(itemToMoveX, itemToMoveY);
                console.log(`${itemToMoveX},${itemToMoveY}`)

                // Adjust positions of already attached items
                this.attachedItems.forEach(attachedItem => {
                    attachedItem.x -= 16;  // Move existing items left by 16 pixels
                });

                // Attach the new item to the character's `attachedItems` array
                this.attachedItems.push(itemInFront);
            }
        };
        animate();
    } else {
        console.log("No item to pick up in front.");
    }
  }

  putDown(state) {
    if (this.attachedItems.length > 0) {
      const itemToPutDown = this.attachedItems.shift(); 
      const { nextX, nextY } = this.getNextPosition();

      // Animate the item being put down
      const targetX = nextX;
      const targetY = nextY;
      const stepSize = 1;
      itemToPutDown.parent = null;

      const animate = () => {
        if (itemToPutDown.y < targetY) {
          itemToPutDown.y += stepSize;
          // itemToPutDown.x += stepSize;
          requestAnimationFrame(animate);
        } else {
          // Ensure the item is at the correct position after the animation
          itemToPutDown.y = targetY;
          itemToPutDown.x = targetX;

          // Set the item as not a child of the person
          itemToPutDown.parent = null;
          itemToPutDown.zIndex = this.zIndex - 1;

          console.log("Item animation complete");

          // Place the item in the map
          state.map.gameObjects[itemToPutDown.id] = itemToPutDown;
          state.map.initObjAtCoord();

          // Add the wall or obstacle back if necessary
          state.map.addWall(nextX, nextY);
        }
      };
      animate();
    } else {
      console.log("No item to put down.");
    }
  }

  

}