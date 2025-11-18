// src/poi-system.ts - 配合场景管理器的POI系统（支持Sub-POI）
import { Vec3 } from 'playcanvas';
import { Events } from './events';
import { Scene } from './scene';

import { customDialog } from './custom-dialog';

interface POISubData {
    id: string;
    name: string;
    position: Vec3;
    description?: string;
    // 场景切换相关
    targetSceneId?: string;  // 目标场景ID
    cameraPos?: Vec3;        // 切换后的相机位置
    cameraTarget?: Vec3;     // 切换后的相机目标
}

interface POIData {
    id: string;
    name: string;
    position: Vec3;
    description?: string;
    // 场景切换相关
    targetSceneId?: string;  // 目标场景ID
    cameraPos?: Vec3;        // 切换后的相机位置
    cameraTarget?: Vec3;     // 切换后的相机目标
    // 子POI相关
    subPOIs?: POISubData[];  // 子POI数据
}

class POISystem {
    private scene: Scene;
    private events: Events;
    private pois: POIData[] = [];
    private poiElements: Map<string, HTMLElement> = new Map();
    private subPoiElements: Map<string, HTMLElement> = new Map();
    private container: HTMLElement;
    private subPoiContainer: HTMLElement;
    private tooltipElement: HTMLElement;
    private isVisible: boolean = true;
    
    // Sub-POI 相关状态
    private activeParentPOI: string | null = null;  // 当前激活的父POI ID
    private subPOIsVisible: boolean = false;
    private lastCameraDistance: number = 0;
    private lastCameraAzim: number = 0;
    private lastCameraElev: number = 0;

