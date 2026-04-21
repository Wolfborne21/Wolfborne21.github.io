// Project Title
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

// References and resources:
// https://p5js.org/reference/p5/p5.Vector/ - vector class
// https://editor.p5js.org/jeffThompson/sketches/rrssQYach - frame count
// https://gameprogrammingpatterns.com/state.html - state machines
// https://editor.p5js.org/shfitz/sketches/8s9FLdrai - switch and case
// https://ultimateframedata.com/stats - character statistics
// https://www.jeffreythompson.org/collision-detection/rect-rect.php - rect/rect collision detection


function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(220);
}

// Player constants and variables
const SPAWN_X = 300;
const SPAWN_Y = 150;

let player;

// Stage constants and variables
const STAGE_X = 400;
const STAGE_Y = 400;
const STAGE_WIDTH = 800;
const STAGE_HEIGHT = 50;

// Marth stats
let marthStats = {
  runSpeed: 10,
  initialDash: 10,
  airAcceleration: 10,
  airSpeed: 10,
  friction: 0.8,
  gravity: 5,
  fallSpeed: 2,
  fastFallSpeed: 10,
  shortHopPower: -5,
  fullHopPower: -10,
  doubleJumpPower: -12,
  weight: 50,
  color: “blue”,
  dimension: 40,
}

// Create the base player
class Player {
  constructor(x, y, stats) {

    // Physics and stats
    this.position = createVector(x, y);
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0, 0);
    this.stats = stats;

    // States
    this.state = “airborne”; // idle, running, airborne, jumpsquat, hitsun, starting, active, ending

    // Booleans/Conditions
    this.direction = true;
    this.jumpSquatting = false;
    this.jumpAvailable = true;
    this.doubleJumpAvailable = false;
    this.isAirborne = true;
    this.grounded = false;

    // Timers
    this.jumpSquatTimer = 3;
  }

  // Display the player
  display() {

    // Draw player from the center
    rectMode(CENTER);

    // Square to represent the player
    fill(this.stats.color);
    square(this.position.x, this.position.y, this.stats.dimension);
  }

  // Update the player’s state and movement
  update() {

    // Constant gravity
    this.addGravity();

    // Check state and behavior
    this.manageState();

    // Add vector forces
    this.addVectors();
  }

  // Add gravity to player
  addGravity() {
    if (this.position.y < STAGE_Y) {
      this.velocity.y += this.stats.gravity;
    }
  }

  // Add friction to player
  addFriction() {
    this.velocity.x *= this.stats.friction;
  }

  // Control the player’s states, conditions, and behavior
  manageState() {
    switch(this.state) {

      // idle state behaviors and triggers
      case “idle”:

        // State behavior
        this.velocity.x = 0;
        this.addFriction();

        // State triggers
        if (this.jumpSquatting) {
          this.state = “jumpSquat”;
        }

        if (keyIsDown(65) || keyIsDown(68)) {
          this.state = “running”;
        }

        if (this.position.y < STAGE_Y) {
          this.state = “airborne”;
        }
        break;

      // running state behaviors and triggers
      case “running”:

        // State Behavior
        this.groundMovement();
        this.addFriction();

        // State triggers
        if (!keyIsDown(65) || !keyIsDown(68)) {
          this.state = “idle”;
        }

        if (this.jumpSquatting) {
          this.state = “jumpSquat”;
        }

        if (this.position.y < STAGE_Y) {
          this.state = “airborne”;
        }
        break;

      // airborne state behaviors and triggers
      case “airborne”:

        // State behavior
        this.airMovement();

        // State trigger
        if (this.position.y >= STAGE_Y) {
          this.state = “idle”;

          // Reset jumpsquat timer and jumps
          this.jumpAvailable = true;
          this.doubleJumpAvailable = false;
          this.jumpSquatTimer = 3;
        }
        break;

      // jumpSquat state behaviours and trigger
      case “jumpSquat”:

        // State behavior
        this.prepareGroundJump();

        // State trigger
        if (this.position.y < STAGE_Y) {
          this.state = “airborne”;
        }
        break;
      }
    }
  }

  // Move player on the stage
  groundMovement() {

    // Move right
    if (keyIsDown(68)) {
      this.acceleration.add(this.stats.initialDash, 0);
    }

    // Move left
    if (keyIsDown(65)) {
      this.acceleration.add(-this.stats.initialDash, 0);
    }
  }

  // Move player in the air
  airMovement() {

    // Move right
    if (keyIsDown(68)) {
      this.acceleration.add(this.stats.airAcceleration, 0);
    }

    // Move left
    if (keyIsDown(65)) {
      this.acceleration.add(-this.stats.airAcceleration, 0);
    }
  }

  // Pause before the player jumps
  prepareGroundJump() {
    this.velocity.x = 0;
    this.jumpSquatTimer–;
    if (this.jumpSquatTimer <= 0) {
      this.jumpSquatting = false;
      this.groundJump();
    }
  }

  // Make player jump from the ground
  groundJump() {    
    if (this.jumpAvailable) {

      // Determine jump height
      if (keyIsDown(89) && keyIsDown(85)) {
        this.velocity.y = this.stats.shortHopPower;
      }
      else if (keyIsDown(89) || keyIsDown(85)) {
        this.velocity.y = this.stats.fullHopPower;
      }
      else {
        this.velocity.y = this.stats.shortHopPower;
      }

      // Disable ground jump and unlock double jump
      this.jumpAvailable = false;
      this.doubleJumpAvailable = true;
    }
  }

  // Double jump
  doubleJump() {
    if (this.doubleJumpAvailable) {
      this.velocity.y = this.stats.doubleJumpPower;

      // Disable double jump
      this.doubleJumpAvailable = false;
    }
  }

  // Apply user input to player
  addVectors() {
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.acceleration.mult(0);

    // Cap speeds corresponding to state
    if (this.position.y >= STAGE_Y && this.velocity.x > this.stats.runSpeed) {
      this.velocity.x = this.stats.runSpeed;
    }
    if (this.position.y < STAGE_Y && this.velocity.x > this.stats.airSpeed) {
      this.velocity.x = this.stats.airSpeed;
    }
  }
}

// Setup player
function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // Create player
  player = new Player(SPAWN_X, SPAWN_Y, marthStats);
}

// Manage players
function draw() {
  background(220);

  // Draw stage
  rectMode(CORNER);
  rect(STAGE_X, STAGE_Y, STAGE_WIDTH, STAGE_HEIGHT);

  // Update player states and movement
  player.update();

  // Display player
  player.display();
}

// Handle player input
function keyPressed() {

  // Ground jump
  if (keyCode === 89) {
    player.jumpSquatting = true;
  }

  // Double jump
  if (keyCode === 85) {
    player.doubleJump();
  }
}
