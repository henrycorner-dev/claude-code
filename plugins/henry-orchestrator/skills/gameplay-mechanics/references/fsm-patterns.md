# Finite State Machine Patterns

Comprehensive guide to implementing FSMs, hierarchical state machines, and behavior trees for game AI.

## Basic FSM Implementation

### Simple State Machine

```javascript
class StateMachine {
  constructor(initialState) {
    this.currentState = initialState;
    this.states = new Map();
  }

  addState(name, state) {
    this.states.set(name, state);
  }

  transition(newStateName) {
    const newState = this.states.get(newStateName);

    if (!newState) {
      console.warn(`State "${newStateName}" does not exist`);
      return;
    }

    // Exit current state
    if (this.currentState && this.currentState.exit) {
      this.currentState.exit();
    }

    // Enter new state
    this.currentState = newState;

    if (this.currentState.enter) {
      this.currentState.enter();
    }
  }

  update(deltaTime) {
    if (this.currentState && this.currentState.update) {
      this.currentState.update(deltaTime);
    }
  }
}
```

### State Definition Pattern

```javascript
// Define states as objects with enter, update, exit methods
const idleState = {
  name: 'idle',

  enter() {
    this.entity.playAnimation('idle');
    this.entity.velocity.x = 0;
  },

  update(deltaTime) {
    // Check for transitions
    if (this.entity.input.isMoving) {
      this.fsm.transition('walk');
    }

    if (this.entity.input.jump) {
      this.fsm.transition('jump');
    }

    if (this.entity.isAttacking) {
      this.fsm.transition('attack');
    }
  },

  exit() {
    // Cleanup if needed
  }
};

const walkState = {
  name: 'walk',

  enter() {
    this.entity.playAnimation('walk');
  },

  update(deltaTime) {
    this.entity.velocity.x = this.entity.input.direction * this.entity.walkSpeed;

    if (!this.entity.input.isMoving) {
      this.fsm.transition('idle');
    }

    if (this.entity.input.jump) {
      this.fsm.transition('jump');
    }

    if (this.entity.input.sprint) {
      this.fsm.transition('run');
    }
  },

  exit() {
    this.entity.velocity.x = 0;
  }
};

const jumpState = {
  name: 'jump',

  enter() {
    this.entity.playAnimation('jump');
    this.entity.velocity.y = this.entity.jumpForce;
  },

  update(deltaTime) {
    // Air control
    this.entity.velocity.x = this.entity.input.direction * this.entity.airSpeed;

    if (this.entity.isGrounded) {
      if (this.entity.input.isMoving) {
        this.fsm.transition('walk');
      } else {
        this.fsm.transition('idle');
      }
    }
  },

  exit() {
    // Jump complete
  }
};
```

### Entity Integration

```javascript
class Character {
  constructor(x, y) {
    this.position = { x, y };
    this.velocity = { x: 0, y: 0 };
    this.input = new InputController();
    this.animation = null;

    // Create FSM
    this.fsm = new StateMachine(idleState);

    // Bind states to this entity
    idleState.entity = this;
    walkState.entity = this;
    jumpState.entity = this;

    // Bind FSM to states
    idleState.fsm = this.fsm;
    walkState.fsm = this.fsm;
    jumpState.fsm = this.fsm;

    // Add states
    this.fsm.addState('idle', idleState);
    this.fsm.addState('walk', walkState);
    this.fsm.addState('jump', jumpState);
  }

  update(deltaTime) {
    this.input.update();
    this.fsm.update(deltaTime);

    // Apply physics
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
  }

  playAnimation(name) {
    if (this.animation !== name) {
      this.animation = name;
      // Trigger animation system
    }
  }
}
```

## Advanced FSM Patterns

### State with Conditions

Define transition conditions explicitly:

