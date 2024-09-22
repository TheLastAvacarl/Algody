class TextMessage {
  constructor(config) {
    this.text = config.text || '';
    this.x = config.x || 0;
    this.y = config.y || 0;
    this.duration = config.duration || null; // Duration in milliseconds
    this.canBeSkipped = config.canBeSkipped !== undefined ? config.canBeSkipped : true; // Whether the message can be skipped
    this.color = config.color || "black"; // Default color
    this.onComplete = config.onComplete || (() => {}); // Default no-op function
    this.element = null;
    this.autoDismissTimer = null;
  }

  createElement() {
    // Create the element
    this.element = document.createElement("div");
    this.element.classList.add("TextMessage");

    this.element.innerHTML = (`
      <p class="TextMessage_p"></p>
      ${this.canBeSkipped ? '<button class="TextMessage_button">Next</button>' : ''}
    `);

    // Initialize the typewriter effect
    this.revealingText = new RevealingText({
      element: this.element.querySelector(".TextMessage_p"),
      text: this.text
    });

    // Add event listener for "Next" button if message can be skipped
    if (this.canBeSkipped) {
      this.element.querySelector("button").addEventListener("click", () => {
        this.done();
      });
    }

    // Add key press listener if message can be skipped
    this.actionListener = this.canBeSkipped ? new KeyPressListener("Enter", () => {
      this.done();
    }) : null;
  }

  done() {
    if (this.revealingText.isDone) {
      this.element.remove();
      if (this.actionListener) {
        this.actionListener.unbind();
      }
      if (this.autoDismissTimer) {
        clearTimeout(this.autoDismissTimer);
      }
      this.onComplete();
    } else {
      this.revealingText.warpToDone();
    }
  }


init(container) {
  this.createElement();
  container.appendChild(this.element);
  this.revealingText.init();

  // Get the offset based on the percentage
  const containerLeftOffset = container.offsetWidth * 0.235;
  const containerTopOffset = container.offsetHeight * 0.10; // Adjust this value as needed

  // Position the text message based on x and y coordinates, factoring in the offsets
  this.element.style.position = "absolute";
  this.element.style.left = `${this.x + containerLeftOffset}px`;
  this.element.style.top = `${this.y - 5 + containerTopOffset}px`;
  this.element.style.color = this.color;

  // Set up auto-dismiss timer if duration is provided
  if (this.duration) {
    this.autoDismissTimer = setTimeout(() => {
      this.done();
    }, this.duration);
  }
}

}