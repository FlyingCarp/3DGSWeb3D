// src/poi-system.ts - 配合场景管理器的POI系统
import { Vec3 } from 'playcanvas';
import { Events } from './events';
import { Scene } from './scene';

interface POIData {
    id: string;
    name: string;
    position: Vec3;
    description?: string;
    // 场景切换相关
    targetSceneId?: string;  // 目标场景ID
    cameraPos?: Vec3;        // 切换后的相机位置
    cameraTarget?: Vec3;     // 切换后的相机目标
}

class POISystem {
    private scene: Scene;
    private events: Events;
    private pois: POIData[] = [];
    private poiElements: Map<string, HTMLElement> = new Map();
    private container: HTMLElement;
    private tooltipElement: HTMLElement;
    private isVisible: boolean = true;

    constructor(scene: Scene, events: Events) {
        this.scene = scene;
        this.events = events;
        this.initializePOIs();
        this.createContainer();
        this.createTooltip();
        this.registerEvents();
    }

    // 初始化POI数据
    private initializePOIs() {
        this.pois = [
            {
                id: 'poi_1',
                name: 'A1',
                position: new Vec3(-0.9, -1.6, -2.9),
                description: '食堂、酒店所在位置'
            },
            {
                id: 'poi_2', 
                name: 'A2',
                position: new Vec3(-1, -1.4, -1),//(y,h,x)
                description: 'A2区域',
                cameraPos: new Vec3(-4.1816086769104, 0.9447703957557678, -1.489044189453125),
                cameraTarget: new Vec3(2.882621562515408, -4.432813432221651, 0.4316858534445833)
            },  
            {
                id: 'poi_3',
                name: 'A3',
                position: new Vec3(-0.35, -1.2, 0.5),
                description: 'A3区域'
            },
            {
                id: 'poi_4',
                name: 'A4',
                position: new Vec3(1.2, -1.2, -0.9),
                description: 'A4区域',

            },
            {
                id: 'poi_5',
                name: 'B1',
                position: new Vec3(1.8, -1, 1.5),
                description: '行政楼'
            },
            {
                id: 'poi_6',
                name: 'B2',
                position: new Vec3(2.8, -0.8, 2.15),
                description: 'B2宿舍楼'
            },
            {
                id: 'poi_7',
                name: 'B3',
                position: new Vec3(3, -1, -0.1),
                description: 'B3宿舍楼、商店、快递收发室'
            },
            {
                id: 'poi_8',
                name: 'B4',
                position: new Vec3(3.95, -0.8, 0.25),
                description: 'B4宿舍楼'
            },
            {
                id: 'poi_9',
                name: 'C1会议中心',
                position: new Vec3(-1, -1.1, 3.5),
                description: '会议中心C栋'
            },
            {
                id: 'poi_10',
                name: '专家楼',
                position: new Vec3(1.2, -0.8, 5),
                description: '专家服务楼'
            }
        ];

        console.log(`初始化了 ${this.pois.length} 个POI`);
    }

    // 注册事件
    private registerEvents() {
        // 监听POI显示/隐藏
        this.events.on('poi.setVisibility', (visible: boolean) => {
            this.setVisibility(visible);
        });
    }

