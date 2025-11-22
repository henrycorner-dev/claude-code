/**
 * Finite State Machine Character Controller
 *
 * This example demonstrates:
 * - FSM implementation for character behavior
 * - State transitions with enter/exit callbacks
 * - Multiple character states (idle, walk, run, jump, attack, hurt)
 * - Animation integration
 * - Input handling
 */

class StateMachine {
  constructor(initialState) {
    this.currentState = initialState;
    this.states = new Map();
    this.stateHistory = [];
  }

  addState(name, state) {
    this.states.set(name, state);
  }

  transition(newStateName) {
    const newState = this.states.get(newStateName);

    if (!newState) {
      console.warn(`State "${newStateName}" does not exist`);
      return false;
    }

    // Check if transition is allowed
    if (this.currentState.transitions && !this.currentState.transitions.includes(newStateName)) {
      console.warn(`Transition from "${this.currentState.name}" to "${newStateName}" not allowed`);
      return false;
    }

    // Exit current state
    if (this.currentState && this.currentState.exit) {
      this.currentState.exit();
    }

    // Track history
    this.stateHistory.push(this.currentState.name);
    if (this.stateHistory.length > 10) {
      this.stateHistory.shift();
    }

    // Enter new state
    this.currentState = newState;

    if (this.currentState.enter) {
      this.currentState.enter();
    }

    return true;
  }

  update(deltaTime) {
    if (this.currentState && this.currentState.update) {
      this.currentState.update(deltaTime);
    }
  }

  getCurrentStateName() {
    return this.currentState ? this.currentState.name : 'none';
  }
}

class Character {
  constructor(x, y) {
    this.position = { x, y };
    this.velocity = { x: 0, y: 0 };
    this.direction = 1; // 1 = right, -1 = left

    // Character properties
    this.walkSpeed = 150;
    this.runSpeed = 250;
    this.jumpForce = 400;
    this.gravity = 1000;
    this.isGrounded = false;

    // Animation
    this.animation = 'idle';
    this.animationTime = 0;

    // Combat
    this.health = 100;
    this.maxHealth = 100;
    this.attackDamage = 20;
    this.attackRange = 50;

    // Input
    this.input = {
      left: false,
      right: false,
      jump: false,
      attack: false,
      sprint: false,
    };

    // Create FSM
    this.fsm = this.createFSM();
  }

