class Overworld {
  constructor(config) {
    this.element = config.element;
    this.canvas = this.element.querySelector(".game-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.map = null;
  }
 
   startGameLoop() {
     const step = () => {
       //Clear off the canvas
       this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
 
  
       //Update all objects
       Object.values(this.map.gameObjects).forEach(object => {
         object.update({
           arrow: this.directionInput.direction,
           map: this.map,
         })
       })
 
       //Draw Lower layer
       this.map.drawLowerImage(this.ctx);
 
       //Draw Game Objects
       Object.values(this.map.gameObjects).sort((a, b) => a.zIndex - b.zIndex).forEach(object => {
         object.sprite.draw(this.ctx);
       });
 
       // //Draw Upper layer
       // this.map.drawUpperImage(this.ctx);
       
       requestAnimationFrame(() => {
         step();   
       })
     }
     step();
  }
 
  bindActionInput() {
    new KeyPressListener("Enter", () => {
      //Is there a person here to talk to?
      this.map.checkForActionCutscene()
    })
  }
 
  bindHeroPositionCheck() {
    document.addEventListener("PersonWalkingComplete", e => {
      if (e.detail.whoId === "hero") {
        //Hero's position has changed
        this.map.checkForFootstepCutscene()
      }
    })
  }
  
 
  startMap(mapConfig) {
   this.map = new OverworldMap(mapConfig);
   this.map.overworld = this;
   this.map.mountObjects();
  }
 
  // Create a separate function for running cutscenes
  runCutscene() {
   this.map.startCutscene([  
     { who: "hero", type: "walkTo", x: utils.withGrid(3), y: utils.withGrid(6) },
     { who: "hero", type: "walk", direction:"right"},
     { type: "swapPrevious", who: "hero" },
  
     { type: "checkSorted" },
    //  {
    //    type: "changeCanvasBorderAndPlaySound",
    //    result: "failed" // Can be "success" or "failed"
    //  }
     
   ]);
  }
 
  init() {
   this.startMap(window.OverworldMaps.DemoRoom);
 
 
   this.bindActionInput();
   this.bindHeroPositionCheck();
 
   this.directionInput = new DirectionInput();
   this.directionInput.init();
 
   this.startGameLoop();
   
 
   document.querySelector("#startCutsceneButton").addEventListener("click", () => {
     this.runCutscene();
   });
 
   

 
 }
 
 
}
    

  //  this.map.startCutscene([  
    // { who: "hero", type: "walkTo", x: utils.withGrid(3), y: utils.withGrid(6) },
    // { who: "hero", type: "walk", direction:"right"},
    // { type: "swapPrevious", who: "hero" },
 
    // { type: "checkSorted" },
       
//        ])
 
//  }
 