```javascript
class ConditionalStateMachine extends StateMachine {
  transition(newStateName, force = false) {
    const newState = this.states.get(newStateName);

    if (!newState) return;

    // Check if transition is allowed
    if (!force && !this.canTransition(this.currentState, newState)) {
      return;
    }

    // Perform transition
    if (this.currentState && this.currentState.exit) {
      this.currentState.exit();
    }

    this.currentState = newState;

    if (this.currentState.enter) {
      this.currentState.enter();
    }
  }

  canTransition(fromState, toState) {
    if (!fromState || !fromState.transitions) {
      return true; // Allow any transition
    }

    return fromState.transitions.includes(toState.name);
  }
}

// State with explicit transitions
const attackState = {
  name: 'attack',
  transitions: ['idle', 'walk'], // Can only transition to these states

  enter() {
    this.entity.playAnimation('attack');
    this.attackComplete = false;
  },

  update(deltaTime) {
    if (this.attackComplete) {
      if (this.entity.input.isMoving) {
        this.fsm.transition('walk');
      } else {
        this.fsm.transition('idle');
      }
    }
  },

  exit() {
    this.attackComplete = false;
  }
};
```

### Timed States

States that automatically transition after duration:

```javascript
const chargeState = {
  name: 'charge',
  duration: 1.0, // seconds
  timer: 0,

  enter() {
    this.timer = 0;
    this.entity.playAnimation('charge');
    this.entity.velocity.x = 0;
  },

  update(deltaTime) {
    this.timer += deltaTime;

    if (this.timer >= this.duration) {
      this.fsm.transition('attack');
    }

    // Allow canceling
    if (this.entity.input.dodge) {
      this.fsm.transition('dodge');
    }
  },

  exit() {
    this.timer = 0;
  }
};
```

### State with Substate

```javascript
const combatState = {
  name: 'combat',
  substate: 'stance',

  enter() {
    this.substate = 'stance';
  },

  update(deltaTime) {
    switch (this.substate) {
      case 'stance':
        this.updateStance(deltaTime);
        break;
      case 'attack':
        this.updateAttack(deltaTime);
        break;
      case 'block':
        this.updateBlock(deltaTime);
        break;
    }

    // Exit combat if far from enemy
    if (this.entity.distanceToEnemy > 10) {
      this.fsm.transition('idle');
    }
  },

  updateStance(deltaTime) {
    if (this.entity.input.attack) {
      this.substate = 'attack';
      this.attackTimer = 0;
    } else if (this.entity.input.block) {
      this.substate = 'block';
    }
  },

  updateAttack(deltaTime) {
    this.attackTimer += deltaTime;
    if (this.attackTimer >= this.attackDuration) {
      this.substate = 'stance';
    }
  },

  updateBlock(deltaTime) {
    if (!this.entity.input.block) {
      this.substate = 'stance';
    }
  },

  exit() {
    this.substate = 'stance';
  }
};
```

## Hierarchical FSM (HFSM)

Nested state machines for complex behavior:

```javascript
class HierarchicalStateMachine {
  constructor(initialState) {
    this.currentState = initialState;
    this.states = new Map();
    this.parent = null;
  }

  addState(name, state, isComposite = false) {
    if (isComposite) {
      state.fsm = new HierarchicalStateMachine(state.initialState);
      state.fsm.parent = this;
    }
    this.states.set(name, state);
  }

  transition(newStateName) {
    const newState = this.states.get(newStateName);

    if (!newState) {
      // Try parent FSM
      if (this.parent) {
        this.parent.transition(newStateName);
      }
      return;
    }

    // Exit current state and substates
    this.exitState(this.currentState);

    // Enter new state
    this.currentState = newState;
    this.enterState(this.currentState);
  }

  enterState(state) {
    if (state.enter) {
      state.enter();
    }

    // Enter default substate if composite
    if (state.fsm) {
      this.enterState(state.fsm.currentState);
    }
  }

  exitState(state) {
    if (!state) return;

    // Exit substates first
    if (state.fsm) {
      this.exitState(state.fsm.currentState);
    }

    if (state.exit) {
      state.exit();
    }
  }

  update(deltaTime) {
    if (!this.currentState) return;

    // Update substates first
    if (this.currentState.fsm) {
      this.currentState.fsm.update(deltaTime);
    }

    // Update current state
    if (this.currentState.update) {
      this.currentState.update(deltaTime);
    }
  }
}
```