  createFSM() {
    const fsm = new StateMachine(null);

    // Define states
    const idleState = {
      name: 'idle',
      transitions: ['walk', 'run', 'jump', 'attack', 'hurt'],

      enter: () => {
        this.animation = 'idle';
        this.velocity.x = 0;
      },

      update: deltaTime => {
        // Check for transitions
        if (this.input.left || this.input.right) {
          if (this.input.sprint) {
            this.fsm.transition('run');
          } else {
            this.fsm.transition('walk');
          }
        }

        if (this.input.jump && this.isGrounded) {
          this.fsm.transition('jump');
        }

        if (this.input.attack) {
          this.fsm.transition('attack');
        }
      },

      exit: () => {},
    };

    const walkState = {
      name: 'walk',
      transitions: ['idle', 'run', 'jump', 'attack', 'hurt'],

      enter: () => {
        this.animation = 'walk';
      },

      update: deltaTime => {
        // Horizontal movement
        if (this.input.left) {
          this.velocity.x = -this.walkSpeed;
          this.direction = -1;
        } else if (this.input.right) {
          this.velocity.x = this.walkSpeed;
          this.direction = 1;
        } else {
          this.velocity.x = 0;
        }

        // Check transitions
        if (!this.input.left && !this.input.right) {
          this.fsm.transition('idle');
        }

        if (this.input.sprint && (this.input.left || this.input.right)) {
          this.fsm.transition('run');
        }

        if (this.input.jump && this.isGrounded) {
          this.fsm.transition('jump');
        }

        if (this.input.attack) {
          this.fsm.transition('attack');
        }
      },

      exit: () => {
        this.velocity.x = 0;
      },
    };

    const runState = {
      name: 'run',
      transitions: ['idle', 'walk', 'jump', 'attack', 'hurt'],

      enter: () => {
        this.animation = 'run';
      },

      update: deltaTime => {
        // Horizontal movement
        if (this.input.left) {
          this.velocity.x = -this.runSpeed;
          this.direction = -1;
        } else if (this.input.right) {
          this.velocity.x = this.runSpeed;
          this.direction = 1;
        } else {
          this.velocity.x = 0;
        }

        // Check transitions
        if (!this.input.left && !this.input.right) {
          this.fsm.transition('idle');
        }

        if (!this.input.sprint && (this.input.left || this.input.right)) {
          this.fsm.transition('walk');
        }

        if (this.input.jump && this.isGrounded) {
          this.fsm.transition('jump');
        }

        if (this.input.attack) {
          this.fsm.transition('attack');
        }
      },

      exit: () => {
        this.velocity.x = 0;
      },
    };

    const jumpState = {
      name: 'jump',
      transitions: ['idle', 'walk', 'run', 'attack', 'hurt'],
      airTime: 0,

      enter: () => {
        this.animation = 'jump';
        this.velocity.y = -this.jumpForce;
        this.isGrounded = false;
        this.airTime = 0;
      },

      update: deltaTime => {
        this.airTime += deltaTime;

        // Air control
        const airControlFactor = 0.5;
        if (this.input.left) {
          this.velocity.x = -this.walkSpeed * airControlFactor;
          this.direction = -1;
        } else if (this.input.right) {
          this.velocity.x = this.walkSpeed * airControlFactor;
          this.direction = 1;
        }

        // Check if landed
        if (this.isGrounded) {
          if (this.input.left || this.input.right) {
            if (this.input.sprint) {
              this.fsm.transition('run');
            } else {
              this.fsm.transition('walk');
            }
          } else {
            this.fsm.transition('idle');
          }
        }

        if (this.input.attack) {
          this.fsm.transition('attack');
        }
      },

      exit: () => {
        this.velocity.x = 0;
      },
    };

    const attackState = {
      name: 'attack',
      transitions: ['idle', 'walk', 'run', 'hurt'],
      duration: 0.5,
      timer: 0,
      attackExecuted: false,

      enter: () => {
        this.animation = 'attack';
        this.timer = 0;
        this.attackExecuted = false;
        this.velocity.x = 0;
      },

      update: deltaTime => {
        this.timer += deltaTime;

        // Execute attack at midpoint of animation
        if (this.timer >= this.duration * 0.5 && !this.attackExecuted) {
          this.executeAttack();
          this.attackExecuted = true;
        }

        // Attack complete
        if (this.timer >= this.duration) {
          if (this.input.left || this.input.right) {
            if (this.input.sprint) {
              this.fsm.transition('run');
            } else {
              this.fsm.transition('walk');
            }
          } else {
            this.fsm.transition('idle');
          }
        }
      },

      exit: () => {
        this.timer = 0;
        this.attackExecuted = false;
      },
    };

    const hurtState = {
      name: 'hurt',
      transitions: ['idle', 'dead'],
      duration: 0.3,
      timer: 0,

      enter: () => {
        this.animation = 'hurt';
        this.timer = 0;
        this.velocity.x = -this.direction * 100; // Knockback
      },

      update: deltaTime => {
        this.timer += deltaTime;

        if (this.timer >= this.duration) {
          if (this.health <= 0) {
            this.fsm.transition('dead');
          } else {
            this.fsm.transition('idle');
          }
        }
      },

      exit: () => {
        this.velocity.x = 0;
      },
    };

    const deadState = {
      name: 'dead',
      transitions: [],

      enter: () => {
        this.animation = 'dead';
        this.velocity.x = 0;
        this.velocity.y = 0;
      },

      update: deltaTime => {
        // Dead - no transitions
      },

      exit: () => {},
    };

    // Add states to FSM
    fsm.addState('idle', idleState);
    fsm.addState('walk', walkState);
    fsm.addState('run', runState);
    fsm.addState('jump', jumpState);
    fsm.addState('attack', attackState);
    fsm.addState('hurt', hurtState);
    fsm.addState('dead', deadState);

    // Set initial state
    fsm.currentState = idleState;
    idleState.enter();

    return fsm;
  }

  update(deltaTime) {
    // Update FSM
    this.fsm.update(deltaTime);

    // Apply gravity
    if (!this.isGrounded) {
      this.velocity.y += this.gravity * deltaTime;
    }

    // Update position
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;

    // Simple ground collision (would be more complex in real game)
    if (this.position.y >= 500) {
      this.position.y = 500;
      this.velocity.y = 0;
      this.isGrounded = true;
    } else if (this.position.y < 500) {
      this.isGrounded = false;
    }

    // Keep in bounds
    this.position.x = Math.max(50, Math.min(750, this.position.x));

    // Update animation time
    this.animationTime += deltaTime;
  }

  executeAttack() {
    console.log(`Character attacks! Damage: ${this.attackDamage}, Range: ${this.attackRange}`);
    // In real game, check for enemies in range and deal damage
  }

  takeDamage(amount) {
    if (this.fsm.getCurrentStateName() === 'dead') return;

    this.health -= amount;
    this.health = Math.max(0, this.health);

    this.fsm.transition('hurt');
  }