    constructor(scene: Scene, events: Events) {
        this.scene = scene;
        this.events = events;
        this.initializePOIs();
        this.createContainer();
        this.createSubPoiContainer();
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
                position: new Vec3(-1, -1.4, -1),
                description:  `
                    锂离子电池材料团队
                    Li-ion Battery Materials Group
                    半导体异质材料与器件中心
                    Semiconductor Heterogeneous Materials and Devices Center
                    大湾区显微科学与技术研究中心
                    Bay Area Center for Electron Microscopy
                    水系锌基电池团队
                    Agueous Zinc Battery Group
                    精密仪器研发团队
                    Precise Equipment Development Group
                    阿秒实验室I 
                    Attolab-I
                    非晶电机联合工程中心
                    Amorphous Motor Joint Lab
                    二维材料团队
                    2D Materials Group
                    强磁场团队
                    High Magnetic Field Group
                    阿秒实验室Ⅱ 
                    Attolab-II
                    锂离子电池材料团队
                    Li-ion Battery Materials Group
                `
                // cameraPos: new Vec3(-4.1816086769104, 0.9447703957557678, -1.489044189453125),
                // cameraTarget: new Vec3(2.882621562515408, -4.432813432221651, 0.4316858534445833)
            },  
            {
                id: 'poi_3',
                name: 'A3',
                position: new Vec3(-0.35, -1.2, 0.5),
                description: `
                光电子材料与器件团队
                Photoelectronic Materials and Devices Group
                非晶材料团队 
                Amorphous Material Group
                光电子材料与器件团队
                Photoelectronic Materials and Devices Group
                实用超导薄膜研究团队
                Practical Superconducting Films Center
                高熵合金材料及应用团队
                High Entropy Alloy Materials and Application Group
                非晶智芯团队
                Smart Materials and Sensor Devices
                空间材料团队
                space Materials Group
                绿色材料团队
                Green Amorphous Alloys Group
                非晶材料团队
                Amorphous Group
                阿秒科学中心
                Attosecond Science Center
                `
            },
            {
                id: 'poi_4',
                name: 'A4',
                position: new Vec3(1.2, -1.2, -0.9),
                description: `
                数据驱动材料科学研究团队
                Data-driven Materials Science Research Group
                大湾区显微科学与技术研究中心
                Bay Area Center for Electron Microscopy
                光子制造团队
                Photon Manufacturing Group
                高性能陶瓷与增材制造团队
                High Performance Ceramics and Additive Manufacturing Research Group
                新型高性能铝合金材料联合工程中心
                Joint engineering Center for High performance Aluminum Alloy Materials
                强磁场团队
                High Magnetic Field Group
                先进陶瓷材料团队
                Advanced Ceramics Materials Group
                新型纤维团队
                Advanced Fibers Group
                等离子体放电团队
                Plasma Group
                微加工与器件平台
                Micro-Nano Fabrication and Device Center
                材料制备与表征平台 
                Materials Growth and Characterization Center
                多孔介质燃烧技术及装备产业化团队
                Porous Media Combustion Technology and Equipment Group
                轻元素材料团队
                Light-Element Materials Group
                光子制造团队
                Photon Manufacturing Group
                气体净化材料团队 
                Gas Separation & Purification Materials Group
                新型纤维团队
                Advanced Fibers Group
                先进陶瓷材料团队
                Advanced Ceramics Materials Group
                材料计算与数据库平台
                Platform for Data-Driven Computationa Materials Discovery
                `,
                // A4 的子POI：科研团队和仪器
                // subPOIs: [
                //     {
                //         id: 'sub_a4_1',
                //         name: '数据驱动材料科研团队',
                //         position: new Vec3(1.1, -1.0, -0.8),
                //         targetSceneId: '319SOG',
                //         cameraPos: new Vec3(0.17799146473407745,  0.2273823767900467,  1.0555236339569092),
                //         cameraTarget: new Vec3(-2.1905466112370635,  -2.497009092983879,  -5.6743308952218685),
                //     }
                // ]
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
                position: new Vec3(1.2, -0.8, 5),//y,h,x
                description: '专家服务楼'
            },
            {
                id: 'poi_11',
                name: '数据驱动材料科研团队',
                position: new Vec3(1.9, -1.0, -0.8),
                targetSceneId: '319SOG',
                cameraPos: new Vec3(0.17799146473407745,  0.2273823767900467,  1.0555236339569092),
                cameraTarget: new Vec3(-2.1905466112370635,  -2.497009092983879,  -5.6743308952218685)
            },
             {
                id: 'poi_12',
                name: '二号门',
                position: new Vec3(-1.9, -1.4, 1.9),
            },
             {
                id: 'poi_13',
                name: '三号门',
                position: new Vec3(-1.8, -1.8, -3.25),
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

        // 监听相机移动事件（用于隐藏Sub-POI）
        this.events.on('camera.moved', () => {
            this.checkCameraMovement();
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

    // 创建Sub-POI容器（独立容器，便于统一控制）
    private createSubPoiContainer() {
        this.subPoiContainer = document.createElement('div');
        this.subPoiContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: 1001;
            display: none;
        `;
        document.body.appendChild(this.subPoiContainer);
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
        // const iconCell = document.createElement('div');
        // iconCell.style.cssText = `
        //     display: table-cell;
        //     vertical-align: middle;
        //     padding-right: 6px;
        // `;

        // // POI 图标
        // const icon = document.createElement('div');
        // icon.style.cssText = `
        //     width: 32px;
        //     height: 32px;
        //     background-image: url('/media/images/poi-icon.png');
        //     background-size: contain;
        //     background-repeat: no-repeat;
        //     background-position: center;
        // `;
        // iconCell.appendChild(icon);

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

        // container.appendChild(iconCell);
        container.appendChild(textCell);
        wrapper.appendChild(container);

        // 事件监听
        wrapper.addEventListener('mouseenter', (e) => {
            container.style.transform = 'scale(1.2)';
            // this.showTooltip(e.clientX, e.clientY, poi);
        });

        wrapper.addEventListener('mouseleave', () => {
            container.style.transform = 'scale(1)';
            // this.hideTooltip();
        });

        wrapper.addEventListener('mousemove', (e) => {
            // this.showTooltip(e.clientX, e.clientY, poi);
        });

        wrapper.addEventListener('click', (e) => {
            e.stopPropagation();
            this.onPoiClick(poi);
        });

        return wrapper;
    }

    // 创建Sub-POI元素
    private createSubPOIElement(subPoi: POISubData, parentPoi: POIData): HTMLElement {
        const wrapper = document.createElement('div');
        wrapper.style.cssText = `
            position: absolute;
            transform: translate(-50%, -50%);
            pointer-events: auto;
            animation: fadeInScale 0.3s ease-out;
        `;

        // 添加渐入动画
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInScale {
                from {
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(0.5);
                }
                to {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }
            }
        `;
        if (!document.querySelector('#subpoi-animation-style')) {
            style.id = 'subpoi-animation-style';
            document.head.appendChild(style);
        }

        const container = document.createElement('div');
        container.style.cssText = `
            display: flex;
            align-items: center;
            background: rgba(0, 0, 0, 0.8);
            padding: 6px 12px;
            border-radius: 20px;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        `;

        // 图标
        const icon = document.createElement('span');
        
        icon.style.cssText = `
            font-size: 16px;
            margin-right: 6px;
        `;

        // 名称
        const label = document.createElement('span');
        label.textContent = subPoi.name;
        label.style.fontFamily = `"Source Han Sans SC", "Noto Sans SC", "Microsoft YaHei", sans-serif`;
        label.style.cssText = `
            color: white;
            font-size: 13px;
            font-weight: 500;
            white-space: nowrap;
            user-select: none;
        `;

        container.appendChild(icon);
        container.appendChild(label);
        wrapper.appendChild(container);

        // 悬停效果
        wrapper.addEventListener('mouseenter', (e) => {
            container.style.transform = 'scale(1.1)';
            container.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
            // this.showSubPoiTooltip(e.clientX, e.clientY, subPoi);
        });

        wrapper.addEventListener('mouseleave', () => {
            container.style.transform = 'scale(1)';
            container.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
            // this.hideTooltip();
        });

        wrapper.addEventListener('mousemove', (e) => {
            // this.showSubPoiTooltip(e.clientX, e.clientY, subPoi);
        });

        wrapper.addEventListener('click', (e) => {
            e.stopPropagation();
            this.onSubPoiClick(subPoi, parentPoi);
        });

        return wrapper;
    }

    private showTooltip(x: number, y: number, poi: POIData) {
        let content = `<div style="font-weight: bold;">${poi.name}</div>`;
        content += `<div style="font-size: 12px; margin-top: 4px;">${poi.description}</div>`;
        
        // if (poi.subPOIs && poi.subPOIs.length > 0) {
        //     content += `<div style="font-size: 11px; margin-top: 6px; color: #4CAF50;">点击查看 ${poi.subPOIs.length} 个详细信息</div>`;
        // }
        
        this.tooltipElement.innerHTML = content;
        this.tooltipElement.style.display = 'block';
        this.tooltipElement.style.left = (x + 10) + 'px';
        this.tooltipElement.style.top = (y - 50) + 'px';
    }

    private showSubPoiTooltip(x: number, y: number, subPoi: POISubData) {
        
        this.tooltipElement.innerHTML = `
            <div style="font-weight: bold;">${subPoi.name}</div>
            <div style="font-size: 12px; margin-top: 4px;">${subPoi.description}</div>
        `;
        this.tooltipElement.style.display = 'block';
        this.tooltipElement.style.left = (x + 10) + 'px';
        this.tooltipElement.style.top = (y - 50) + 'px';
    }

    private hideTooltip() {
        this.tooltipElement.style.display = 'none';
    }

    private async onPoiClick(poi: POIData) {
        console.log(`点击POI: ${poi.name}`);
        this.events.fire('poi.clicked', poi);
        // ✅ 使用自定义对话框替代原生 confirm
        if(poi.description){
            const result = await customDialog.alert(poi.name, poi.description);
        }
        // 判断是否需要切换场景
        if (poi.targetSceneId) {
            // 需要切换场景
            const message = `${poi.name}在A4栋319\n\n将切换到新场景,大约10秒加载时间，是否继续?`;
            const result = confirm(message);
            
            if (result) {
                console.log(`请求切换到场景: ${poi.targetSceneId}`);
                this.hideSubPOIs();  // 切换场景前隐藏Sub-POI
                
                this.events.fire('scene.switchWithCamera', {
                    sceneId: poi.targetSceneId,
                    cameraPos: poi.cameraPos,
                    cameraTarget: poi.cameraTarget
                });
            }
        } else {
            // 检查是否有Sub-POI
            if (poi.subPOIs && poi.subPOIs.length > 0) {
                // 如果当前已经显示该POI的Sub-POI，则隐藏
                if (this.activeParentPOI === poi.id && this.subPOIsVisible) {
                    this.hideSubPOIs();
                } else {
                    // 显示该POI的Sub-POI
                    this.showSubPOIs(poi);
                }
            } else if (poi.cameraPos && poi.cameraTarget) {
                // 仅调整相机位置（不切换场景）
                console.log(`导航到: ${poi.name}`);
                const camera = this.scene.camera;
                camera.setPose(poi.cameraPos, poi.cameraTarget, 1);
                this.events.fire('poi.navigate', poi);
            }
        }
    }

    private onSubPoiClick(subPoi: POISubData, parentPoi: POIData) {
        console.log(`点击Sub-POI: ${subPoi.name} (属于 ${parentPoi.name})`);
        if (subPoi.targetSceneId) {
            // 需要切换场景
            const message = `${subPoi.name}\n\n将切换到新场景,是否继续?`;
            const result = confirm(message);
            
            if (result) {
                console.log(`请求切换到场景: ${subPoi.targetSceneId}`);
                this.hideSubPOIs();  // 切换场景前隐藏Sub-POI
                
                this.events.fire('scene.switchWithCamera', {
                    sceneId: subPoi.targetSceneId,
                    cameraPos: subPoi.cameraPos,
                    cameraTarget: subPoi.cameraTarget
                });
            }
        }
       
        
        this.events.fire('subpoi.clicked', {
            subPoi,
            parentPoi
        });
    }

    // 显示Sub-POI
    private showSubPOIs(parentPoi: POIData) {
        console.log(`显示 ${parentPoi.name} 的Sub-POI`);
        
        // 隐藏之前的Sub-POI
        this.hideSubPOIs();
        
        // 记录当前相机状态
        this.recordCameraState();
        
        // 创建并显示Sub-POI
        if (parentPoi.subPOIs) {
            parentPoi.subPOIs.forEach(subPoi => {
                const element = this.createSubPOIElement(subPoi, parentPoi);
                this.subPoiElements.set(subPoi.id, element);
                this.subPoiContainer.appendChild(element);
            });
        }
        
        this.activeParentPOI = parentPoi.id;
        this.subPOIsVisible = true;
        this.subPoiContainer.style.display = 'block';
        
        this.events.fire('subpoi.shown', parentPoi);
    }

    // 隐藏Sub-POI
    private hideSubPOIs() {
        if (!this.subPOIsVisible) return;
        
        console.log('隐藏Sub-POI');
        
        // 清空Sub-POI元素
        this.subPoiElements.forEach(element => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });
        this.subPoiElements.clear();
        
        this.subPoiContainer.style.display = 'none';
        this.subPOIsVisible = false;
        this.activeParentPOI = null;
        
        this.events.fire('subpoi.hidden');
    }

    // 记录相机状态
    private recordCameraState() {
        const camera = this.scene.camera;
        this.lastCameraDistance = camera.distance;
        this.lastCameraAzim = camera.azim;
        this.lastCameraElev = camera.elevation;
    }

    // 检查相机移动（缩放或大范围滑动）
    private checkCameraMovement() {
        if (!this.subPOIsVisible) return;
        
        const camera = this.scene.camera;
        const currentDistance = camera.distance;
        const currentAzim = camera.azim;
        const currentElev = camera.elevation;
        
        // 计算变化量
        const distanceChange = Math.abs(currentDistance - this.lastCameraDistance);
        const azimChange = Math.abs(currentAzim - this.lastCameraAzim);
        const elevChange = Math.abs(currentElev - this.lastCameraElev);
        
        // 阈值：缩放变化 > 0.1 或 旋转变化 > 5 度
        const DISTANCE_THRESHOLD = 0.1;
        const ROTATION_THRESHOLD = 5;
        
        if (distanceChange > DISTANCE_THRESHOLD || 
            azimChange > ROTATION_THRESHOLD || 
            elevChange > ROTATION_THRESHOLD) {
            console.log(`相机移动超过阈值，隐藏Sub-POI (距离:${distanceChange.toFixed(2)}, 方位:${azimChange.toFixed(2)}°, 仰角:${elevChange.toFixed(2)}°)`);
            this.hideSubPOIs();
        }
    }

    // 设置POI可见性
    setVisibility(visible: boolean) {
        this.isVisible = visible;
        this.container.style.display = visible ? 'block' : 'none';
        
        // 如果主POI隐藏，Sub-POI也隐藏
        if (!visible) {
            this.hideSubPOIs();
        }
        
        console.log(`POI可见性: ${visible}`);
    }

    update(deltaTime: number) {
        // 只在可见时更新
        if (!this.isVisible) return;

        const camera = this.scene.camera.entity.camera;
        const canvas = this.scene.canvas;
        
        // 更新主POI位置
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
        
        // 更新Sub-POI位置
        if (this.subPOIsVisible) {
            const parentPoi = this.pois.find(p => p.id === this.activeParentPOI);
            if (parentPoi && parentPoi.subPOIs) {
                this.subPoiElements.forEach((element, id) => {
                    const subPoi = parentPoi.subPOIs!.find(sp => sp.id === id);
                    if (subPoi) {
                        const screenPos = new Vec3();
                        camera.worldToScreen(subPoi.position, screenPos);
                        
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
        }
    }

    destroy() {
        if (this.container) {
            document.body.removeChild(this.container);
        }
        if (this.subPoiContainer) {
            document.body.removeChild(this.subPoiContainer);
        }
        if (this.tooltipElement) {
            document.body.removeChild(this.tooltipElement);
        }
        this.poiElements.clear();
        this.subPoiElements.clear();
    }
}

export { POISystem, POIData, POISubData };