### HFSM Example: Enemy AI

```javascript
// Top-level states
const patrolState = {
  name: 'patrol',
  initialState: 'walking',

  enter() {
    this.entity.alert = false;
  },

  update(deltaTime) {
    // Check for player detection
    if (this.entity.canSeePlayer()) {
      this.fsm.transition('combat');
    }
  }
};

// Substates of patrol
const walkingSubstate = {
  name: 'walking',

  update(deltaTime) {
    this.entity.moveTowardsWaypoint(deltaTime);

    if (this.entity.reachedWaypoint()) {
      this.fsm.transition('idle');
    }
  }
};

const idleSubstate = {
  name: 'idle',
  duration: 2.0,
  timer: 0,

  enter() {
    this.timer = 0;
  },

  update(deltaTime) {
    this.timer += deltaTime;

    if (this.timer >= this.duration) {
      this.entity.nextWaypoint();
      this.fsm.transition('walking');
    }
  }
};

// Combat state with substates
const combatState = {
  name: 'combat',
  initialState: 'approach',

  enter() {
    this.entity.alert = true;
  },

  update(deltaTime) {
    // Check if player escaped
    if (!this.entity.canSeePlayer() && this.entity.timeSinceLastSaw > 5.0) {
      this.fsm.transition('patrol');
    }
  }
};

const approachSubstate = {
  name: 'approach',

  update(deltaTime) {
    this.entity.moveTowardsPlayer(deltaTime);

    if (this.entity.distanceToPlayer < this.entity.attackRange) {
      this.fsm.transition('attack');
    }
  }
};

const attackSubstate = {
  name: 'attack',
  cooldown: 1.5,
  timer: 0,

  enter() {
    this.entity.performAttack();
    this.timer = 0;
  },

  update(deltaTime) {
    this.timer += deltaTime;

    if (this.timer >= this.cooldown) {
      if (this.entity.distanceToPlayer > this.entity.attackRange) {
        this.fsm.transition('approach');
      } else {
        // Attack again
        this.entity.performAttack();
        this.timer = 0;
      }
    }

    // Take cover if low health
    if (this.entity.health < 0.3) {
      this.fsm.transition('retreat');
    }
  }
};

const retreatSubstate = {
  name: 'retreat',

  update(deltaTime) {
    this.entity.moveAwayFromPlayer(deltaTime);

    if (this.entity.distanceToPlayer > 10) {
      this.fsm.transition('approach');
    }
  }
};

// Setup HFSM
class Enemy {
  constructor() {
    this.fsm = new HierarchicalStateMachine(patrolState);

    // Bind entities
    patrolState.entity = this;
    combatState.entity = this;
    walkingSubstate.entity = this;
    idleSubstate.entity = this;
    approachSubstate.entity = this;
    attackSubstate.entity = this;
    retreatSubstate.entity = this;

    // Bind FSMs
    patrolState.fsm = this.fsm;
    combatState.fsm = this.fsm;

    // Add top-level states
    this.fsm.addState('patrol', patrolState, true);
    this.fsm.addState('combat', combatState, true);

    // Add patrol substates
    patrolState.fsm.addState('walking', walkingSubstate);
    patrolState.fsm.addState('idle', idleSubstate);

    // Add combat substates
    combatState.fsm.addState('approach', approachSubstate);
    combatState.fsm.addState('attack', attackSubstate);
    combatState.fsm.addState('retreat', retreatSubstate);
  }

  update(deltaTime) {
    this.fsm.update(deltaTime);
  }
}
```

## Pushdown Automaton

Stack-based state machine for temporary state interruptions:

