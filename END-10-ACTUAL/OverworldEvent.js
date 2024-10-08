class OverworldEvent {
  constructor({ map, event }) {
    this.map = map;
    this.event = event;
  }

  stand(resolve) {
    const who = this.map.gameObjects[this.event.who];
    who.startBehavior({
      map: this.map
    }, {
      type: "stand",
      direction: this.event.direction,
      time: this.event.time
    });

    // Set up a handler to complete when the correct person is done standing, then resolve the event
    const completeHandler = e => {
      if (e.detail.whoId === this.event.who) {
        document.removeEventListener("PersonStandComplete", completeHandler);
        resolve();
      }
    };
    document.addEventListener("PersonStandComplete", completeHandler);
  }
  

  highlight(resolve) {
    const item = this.map.gameObjects[this.event.itemId]; // Ensure this.event.itemId points to the correct item
    item.sprite.highlight(); // Call highlight method on the item's sprite
  
    setTimeout(() => {
      item.sprite.removeHighlight(); // Remove highlight after the duration
      resolve();
    }, 2000); // Total duration for highlight
  }

  

  walk(resolve) {
    const who = this.map.gameObjects[this.event.who];
    who.startBehavior({
      map: this.map
    }, {
      type: "walk",
      direction: this.event.direction,
      retry: true
    });

    // Set up a handler to complete when the correct person is done walking, then resolve the event
    const completeHandler = e => {
      if (e.detail.whoId === this.event.who) {
        document.removeEventListener("PersonWalkingComplete", completeHandler);
        resolve();
      }
    };
    document.addEventListener("PersonWalkingComplete", completeHandler);
  }


  textMessage(resolve) {
    const who = this.map.gameObjects[this.event.who];

    if (this.event.faceHero) {
      const obj = this.map.gameObjects[this.event.faceHero];
      obj.direction = utils.oppositeDirection(this.map.gameObjects["hero"].direction);
    }
    const text = this.event.text;

    const textWidth = text.length // Estimate total width of the text

    const centeredX = who.x - textWidth ;

    const message = new TextMessage({
      text: this.event.text,
      x: centeredX,
      y: who.y - 16,
      duration: 2000,
      canBeSkipped: false,
      onComplete: () => resolve()
    });
    message.init(document.querySelector(".game-container"));
  }


  changeMap(resolve) {
    const sceneTransition = new SceneTransition();
    sceneTransition.init(document.querySelector(".game-container"), () => {
      this.map.overworld.startMap(window.OverworldMaps[this.event.map]);
      resolve();
      sceneTransition.fadeOut();
    });
  }


  checkItemInFront(resolve) {
    const who = this.map.gameObjects[this.event.who];
    const direction = who.direction;
    const x = who.x;
    const y = who.y;
  
    let item = null;
  
    // Determine the position in front of the character
    switch (direction) {
      case "up":
        item = this.map.getObjectAt(x, y - 16);
        break;
      case "down":
        item = this.map.getObjectAt(x, y + 16);
        break;
      case "left":
        item = this.map.getObjectAt(x - 16, y);
        break;
      case "right":
        item = this.map.getObjectAt(x + 16, y);
        break;
    }

    if (item) {
      item.sprite.highlight("white");
    }
  
    let comparisonMessage = '';
  
    if (this.event.compareValue !== undefined && this.event.comparisonSign !== undefined) {
      // Perform comparison if compareValue and comparisonSign are provided
      comparisonMessage = `${item ? item.value : 'No item'} ${this.event.comparisonSign} ${this.event.compareValue}`;
      const { resultText, isComparisonValid } = item && item instanceof Item ? this.compareItem(item) : { resultText: "No item found in front.", isComparisonValid: false };
  
      const displayMessage = (text, color, duration, onComplete) => {
        const textWidth = text.length; // Estimate total width of the text
        const centeredX = who.x - textWidth;
        const message = new TextMessage({
          text,
          x: centeredX,
          y: who.y - 16,
          duration,
          canBeSkipped: false,
          onComplete
        });
  
        message.color = color; // Assuming you want to set the text color
        message.init(document.querySelector(".game-container"));
      };
  
      // Show the comparison message
      displayMessage(comparisonMessage, 'black', 2000, () => {
        // Wait for 2 seconds before showing the result
        setTimeout(() => {
          // Determine color based on result
          const resultColor = isComparisonValid ? 'green' : 'red';
          item.sprite.highlight(resultColor);
          displayMessage(resultText, resultColor, 2000, () => {
            console.log("Text message completed");
            resolve();
          });
        }, 10);
      });
  
    } else {
      // Default behavior if no compareValue and comparisonSign
      comparisonMessage = item ? `Item value: ${item.value}` : 'No item in front.';
  
      const displayMessage = (text, color, duration, onComplete) => {
        const textWidth = text.length; // Estimate total width of the text
        const centeredX = who.x - textWidth;
        
        const message = new TextMessage({
          text,
          x: centeredX,
          y: who.y - 16,
          duration,
          canBeSkipped: false,
          onComplete
        });
  
        message.color = color; // Assuming you want to set the text color
        message.init(document.querySelector(".game-container"));
      };
  
      // Show the default message
      displayMessage(comparisonMessage, 'black', 2000, () => {
        console.log("Text message completed");
        resolve();
      });
    }
  }

  foundItem(resolve) {
    const who = this.map.gameObjects[this.event.who];
    
    // Get all items on the map and sort them by their `x` values.
    const items = Object.values(this.map.gameObjects).filter(obj => obj instanceof Item);
    const sortedItems = items.sort((a, b) => a.x - b.x);

    // Get the index of the item we want to find
    const targetItemIndex = this.event.itemIndex;
    const targetValue = this.event.value; // New parameter for value comparison

    // Ensure the targetItemIndex is within range
    if (targetItemIndex < 0 || targetItemIndex >= sortedItems.length) {
        console.log("Item index out of bounds!");
        this.displayMessageAndPlaySound(`No item at index ${targetItemIndex}`, false, resolve);
        return;
    }

    // Find the target item based on the dynamic sorting
    const targetItem = sortedItems[targetItemIndex];

    if (targetItem) {
        console.log(`Found item at index ${targetItemIndex}:`, targetItem);

        // Highlight the found item
        targetItem.sprite.highlight("green");

        // Check for value comparison
        if (targetValue !== undefined) {
            if (targetItem.value === targetValue) {
                // If values match, display success message
                this.displayMessageAndPlaySound(`Found item with value ${targetItem.value} at index ${targetItemIndex}. Values match!`, true, resolve);
            } else {
                // If values do not match, highlight red and display failure message
                targetItem.sprite.highlight("red");
                this.displayMessageAndPlaySound(`Found item with value ${targetItem.value} at index ${targetItemIndex}. Values do not match.`, false, resolve);
            }
        } else {
            // No value parameter provided, display found message
            this.displayMessageAndPlaySound(`Found item with value ${targetItem.value} at index ${targetItemIndex}`, true, resolve);
        }
    } else {
        console.log(`No item found at index ${targetItemIndex}.`);
        this.displayMessageAndPlaySound("No item found.", false, resolve);
    }
}



  
  compareItem(item) {
    const comparison = this.event.comparisonSign;
    const value = item.value;
    const targetValue = this.event.compareValue;
  
    console.log(`Performing comparison: ${value} ${comparison} ${targetValue}`);
  
    let resultText = "";
    let isComparisonValid = false;
  
    switch (comparison) {
      case "==":
        resultText = value === targetValue ? "are equal." : "are not equal.";
        isComparisonValid = value === targetValue;
        break;
      case "!=":
        resultText = value !== targetValue ? "are not equal." : "are equal.";
        isComparisonValid = value !== targetValue;
        break;
      case ">":
        resultText = value > targetValue ? "is greater." : "is not greater.";
        isComparisonValid = value > targetValue;
        break;
      case "<":
        resultText = value < targetValue ? "is less." : "is not less.";
        isComparisonValid = value < targetValue;
        break;
      // Add more cases as needed
      default:
        resultText = "Unknown comparison.";
        isComparisonValid = false;
    }
  
    return { resultText, isComparisonValid };
  }

  goToItem(resolve) {
    const who = this.map.gameObjects[this.event.who];

    // Get all items on the map
    const items = Object.values(this.map.gameObjects).filter(obj => obj instanceof Item);

    // Sort items by their x position (ascending order)
    const sortedItems = items.sort((a, b) => a.x - b.x);

    // Get the index of the item we want to go to
    const targetItemIndex = this.event.itemIndex;

    // Ensure the targetItemIndex is within range
    if (targetItemIndex < 0 || targetItemIndex >= sortedItems.length) {
        console.log("Item index out of bounds!");

        // Trigger a text message event if the index is out of bounds
        const textEvent = {
            type: "textMessage",
            who: "hero",
            text: `There is no item at this index ${targetItemIndex}`,
            // faceHero: "hero" // Optionally, make the message face the hero
        };

        const textHandler = new OverworldEvent({
            map: this.map,
            event: textEvent
        });

        textHandler.init().then(() => {
            resolve(); // Resolve the event after showing the message
        });

        return;
    }

    // Find the target item based on its index after sorting
    const targetItem = sortedItems[targetItemIndex];

    const targetX = targetItem.x;
    const targetY = targetItem.y - 16; // Adjust Y-coordinate by subtracting 16

    console.log(`Moving ${who.id} to the item at index ${targetItemIndex} (${targetX}, ${targetY})`);

    // Move the character to the target item's position
    const moveEvent = {
        type: "walkTo",
        who: this.event.who,
        x: targetX,
        y: targetY
    };

    const moveHandler = new OverworldEvent({
        map: this.map,
        event: moveEvent
    });

    moveHandler.init().then(() => {
        console.log(`${who.id} has reached the item at index ${targetItemIndex}.`);

        // Create a stand event after reaching the item
        const standEvent = {
            type: "stand",
            who: this.event.who,
            direction: "down", // Adjust this if needed
            time: 500 // Duration of the stand
        };

        const standHandler = new OverworldEvent({
            map: this.map,
            event: standEvent
        });

        return standHandler.init(); // Wait for the stand event to complete
    }).then(() => {
        console.log(`${who.id} is now standing after reaching the item.`);
        resolve(); // Resolve the event sequence after standing
    });
}

highlightIndex(resolve) {
  const targetIndex = this.event.itemIndex;

  // Get all items on the map and sort them by their `x` values.
  const items = Object.values(this.map.gameObjects).filter(obj => obj instanceof Item);
  const sortedItems = items.sort((a, b) => a.x - b.x);

  // Ensure the targetIndex is within range
  if (targetIndex < 0 || targetIndex >= sortedItems.length) {
      console.log("Index out of bounds for highlighting!");
      resolve(); // Resolve immediately if index is invalid
      return;
  }

  // Find the target item based on the dynamic sorting
  const targetItem = sortedItems[targetIndex];

  if (targetItem) {
    console.log(`Highlighting item at index ${targetIndex}:`, targetItem);

    // Highlight the found item
    targetItem.sprite.highlight("yellow"); // Use a different color for highlighting

    // Optionally, you can display a message or add more actions here
  } else {
    console.log(`No item found to highlight at index ${targetIndex}.`);
  }

  // Resolve the event after the highlight action
  resolve();
}


removeAllHighlights(resolve) {
  // Get all items on the map
  const items = Object.values(this.map.gameObjects).filter(obj => obj instanceof Item);

  // Remove highlight from each item
  items.forEach(item => {
    item.sprite.removeHighlight(); // Assuming this method resets the highlight state
  });

  console.log("Removed all highlights from items.");

  // Resolve the event after removing highlights
  resolve();
}

  walkTo(resolve) {
    const who = this.map.gameObjects[this.event.who];
    const targetX = this.event.x;
    const targetY = this.event.y;
  
    const move = () => {
      let direction = null;
  
      // Move along the Y-axis first
      const yDiff = targetY - who.y;
      if (yDiff !== 0) {
        direction = yDiff > 0 ? "down" : "up";
      } else {
        // Once Y-axis is aligned, move along the X-axis
        const xDiff = targetX - who.x;
        if (xDiff !== 0) {
          direction = xDiff > 0 ? "right" : "left";
        }
      }
  
      console.log(`Current Position: (${who.x}, ${who.y}), Target Position: (${targetX}, ${targetY}), Direction: ${direction}`);
  
      if (direction) {
        who.startBehavior({ map: this.map }, { type: "walk", direction: direction, retry: true });
  
        // Set up a handler to continue movement until target position is reached
        const completeHandler = e => {
          if (e.detail.whoId === this.event.who) {
            document.removeEventListener("PersonWalkingComplete", completeHandler);
            move(); // Continue moving towards the target
          }
        };
  
        document.addEventListener("PersonWalkingComplete", completeHandler);
      } else {
        console.log(`Reached Target Position: (${who.x}, ${who.y})`);
        resolve(); // Reached the target position, resolve the event
      }
    };
  
    console.log(`Starting movement for ${who.id} to (${targetX}, ${targetY})`);
    move(); // Start the first move
  }
  

  pickUp(resolve) {
    const who = this.map.gameObjects[this.event.who];
    who.pickUp({
      ...this.map,
      map: this.map,
      gameObjects: this.map.gameObjects
    });
    setTimeout(() => {
        resolve();
    }, 500); 
  }

  putDown(resolve) {
    const who = this.map.gameObjects[this.event.who];
    who.putDown({
      ...this.map,
      map: this.map,
      gameObjects: this.map.gameObjects
    });
    setTimeout(() => {
      resolve();
  }, 500); 
  }

  init() {
    return new Promise(resolve => {
      this[this.event.type](resolve);
    });
  }

  swapTwoItems(resolve) {
    const targetIndex1 = this.event.itemIndex1;
    const targetIndex2 = this.event.itemIndex2;

    // Ensure the indices are provided
    if (targetIndex1 === undefined || targetIndex2 === undefined) {
        console.log("Indices for swapping not provided!");
        resolve();
        return;
    }

    // Function to get the current item based on index
    const getCurrentItem = (index) => {
        const items = Object.values(this.map.gameObjects).filter(obj => obj instanceof Item);
        return items.sort((a, b) => a.x - b.x)[index];
    };

    // Store original positions of the items
    const item1 = getCurrentItem(targetIndex1);
    const item2 = getCurrentItem(targetIndex2);
    const originalPosition1 = { x: item1.x, y: item1.y };
    const originalPosition2 = { x: item2.x, y: item2.y };

    const moveToFirstItem = () => {
        const goToItemEvent1 = new OverworldEvent({
            map: this.map,
            event: {
                type: "goToItem",
                who: this.event.who,
                itemIndex: targetIndex1,
            }
        });
        return goToItemEvent1.init();
    };

    const pickUpFirstItem = () => {
        const pickUpEvent1 = new OverworldEvent({
            map: this.map,
            event: {
                type: "pickUp",
                who: this.event.who,
            }
        });
        return pickUpEvent1.init();
    };

    const moveToSecondItem = () => {
        const goToItemEvent2 = new OverworldEvent({
            map: this.map,
            event: {
                type: "goToItem",
                who: this.event.who,
                itemIndex: targetIndex2,
            }
        });
        return goToItemEvent2.init();
    };

    const pickUpSecondItem = () => {
        const pickUpEvent2 = new OverworldEvent({
            map: this.map,
            event: {
                type: "pickUp",
                who: this.event.who,
            }
        });
        return pickUpEvent2.init();
    };

    const moveToFirstItemPosition = () => {
        const moveEvent1 = {
            type: "walkTo",
            who: this.event.who,
            x: originalPosition1.x,
            y: originalPosition1.y - 16, // Adjust Y-coordinate if needed
        };

        const walkToEvent1 = new OverworldEvent({
            map: this.map,
            event: moveEvent1,
        });

        return walkToEvent1.init();
    };

    const standAfterFirstPutDown = () => {
        const standEvent1 = {
            type: "stand",
            who: this.event.who,
            direction: "down",
            time: 500,
        };

        const standHandler1 = new OverworldEvent({
            map: this.map,
            event: standEvent1,
        });

        return standHandler1.init();
    };

    const putDownFirstItem = () => {
        const putDownEvent1 = new OverworldEvent({
            map: this.map,
            event: {
                type: "putDown",
                who: this.event.who,
            }
        });

        return putDownEvent1.init();
    };

    const moveToSecondItemPosition = () => {
        const moveEvent2 = {
            type: "walkTo",
            who: this.event.who,
            x: originalPosition2.x,
            y: originalPosition2.y - 16, // Adjust Y-coordinate if needed
        };

        const walkToEvent2 = new OverworldEvent({
            map: this.map,
            event: moveEvent2,
        });

        return walkToEvent2.init();
    };

    const standAfterSecondPutDown = () => {
        const standEvent2 = {
            type: "stand",
            who: this.event.who,
            direction: "down",
            time: 500,
        };

        const standHandler2 = new OverworldEvent({
            map: this.map,
            event: standEvent2,
        });

        return standHandler2.init();
    };

    const putDownSecondItem = () => {
        const putDownEvent2 = new OverworldEvent({
            map: this.map,
            event: {
                type: "putDown",
                who: this.event.who,
            }
        });

        return putDownEvent2.init();
    };

    // Execute the sequence: Move to item 1 -> pick up item 1 -> Move to item 2 -> pick up item 2
    moveToFirstItem()
        .then(() => pickUpFirstItem())
        .then(() => moveToSecondItem())
        .then(() => pickUpSecondItem())
        .then(() => putDownFirstItem())
        .then(() => standAfterFirstPutDown())
        .then(() => moveToFirstItemPosition()) // Move back to the first item's original position
        .then(() => standAfterSecondPutDown())
        .then(() => putDownSecondItem())
        .then(() => moveToSecondItemPosition())
        .then(() => resolve());
}





displayMessageAndPlaySound(messageText, isSuccess, resolve) {
  const who = this.map.gameObjects[this.event.who];

  // Estimate text width
  const textWidth = messageText.length;
  const centeredX = who.x - textWidth;

  // Display the text message
  const message = new TextMessage({
    text: messageText,
    x: centeredX,
    y: who.y - 16,
    duration: 2000, // Display for 2 seconds
    canBeSkipped: false,
    onComplete: () => {
      // After message is complete, change canvas border and play sound
      this.changeCanvasBorderAndPlaySound(isSuccess, resolve);
    }
  });

  message.init(document.querySelector(".game-container"));
}

changeCanvasBorderAndPlaySound(isSuccess, resolve) {
  const container = document.querySelector(".game-container");

  if (container) {
    // Change border color
    container.style.border = `2px solid ${isSuccess ? "green" : "red"}`;

    // Play sound
    const audio = new Audio(`path/to/${isSuccess ? "success" : "failed"}.mp3`);
    audio.play().then(() => {
      setTimeout(resolve, 500);
    }).catch(error => {
      console.error("Error playing sound:", error);
      resolve(); // Resolve even if there's an error playing the sound
    });
    this.displayButtons(container, isSuccess, resolve);
  } else {
    console.error("Game container not found.");

    resolve();
  }
}

displayButtons(container, isSuccess, resolve) {
  // Create a container for buttons
  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("button-container");

  // Create status message
  const statusMessage = document.createElement("h2");
  statusMessage.textContent = isSuccess ? "Success" : "Failed";
  statusMessage.classList.add("status-message");
  buttonContainer.appendChild(statusMessage);

  // Create a row for buttons
  const buttonRow = document.createElement("div");
  buttonRow.classList.add("button-row");

  // Create Retry button
  const retryButton = document.createElement("button");
  retryButton.classList.add("event-button", "retry-button");
  retryButton.innerHTML = `<img src="images/icons/retry.svg" alt="Retry" />`;
  retryButton.addEventListener("click", () => {
      this.handleRetry(resolve);
  });

  // Create Home button
  const homeButton = document.createElement("button");
  homeButton.classList.add("event-button", "home-button");
  homeButton.innerHTML = `<img src="images/icons/home.svg" alt="Home" />`;
  homeButton.addEventListener("click", () => {
      this.handleHome(resolve);
  });

  // Create Next Level button with SVG
  const nextLevelButton = document.createElement("button");
  nextLevelButton.classList.add("event-button", "next-level-button");
  nextLevelButton.innerHTML = `<img src="images/icons/next.svg" alt="Next" />`;

  // Enable or disable the Next Level button based on isSuccess
  if (isSuccess) {
      nextLevelButton.disabled = false;
      nextLevelButton.addEventListener("click", () => {
          this.handleNextLevel(resolve);
      });
  } else {
      nextLevelButton.disabled = true;
  }

  // Append buttons to button row
  buttonRow.appendChild(retryButton);
  buttonRow.appendChild(homeButton);
  buttonRow.appendChild(nextLevelButton);

  // Append button row to button container
  buttonContainer.appendChild(buttonRow);

  // Append button container to main container
  container.appendChild(buttonContainer);

  // Use a timeout to add the "show" class after 1 second
  setTimeout(() => {
      buttonContainer.classList.add("show");
  }, 1000);
}

handleNextLevel(resolve) {
    console.log("Next Level button clicked");
    // Implement next level logic here
    window.location.href = "next-level.html"; // Example: navigate to the next level
    resolve(); // Call resolve to continue after clicking the button
}
  
handleRetry(resolve) {
    const container = document.querySelector(".game-container");
    console.log("Retry button clicked");
    container.style.border = "";

    // Remove buttons
    const buttons = document.querySelectorAll(".retry-button, .home-button, .next-level-button");
    buttons.forEach(button => button.remove());

    // Remove text messages
    const existingMessages = document.querySelectorAll(".status-message"); // Adjust the selector as necessary
    existingMessages.forEach(message => message.remove());

    // Reset highlights on game objects
    const gameObjects = this.map.gameObjects;
    for (const key in gameObjects) {
        const obj = gameObjects[key];
        if (obj.sprite && obj.sprite.highlighted) {
            obj.sprite.removeHighlight(); // Ensure your Sprite class has this method
        }
    }

    const who = this.map.gameObjects["hero"]; // Assuming "hero" is the player ID
    const originalPosition = this.event.originalPosition || { x: utils.withGrid(6), y: utils.withGrid(4) }; // Define the original position or use a default

    // Move the player to the original position
    const moveEvent = {
        type: "walkTo",
        who: "hero",
        x: originalPosition.x,
        y: originalPosition.y
    };

    const moveHandler = new OverworldEvent({
        map: this.map,
        event: moveEvent
    });

    moveHandler.init().then(() => {
        // After moving to the original position, create and execute the stand event (direction down)
        const standEvent = {
            type: "stand",
            who: "hero",
            direction: "down",
            time: 500,
        };

        const standHandler = new OverworldEvent({
            map: this.map,
            event: standEvent
        });

        standHandler.init().then(() => {
            // After standing, display the text message
            const message = new TextMessage({
                text: "Let's try this again",
                x: utils.withGrid(4.8),
                y: who.y - 16, 
                duration: 2000, // Display for 2 seconds
                canBeSkipped: false,
            });
            message.init(document.querySelector(".game-container"));
        });
    });
}



handleHome(resolve) {
    console.log("Home button clicked");
    
    // Record the completed level
    if (level) {
        completeLevel(level); // Call completeLevel with the current level
        localStorage.setItem('completedLevel', JSON.stringify(level)); // Store completed level in local storage
    }
    console.log("Completed level is", completedLevel);
    
    window.location.href = "home.html"; // Navigate to home page
    resolve(); // Call resolve to continue after clicking the button
}

checkSorted(resolve) {
  const items = Object.values(this.map.gameObjects).filter(obj => obj instanceof Item);
  const itemPositions = items.map(item => ({
      x: item.x,
      y: item.y,
      value: item.value,
      item: item // Store reference to the item
  }));

  const sortedByPosition = itemPositions.sort((a, b) => a.x - b.x);
  const sortedValues = sortedByPosition.map(item => item.value).sort((a, b) => a - b);

  let index = 0;
  let hasError = false;

  // Remove highlights before starting the check
  this.removeAllHighlights(() => {
      // Start checking items
      const checkNextItem = () => {
          if (index >= sortedByPosition.length) {
              if (!hasError) {
                  completeLevel(level); 
              }
              this.changeCanvasBorderAndPlaySound(!hasError, resolve);
              return;
          }
          const itemAtPosition = sortedByPosition[index];
          const itemInMap = items.find(item => item.x === itemAtPosition.x && item.y === itemAtPosition.y);

          if (itemInMap && itemInMap.value === sortedValues[index]) {
              console.log(`Item at position ${itemAtPosition.x}, ${itemAtPosition.y} is in order.`);
              itemInMap.sprite.highlight("green");
          } else {
              console.log(`Item at position ${itemAtPosition.x}, ${itemAtPosition.y} is out of order.`);
              hasError = true; // Set hasError to true if any item is out of order
              itemInMap.sprite.highlight("red");
          }

          index++;
          setTimeout(checkNextItem, 500); // Check the next item after a delay
      };

      checkNextItem(); // Start checking items
  });
}

swapPrevious(resolve) {
  const sequence = [
    { who: this.event.who, type: "stand", direction: "down", time: 500 },
    { who: this.event.who, type: "walk", direction: "left" },
    { who: this.event.who, type: "stand", direction: "down", time: 500 },
    { who: this.event.who, type: "pickUp" },
    { who: this.event.who, type: "stand", direction: "down", time: 500 },
    { who: this.event.who, type: "walk", direction: "right" },
    { who: this.event.who, type: "stand", direction: "down", time: 500 },
    { who: this.event.who, type: "pickUp" },
    { who: this.event.who, type: "putDown" },
    { who: this.event.who, type: "stand", direction: "down", time: 500 },
    { who: this.event.who, type: "walk", direction: "left" },
    { who: this.event.who, type: "stand", direction: "down", time: 500 },
    { who: this.event.who, type: "putDown" },
    { who: this.event.who, type: "walk", direction: "right" },
    { who: this.event.who, type: "stand", direction: "down", time: 500 },
  ];

  // Execute each event in the sequence
  const executeSequence = (index = 0) => {
    if (index < sequence.length) {
      this.map.startCutscene([sequence[index]]).then(() => {
        executeSequence(index + 1); // Call the next event after the previous finishes
      });
    } else {
      resolve(); 
    }
  };

  executeSequence();
}


compareItemToValue(resolve) {
  const targetIndex = this.event.itemIndex; // Index of the item to compare
  const compareValue = this.event.compareValue; // Value to compare against

  // Ensure the index and comparison value are provided
  if (targetIndex === undefined || compareValue === undefined) {
      console.log("Index or comparison value not provided!");
      resolve();
      return;
  }

  // Function to get the current item based on index
  const getCurrentItem = (index) => {
      const items = Object.values(this.map.gameObjects).filter(obj => obj instanceof Item);
      return items.sort((a, b) => a.x - b.x)[index];
  };

  // Step 1: Move to the target item using `goToItem` event
  const moveToItem = () => {
      const goToItemEvent = new OverworldEvent({
          map: this.map,
          event: {
              type: "goToItem",
              who: this.event.who,
              itemIndex: targetIndex,
          }
      });
      return goToItemEvent.init();
  };

  // Step 2: Perform comparison with the provided value using `checkItemInFront`
  const compareItem = () => {
      const item = getCurrentItem(targetIndex);
      const itemValue = item.value; // Get the item's value

      const compareItemEvent = new OverworldEvent({
          map: this.map,
          event: {
              type: "checkItemInFront",
              who: this.event.who,
              comparisonSign: this.event.comparisonSign,
              compareValue: compareValue,
              itemValue: itemValue, // Pass the item's value for comparison
          }
      });
      return compareItemEvent.init();
  };

  // Execute the sequence: Move to item -> compare to value
  moveToItem()
      .then(() => compareItem())
      .then(() => {
          // Step 3: Remove highlights after a set time (e.g., 1000 milliseconds)
          setTimeout(() => {
              const item = getCurrentItem(targetIndex);

              if (item) item.sprite.removeHighlight(); // Remove highlight from the item

              resolve(); // Resolve after removing highlights
          }, 1000); // Adjust the time as needed
      });
}


compareTwoItems(resolve) {
  const targetIndex1 = this.event.itemIndex1;
  const targetIndex2 = this.event.itemIndex2;

  // Ensure the indices are provided
  if (targetIndex1 === undefined || targetIndex2 === undefined) {
      console.log("Indices for comparison not provided!");
      resolve();
      return;
  }

  // Function to get the current item based on index
  const getCurrentItem = (index) => {
      const items = Object.values(this.map.gameObjects).filter(obj => obj instanceof Item);
      return items.sort((a, b) => a.x - b.x)[index];
  };

  // Step 1: Move to the first item using `goToItem` event
  const moveToFirstItem = () => {
      const goToItemEvent1 = new OverworldEvent({
          map: this.map,
          event: {
              type: "goToItem",
              who: this.event.who,
              itemIndex: targetIndex1,
          }
      });
      return goToItemEvent1.init();
  };

  // Step 2: Check and highlight the first item using `checkItemInFront`
  const checkFirstItem = () => {
      const checkItemEvent1 = new OverworldEvent({
          map: this.map,
          event: {
              type: "checkItemInFront",
              who: this.event.who,
              comparisonSign: "none", // No comparison for first item, just highlight
          }
      });
      return checkItemEvent1.init();
  };

  // Step 3: Move to the second item using `goToItem` event
  const moveToSecondItem = () => {
      const goToItemEvent2 = new OverworldEvent({
          map: this.map,
          event: {
              type: "goToItem",
              who: this.event.who,
              itemIndex: targetIndex2,
          }
      });
      return goToItemEvent2.init();
  };

  // Step 4: Check the second item and perform comparison using `checkItemInFront`
  const checkAndCompareItems = () => {
      const item1 = getCurrentItem(targetIndex1);
      const compareValue = item1.value; // Compare with the first item's value

      const checkItemEvent2 = new OverworldEvent({
          map: this.map,
          event: {
              type: "checkItemInFront",
              who: this.event.who,
              comparisonSign: this.event.comparisonSign,
              compareValue: compareValue,
          }
      });
      return checkItemEvent2.init();
  };

  // Execute the sequence: Move to first item -> check first item -> move to second item -> check and compare
  moveToFirstItem()
      .then(() => checkFirstItem())
      .then(() => moveToSecondItem())
      .then(() => checkAndCompareItems())
      .then(() => {
          // Step 5: Remove highlights after a set time (e.g., 2000 milliseconds)
          setTimeout(() => {
              const item1 = getCurrentItem(targetIndex1);
              const item2 = getCurrentItem(targetIndex2);

              if (item1) item1.sprite.removeHighlight(); // Remove highlight from first item
              if (item2) item2.sprite.removeHighlight(); // Remove highlight from second item

              resolve(); // Resolve after removing highlights
          }, 1000); // Adjust the time as needed
      });
}


}
