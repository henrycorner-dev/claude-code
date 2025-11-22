/**
 * Example: Mobile touch controls for web-based games
 * Features: Virtual joystick, action buttons, swipe gestures, responsive layout
 */

class TouchControls {
  constructor(options = {}) {
    this.options = {
      joystickContainer: options.joystickContainer || '#joystick-container',
      buttonsContainer: options.buttonsContainer || '#buttons-container',
      joystickRadius: options.joystickRadius || 50,
      joystickDeadzone: options.joystickDeadzone || 0.1,
      enableHaptics: options.enableHaptics !== false,
      showDebug: options.showDebug || false,
      ...options,
    };

    this.joystick = {
      active: false,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      normalizedX: 0,
      normalizedY: 0,
    };

    this.buttons = new Map();
    this.swipeGestures = {
      startX: 0,
      startY: 0,
      startTime: 0,
      minDistance: 50,
      maxTime: 300,
    };

    this.callbacks = {
      onJoystickMove: null,
      onButtonPress: null,
      onButtonRelease: null,
      onSwipe: null,
    };

    this.init();
  }

  init() {
    this.setupJoystick();
    this.setupButtons();
    this.setupSwipeDetection();
    this.setupOrientationChange();

    if (this.options.showDebug) {
      this.setupDebugDisplay();
    }

    console.log('Touch Controls initialized');
  }

  // ===== VIRTUAL JOYSTICK =====

  setupJoystick() {
    const container = document.querySelector(this.options.joystickContainer);
    if (!container) return;

    // Create joystick elements
    const base = document.createElement('div');
    base.className = 'joystick-base';
    base.style.cssText = `
            width: ${this.options.joystickRadius * 2}px;
            height: ${this.options.joystickRadius * 2}px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.2);
            border: 2px solid rgba(255, 255, 255, 0.4);
            position: relative;
        `;

    const stick = document.createElement('div');
    stick.className = 'joystick-stick';
    stick.style.cssText = `
            width: ${this.options.joystickRadius}px;
            height: ${this.options.joystickRadius}px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            border: 2px solid rgba(255, 255, 255, 0.8);
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            transition: transform 0.1s;
        `;

    base.appendChild(stick);
    container.appendChild(base);

    this.joystickElements = { container, base, stick };

    // Touch events
    base.addEventListener('touchstart', this.onJoystickStart.bind(this), { passive: false });
    base.addEventListener('touchmove', this.onJoystickMove.bind(this), { passive: false });
    base.addEventListener('touchend', this.onJoystickEnd.bind(this), { passive: false });

    // Mouse events (for testing on desktop)
    base.addEventListener('mousedown', this.onJoystickStart.bind(this));
    base.addEventListener('mousemove', this.onJoystickMove.bind(this));
    base.addEventListener('mouseup', this.onJoystickEnd.bind(this));
    base.addEventListener('mouseleave', this.onJoystickEnd.bind(this));
  }

  onJoystickStart(event) {
    event.preventDefault();
    this.joystick.active = true;

    const touch = event.touches ? event.touches[0] : event;
    const rect = this.joystickElements.base.getBoundingClientRect();

    this.joystick.startX = rect.left + rect.width / 2;
    this.joystick.startY = rect.top + rect.height / 2;

    this.hapticFeedback('light');
  }

  onJoystickMove(event) {
    if (!this.joystick.active) return;
    event.preventDefault();

    const touch = event.touches ? event.touches[0] : event;

    let deltaX = touch.clientX - this.joystick.startX;
    let deltaY = touch.clientY - this.joystick.startY;

    // Calculate distance and clamp to radius
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDistance = this.options.joystickRadius / 2;

    if (distance > maxDistance) {
      deltaX = (deltaX / distance) * maxDistance;
      deltaY = (deltaY / distance) * maxDistance;
    }

    // Update stick position
    this.joystickElements.stick.style.transform = `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px))`;

    // Normalize to -1 to 1
    this.joystick.normalizedX = deltaX / maxDistance;
    this.joystick.normalizedY = -deltaY / maxDistance; // Invert Y

    // Apply deadzone
    if (Math.abs(this.joystick.normalizedX) < this.options.joystickDeadzone) {
      this.joystick.normalizedX = 0;
    }
    if (Math.abs(this.joystick.normalizedY) < this.options.joystickDeadzone) {
      this.joystick.normalizedY = 0;
    }

    // Callback
    if (this.callbacks.onJoystickMove) {
      this.callbacks.onJoystickMove(this.joystick.normalizedX, this.joystick.normalizedY);
    }
  }

  onJoystickEnd(event) {
    if (!this.joystick.active) return;
    event.preventDefault();

    this.joystick.active = false;
    this.joystick.normalizedX = 0;
    this.joystick.normalizedY = 0;

    // Reset stick position
    this.joystickElements.stick.style.transform = 'translate(-50%, -50%)';

    // Callback
    if (this.callbacks.onJoystickMove) {
      this.callbacks.onJoystickMove(0, 0);
    }
  }

