# HUD Design Patterns

## Core HUD Principles

### Visual Hierarchy

**Primary Information** (always visible, largest):

- Player health/status
- Current objective/mission
- Critical alerts

**Secondary Information** (visible but less prominent):

- Ammunition/resources
- Mini-map/radar
- Score/currency
- Ability cooldowns

**Tertiary Information** (contextual, appears when needed):

- Interaction prompts
- Damage indicators
- Tutorial hints
- Quest updates

### Screen Zones

```
┌─────────────────────────────────┐
│ TL: Health    TC: Objective  TR:│
│     Abilities    Timer     Ammo │
│                                  │
│                                  │
│ ML:                          MR: │
│ Quest Log                   Map  │
│                                  │
│                                  │
│ BL: Inventory BC: Prompts   BR: │
│     Buffs        "Press E"  XP   │
└─────────────────────────────────┘
```

**Corner Positioning:**

- **Top-Left**: Health, shields, character portrait (most critical - eyes start here for LTR readers)
- **Top-Right**: Resources, ammo, mini-map
- **Bottom-Left**: Inventory, buffs/debuffs, quest tracker
- **Bottom-Right**: Experience, score, secondary objectives
- **Top-Center**: Mission objectives, countdown timers
- **Bottom-Center**: Interaction prompts, subtitles, contextual actions

### Diegetic vs Non-Diegetic UI

**Diegetic UI** (exists in game world):

- Health bars on enemies
- Holographic displays
- In-world navigation markers
- Screen overlays (helmet HUD)

**Non-Diegetic UI** (overlay on screen):

- Traditional health bars
- Mini-maps
- Inventory screens
- Pause menus

**Spatial UI** (3D but not diegetic):

- Floating damage numbers
- World-space health bars
- Billboard UI elements

**Meta UI** (outside game context):

- Loading screens
- Achievement notifications
- Social features

## Common HUD Elements

### Health Bars

**Linear Health Bar:**

```
[████████░░░░░░░░] 60/100 HP
```

**Segmented Health Bar:**

```
[███] [███] [███] [░░░]
```

**Circular/Radial Health:**

```
    ◐ 75%
```

**Design Considerations:**

- Use color coding: Green (healthy) → Yellow (caution) → Red (critical)
- Add damage feedback: Flash red, shake, or pulse
- Consider regeneration: Show regenerating portion differently
- Multiple health types: Health + shields + armor (use layering or segments)

### Resource Management

**Ammunition Display:**

```
[▪▪▪▪▪▪▪▪░░] 8/10
Reserves: 60
```

**Cooldown Indicators:**

```
⏱ 3.5s  (numerical)
◐ 50%   (circular fill)
```

**Stamina/Mana:**

```
Stamina: [███████░░░]
Mana:    [██████████] 100%
```

### Mini-Map/Radar

**Elements to Include:**

- Player position (always centered or dynamic)
- Objectives (markers, waypoints)
- Enemies (red) / Allies (blue)
- Points of interest
- Fog of war (explored vs unexplored)

**Types:**

- Fixed rotation (north always up)
- Player-relative (forward always up)
- Full map overlay (accessed via button)

**Zoom Levels:**

- Close: Detailed tactical view
- Medium: Navigation view
- Far: Strategic overview

### Crosshairs/Reticles

**Static Crosshair:**

```
    │
────┼────
    │
```

**Dynamic Spread Indicator:**

```
    │
  ──┼──  (tightens when aiming)
    │
```

**Contextual Crosshair:**

- Changes color when hovering over enemy
- Expands when target is in range
- Shows hit confirmation

### Damage/Hit Indicators

**Directional Damage:**

```
     ▲

◄   @   ►  (arrows point to damage source)

     ▼
```

**Screen Edge Vignette:**

- Red vignette from damage direction
- Fades based on time and distance

**Floating Damage Numbers:**

- Critical hits (larger, different color)
- Damage types (elemental colors)
- Headshots (special effect)

### Objective Markers

**World-Space Markers:**

- Distance indicator
- Icon type (main quest, side quest, collectible)
- Clamp to screen edge when off-screen
- Fade when behind player

**Waypoint System:**

```
[⭐ Main Quest - 150m]
   └─ Follow the path
[📍 Side Quest - 45m]
```

### Status Effects/Buffs

**Icon Grid:**

```
[🔥] [⚡] [🛡️]  (active effects)
3.2s 8.5s Perm
```

**Design Guidelines:**

- Color code: Buffs (blue/green), Debuffs (red/purple)
- Show timer/duration
- Stack count for stackable effects
- Pulsing/glowing for high importance

