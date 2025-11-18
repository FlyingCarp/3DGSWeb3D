// src/swipe-up-menu.ts
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
    speaker: string;
}

class SwipeUpMenu {
    private container: HTMLElement;
    private menuContent: HTMLElement;
    private toggleButton: HTMLElement;
    private toggleHint: HTMLElement;
    private isExpanded: boolean = false;
    private isFullyExpanded: boolean = false;
    private events: Events;
    private scene: Scene;

    // 建筑信息配置
    private buildings: BuildingInfo[] = [
        {
            name: '酒店',
            icon: '🏨',
            position: new Vec3(1.0714532136917114, 0.17564377188682556, -1.8519530296325684),
            target: new Vec3(-0.782445021782728, -2.5086924706317775, -3.131205334997997)
        },
        {
            name: '食堂',
            icon: '🍽️',
            position: new Vec3(-1.8875062465667725, -0.14047487080097198, -1.690224289894104),
            target: new Vec3(0.6187147327250981, -3.2034843419990495, -3.7778125648765286)
        },
        {
            name: '会议中心',
            icon: '🏢',
            position: new Vec3(-3.280106544494629, 0.20584993064403534, 4.102974891662598),
            target: new Vec3(0.7615767462027138, -2.530067489944535, 2.913978157741491)
        },
        {
            name: '便利店',
            icon: '🏪',
            position: new Vec3(1.000038743019104, 0.4574660658836365, -0.8368762135505676),
            target: new Vec3(2.834293089475086, -0.8925182739336803, -0.19787027681636282)
        }
    ];

    // 会议日程数据
    private morningSchedule: ConferenceSchedule[] = [
        { time: '8:00-8:30', speaker: 'Sign in' },
        { time: '8:30-8:40', speaker: 'Yong-Ming Sheng' },
        { time: '8:40-9:30', speaker: 'Peter Harrowell' },
        { time: '9:30-10:20', speaker: 'Gang Sun' },
        { time: '10:20-10:35', speaker: 'Coffee Break' },
        { time: '10:35-11:25', speaker: 'Vladimir Novikov' },
        { time: '11:25-12:15', speaker: 'Yang Sun/Fujie Tang' },
        { time: '12:15-12:20', speaker: 'Yu Cui/Yi-Qi wang' },
        { time: 'Lunch time', speaker: 'SLAB Canteen' }
    ];

    private afternoonSchedule: ConferenceSchedule[] = [
        { time: '13:30-14:20', speaker: 'Bo Zhang' },
        { time: '14:20-15:10', speaker: 'Yun-Jiang Wang' },
        { time: '15:10-15:30', speaker: 'Yan-Wei Li' },
        { time: '15:30-16:20', speaker: 'Coffee Break' },
        { time: '16:20-17:10', speaker: 'Hai-Bin Yu' },
        { time: '17:10-18:00', speaker: 'Yuan-Chao Hu' },
        { time: '18:00-18:30', speaker: 'Free Discussion' },
        { time: '18:30-18:40', speaker: 'Closing Remark' },
        { time: 'Dinner time', speaker: 'SLAB Canteen' }
    ];

