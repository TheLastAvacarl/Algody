class OverworldMap {
  constructor(config) {
    this.overworld = null;
    this.gameObjects = config.gameObjects;
    this.cutsceneSpaces = config.cutsceneSpaces || {};
    this.walls = config.walls || {};

    this.lowerImage = new Image();
    this.lowerImage.src = config.lowerSrc;

    this.upperImage = new Image();
    this.upperImage.src = config.upperSrc;

    this.isCutscenePlaying = false;

    // Initialize the objectsAtCoordinates dictionary
    this.objAtCoord = {};
    this.initObjAtCoord();
  }

  initObjAtCoord() {
    // Populate the dictionary with objects indexed by their coordinates
    Object.keys(this.gameObjects).forEach(key => {
      const object = this.gameObjects[key];
      const coordkey = `${object.x},${object.y}`;
      if (!this.objAtCoord[coordkey]) {
        this.objAtCoord[coordkey] = {};
      }
      this.objAtCoord[coordkey][key] = object;
    });
  }

  drawLowerImage(ctx) {
    ctx.drawImage(this.lowerImage, utils.withGrid(0), utils.withGrid(0));
  }

  drawUpperImage(ctx) {
    ctx.drawImage(this.upperImage, utils.withGrid(0), utils.withGrid(0));
  }

  isSpaceTaken(currentX, currentY, direction) {
    const { x, y } = utils.nextPosition(currentX, currentY, direction);
    return this.walls[`${x},${y}`] || false;
  }

  mountObjects() {
    Object.keys(this.gameObjects).forEach(key => {
      const object = this.gameObjects[key];
      object.id = key;
      object.mount(this);
    });
    // Reinitialize the dictionary after mounting
    this.initObjAtCoord();
  }

  getObjectAt(x, y) {
    const coordkey = `${x},${y}`;
    console.log(`Checking for object at position (${x}, ${y})`);


    if (this.objAtCoord[coordkey]) {
      const objectsAtKey = this.objAtCoord[coordkey];
      for (const key in objectsAtKey) {
        const object = objectsAtKey[key];
        console.log(`Checking object ${key} at (${object.x}, ${object.y})`);
        if (object.x === x && object.y === y) {
          console.log(`Object found: ${key}`);
          return object;
        }
      }
    }
    console.log(`No object found at (${x}, ${y})`);
    return null; // No object at the specified position
  }

  async startCutscene(events) {
    this.isCutscenePlaying = true;

    for (let i = 0; i < events.length; i++) {
      const eventHandler = new OverworldEvent({
        event: events[i],
        map: this,
      });
      await eventHandler.init();
    }

    this.isCutscenePlaying = false;

    // Reset NPCs to do their idle behavior
    Object.values(this.gameObjects).forEach(object => object.doBehaviorEvent(this));
  }

  checkForActionCutscene() {
    const hero = this.gameObjects["hero"];
    const nextCoords = utils.nextPosition(hero.x, hero.y, hero.direction);
    const match = Object.values(this.gameObjects).find(object => {
      return `${object.x},${object.y}` === `${nextCoords.x},${nextCoords.y}`;
    });
    if (!this.isCutscenePlaying && match && match.talking.length) {
      this.startCutscene(match.talking[0].events);
    }
  }

  checkForFootstepCutscene() {
    const hero = this.gameObjects["hero"];
    const match = this.cutsceneSpaces[`${hero.x},${hero.y}`];
    if (!this.isCutscenePlaying && match) {
      this.startCutscene(match[0].events);
    }
  }

  addWall(x, y) {
    this.walls[`${x},${y}`] = true;
  }

  removeWall(x, y) {
    delete this.walls[`${x},${y}`];
  }

  moveWall(wasX, wasY, direction) {
    this.removeWall(wasX, wasY);
    const { x, y } = utils.nextPosition(wasX, wasY, direction);
    this.addWall(x, y);
  }
}

window.OverworldMaps = {
  DemoRoom: {
    lowerSrc: "/images/maps/DemoMap.png",
    upperSrc: "/images/maps/DemoUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(6),
        y: utils.withGrid(4),
        src: "/images/characters/people/demo.png",
        useShadow: true,
        useAnimation: true,
      }),

      // item11: new Item({
      //   x: utils.withGrid(1),
      //   y: utils.withGrid(7),
      //   value: 5,
      //   src: "/images/characters/boxes.png",
      // }),
      item0: new Item({
        x: utils.withGrid(2),
        y: utils.withGrid(7),
        value: 2,
        src: "/images/characters/boxes.png",
      }),
      item1: new Item({
        x: utils.withGrid(3),
        y: utils.withGrid(7),
        value: 5,
        src: "/images/characters/boxes.png",
      }),
      item2: new Item({
        x: utils.withGrid(4),
        y: utils.withGrid(7),
        src: "/images/characters/boxes.png",
        value: 20,
      }),
      item3: new Item({
        x: utils.withGrid(5),
        y: utils.withGrid(7),
        src: "/images/characters/boxes.png",
        value: 15,
      }),
      item4: new Item({
        x: utils.withGrid(6),
        y: utils.withGrid(7),
        src: "/images/characters/boxes.png",
        value: 16,
      }),
      item5: new Item({
        x: utils.withGrid(7),
        y: utils.withGrid(7),
        src: "/images/characters/boxes.png",
        value: 27,
      }),
      item6: new Item({
        x: utils.withGrid(8),
        y: utils.withGrid(7),
        src: "/images/characters/boxes.png",
        value: 28,
      }),
      item7: new Item({
        x: utils.withGrid(9),
        y: utils.withGrid(7),
        src: "/images/characters/boxes.png",
        value: 21,
      }),
      item8: new Item({
        x: utils.withGrid(10),
        y: utils.withGrid(7),
        src: "/images/characters/boxes.png",
        value: 26,
      }),
      
    },
    walls: {
      // [utils.asGridCoord(7, 6)]: true,
      // [utils.asGridCoord(8, 6)]: true,
      // [utils.asGridCoord(7, 7)]: true,
      // [utils.asGridCoord(8, 7)]: true,
    },
    cutsceneSpaces: {
      // [utils.asGridCoord(2, 7)]: [
      //   {
      //     events: [
      //       // {who: "hero", type: "walkTo", x: utils.withGrid(2), y: utils.withGrid(7), },
      //       {who: "hero", type: "stand", direction:"right", },
      //       { who: "hero", type: "pickUp",},
      //       // { who: "hero", type: "checkItemInFront" },
      //       // { who: "hero", type: "checkItemInFront", compareValue: 101, comparisonSign: "==" },
      //       // { who: "npcB", type: "walkTo", x: utils.withGrid(3), y: utils.withGrid(3) },
      //     ]
      //   }
      // ],
      // [utils.asGridCoord(5, 10)]: [
      //   {
      //     events: [
      //       { type: "changeMap", map: "Kitchen" }
      //     ]
      //   }
      // ]
    }
  },
  
  Kitchen: {
    lowerSrc: "/images/maps/KitchenLower.png",
    upperSrc: "/images/maps/KitchenUpper.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        x: utils.withGrid(5),
        y: utils.withGrid(5),
      }),
      npcB: new Person({
        x: utils.withGrid(10),
        y: utils.withGrid(8),
        src: "/images/characters/people/npc3.png",
        talking: [
          {
            events: [
              { type: "textMessage", text: "You made it! This video is going to be such a good time!", faceHero: "npcB" },
            ]
          }
        ]
      })
    }
  }
};
