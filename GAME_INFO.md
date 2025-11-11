# TRON Light Cycle Game - Technical Documentation

## Overview
A fully functional 3D TRON light cycle game built with Three.js, featuring dynamic camera movement, AI opponent, and classic TRON aesthetics.

## File Structure
```
.
├── index.html          # Main HTML file with UI and canvas
├── game.js            # Complete game logic and Three.js setup
├── package.json       # Dependencies (Three.js v0.160.0)
├── README.md          # User-facing documentation
└── .gitignore         # Excludes node_modules and old files
```

## Game Architecture

### Scene Setup (lines 24-61)
- Three.js scene with fog effect
- Perspective camera (75° FOV)
- WebGL renderer with anti-aliasing and shadow mapping
- Ambient and directional lighting

### Arena (lines 63-125)
- 100x100 unit grid floor
- PBR materials with emissive glow
- Four surrounding walls (height: 5 units)
- Red glowing walls for TRON aesthetic

### Light Cycles (lines 127-196)
- Player cycle: Cyan/blue with point light
- AI cycle: Orange/red with point light
- Box geometry with metallic materials
- Front lights for direction indication

### Game Mechanics

#### Movement (lines 293-312, 398-421)
- Player speed: 0.15 units/frame
- AI speed: 0.12 units/frame
- Turn cooldown: 200ms to prevent spam
- Direction changes create trail segments

#### Camera System (lines 245-260)
- Follows player with smooth interpolation (lerp factor: 0.05)
- Positioned 15 units behind, 20 units above
- Looks ahead in player direction

#### Collision Detection (lines 354-406)
- Wall boundaries: ±49 units
- Trail collision: 1.2 units (TRAIL_WIDTH * 1.5)
- Cycle collision: 2.25 units (CYCLE_SIZE * 1.5)
- Smart detection to avoid self-collision with current trail

#### AI Behavior (lines 314-352)
- Random turns with 1% chance per frame
- Wall avoidance at 45 units from edge
- Direction selection prioritizes center of arena
- Perpendicular turns only (no 180° reversals)

### UI Elements

#### HUD
- Score/time display (top left)
- Minimap (bottom right, 200x200px)
- Start screen with instructions
- Game over screen with results

#### Minimap (lines 457-511)
- Real-time 2D overhead view
- Cyan dot: player position
- Orange dot: AI position
- Trail segments drawn as small rectangles

## Performance Optimizations
- Pixel ratio capped at 2x
- PCF soft shadows
- Fog to reduce far rendering
- High-performance rendering preference
- Efficient collision detection (skips current trail segment)

## Controls
- Arrow Keys or WASD for turning
- No 180-degree turns allowed
- Turn cooldown prevents rapid direction changes

## Win/Lose Conditions
- Player loses: hits wall, own trail, or AI trail
- AI loses: hits wall or any trail
- Both lose: cycles collide directly

## Browser Compatibility
- Requires WebGL support
- Import maps for ES modules
- Works in Chrome, Firefox, Safari, Edge (latest versions)

## Known Limitations
- AI has basic pathfinding (doesn't predict player trails)
- Software rendering may be slower on some systems
- No multiplayer support
- No mobile touch controls (keyboard only)

## Future Enhancement Ideas
- Multiple difficulty levels
- Better AI with predictive pathfinding
- Power-ups (speed boosts, temporary invincibility)
- Mobile touch/tilt controls
- Multiplayer over WebRTC
- More arena variations
- Sound effects and music
