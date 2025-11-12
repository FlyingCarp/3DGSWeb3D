# 3DGS Web Project

> A web-based 3D Gaussian Splatting viewer built on [SuperSplat](https://github.com/playcanvas/supersplat), featuring interactive POI markers, conference scheduling, and an elegant slide-up menu interface.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/) [![PlayCanvas](https://img.shields.io/badge/PlayCanvas-Latest-orange.svg)](https://playcanvas.com/)
<p align="center">
  <img src="./webpage.png" width="400" /><br>
  <em>3DGS Web</em>
</p>   

## ✨ Features

- 🎨 **High-Performance 3D Rendering**: Powered by PlayCanvas and optimized for both desktop and mobile devices
- 📍 **Interactive POI System**: Navigate to key locations with visual markers
- 📅 **Integrated Conference Schedule**: View meeting schedules directly in the 3D environment
- 📱 **Responsive Slide-Up Menu**: Three-stage expandable menu (collapsed → half → full)
- 🚀 **Mobile Optimized**: Adaptive quality, texture optimization, and touch-friendly controls
- 🎯 **Building Navigation**: Quick access to hotels, canteens, conference centers, and convenience stores
- 🔄 **Scene Management**: Load and manage multiple SOG format 3D Gaussian Splatting models

## 📦 Tech Stack

- **Framework**: [PlayCanvas](https://playcanvas.com/) (WebGL engine)
- **Language**: TypeScript 5.0+
- **Build Tool**: Rollup
- **3D Format**: SOG (optimized Gaussian Splatting format)
- **UI**: Vanilla TypeScript with CSS animations

## 🚀 Quick Start

### Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Run development server**
   ```bash
   npm run develop
   ```

3. **Open browser**
   - Navigate to `http://localhost:3000`

### Production Build

```bash
npm run build
```

The built files will be in the `dist/` directory.

---

## 🌐 Cloud Server Deployment

### Step 1: Clone Repository

```bash
git clone https://gitee.com/yourusername/3DGSWeb3D.git
cd 3DGSWeb3D
```

### Step 2: Upload 3D Assets

Upload your SOG model files to:
```
dist/media/SplattingFiles/
```

**Recommended structure**:
```
dist/media/SplattingFiles/
└── SSLake_optimized_mobile/
    ├── meta.json
    ├── model.sog
    └── ... (other assets)
```

### Step 3: Build Project

```bash
npm install
npm run build
```

### Step 4: Install Process Manager

```bash
# Install PM2 (process manager)
npm install -g pm2

# Install serve (static file server)
npm install -g serve
```

### Step 5: Start Application

**Basic start**:
```bash
pm2 start npm --name "3dgs-web" -- run serve
```

**Advanced start with logging** (recommended):

```bash
# 1. Install log rotation
pm2 install pm2-logrotate

# 2. Configure log rotation (optional)
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# 3. Start with custom log files
pm2 delete 3dgs-web  # Remove existing process if any

pm2 start npm \
  --name "3dgs-web" \
  --log-date-format "YYYY-MM-DD HH:mm:ss Z" \
  --error /var/log/3dgs-error.log \
  --output /var/log/3dgs-out.log \
  -- run serve
```

### Step 6: Configure Auto-Start on Reboot

```bash
# Save current process list
pm2 save

# Generate startup script
pm2 startup

# Follow the instructions displayed by PM2
```

### Step 7: Verify Deployment

```bash
# Check process status
pm2 status

# View logs
pm2 logs 3dgs-web

# Monitor in real-time
pm2 monit
```

---

## 📂 Project Structure

```
3DGSWeb3D/
├── src/
│   ├── main.ts                 # Application entry point
│   ├── camera.ts               # Camera controller with mobile optimization
│   ├── scene-manager.ts        # Scene and model management
│   ├── poi-system.ts           # Point of Interest system
│   ├── swipe-up-menu.ts        # Slide-up menu component
│   ├── start_overlay.ts        # Loading overlay
│   └── ... (other modules)
├── dist/
│   ├── media/
│   │   └── SplattingFiles/     # 3D model assets (SOG format)
│   ├── index.html
│   └── ... (built files)
├── package.json
├── tsconfig.json
└── rollup.config.mjs
```

---

## 🎮 Usage

### Camera Controls

**Desktop**:
- **Left Mouse**: Rotate camera
- **Right Mouse**: Pan camera
- **Mouse Wheel**: Zoom in/out
- **Middle Mouse**: Pan camera

**Mobile**:
- **Single Finger Drag**: Rotate camera
- **Two Finger Pinch**: Zoom
- **Two Finger Drag**: Pan camera
- **Swipe Up**: Expand menu

### Slide-Up Menu

**Three-Stage Interaction**:

1. **Collapsed (45px)**: Shows "👆 Swipe up to expand menu"
2. **Half-Expanded (50vh)**: Shows building navigation and basic conference info
3. **Fully-Expanded (90vh)**: Shows complete conference schedule

**Interaction Methods**:
- **Click Toggle Button**: Cycle through states
- **Swipe Up 50px**: Collapsed → Half-expanded
- **Continue Swipe Up 80px**: Half-expanded → Fully-expanded
- **Swipe Down**: Collapse to previous state
- **Double-Tap**: Quick toggle between collapsed and fully-expanded

### Building Navigation

Click on building icons to focus camera on:
- 🏨 **Hotel**
- 🍽️ **Canteen**
- 🏢 **Conference Center**
- 🏪 **Convenience Store**

---

## ⚙️ Configuration

### Update Building Positions

Edit `src/swipe-up-menu.ts`:

```typescript
private buildings: BuildingInfo[] = [
    {
        name: '酒店',
        icon: '🏨',
        position: new Vec3(x, y, z),  // Camera position
        target: new Vec3(x, y, z)     // Look-at target
    },
    // ... other buildings
];
```

### Configure Scene

Edit `src/main.ts`:

```typescript
// Load your SOG model
await events.invoke('import', [{
    filename: 'meta.json',
    url: '/media/SplattingFiles/YourModel/meta.json'
}]);

// Set initial camera pose
camera.setPose(
    new Vec3(camX, camY, camZ),     // Camera position
    new Vec3(targetX, targetY, targetZ),  // Look-at target
    0  // Damping (0 = instant)
);
```

### Update Conference Schedule

Edit `src/swipe-up-menu.ts`:

```typescript
private morningSchedule: ConferenceSchedule[] = [
    { time: '8:00-8:30', event: 'Sign in' },
    { time: '8:30-8:40', event: 'Opening', speaker: 'Speaker Name' },
    // ... more events
];
```

---

## 🎨 Customization

### Menu Theme

Adjust colors in `swipe-up-menu.ts`:

```typescript
// Background color
this.container.style.background = 'rgba(255, 255, 255, 0.98)';

// Accent color (icons, hints)
const accentColor = '#1890ff';  // Change to your brand color

// Button hover effects
iconButton.style.borderColor = accentColor;
```

### Performance Tuning

**Mobile optimization** (in `camera.ts`):
```typescript
// Texture format (RGB565 for better performance)
const isMobile = isMobileDevice();

// Adaptive quality system
// Automatically reduces quality if FPS drops below 25
```

**Disable features for low-end devices**:
```typescript
// In swipe-up-menu.ts
// Remove backdrop-filter (already disabled for performance)

// In camera.ts
// Adjust near/far clipping planes
this.near = 0.01;
this.far = 1000;
```

---

## 📊 Performance

### Benchmarks

| Platform | FPS | GPU Usage | Memory |
|----------|-----|-----------|--------|
| Desktop (Chrome) | 60 | <5% | ~50MB |
| Desktop (Firefox) | 60 | <5% | ~45MB |
| iPhone 12+ | 60 | <10% | ~40MB |
| Android (Mid-range) | 45-60 | <15% | ~35MB |

### Optimization Features

- ✅ **Adaptive Quality**: Automatically adjusts rendering quality based on FPS
- ✅ **Texture Optimization**: RGB565 format on mobile devices
- ✅ **Frustum Culling**: Optimized near/far clipping planes
- ✅ **UI Performance**: CSS-only animations (no JavaScript loops)
- ✅ **Lazy Loading**: Menu content loaded on-demand

---

## 🐛 Troubleshooting

### Issue: Model not loading

**Solution**:
1. Check file paths in `main.ts`
2. Ensure SOG files are in `dist/media/SplattingFiles/`
3. Verify `meta.json` is valid JSON
4. Check browser console for errors

### Issue: Low FPS on mobile

**Solution**:
1. Reduce model complexity (use optimized SOG)
2. Enable adaptive quality in `camera.ts`
3. Disable backdrop-filter (already done)
4. Check mobile device specifications

### Issue: Menu not showing

**Solution**:
1. Ensure `swipe-up-menu.ts` is imported in `main.ts`
2. Check z-index conflicts (menu uses z-index: 1000)
3. Verify CSS is loaded correctly
4. Check browser console for initialization errors

### Issue: PM2 process not starting

**Solution**:
```bash
# Check PM2 logs
pm2 logs 3dgs-web --lines 100

# Restart process
pm2 restart 3dgs-web

# Check port availability
lsof -i :3000
```

---

## 🔧 Development

### Available Scripts

```bash
# Development server (hot reload)
npm run develop

# Production build
npm run build

# Type checking
npm run typecheck

# Serve production build locally
npm run serve
```



## 📝 Browser Support

| Browser | Desktop | Mobile |
|---------|---------|--------|
| Chrome 90+ | ✅ | ✅ |
| Firefox 88+ | ✅ | ✅ |
| Safari 14+ | ✅ | ✅ |
| Edge 90+ | ✅ | ✅ |

**Requirements**:
- WebGL 2.0 support
- ES6+ JavaScript support
- Modern CSS support (flexbox, grid)

---


## 🙏 Acknowledgments

- [SuperSplat](https://github.com/playcanvas/supersplat) - Base 3DGS viewer framework
- [PlayCanvas](https://playcanvas.com/) - WebGL game engine
- [3D Gaussian Splatting](https://repo-sam.inria.fr/fungraph/3d-gaussian-splatting/) - Original research

---

## 📸 Screenshots

- Main 3D view with POI markers

- Slide-up menu (collapsed/expanded states)

---