    private createContainer() {
        this.container = document.createElement('div');
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: 1000;
        `;
        document.body.appendChild(this.container);
    }

    private createTooltip() {
        this.tooltipElement = document.createElement('div');
        this.tooltipElement.style.cssText = `
            position: absolute;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 14px;
            pointer-events: none;
            z-index: 10001;
            display: none;
            max-width: 200px;
        `;
        document.body.appendChild(this.tooltipElement);
    }

    createPOIMarkers() {
        this.pois.forEach(poi => {
            const element = this.createPOIElement(poi);
            this.poiElements.set(poi.id, element);
            this.container.appendChild(element);
            console.log(`创建POI: ${poi.name}`);
        });
    }

private createPOIElement(poi: POIData): HTMLElement {
    const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
    
    // 使用 wrapper 强制横向布局
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
        position: absolute;
        transform: translate(-50%, -50%);
        pointer-events: auto;
    `;

    // 内部容器
    const container = document.createElement('div');
    container.style.cssText = `
        display: table;
        cursor: pointer;
        transition: transform 0.2s ease;
    `;

    // 图标单元格
    const iconCell = document.createElement('div');
    iconCell.style.cssText = `
        display: table-cell;
        vertical-align: middle;
        padding-right: 6px;
    `;

    // POI 图标
    const icon = document.createElement('div');
    icon.style.cssText = `
        width: 32px;
        height: 32px;
        background-image: url('/media/images/poi-icon.png');
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
    `;
    iconCell.appendChild(icon);

    // 文字单元格
    const textCell = document.createElement('div');
    textCell.style.cssText = `
        display: table-cell;
        vertical-align: middle;
    `;

    // POI 名称标签
    const label = document.createElement('span');
    label.textContent = poi.name;
    label.style.fontFamily = `"Source Han Sans SC", "Noto Sans SC", "Microsoft YaHei", sans-serif`;
    label.style.cssText = `
        color: white;
        font-size: 17px;
        text-shadow: 
            -1px -1px 2px rgba(0,0,0,0.8),
            1px -1px 2px rgba(0,0,0,0.8),
            -1px 1px 2px rgba(0,0,0,0.8),
            1px 1px 2px rgba(0,0,0,0.8);
        white-space: nowrap;
        user-select: none;
    `;
    textCell.appendChild(label);

    container.appendChild(iconCell);
    container.appendChild(textCell);
    wrapper.appendChild(container);

    // 事件监听
    wrapper.addEventListener('mouseenter', (e) => {
        container.style.transform = 'scale(1.2)';
        this.showTooltip(e.clientX, e.clientY, poi);
    });

    wrapper.addEventListener('mouseleave', () => {
        container.style.transform = 'scale(1)';
        this.hideTooltip();
    });

    wrapper.addEventListener('mousemove', (e) => {
        this.showTooltip(e.clientX, e.clientY, poi);
    });

    wrapper.addEventListener('click', (e) => {
        e.stopPropagation();
        this.onPoiClick(poi);
    });

    return wrapper;
}

    private showTooltip(x: number, y: number, poi: POIData) {
        this.tooltipElement.innerHTML = `
            <div style="font-weight: bold;">${poi.name}</div>
            <div style="font-size: 12px; margin-top: 4px;">${poi.description}</div>
        `;
        this.tooltipElement.style.display = 'block';
        this.tooltipElement.style.left = (x + 10) + 'px';
        this.tooltipElement.style.top = (y - 50) + 'px';
    }

    private hideTooltip() {
        this.tooltipElement.style.display = 'none';
    }

    private onPoiClick(poi: POIData) {
        console.log(`点击POI: ${poi.name}`);
        this.events.fire('poi.clicked', poi);
        
        // 判断是否需要切换场景
        if (poi.targetSceneId) {
            // 需要切换场景
            const message = `${poi.name}\n${poi.description}\n\n将切换到新场景，是否继续？`;
            const result = confirm(message);
            
            if (result) {
                console.log(`请求切换到场景: ${poi.targetSceneId}`);
                
                // ✅ 不要在这里手动设置可见性，让场景管理器根据场景配置自动处理
                // 触发场景切换事件，场景管理器会根据目标场景的hasPOI配置自动控制POI显示
                this.events.fire('scene.switchWithCamera', {
                    sceneId: poi.targetSceneId,
                    cameraPos: poi.cameraPos,
                    cameraTarget: poi.cameraTarget
                });
            }
        } else {
            // 仅调整相机位置（不切换场景）

                    console.log(`导航到: ${poi.name}`);
                    const camera = this.scene.camera;
                    camera.setPose(poi.cameraPos, poi.cameraTarget, 1);
                    this.events.fire('poi.navigate', poi);
                            
            
            
        }
    }

    // 设置POI可见性
    setVisibility(visible: boolean) {
        this.isVisible = visible;
        this.container.style.display = visible ? 'block' : 'none';
        console.log(`POI可见性: ${visible}`);
    }

    update(deltaTime: number) {
        // 只在可见时更新
        if (!this.isVisible) return;

        const camera = this.scene.camera.entity.camera;
        const canvas = this.scene.canvas;
        
        this.poiElements.forEach((element, id) => {
            const poi = this.pois.find(p => p.id === id);
            if (poi) {
                const screenPos = new Vec3();
                camera.worldToScreen(poi.position, screenPos);
                
                const rect = canvas.getBoundingClientRect();
                const isVisible = screenPos.z > 0 && 
                                screenPos.x >= 0 && screenPos.x <= rect.width &&
                                screenPos.y >= 0 && screenPos.y <= rect.height;
                
                if (isVisible) {
                    const pageX = rect.left + screenPos.x;
                    const pageY = rect.top + screenPos.y;
                    
                    element.style.left = pageX + 'px';
                    element.style.top = pageY + 'px';
                    element.style.display = 'block';
                } else {
                    element.style.display = 'none';
                }
            }
        });
    }

    destroy() {
        if (this.container) {
            document.body.removeChild(this.container);
        }
        if (this.tooltipElement) {
            document.body.removeChild(this.tooltipElement);
        }
        this.poiElements.clear();
    }
}

export { POISystem, POIData };