## HUD Design Best Practices

### Clarity and Readability

**Typography:**

- Use high-contrast fonts
- Minimum font size: 18-24px for console, 12-16px for PC
- Bold or outlined text for readability over varied backgrounds
- Avoid overly stylized fonts that sacrifice legibility

**Color Guidelines:**

- Use consistent color language: Red = danger, Green = good, Blue = info, Yellow = warning
- Consider colorblind accessibility (avoid red/green only distinctions)
- Use saturation and brightness differences in addition to hue
- Test on various backgrounds and lighting conditions

**Contrast and Outlines:**

- Black outline or drop shadow for light text
- White outline for dark text
- Background panels with opacity (80-90%) behind important info
- Avoid pure white/black; use slightly off-white (#F0F0F0) or dark gray (#1A1A1A)

### Information Density

**Progressive Disclosure:**

- Hide less important info during action
- Show detailed stats only when needed
- Use collapsible panels for complex information
- Context-sensitive displays (show ammo only when weapon drawn)

**Minimalism:**

- Remove unnecessary decorative elements
- Every pixel should serve a purpose
- Use whitespace effectively
- Consider "minimal HUD" options for players who want less clutter

**Grouping:**

- Related information should be spatially grouped
- Use Gestalt principles (proximity, similarity, enclosure)
- Separate concerns: Combat info vs exploration info

### Feedback and Response

**Immediate Feedback:**

- Visual: Flash, highlight, shake
- Audio: Sound effect for state changes
- Haptic: Controller vibration for damage/actions

**State Changes:**

- Smooth transitions (not instant jumps)
- Anticipatory feedback (ability about to be ready)
- Confirmation feedback (action successfully performed)

**Animations:**

- Slide in/out for temporary elements
- Pulse for attention
- Smooth fill animations for bars
- Shake for damage or critical events

### Accessibility

**Options to Provide:**

- HUD scale (50% - 200%)
- Opacity control
- Color customization
- Toggle individual elements
- Text-to-speech for key information
- High contrast mode

**Considerations:**

- Colorblind modes (Protanopia, Deuteranopia, Tritanopia)
- Motion sickness: Reduce screen shake, bob, motion blur
- Cognitive load: Don't overwhelm with information
- Customizable layouts for different play styles

## Genre-Specific Patterns

### First-Person Shooter (FPS)

**Essential Elements:**

- Crosshair (center screen)
- Health (bottom-left or top-left)
- Ammo (bottom-right)
- Mini-map (corner)
- Objective marker (top-center)
- Grenade/ability indicators
- Damage indicators (directional)

**Design Focus:**

- Minimal obstruction of center screen
- Quick-read information
- High contrast for fast-paced action

### Role-Playing Game (RPG)

**Essential Elements:**

- Health/Mana/Stamina bars
- Character portrait
- Level and experience
- Quest log/tracker
- Mini-map
- Inventory quick-access
- Party member status (if applicable)
- Buff/debuff indicators

**Design Focus:**

- More information density acceptable
- Stat-heavy displays
- Detailed tooltips
- Multiple screens/tabs

### Real-Time Strategy (RTS)

**Essential Elements:**

- Mini-map (prominent, often bottom corner)
- Resource counters (top)
- Unit selection panel (bottom)
- Build queues
- Tech tree access
- Population/supply counter

**Design Focus:**

- Information-dense
- Quick access to production and strategy
- Clear unit states and grouping

### Racing Games

**Essential Elements:**

- Speedometer (prominent)
- Position/lap counter
- Mini-map/racing line
- Rear-view mirror
- Damage indicator
- Boost/nitro meter

**Design Focus:**

- Speed readable at a glance
- Minimal obstruction of track view
- Clear positioning relative to opponents

### Platformers

**Essential Elements:**

- Health/lives
- Collectibles counter
- Score
- Timer (if applicable)
- Power-up status

**Design Focus:**

- Simple and clean
- Not distracting from platforming action
- Clear visual language for collectibles

### Fighting Games

**Essential Elements:**

- Health bars (top, symmetrical)
- Character names/portraits
- Round counter
- Timer (top-center)
- Combo counter
- Super meter/special gauge

**Design Focus:**

- Symmetrical layout
- High visibility of both players' status
- Clear indication of round victory
- Combo feedback

## Mobile-Specific Considerations

### Touch Controls

**Virtual Buttons:**

- Large enough for fingers (minimum 44x44 pixels)
- Adequate spacing to prevent mis-taps
- Semi-transparent to not obstruct view
- Haptic feedback on press

**Gesture Areas:**

- Swipe zones for quick actions
- Pinch-to-zoom for maps
- Long-press for context menus

**Thumb Zones:**

```
┌─────────────────────┐
│         ✗           │  (hard to reach)
│                     │
│    ✓         ✓      │  (easy reach)
│                     │
│   ✓         ✓       │  (natural thumb position)
└─────────────────────┘
```

### Safe Areas

- Account for notches, home indicators, camera cutouts
- Keep critical UI within safe bounds
- Use Unity's Screen.safeArea or equivalent APIs

### Screen Size Adaptation

- Scale UI relative to screen resolution
- Test on various aspect ratios (16:9, 18:9, 19.5:9, 4:3 for tablets)
- Provide different layouts for phone vs tablet

## Performance Considerations

### Optimization

**Canvas/UI Updates:**

- Batch updates when possible
- Avoid updating every frame unless necessary
- Use object pooling for frequently created/destroyed elements
- Disable invisible UI elements instead of destroying

**Draw Calls:**

- Minimize separate canvases
- Use sprite atlases for UI textures
- Avoid transparency overdraw

**Animation:**

- Use cached animations
- Tween libraries for smooth interpolation
- Avoid complex shaders on UI elements

**Event System:**

- Unsubscribe from events when not needed
- Use efficient raycasting for interactions
- Limit the number of interactive elements

## Testing and Iteration

### Usability Testing

**Questions to Ask:**

- Can players find critical information quickly?
- Is the HUD too cluttered or too sparse?
- Do colors/icons convey the right meaning?
- Can players identify state changes immediately?

**Metrics to Track:**

- Time to find information
- Errors due to misunderstanding HUD
- Player feedback and confusion points

### A/B Testing

- Test different layouts
- Vary information density
- Compare static vs dynamic elements
- Test with target audience

### Iteration Checklist

- [ ] Is critical information immediately visible?
- [ ] Does the HUD support the core gameplay loop?
- [ ] Is the visual language consistent?
- [ ] Are there accessibility options?
- [ ] Does it scale across different screen sizes?
- [ ] Is performance acceptable?
- [ ] Have players tested and provided feedback?

## Common Mistakes to Avoid

### Overcrowding

❌ **Don't:**

- Fill every corner with information
- Show all possible stats at once
- Use tiny fonts to fit more information

✅ **Do:**

- Show only what's needed for the current context
- Use progressive disclosure
- Prioritize critical information

### Poor Contrast

❌ **Don't:**

- Use similar colors for foreground and background
- Rely only on color to convey information
- Use pure white text on light backgrounds

✅ **Do:**

- Use outlines, shadows, or background panels
- Test on different backgrounds and lighting
- Ensure colorblind accessibility

### Lack of Feedback

❌ **Don't:**

- Have instant state changes with no transition
- Ignore player actions in the UI
- Use static elements that never change

✅ **Do:**

- Animate state transitions
- Provide immediate visual feedback
- Use audio and haptic feedback where appropriate

### Inconsistent Design Language

❌ **Don't:**

- Mix different visual styles across UI elements
- Use different colors for the same meaning in different places
- Have inconsistent fonts and sizing

✅ **Do:**

- Create a UI style guide
- Use consistent color palette
- Maintain uniform spacing and alignment

## Resources and Tools

### Design Tools

- **Figma/Sketch**: UI mockups and prototyping
- **Adobe XD**: Interactive prototypes
- **Photoshop/Illustrator**: Asset creation

### Font Resources

- **Google Fonts**: Free web fonts
- **DaFont**: Game-oriented fonts
- **Font Squirrel**: Commercial-use fonts

### Icon Libraries

- **Font Awesome**: General purpose icons
- **Game Icons**: Game-specific icon sets
- **Material Icons**: Clean, modern icons

### Color Palettes

- **Coolors.co**: Color palette generator
- **Adobe Color**: Color wheel and harmonies
- **Colorblind simulator**: Test accessibility

### UI Frameworks

- **Unity UI Toolkit**: Unity's modern UI system
- **TextMeshPro**: Advanced text rendering for Unity
- **UMG (Unreal Motion Graphics)**: Unreal's UI system
- **Phaser UI**: Web-based game UI

## Conclusion

Effective HUD design balances information density with clarity, provides immediate feedback, and adapts to different contexts and platforms. Always test with real players and iterate based on feedback. Prioritize readability, accessibility, and supporting the core gameplay experience.