```javascript
class PushdownAutomaton {
  constructor(initialState) {
    this.stateStack = [initialState];
    this.states = new Map();
  }

  addState(name, state) {
    this.states.set(name, state);
  }

  pushState(stateName) {
    const currentState = this.getCurrentState();
    if (currentState && currentState.pause) {
      currentState.pause();
    }

    const newState = this.states.get(stateName);
    this.stateStack.push(newState);

    if (newState && newState.enter) {
      newState.enter();
    }
  }

  popState() {
    const oldState = this.stateStack.pop();
    if (oldState && oldState.exit) {
      oldState.exit();
    }

    const currentState = this.getCurrentState();
    if (currentState && currentState.resume) {
      currentState.resume();
    }
  }

  getCurrentState() {
    return this.stateStack[this.stateStack.length - 1];
  }

  update(deltaTime) {
    const currentState = this.getCurrentState();
    if (currentState && currentState.update) {
      currentState.update(deltaTime);
    }
  }
}

// Example: Game with pause menu
const gameplayState = {
  name: 'gameplay',

  enter() {
    console.log('Starting gameplay');
  },

  update(deltaTime) {
    // Update game logic

    if (this.input.pause) {
      this.fsm.pushState('pause');
    }
  },

  pause() {
    console.log('Game paused');
  },

  resume() {
    console.log('Game resumed');
  },

  exit() {
    console.log('Exiting gameplay');
  }
};

const pauseState = {
  name: 'pause',

  enter() {
    this.showPauseMenu();
  },

  update(deltaTime) {
    if (this.input.resume) {
      this.fsm.popState(); // Return to gameplay
    }

    if (this.input.quit) {
      this.fsm.popState(); // Back to gameplay
      this.fsm.transition('mainMenu'); // Then to main menu
    }
  },

  exit() {
    this.hidePauseMenu();
  }
};
```

## Behavior Trees

Alternative to FSMs, offering more composability:

```javascript
// Node types
class BehaviorNode {
  run(entity) {
    throw new Error('Must implement run()');
  }
}

// Leaf nodes (actions and conditions)
class Action extends BehaviorNode {
  constructor(action) {
    super();
    this.action = action;
  }

  run(entity) {
    return this.action(entity);
  }
}

class Condition extends BehaviorNode {
  constructor(condition) {
    super();
    this.condition = condition;
  }

  run(entity) {
    return this.condition(entity) ? 'success' : 'failure';
  }
}

// Composite nodes
class Sequence extends BehaviorNode {
  constructor(children) {
    super();
    this.children = children;
  }

  run(entity) {
    for (const child of this.children) {
      const result = child.run(entity);
      if (result !== 'success') {
        return result;
      }
    }
    return 'success';
  }
}

class Selector extends BehaviorNode {
  constructor(children) {
    super();
    this.children = children;
  }

  run(entity) {
    for (const child of this.children) {
      const result = child.run(entity);
      if (result !== 'failure') {
        return result;
      }
    }
    return 'failure';
  }
}

class Parallel extends BehaviorNode {
  constructor(children, successThreshold = 1) {
    super();
    this.children = children;
    this.successThreshold = successThreshold;
  }

  run(entity) {
    let successCount = 0;

    for (const child of this.children) {
      const result = child.run(entity);
      if (result === 'success') {
        successCount++;
      }
    }

    return successCount >= this.successThreshold ? 'success' : 'failure';
  }
}

// Decorator nodes
class Inverter extends BehaviorNode {
  constructor(child) {
    super();
    this.child = child;
  }

  run(entity) {
    const result = this.child.run(entity);
    if (result === 'success') return 'failure';
    if (result === 'failure') return 'success';
    return result;
  }
}

class Repeater extends BehaviorNode {
  constructor(child, times = Infinity) {
    super();
    this.child = child;
    this.times = times;
  }

  run(entity) {
    for (let i = 0; i < this.times; i++) {
      const result = this.child.run(entity);
      if (result === 'failure') {
        return 'failure';
      }
      if (result === 'running') {
        return 'running';
      }
    }
    return 'success';
  }
}

// Example: Enemy behavior tree
const enemyBehaviorTree = new Selector([
  // Try to attack if player is close
  new Sequence([
    new Condition((entity) => entity.canSeePlayer()),
    new Condition((entity) => entity.distanceToPlayer < 5),
    new Action((entity) => {
      entity.attack();
      return 'success';
    })
  ]),

  // Chase player if visible
  new Sequence([
    new Condition((entity) => entity.canSeePlayer()),
    new Action((entity) => {
      entity.moveTowardsPlayer();
      return 'success';
    })
  ]),

  // Patrol waypoints
  new Sequence([
    new Action((entity) => {
      entity.patrolWaypoints();
      return 'success';
    })
  ])
]);

class Enemy {
  constructor() {
    this.behaviorTree = enemyBehaviorTree;
  }

  update(deltaTime) {
    this.behaviorTree.run(this);
  }
}
```

