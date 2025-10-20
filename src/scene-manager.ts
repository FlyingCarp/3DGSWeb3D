// src/scene-manager.ts - 场景管理器
import { Vec3 } from 'playcanvas';
import { Events } from './events';
import { Scene } from './scene';
import { ElementType } from './element';
import { Splat } from './splat';

// 场景配置接口
interface SceneConfig {
    id: string;
    name: string;
    url: string;
    filename: string;
    defaultCameraPos?: Vec3;
    defaultCameraTarget?: Vec3;
    hasPOI?: boolean;  // 是否显示POI
}

class SceneManager {
    private scene: Scene;
    private events: Events;
    private currentSceneId: string = 'main';
    private scenes: Map<string, SceneConfig> = new Map();
    private backButton: HTMLElement;
    private isLoading: boolean = false;

    constructor(scene: Scene, events: Events) {
        this.scene = scene;
        this.events = events;
        
        this.initializeScenes();
        this.createBackButton();
        this.registerEvents();
    }

    // 初始化所有场景配置
    private initializeScenes() {
        // 主场景配置
        this.scenes.set('main', {
            id: 'main',
            name: '主场景',
            url: '/media/SplattingFile/SSLake.ply',
            filename: 'SSLake.ply',
            defaultCameraPos: new Vec3(-3.5739870071411133, 8.027021408081055, 0.7438146471977234),
            defaultCameraTarget: new Vec3(0.9115669929031545, -4.710339847395481, 1.96341514830072),
            hasPOI: true  // 只有主场景有POI
        });

        // A4场景配置
        this.scenes.set('A4', {
            id: 'A4',
            name: 'A4场景',
            url: '/media/SplattingFile/A4_319.ply',
            filename: 'A4_319.ply',
            defaultCameraPos: new Vec3(0, 2, 5),
            defaultCameraTarget: new Vec3(0, 0, 0),
            hasPOI: false
        });

        // 可以继续添加更多场景
        // this.scenes.set('B1', {
        //     id: 'B1',
        //     name: 'B1场景',
        //     url: '/media/SplattingFile/B1.ply',
        //     filename: 'B1.ply',
        //     hasPOI: false
        // });

        console.log(`场景管理器初始化完成，共 ${this.scenes.size} 个场景`);
    }

    // 创建返回按钮
    private createBackButton() {
        this.backButton = document.createElement('button');
        this.backButton.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span style="margin-left: 8px;">返回主场景</span>
        `;
        this.backButton.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            padding: 10px 16px;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-family: Arial, sans-serif;
            display: none;
            align-items: center;
            z-index: 10002;
            pointer-events: auto;
            transition: all 0.3s ease;
        `;

        // 悬停效果
        this.backButton.addEventListener('mouseenter', () => {
            this.backButton.style.background = 'rgba(0, 0, 0, 0.85)';
            this.backButton.style.transform = 'scale(1.05)';
        });

        this.backButton.addEventListener('mouseleave', () => {
            this.backButton.style.background = 'rgba(0, 0, 0, 0.7)';
            this.backButton.style.transform = 'scale(1)';
        });

        // 点击返回主场景
        this.backButton.addEventListener('click', () => {
            this.switchToScene('main');
        });

        document.body.appendChild(this.backButton);
    }

    // 注册事件监听
    private registerEvents() {
        // 监听场景切换请求
        this.events.on('scene.switch', (sceneId: string) => {
            this.switchToScene(sceneId);
        });

        // 监听场景切换请求（带相机位置）
        this.events.on('scene.switchWithCamera', (data: {
            sceneId: string,
            cameraPos?: Vec3,
            cameraTarget?: Vec3
        }) => {
            this.switchToScene(data.sceneId, data.cameraPos, data.cameraTarget);
        });

        // 监听返回主场景请求
        this.events.on('scene.returnToMain', () => {
            this.switchToScene('main');
        });

        console.log('场景管理器事件已注册');
    }