  // ===== ACTION BUTTONS =====

  setupButtons() {
    const container = document.querySelector(this.options.buttonsContainer);
    if (!container) return;

    // Create buttons (Jump, Attack, etc.)
    const buttonConfigs = [
      { id: 'jump', label: 'A', color: '#4CAF50' },
      { id: 'attack', label: 'B', color: '#F44336' },
      { id: 'special', label: 'X', color: '#2196F3' },
    ];

    buttonConfigs.forEach((config, index) => {
      const button = document.createElement('button');
      button.className = 'action-button';
      button.id = `btn-${config.id}`;
      button.innerHTML = config.label;
      button.style.cssText = `
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: ${config.color};
                color: white;
                border: 3px solid rgba(255, 255, 255, 0.5);
                font-size: 20px;
                font-weight: bold;
                touch-action: manipulation;
                user-select: none;
                -webkit-tap-highlight-color: transparent;
                margin: 8px;
            `;

      // Touch events
      button.addEventListener(
        'touchstart',
        e => {
          e.preventDefault();
          this.onButtonPress(config.id);
        },
        { passive: false }
      );

      button.addEventListener(
        'touchend',
        e => {
          e.preventDefault();
          this.onButtonRelease(config.id);
        },
        { passive: false }
      );

      // Mouse events (for testing)
      button.addEventListener('mousedown', () => this.onButtonPress(config.id));
      button.addEventListener('mouseup', () => this.onButtonRelease(config.id));

      container.appendChild(button);
      this.buttons.set(config.id, { element: button, pressed: false });
    });
  }

  onButtonPress(buttonId) {
    const button = this.buttons.get(buttonId);
    if (!button || button.pressed) return;

    button.pressed = true;
    button.element.style.transform = 'scale(0.9)';
    button.element.style.opacity = '0.8';

    this.hapticFeedback('medium');

    if (this.callbacks.onButtonPress) {
      this.callbacks.onButtonPress(buttonId);
    }
  }

  onButtonRelease(buttonId) {
    const button = this.buttons.get(buttonId);
    if (!button || !button.pressed) return;

    button.pressed = false;
    button.element.style.transform = 'scale(1)';
    button.element.style.opacity = '1';

    if (this.callbacks.onButtonRelease) {
      this.callbacks.onButtonRelease(buttonId);
    }
  }

  // ===== SWIPE GESTURES =====

  setupSwipeDetection() {
    const gameArea = document.querySelector('#game-area') || document.body;

    gameArea.addEventListener(
      'touchstart',
      e => {
        if (e.target.closest('.joystick-base') || e.target.closest('.action-button')) {
          return; // Don't detect swipes on controls
        }

        this.swipeGestures.startX = e.touches[0].clientX;
        this.swipeGestures.startY = e.touches[0].clientY;
        this.swipeGestures.startTime = Date.now();
      },
      { passive: true }
    );

    gameArea.addEventListener(
      'touchend',
      e => {
        if (e.target.closest('.joystick-base') || e.target.closest('.action-button')) {
          return;
        }

        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const endTime = Date.now();

        const deltaX = endX - this.swipeGestures.startX;
        const deltaY = endY - this.swipeGestures.startY;
        const deltaTime = endTime - this.swipeGestures.startTime;

        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Check if it's a swipe
        if (distance > this.swipeGestures.minDistance && deltaTime < this.swipeGestures.maxTime) {
          const direction = this.getSwipeDirection(deltaX, deltaY);

          this.hapticFeedback('light');

          if (this.callbacks.onSwipe) {
            this.callbacks.onSwipe(direction);
          }
        }
      },
      { passive: true }
    );
  }