## Utility AI

Decision-making based on scoring multiple options:

```javascript
class UtilityAI {
  constructor() {
    this.actions = [];
  }

  addAction(name, scoreFn, executeFn) {
    this.actions.push({ name, scoreFn, executeFn });
  }

  update(entity) {
    let bestAction = null;
    let bestScore = -Infinity;

    // Evaluate all actions
    for (const action of this.actions) {
      const score = action.scoreFn(entity);

      if (score > bestScore) {
        bestScore = score;
        bestAction = action;
      }
    }

    // Execute best action
    if (bestAction) {
      bestAction.executeFn(entity);
    }
  }
}

// Example: NPC decision making
const npcAI = new UtilityAI();

npcAI.addAction(
  'attack',
  (entity) => {
    if (!entity.canSeePlayer()) return 0;
    const distance = entity.distanceToPlayer;
    const health = entity.health / entity.maxHealth;

    // Higher score when close and healthy
    return (1 - distance / 10) * health;
  },
  (entity) => entity.attack()
);

npcAI.addAction(
  'retreat',
  (entity) => {
    const health = entity.health / entity.maxHealth;
    const distance = entity.distanceToPlayer;

    // Higher score when low health and close to player
    return (1 - health) * (1 - distance / 10);
  },
  (entity) => entity.retreat()
);

npcAI.addAction(
  'heal',
  (entity) => {
    const health = entity.health / entity.maxHealth;
    const hasPotions = entity.potions > 0;
    const safe = entity.distanceToPlayer > 8;

    if (!hasPotions || !safe) return 0;

    return (1 - health) * 0.8;
  },
  (entity) => entity.usePotion()
);

npcAI.addAction(
  'patrol',
  (entity) => {
    // Default low-priority action
    return 0.1;
  },
  (entity) => entity.patrol()
);
```

## FSM vs Behavior Trees vs Utility AI

**Use FSM when:**
- Clear, discrete states
- Simple transitions
- Animation-driven behavior
- Character controllers

**Use Behavior Trees when:**
- Complex, hierarchical behavior
- Need reusable sub-behaviors
- Priority-based decisions
- Strategic AI

**Use Utility AI when:**
- Many competing actions
- Context-dependent decisions
- Smooth priority blending
- Realistic NPC behavior

Many games combine these approaches for different AI systems.

## Common Pitfalls

**State explosion**: Too many states makes FSM unwieldy. Use HFSM or behavior trees for complex behavior.

**Tight coupling**: States shouldn't directly reference each other. Use string names for transitions.

**Missing transitions**: Ensure all states can reach all reachable states. Test transition graphs.

**No default state**: Always have a safe fallback state.

**Update order bugs**: Be careful when transitioning mid-update. Mark for transition, execute after update.

**Shared state issues**: Don't share state objects between entities. Clone or use factory pattern.

**Performance**: Behavior trees can be expensive. Cache results, limit execution frequency, or use simpler FSMs for simple behaviors.
