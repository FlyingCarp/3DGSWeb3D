// src/first-person-controller.ts - 第一人称控制器(移动端优化版)
import { Vec3, math } from 'playcanvas';
import { Camera } from './camera';

class FirstPersonController {
    private camera: Camera;
    private position: Vec3 = new Vec3();
    private yaw: number = 0;      // 水平角度
    private pitch: number = 0;    // 垂直角度
    
    private moveSpeed: number = 2.0;  // 移动速度(降低)
    private lookSensitivity: number = 0.1;  // 视角灵敏度(降低)
    
    // 移动控制UI
    private controlsContainer: HTMLElement | null = null;
    private moveButtons: Map<string, HTMLElement> = new Map();
    
    // 移动状态
    private moveState = {
        forward: false,
        backward: false,
        left: false,
        right: false
    };
    
    // 触摸控制
    private touchStartX: number = 0;
    private touchStartY: number = 0;
    private isTouching: boolean = false;
    
    public isInFirstPersonMode: boolean = false;

    constructor(camera: Camera) {
        this.camera = camera;
    }

    // ✅ 激活第一人称模式
    activate(position: Vec3, yaw: number, pitch: number) {
        this.position.copy(position);
        this.yaw = yaw;
        this.pitch = pitch;
        this.isInFirstPersonMode = true;
        
        this.createMobileControls();
        this.bindTouchEvents();
        
        console.log('✅ 第一人称模式已激活', {
            position: position,
            yaw: yaw,
            pitch: pitch
        });
    }

    // ✅ 停用第一人称模式
    deactivate() {
        this.isInFirstPersonMode = false;
        this.removeMobileControls();
        this.unbindTouchEvents();
        
        console.log('✅ 第一人称模式已停用');
    }