    // 切换场景的核心方法
    private async switchToScene(
        sceneId: string, 
        customCameraPos?: Vec3, 
        customCameraTarget?: Vec3
    ) {
        // 防止重复加载
        if (this.isLoading) {
            console.warn('场景正在加载中，请稍候...');
            return;
        }

        // 如果已经是当前场景，只调整相机
        if (this.currentSceneId === sceneId && !customCameraPos) {
            console.log(`已经在场景 ${sceneId} 中`);
            return;
        }

        const sceneConfig = this.scenes.get(sceneId);
        if (!sceneConfig) {
            console.error(`场景 ${sceneId} 不存在`);
            return;
        }

        this.isLoading = true;
        console.log(`开始切换到场景: ${sceneConfig.name}`);

        try {
            // 触发场景切换开始事件
            this.events.fire('scene.switchStart', sceneConfig);

            // ✅ 1. 立即隐藏POI（如果目标场景不需要POI）
            // 这样用户点击后就能立即看到POI消失，提供即时反馈
            if (!sceneConfig.hasPOI) {
                this.updatePOIVisibility(false);
            }

            // 2. 卸载当前场景
            await this.unloadCurrentScene();

            // 3. 加载新场景
            await this.loadScene(sceneConfig);

            // 4. 设置相机位置
            const cameraPos = customCameraPos || sceneConfig.defaultCameraPos;
            const cameraTarget = customCameraTarget || sceneConfig.defaultCameraTarget;
            
            if (cameraPos && cameraTarget) {
                this.scene.camera.setPose(cameraPos, cameraTarget, 0);
            }

            // 5. 更新当前场景ID
            this.currentSceneId = sceneId;

            // 6. 控制返回按钮显示
            if (sceneId === 'main') {
                this.hideBackButton();
            } else {
                this.showBackButton();
            }

            // ✅ 7. 再次确认POI显示状态（确保加载完成后状态正确）
            this.updatePOIVisibility(sceneConfig.hasPOI);

            // 8. 触发场景切换完成事件
            this.events.fire('scene.switchComplete', sceneConfig);

            console.log(`场景切换完成: ${sceneConfig.name}, POI显示: ${sceneConfig.hasPOI}`);

        } catch (error) {
            console.error('场景切换失败:', error);
            this.events.fire('scene.switchError', error);
            alert(`场景切换失败: ${error.message}`);
            
            // ✅ 错误时尝试恢复POI状态
            // 如果是从主场景切换失败，应该保持POI显示
            if (this.currentSceneId === 'main') {
                this.updatePOIVisibility(true);
            }
        } finally {
            this.isLoading = false;
        }
    }

    // 卸载当前场景
    private async unloadCurrentScene(): Promise<void> {
        console.log('卸载当前场景...');
        
        const splats = this.scene.getElementsByType(ElementType.splat) as Splat[];
        for (const splat of splats) {
            splat.destroy();
        }

        console.log(`卸载了 ${splats.length} 个Splat对象`);
    }

    // 加载场景
    private async loadScene(sceneConfig: SceneConfig): Promise<void> {
        console.log(`加载场景: ${sceneConfig.name}`);

        await this.events.invoke('import', [{
            filename: sceneConfig.filename,
            url: sceneConfig.url
        }]);

        console.log(`场景加载完成: ${sceneConfig.filename}`);
    }

    // 显示返回按钮
    private showBackButton() {
        this.backButton.style.display = 'flex';
    }

    // 隐藏返回按钮
    private hideBackButton() {
        this.backButton.style.display = 'none';
    }

    // 控制POI的显示/隐藏
    private updatePOIVisibility(showPOI: boolean) {
        this.events.fire('poi.setVisibility', showPOI);
    }

    // 获取当前场景ID
    getCurrentSceneId(): string {
        return this.currentSceneId;
    }

    // 获取当前场景配置
    getCurrentSceneConfig(): SceneConfig | undefined {
        return this.scenes.get(this.currentSceneId);
    }

    // 添加新场景配置（运行时动态添加）
    addScene(config: SceneConfig) {
        this.scenes.set(config.id, config);
        console.log(`添加场景配置: ${config.name}`);
    }

    // 清理资源
    destroy() {
        if (this.backButton) {
            document.body.removeChild(this.backButton);
        }
    }
}

export { SceneManager, SceneConfig };