  getSwipeDirection(deltaX, deltaY) {
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      return deltaX > 0 ? 'right' : 'left';
    } else {
      return deltaY > 0 ? 'down' : 'up';
    }
  }

  // ===== ORIENTATION HANDLING =====

  setupOrientationChange() {
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.updateLayout();
      }, 100);
    });

    window.addEventListener('resize', () => {
      this.updateLayout();
    });
  }

  updateLayout() {
    const isLandscape = window.innerWidth > window.innerHeight;

    if (isLandscape) {
      // Landscape: Controls on sides
      if (this.joystickElements.container) {
        this.joystickElements.container.style.bottom = '20px';
        this.joystickElements.container.style.left = '20px';
      }
      const buttonsContainer = document.querySelector(this.options.buttonsContainer);
      if (buttonsContainer) {
        buttonsContainer.style.bottom = '20px';
        buttonsContainer.style.right = '20px';
        buttonsContainer.style.flexDirection = 'row';
      }
    } else {
      // Portrait: Stack vertically
      if (this.joystickElements.container) {
        this.joystickElements.container.style.bottom = '120px';
        this.joystickElements.container.style.left = '20px';
      }
      const buttonsContainer = document.querySelector(this.options.buttonsContainer);
      if (buttonsContainer) {
        buttonsContainer.style.bottom = '20px';
        buttonsContainer.style.right = '20px';
        buttonsContainer.style.flexDirection = 'column';
      }
    }
  }

  // ===== HAPTIC FEEDBACK =====

  hapticFeedback(intensity = 'light') {
    if (!this.options.enableHaptics) return;

    if ('vibrate' in navigator) {
      switch (intensity) {
        case 'light':
          navigator.vibrate(10);
          break;
        case 'medium':
          navigator.vibrate(20);
          break;
        case 'heavy':
          navigator.vibrate(50);
          break;
      }
    }
  }

  // ===== DEBUG DISPLAY =====

  setupDebugDisplay() {
    const debug = document.createElement('div');
    debug.id = 'debug-display';
    debug.style.cssText = `
            position: fixed;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 12px;
            z-index: 10000;
        `;
    document.body.appendChild(debug);

    setInterval(() => {
      debug.innerHTML = `
                Joystick: X: ${this.joystick.normalizedX.toFixed(2)}, Y: ${this.joystick.normalizedY.toFixed(2)}<br>
                Buttons: ${
                  Array.from(this.buttons.entries())
                    .filter(([_, btn]) => btn.pressed)
                    .map(([id]) => id)
                    .join(', ') || 'None'
                }
            `;
    }, 100);
  }

  // ===== PUBLIC API =====

  onJoystickMove(callback) {
    this.callbacks.onJoystickMove = callback;
  }

  onButtonPress(callback) {
    this.callbacks.onButtonPress = callback;
  }

  onButtonRelease(callback) {
    this.callbacks.onButtonRelease = callback;
  }

  onSwipe(callback) {
    this.callbacks.onSwipe = callback;
  }

  getJoystickInput() {
    return {
      x: this.joystick.normalizedX,
      y: this.joystick.normalizedY,
    };
  }

  isButtonPressed(buttonId) {
    const button = this.buttons.get(buttonId);
    return button ? button.pressed : false;
  }

  destroy() {
    // Clean up event listeners and DOM elements
    if (this.joystickElements.base) {
      this.joystickElements.base.remove();
    }
    this.buttons.forEach(button => {
      button.element.remove();
    });
  }
}

/*
 * USAGE EXAMPLE:
 *
 * HTML:
 * <!DOCTYPE html>
 * <html>
 * <head>
 *     <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
 *     <style>
 *         body { margin: 0; overflow: hidden; touch-action: none; }
 *         #game-area { width: 100vw; height: 100vh; background: #222; }
 *         #joystick-container { position: fixed; bottom: 20px; left: 20px; }
 *         #buttons-container {
 *             position: fixed;
 *             bottom: 20px;
 *             right: 20px;
 *             display: flex;
 *             flex-direction: row;
 *         }
 *     </style>
 * </head>
 * <body>
 *     <div id="game-area"></div>
 *     <div id="joystick-container"></div>
 *     <div id="buttons-container"></div>
 *     <script src="touch-controls.js"></script>
 * </body>
 * </html>
 *
 * JavaScript:
 * const controls = new TouchControls({
 *     joystickRadius: 60,
 *     joystickDeadzone: 0.15,
 *     enableHaptics: true,
 *     showDebug: true
 * });
 *
 * controls.onJoystickMove((x, y) => {
 *     console.log(`Joystick: X=${x}, Y=${y}`);
 *     // Move player: player.velocity.x = x * speed;
 * });
 *
 * controls.onButtonPress((buttonId) => {
 *     console.log(`Button pressed: ${buttonId}`);
 *     if (buttonId === 'jump') player.jump();
 *     if (buttonId === 'attack') player.attack();
 * });
 *
 * controls.onButtonRelease((buttonId) => {
 *     console.log(`Button released: ${buttonId}`);
 * });
 *
 * controls.onSwipe((direction) => {
 *     console.log(`Swiped: ${direction}`);
 *     if (direction === 'up') player.dodge();
 * });
 *
 * // In game loop:
 * function update() {
 *     const input = controls.getJoystickInput();
 *     player.move(input.x, input.y);
 *
 *     if (controls.isButtonPressed('attack')) {
 *         player.continuousAttack();
 *     }
 *
 *     requestAnimationFrame(update);
 * }
 *
 * TIPS:
 * - Add CSS for visual feedback (hover, active states)
 * - Test on real devices (iOS, Android)
 * - Consider adding touch target indicators
 * - Provide options to customize control positions
 * - Add opacity slider for controls
 * - Support landscape and portrait orientations
 * - Test with different hand sizes
 * - Provide alternative control schemes
 */
