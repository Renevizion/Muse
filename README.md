# TRON Light Cycle Game

A fully-featured 3D TRON-inspired light cycle game built with Three.js.

## Features

- **Full 3D Graphics**: Rendered using Three.js with smooth animations
- **Dynamic Camera**: Camera follows the player cycle with smooth interpolation
- **Light Trails**: Both player and AI leave glowing light trails
- **Smart AI Opponent**: AI opponent with basic pathfinding to avoid walls
- **Collision Detection**: Walls, light trails, and cycle-to-cycle collisions
- **Real-time Minimap**: Track both cycles and trails on the minimap
- **Responsive Controls**: Use Arrow Keys or WASD to control your cycle
- **Neon Aesthetics**: True TRON-style visuals with glowing effects

## How to Play

1. Open `index.html` in a modern web browser
2. Click "START GAME" button
3. Use **Arrow Keys** or **WASD** to turn your light cycle:
   - **Left/A**: Turn left
   - **Right/D**: Turn right
   - **Up/W**: Turn up
   - **Down/S**: Turn down
4. Avoid:
   - Arena walls (red)
   - Your own light trail (cyan)
   - Enemy light trail (orange)
   - The enemy cycle
5. Survive as long as possible to increase your score!

## Technical Details

- **Engine**: Three.js (v0.160.0)
- **Rendering**: WebGL with anti-aliasing
- **Lighting**: Ambient + Directional lights with shadow mapping
- **Materials**: PBR materials with emissive glow effects
- **Performance**: Optimized for smooth 60 FPS gameplay

## Browser Requirements

- Modern browser with WebGL support
- Chrome, Firefox, Safari, or Edge (latest versions)

## Game Mechanics

- **Speed**: Player moves at 0.15 units/frame, AI at 0.12 units/frame
- **Turn Cooldown**: 200ms between turns to prevent rapid direction changes
- **Arena Size**: 100x100 units grid
- **Trail Width**: 0.8 units
- **Collision Distance**: Cycles collide at 1.5 cycle sizes

## Development

This is a standalone HTML5 game with no build process required. Simply:

1. Clone the repository
2. Open `index.html` in a web browser
3. Play!

For development, you can use any local web server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js http-server
npx http-server
```

Then navigate to `http://localhost:8000`

## Credits

Inspired by the classic TRON light cycle battles.
Built with Three.js and modern web technologies.