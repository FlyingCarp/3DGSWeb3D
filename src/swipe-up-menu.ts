import { Vec3 } from 'playcanvas';
import { Events } from './events';
import { Scene } from './scene';

interface BuildingInfo {
    name: string;
    icon: string;
    position: Vec3;
    target: Vec3;
}

interface ConferenceSchedule {
    time: string;
    event: string;
    speaker?: string;
}

class SwipeUpMenu {
    private container: HTMLElement;
    private menuContent: HTMLElement;
    private toggleButton: HTMLElement;
    private isExpanded: boolean = false;
    private isFullyExpanded: boolean = false;
    private events: Events;
    private scene: Scene;

    // 建筑信息配置
    private buildings: BuildingInfo[] = [
        {
            name: '酒店',
            icon: '🏨',
            position: new Vec3(-5, 0, -5),
            target: new Vec3(-5, -2, -5)
        },
        {
            name: '食堂',
            icon: '🍽️',
            position: new Vec3(5, 0, -5),
            target: new Vec3(5, -2, -5)
        },
        {
            name: '会议中心',
            icon: '🏢',
            position: new Vec3(-5, 0, 5),
            target: new Vec3(-5, -2, 5)
        },
        {
            name: '便利店',
            icon: '🏪',
            position: new Vec3(5, 0, 5),
            target: new Vec3(5, -2, 5)
        }
    ];

    // 会议日程数据（从PDF提取）
    private morningSchedule: ConferenceSchedule[] = [
        { time: '8:00-8:30', event: 'Sign in' },
        { time: '8:30-8:40', event: 'Opening', speaker: 'Wei-Hua Wang' },
        { time: '8:40-9:40', event: 'Talk', speaker: 'Peter Harrowell' },
        { time: '9:40-9:55', event: 'Coffee Break' },
        { time: '9:55-10:55', event: 'Talk', speaker: 'Gang Sun' },
        { time: '10:55-11:55', event: 'Talk', speaker: 'Yang Sun' }
    ];

    private afternoonSchedule: ConferenceSchedule[] = [
        { time: '13:15-14:15', event: 'Talk', speaker: 'Yun-Jiang Wang' },
        { time: '14:15-15:15', event: 'Talk', speaker: 'Yan-Wei Li' },
        { time: '15:15-15:30', event: 'Coffee Break' },
        { time: '15:30-16:30', event: 'Talk', speaker: 'Hai-Bin Yu' },
        { time: '16:30-17:30', event: 'Talk', speaker: 'Yuan-Chao Hu' },
        { time: '17:30-18:00', event: 'Free Discussion & Closing Remarks' }
    ];

    constructor(scene: Scene, events: Events) {
        this.scene = scene;
        this.events = events;
        this.createMenu();
        this.attachEventListeners();
    }