    // ✅ 创建移动端方向键控制UI
    private createMobileControls() {
        // 创建容器
        this.controlsContainer = document.createElement('div');
        this.controlsContainer.style.cssText = `
            position: fixed;
            bottom: 30px;
            left: 30px;
            display: grid;
            grid-template-columns: repeat(3, 60px);
            grid-template-rows: repeat(3, 60px);
            gap: 8px;
            z-index: 10000;
            pointer-events: auto;
        `;

        // 创建按钮配置
        const buttons = [
            { key: 'forward', label: '↑', row: 1, col: 2 },
            { key: 'left', label: '←', row: 2, col: 1 },
            { key: 'backward', label: '↓', row: 2, col: 2 },
            { key: 'right', label: '→', row: 2, col: 3 }
        ];

        buttons.forEach(({ key, label, row, col }) => {
            const btn = document.createElement('button');
            btn.textContent = label;
            btn.style.cssText = `
                grid-row: ${row};
                grid-column: ${col};
                width: 60px;
                height: 60px;
                background: rgba(0, 0, 0, 0.6);
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-radius: 12px;
                color: white;
                font-size: 24px;
                font-weight: bold;
                cursor: pointer;
                user-select: none;
                touch-action: none;
                transition: all 0.15s ease;
            `;

            // 触摸事件
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.moveState[key as keyof typeof this.moveState] = true;
                btn.style.background = 'rgba(76, 175, 80, 0.8)';
                btn.style.transform = 'scale(0.95)';
            });

            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.moveState[key as keyof typeof this.moveState] = false;
                btn.style.background = 'rgba(0, 0, 0, 0.6)';
                btn.style.transform = 'scale(1)';
            });

            // 鼠标事件(桌面端测试)
            btn.addEventListener('mousedown', () => {
                this.moveState[key as keyof typeof this.moveState] = true;
                btn.style.background = 'rgba(76, 175, 80, 0.8)';
            });

            btn.addEventListener('mouseup', () => {
                this.moveState[key as keyof typeof this.moveState] = false;
                btn.style.background = 'rgba(0, 0, 0, 0.6)';
            });

            this.moveButtons.set(key, btn);
            this.controlsContainer!.appendChild(btn);
        });

        document.body.appendChild(this.controlsContainer);
    }

    // ✅ 移除移动控制UI
    private removeMobileControls() {
        if (this.controlsContainer) {
            document.body.removeChild(this.controlsContainer);
            this.controlsContainer = null;
        }
        this.moveButtons.clear();
    }

    // ✅ 绑定触摸事件(视角拖动)
    private bindTouchEvents() {
        const canvas = this.camera.scene.canvas;
        
        canvas.addEventListener('touchstart', this.onTouchStart);
        canvas.addEventListener('touchmove', this.onTouchMove);
        canvas.addEventListener('touchend', this.onTouchEnd);
    }

    // ✅ 解绑触摸事件
    private unbindTouchEvents() {
        const canvas = this.camera.scene.canvas;
        
        canvas.removeEventListener('touchstart', this.onTouchStart);
        canvas.removeEventListener('touchmove', this.onTouchMove);
        canvas.removeEventListener('touchend', this.onTouchEnd);
    }

    // ✅ 触摸开始
    private onTouchStart = (e: TouchEvent) => {
        if (e.touches.length === 1) {
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
            this.isTouching = true;
        }
    };

    // ✅ 触摸移动(调整视角)
    private onTouchMove = (e: TouchEvent) => {
        if (!this.isTouching || e.touches.length !== 1) return;
        
        const deltaX = e.touches[0].clientX - this.touchStartX;
        const deltaY = e.touches[0].clientY - this.touchStartY;
        
        // 更新yaw和pitch
        this.yaw -= deltaX * this.lookSensitivity;
        this.pitch -= deltaY * this.lookSensitivity;
        
        // 限制pitch范围
        this.pitch = Math.max(-89, Math.min(89, this.pitch));
        
        // 更新起点
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
        
        e.preventDefault();
    };

    // ✅ 触摸结束
    private onTouchEnd = () => {
        this.isTouching = false;
    };

    // ✅ 更新函数(每帧调用)
    update(deltaTime: number) {
        if (!this.isInFirstPersonMode) return;

        // 1. 处理移动
        const forward = new Vec3();
        const right = new Vec3();
        
        // 计算前方向(忽略pitch,只用yaw)
        const yawRad = this.yaw * math.DEG_TO_RAD;
        forward.set(
            -Math.sin(yawRad),
            0,
            -Math.cos(yawRad)
        ).normalize();
        
        // 计算右方向
        right.set(
            Math.cos(yawRad),
            0,
            -Math.sin(yawRad)
        ).normalize();

        // 根据按键状态移动
        const moveVector = new Vec3();
        
        if (this.moveState.forward) {
            moveVector.add(forward);
        }
        if (this.moveState.backward) {
            moveVector.sub(forward);
        }
        if (this.moveState.left) {
            moveVector.sub(right);
        }
        if (this.moveState.right) {
            moveVector.add(right);
        }

        // 归一化并应用速度
        if (moveVector.length() > 0) {
            moveVector.normalize();
            moveVector.mulScalar(this.moveSpeed * deltaTime);
            this.position.add(moveVector);
        }

        // 2. 更新相机位置和朝向
        this.camera.entity.setLocalPosition(this.position);
        this.camera.entity.setLocalEulerAngles(this.pitch, this.yaw, 0);

        // 3. 更新视锥剔除
        const forwardDir = new Vec3();
        const pitchRad = this.pitch * math.DEG_TO_RAD;
        forwardDir.set(
            -Math.sin(yawRad) * Math.cos(pitchRad),
            Math.sin(pitchRad),
            -Math.cos(yawRad) * Math.cos(pitchRad)
        ).normalize();

        this.camera.fitClippingPlanes(this.position, forwardDir);
    }

    // ✅ 获取当前位置
    getPosition(): Vec3 {
        return this.position.clone();
    }

    // ✅ 获取当前朝向
    getYaw(): number {
        return this.yaw;
    }

    getPitch(): number {
        return this.pitch;
    }
}

export { FirstPersonController };