    constructor(scene: Scene, events: Events) {
        this.scene = scene;
        this.events = events;
        this.createMenu();
        this.attachEventListeners();
        this.handleViewportResize();
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
            max-height: 100dvh;
            overflow: hidden;
            z-index: 1000;
            display: flex;
            flex-direction: column;
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
        
        // 提示文字（只在收起时显示）
        this.toggleHint = document.createElement('div');
        this.toggleHint.className = 'toggle-hint';
        this.toggleHint.textContent = '上划展开';
        this.toggleHint.style.cssText = `
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
        this.toggleButton.appendChild(this.toggleHint);

        // 菜单内容
        this.menuContent = document.createElement('div');
        this.menuContent.className = 'menu-content';
        this.menuContent.style.cssText = `
            padding: 0 20px 100px;
            overflow-y: auto;
            overflow-x: hidden;
            flex: 1;
            background: rgba(255, 255, 255, 0.98);
            scrollbar-width: none;
            -ms-overflow-style: none;
            overscroll-behavior: contain;
            -webkit-overflow-scrolling: touch;
        `;

        // 隐藏滚动条样式
        const style = document.createElement('style');
        style.textContent = `
            .menu-content::-webkit-scrollbar {
                display: none;
            }
            
            /* 优化移动端滚动 */
            .menu-content {
                -webkit-overflow-scrolling: touch;
            }
        `;
        document.head.appendChild(style);

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
        title.textContent = 'One-day Seminar on Metallic Glass Science';
        title.style.cssText = `
            font-size: 18px;
            font-weight: 600;
            margin: 0 0 8px 0;
            color: #333;
            line-height: 1.4;
        `;

        const subtitle = document.createElement('div');
        subtitle.innerHTML = `
            <div style="margin-bottom: 4px; color: #666;">Data-driven Materials Science Research Group</div>
            <div style="margin-bottom: 4px; color: #666;">Meeting Time: Nov 21, 2025</div>
            <div style="margin-bottom: 4px; color: #666;">Time Schedule: 35 mins talk + 15 mins discussion</div>
            <div style="color: #666;">Meeting Place: Building C, Room 204</div>
        `;
        subtitle.style.cssText = `
            font-size: 13px;
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
        morningTitle.innerHTML = 'Morning Session<br><span style="font-size: 13px; font-weight: normal; color: #888;">Chair: Yuan-Chao Hu</span>';
        morningTitle.style.cssText = `
            font-size: 15px;
            font-weight: 600;
            margin: 15px 0 10px 0;
            color: #555;
            line-height: 1.6;
        `;

        const morningTable = this.createScheduleTable(this.morningSchedule);

        // 下午日程
        const afternoonTitle = document.createElement('h4');
        afternoonTitle.innerHTML = 'Afternoon Session<br><span style="font-size: 13px; font-weight: normal; color: #888;">Chair: Gang Sun</span>';
        afternoonTitle.style.cssText = `
            font-size: 15px;
            font-weight: 600;
            margin: 20px 0 10px 0;
            color: #555;
            line-height: 1.6;
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
            margin-bottom: 15px;
        `;

        schedule.forEach((item, index) => {
            const row = document.createElement('div');
            
            // 特殊处理午餐和晚餐时间
            const isSpecialRow = item.time.includes('time');
            
            row.style.cssText = `
                display: grid;
                grid-template-columns: ${isSpecialRow ? '110px 1fr' : '110px 1fr'};
                padding: 12px 15px;
                border-bottom: ${index < schedule.length - 1 ? '1px solid #f0f0f0' : 'none'};
                transition: background 0.2s;
                ${isSpecialRow ? 'background: #f8f8f8; font-weight: 500;' : ''}
                align-items: center;
            `;

            if (!isSpecialRow) {
                row.addEventListener('mouseenter', () => {
                    row.style.background = '#f5f5f5';
                });

                row.addEventListener('mouseleave', () => {
                    row.style.background = 'white';
                });
            }

            const time = document.createElement('span');
            time.textContent = item.time;
            time.style.cssText = `
                font-size: 13px;
                color: ${isSpecialRow ? '#333' : '#1890ff'};
                font-weight: ${isSpecialRow ? '600' : '500'};
                text-align: center;
                display: block;
            `;

            const speaker = document.createElement('span');
            speaker.textContent = item.speaker;
            speaker.style.cssText = `
                font-size: 14px;
                color: #333;
                text-align: center;
                display: block;
            `;

            row.appendChild(time);
            row.appendChild(speaker);

            table.appendChild(row);
        });

        return table;
    }

    // 处理视口变化
    private handleViewportResize() {
        // 监听窗口大小变化（包括地址栏隐藏/显示）
        let resizeTimer: number;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = window.setTimeout(() => {
                this.updateContainerHeight();
            }, 150);
        });

        // 初始化时也更新一次
        this.updateContainerHeight();

        // 监听 orientationchange（设备旋转）
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.updateContainerHeight();
            }, 200);
        });
    }

    // 动态更新容器高度
    private updateContainerHeight() {
        // 使用 window.innerHeight 获取实际可用高度
        const actualHeight = window.innerHeight;
        const visualViewportHeight = window.visualViewport?.height || actualHeight;
        
        // 使用较小的值确保内容不被遮挡
        const safeHeight = Math.min(actualHeight, visualViewportHeight);
        
        this.container.style.height = `${safeHeight}px`;
        this.menuContent.style.height = `${safeHeight - 45}px`;
        
        console.log(`📐 视口更新: 实际高度=${actualHeight}px, 视觉高度=${visualViewportHeight}px, 安全高度=${safeHeight}px`);
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

        // 监听 visualViewport 变化（地址栏隐藏/显示）
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', () => {
                this.updateContainerHeight();
            });

            window.visualViewport.addEventListener('scroll', () => {
                this.updateContainerHeight();
            });
        }
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
        
        // 使用实际高度计算
        const actualHeight = window.innerHeight;
        const targetHeight = actualHeight * 0.5;
        this.container.style.transform = `translateY(${actualHeight - targetHeight}px)`;
        
        const indicator = this.toggleButton.querySelector('.toggle-indicator') as HTMLElement;
        if (indicator) {
            indicator.style.transform = 'rotate(180deg)';
        }

        // 隐藏"上划展开"提示文字
        this.toggleHint.style.opacity = '0';

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
        
        // 使用实际高度计算，并留出安全边距
        const actualHeight = window.innerHeight;
        const safeTopMargin = 20; // 顶部留20px安全边距
        this.container.style.transform = `translateY(${safeTopMargin}px)`;

        // 隐藏"上划展开"提示文字
        this.toggleHint.style.opacity = '0';

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
        
        // 使用实际高度计算
        const actualHeight = window.innerHeight;
        this.container.style.transform = `translateY(${actualHeight - 45}px)`;
        
        const indicator = this.toggleButton.querySelector('.toggle-indicator') as HTMLElement;
        if (indicator) {
            indicator.style.transform = 'rotate(0deg)';
        }

        // 显示"上划展开"提示文字
        this.toggleHint.style.opacity = '1';

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