    private createMenu() {
        // 主容器
        this.container = document.createElement('div');
        this.container.className = 'swipe-up-menu';
        this.container.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(255, 255, 255, 0.98);
            border-radius: 16px 16px 0 0;
            box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
            transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            transform: translateY(calc(100% - 45px));
            height: 100vh;
            overflow: hidden;
            z-index: 1000;
        `;

        // 展开/收起按钮
        this.toggleButton = document.createElement('div');
        this.toggleButton.className = 'menu-toggle';
        this.toggleButton.style.cssText = `
            height: 45px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            user-select: none;
            flex-shrink: 0;
            position: relative;
        `;
        
        // 指示器
        const indicator = document.createElement('div');
        indicator.className = 'toggle-indicator';
        indicator.style.cssText = `
            width: 36px;
            height: 4px;
            background: #999;
            border-radius: 2px;
            transition: all 0.3s;
        `;
        
        // 提示文字（收起时显示）
        const toggleHint = document.createElement('div');
        toggleHint.className = 'toggle-hint';
        toggleHint.textContent = '上划展开';
        toggleHint.style.cssText = `
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            top: 50%;
            margin-top: 2px;
            color: #1890ff;
            font-size: 13px;
            font-weight: 500;
            white-space: nowrap;
            pointer-events: none;
            opacity: 1;
            transition: opacity 0.3s;
        `;
        
        this.toggleButton.appendChild(indicator);
        this.toggleButton.appendChild(toggleHint);

        // 菜单内容
        this.menuContent = document.createElement('div');
        this.menuContent.className = 'menu-content';
        this.menuContent.style.cssText = `
            padding: 0 20px 20px;
            overflow-y: auto;
            height: calc(100vh - 45px);
            background: rgba(255, 255, 255, 0.98);
        `;

        // 建筑图标区域
        const buildingsSection = this.createBuildingsSection();
        
        // 会议信息区域
        const conferenceSection = this.createConferenceSection();

        this.menuContent.appendChild(buildingsSection);
        this.menuContent.appendChild(conferenceSection);

        this.container.appendChild(this.toggleButton);
        this.container.appendChild(this.menuContent);

        document.body.appendChild(this.container);
    }

    private createBuildingsSection(): HTMLElement {
        const section = document.createElement('div');
        section.className = 'buildings-section';
        section.style.cssText = `
            margin-bottom: 30px;
        `;

        const title = document.createElement('h3');
        title.textContent = '建筑导航';
        title.style.cssText = `
            font-size: 18px;
            font-weight: 600;
            margin: 0 0 15px 0;
            color: #333;
        `;

        const iconsContainer = document.createElement('div');
        iconsContainer.style.cssText = `
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
        `;

        this.buildings.forEach((building) => {
            const iconButton = document.createElement('button');
            iconButton.className = 'building-icon';
            iconButton.style.cssText = `
                background: white;
                border: 2px solid #e0e0e0;
                border-radius: 12px;
                padding: 12px 8px;
                cursor: pointer;
                transition: all 0.3s;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 6px;
                font-size: 13px;
                color: #555;
                aspect-ratio: 1;
                min-height: 0;
            `;

            iconButton.innerHTML = `
                <span style="font-size: 28px; line-height: 1;">${building.icon}</span>
                <span style="font-weight: 500; font-size: 12px; text-align: center;">${building.name}</span>
            `;

            iconButton.addEventListener('click', () => this.focusBuilding(building));
            
            iconButton.addEventListener('mouseenter', () => {
                iconButton.style.borderColor = '#1890ff';
                iconButton.style.transform = 'translateY(-2px)';
                iconButton.style.boxShadow = '0 4px 12px rgba(24, 144, 255, 0.2)';
            });

            iconButton.addEventListener('mouseleave', () => {
                iconButton.style.borderColor = '#e0e0e0';
                iconButton.style.transform = 'translateY(0)';
                iconButton.style.boxShadow = 'none';
            });

            iconsContainer.appendChild(iconButton);
        });

        section.appendChild(title);
        section.appendChild(iconsContainer);

        return section;
    }

    private createConferenceSection(): HTMLElement {
        const section = document.createElement('div');
        section.className = 'conference-section';
        section.style.cssText = `
            margin-top: 5px;
        `;

        const title = document.createElement('h3');
        title.textContent = '会议日程 - 金属玻璃科学研讨会';
        title.style.cssText = `
            font-size: 18px;
            font-weight: 600;
            margin: 0 0 10px 0;
            color: #333;
        `;

        const subtitle = document.createElement('div');
        subtitle.textContent = '松山湖材料实验室 | 2025年11月21日 | C栋204室';
        subtitle.style.cssText = `
            font-size: 13px;
            color: #666;
            margin-bottom: 15px;
        `;

        // 预览提示（第一阶段展开时显示）
        const previewHint = document.createElement('div');
        previewHint.className = 'preview-hint';
        previewHint.textContent = '👆 继续上划查看完整日程';
        previewHint.style.cssText = `
            text-align: center;
            padding: 15px;
            color: #1890ff;
            font-size: 14px;
            font-weight: 500;
            background: rgba(24, 144, 255, 0.05);
            border-radius: 8px;
            margin-bottom: 15px;
            display: none;
        `;

        // 完整日程内容（第二阶段展开时显示）
        const fullSchedule = document.createElement('div');
        fullSchedule.className = 'full-schedule';
        fullSchedule.style.cssText = `
            display: none;
        `;

        // 上午日程
        const morningTitle = document.createElement('h4');
        morningTitle.textContent = '上午场次（主持：Yuan-Chao Hu）';
        morningTitle.style.cssText = `
            font-size: 15px;
            font-weight: 600;
            margin: 15px 0 10px 0;
            color: #555;
        `;

        const morningTable = this.createScheduleTable(this.morningSchedule);

        // 下午日程
        const afternoonTitle = document.createElement('h4');
        afternoonTitle.textContent = '下午场次（主持：Gang Sun）';
        afternoonTitle.style.cssText = `
            font-size: 15px;
            font-weight: 600;
            margin: 20px 0 10px 0;
            color: #555;
        `;

        const afternoonTable = this.createScheduleTable(this.afternoonSchedule);

        fullSchedule.appendChild(morningTitle);
        fullSchedule.appendChild(morningTable);
        fullSchedule.appendChild(afternoonTitle);
        fullSchedule.appendChild(afternoonTable);

        section.appendChild(title);
        section.appendChild(subtitle);
        section.appendChild(previewHint);
        section.appendChild(fullSchedule);

        return section;
    }

    private createScheduleTable(schedule: ConferenceSchedule[]): HTMLElement {
        const table = document.createElement('div');
        table.style.cssText = `
            background: white;
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid #e0e0e0;
        `;

        schedule.forEach((item, index) => {
            const row = document.createElement('div');
            row.style.cssText = `
                display: grid;
                grid-template-columns: 100px 1fr auto;
                padding: 12px 15px;
                border-bottom: ${index < schedule.length - 1 ? '1px solid #f0f0f0' : 'none'};
                transition: background 0.2s;
            `;

            row.addEventListener('mouseenter', () => {
                row.style.background = '#f5f5f5';
            });

            row.addEventListener('mouseleave', () => {
                row.style.background = 'white';
            });

            const time = document.createElement('span');
            time.textContent = item.time;
            time.style.cssText = `
                font-size: 13px;
                color: #1890ff;
                font-weight: 500;
            `;

            const event = document.createElement('span');
            event.textContent = item.event;
            event.style.cssText = `
                font-size: 14px;
                color: #333;
            `;

            const speaker = document.createElement('span');
            speaker.textContent = item.speaker || '';
            speaker.style.cssText = `
                font-size: 13px;
                color: #888;
                font-style: italic;
            `;

            row.appendChild(time);
            row.appendChild(event);
            row.appendChild(speaker);

            table.appendChild(row);
        });

        return table;
    }

    private attachEventListeners() {
        // 点击切换按钮 - 循环切换三个状态
        this.toggleButton.addEventListener('click', () => {
            if (!this.isExpanded) {
                // 收起 → 半展开
                this.expand();
            } else if (this.isExpanded && !this.isFullyExpanded) {
                // 半展开 → 全展开
                this.fullyExpand();
            } else {
                // 全展开 → 收起
                this.collapse();
            }
        });

        // 菜单内容滚动监听（第二阶段展开检测）
        this.menuContent.addEventListener('scroll', () => {
            // 当在半展开状态且滚动接近顶部时，自动进入全展开
            if (this.isExpanded && !this.isFullyExpanded && this.menuContent.scrollTop > 30) {
                this.fullyExpand();
            }
        });

        // 触摸滑动支持
        let startY = 0;
        let currentY = 0;
        let startScrollTop = 0;
        let isDragging = false;

        const handleTouchStart = (e: TouchEvent) => {
            startY = e.touches[0].clientY;
            startScrollTop = this.menuContent.scrollTop;
            isDragging = true;
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (!isDragging) return;
            
            currentY = e.touches[0].clientY;
            const diff = startY - currentY; // 正值表示向上滑动
            
            // 防止在有滚动内容时误触发
            const isAtTop = this.menuContent.scrollTop <= 0;
            
            // 第一阶段：从收起到半展开
            if (!this.isExpanded && diff > 50) {
                this.expand();
                isDragging = false;
                e.preventDefault();
            } 
            // 第二阶段：从半展开到全展开（需要在顶部且继续上滑）
            else if (this.isExpanded && !this.isFullyExpanded && diff > 80 && isAtTop) {
                this.fullyExpand();
                isDragging = false;
                e.preventDefault();
            }
            // 下划收起
            else if (diff < -50 && isAtTop) {
                if (this.isFullyExpanded) {
                    this.expand(); // 从全展开回到半展开
                    isDragging = false;
                    e.preventDefault();
                } else if (this.isExpanded) {
                    this.collapse(); // 从半展开回到收起
                    isDragging = false;
                    e.preventDefault();
                }
            }
        };

        const handleTouchEnd = () => {
            isDragging = false;
        };

        // 为toggle按钮添加触摸支持
        this.toggleButton.addEventListener('touchstart', handleTouchStart);
        this.toggleButton.addEventListener('touchmove', handleTouchMove);
        this.toggleButton.addEventListener('touchend', handleTouchEnd);

        // 为菜单内容也添加触摸支持（仅当在顶部时触发状态切换）
        this.menuContent.addEventListener('touchstart', (e) => {
            handleTouchStart(e);
        });
        
        this.menuContent.addEventListener('touchmove', (e) => {
            handleTouchMove(e);
        });
        
        this.menuContent.addEventListener('touchend', handleTouchEnd);

        // 添加双击快速展开到全屏
        let lastTap = 0;
        this.toggleButton.addEventListener('touchend', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            if (tapLength < 300 && tapLength > 0) {
                // 双击快速全展开
                if (!this.isFullyExpanded) {
                    this.fullyExpand();
                } else {
                    this.collapse();
                }
                e.preventDefault();
            }
            lastTap = currentTime;
        });
    }

    private toggle() {
        // 此方法现在不再使用，保留以兼容性
        if (this.isFullyExpanded) {
            this.collapse();
        } else if (this.isExpanded) {
            this.fullyExpand();
        } else {
            this.expand();
        }
    }

    private expand() {
        // 第一阶段展开：50vh 高度，显示建筑导航和会议预览
        console.log('📱 展开到第一阶段 (50vh)');
        
        this.isExpanded = true;
        this.isFullyExpanded = false;
        
        this.container.style.transform = 'translateY(calc(100vh - 50vh))';
        
        const indicator = this.toggleButton.querySelector('div') as HTMLElement;
        if (indicator) {
            indicator.style.transform = 'rotate(180deg)';
        }

        // 显示预览提示
        const previewHint = this.container.querySelector('.preview-hint') as HTMLElement;
        if (previewHint) {
            previewHint.style.display = 'block';
        }

        // 隐藏完整日程
        const fullSchedule = this.container.querySelector('.full-schedule') as HTMLElement;
        if (fullSchedule) {
            fullSchedule.style.display = 'none';
        }

        // 触发事件
        this.events.fire('menu.expanded', { stage: 1 });
    }

    private fullyExpand() {
        // 第二阶段展开：90vh 高度，显示完整日程
        console.log('📱 展开到第二阶段 (90vh)');
        
        this.isExpanded = true;
        this.isFullyExpanded = true;
        
        this.container.style.transform = 'translateY(calc(100vh - 90vh))';

        // 隐藏预览提示
        const previewHint = this.container.querySelector('.preview-hint') as HTMLElement;
        if (previewHint) {
            previewHint.style.display = 'none';
        }

        // 显示完整日程
        const fullSchedule = this.container.querySelector('.full-schedule') as HTMLElement;
        if (fullSchedule) {
            fullSchedule.style.display = 'block';
        }

        // 触发事件
        this.events.fire('menu.fullyExpanded', { stage: 2 });
    }

    private collapse() {
        // 完全收起
        console.log('📱 收起菜单');
        
        this.isExpanded = false;
        this.isFullyExpanded = false;
        
        this.container.style.transform = 'translateY(calc(100% - 45px))';
        
        const indicator = this.toggleButton.querySelector('div') as HTMLElement;
        if (indicator) {
            indicator.style.transform = 'rotate(0deg)';
        }

        // 隐藏所有内容
        const previewHint = this.container.querySelector('.preview-hint') as HTMLElement;
        if (previewHint) {
            previewHint.style.display = 'none';
        }

        const fullSchedule = this.container.querySelector('.full-schedule') as HTMLElement;
        if (fullSchedule) {
            fullSchedule.style.display = 'none';
        }

        // 滚动回顶部
        this.menuContent.scrollTop = 0;

        // 触发事件
        this.events.fire('menu.collapsed', { stage: 0 });
    }

    private focusBuilding(building: BuildingInfo) {
        console.log(`聚焦建筑: ${building.name}`);
        
        // 使用相机的 setPose 方法聚焦建筑
        this.scene.camera.setPose(
            building.position,
            building.target,
            1  // 缓动因子
        );

        // 触发事件
        this.events.fire('building.focused', {
            name: building.name,
            position: building.position
        });

        // 可选：聚焦后自动收起菜单
        setTimeout(() => {
            this.collapse();
        }, 500);
    }

    // 更新建筑位置配置（供外部调用）
    public updateBuildingPosition(buildingName: string, position: Vec3, target: Vec3) {
        const building = this.buildings.find(b => b.name === buildingName);
        if (building) {
            building.position = position;
            building.target = target;
        }
    }

    // 销毁菜单
    public destroy() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}

export { SwipeUpMenu, BuildingInfo };