  render(ctx) {
    const x = this.position.x;
    const y = this.position.y;

    ctx.save();

    // Flip sprite based on direction
    if (this.direction === -1) {
      ctx.translate(x, y);
      ctx.scale(-1, 1);
      ctx.translate(-x, -y);
    }

    // Draw character (simple rectangle for now)
    const color = this.getStateColor();
    ctx.fillStyle = color;
    ctx.fillRect(x - 20, y - 40, 40, 80);

    // Draw eyes
    ctx.fillStyle = '#000';
    ctx.fillRect(x - 10, y - 25, 6, 6);
    ctx.fillRect(x + 4, y - 25, 6, 6);

    ctx.restore();

    // Draw health bar
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(x - 25, y - 50, 50, 5);
    ctx.fillStyle = this.health > 30 ? '#00ff00' : '#ff0000';
    ctx.fillRect(x - 25, y - 50, 50 * (this.health / this.maxHealth), 5);

    // Draw state name
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(this.fsm.getCurrentStateName().toUpperCase(), x, y - 60);

    // Draw ground indicator
    if (this.isGrounded) {
      ctx.fillStyle = 'lime';
      ctx.beginPath();
      ctx.arc(x, y + 45, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  getStateColor() {
    const state = this.fsm.getCurrentStateName();
    const colors = {
      idle: '#00ff00',
      walk: '#00ffff',
      run: '#ffff00',
      jump: '#ff00ff',
      attack: '#ff0000',
      hurt: '#ff6600',
      dead: '#666666',
    };
    return colors[state] || '#00ff00';
  }
}

// Demo
class FSMDemo {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.character = new Character(400, 500);
    this.running = false;
    this.lastTime = performance.now();

    this.setupInput();
  }

  setupInput() {
    window.addEventListener('keydown', e => {
      this.handleKeyDown(e.code);
    });

    window.addEventListener('keyup', e => {
      this.handleKeyUp(e.code);
    });
  }

  handleKeyDown(code) {
    switch (code) {
      case 'ArrowLeft':
      case 'KeyA':
        this.character.input.left = true;
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.character.input.right = true;
        break;
      case 'ArrowUp':
      case 'KeyW':
      case 'Space':
        this.character.input.jump = true;
        break;
      case 'KeyJ':
        this.character.input.attack = true;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.character.input.sprint = true;
        break;
      case 'KeyH':
        // Test damage
        this.character.takeDamage(20);
        break;
    }
  }

  handleKeyUp(code) {
    switch (code) {
      case 'ArrowLeft':
      case 'KeyA':
        this.character.input.left = false;
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.character.input.right = false;
        break;
      case 'ArrowUp':
      case 'KeyW':
      case 'Space':
        this.character.input.jump = false;
        break;
      case 'KeyJ':
        this.character.input.attack = false;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.character.input.sprint = false;
        break;
    }
  }

  update(deltaTime) {
    this.character.update(deltaTime);
  }

  render() {
    const ctx = this.ctx;

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw ground
    ctx.fillStyle = '#444';
    ctx.fillRect(0, 500, 800, 100);

    // Draw character
    this.character.render(ctx);

    // Draw instructions
    ctx.textAlign = 'left';
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.fillText('A/D or Arrow Keys: Move', 10, 20);
    ctx.fillText('Shift: Sprint', 10, 40);
    ctx.fillText('Space/W: Jump', 10, 60);
    ctx.fillText('J: Attack', 10, 80);
    ctx.fillText('H: Take Damage (test)', 10, 100);

    // Draw state history
    ctx.fillText('State History:', 10, 140);
    ctx.font = '12px monospace';
    const history = this.character.fsm.stateHistory.slice(-5);
    for (let i = 0; i < history.length; i++) {
      ctx.fillText(history[i], 10, 160 + i * 15);
    }

    // Draw health
    ctx.font = '14px Arial';
    ctx.fillText(`Health: ${this.character.health}/${this.character.maxHealth}`, 10, 250);
  }

  gameLoop(currentTime) {
    if (!this.running) return;

    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    const dt = Math.min(deltaTime, 0.1);

    this.update(dt);
    this.render();

    requestAnimationFrame(time => this.gameLoop(time));
  }

  start() {
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame(time => this.gameLoop(time));
  }

  stop() {
    this.running = false;
  }
}

// Initialize demo
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas') || createCanvas();
    const demo = new FSMDemo(canvas);
    demo.start();
  });

  function createCanvas() {
    const canvas = document.createElement('canvas');
    canvas.id = 'gameCanvas';
    canvas.width = 800;
    canvas.height = 600;
    document.body.appendChild(canvas);
    return canvas;
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Character, StateMachine, FSMDemo };
}
