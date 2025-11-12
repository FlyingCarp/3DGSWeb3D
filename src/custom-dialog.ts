// src/custom-dialog.ts - 自定义对话框
class CustomDialog {
    private overlay: HTMLElement | null = null;
    private dialog: HTMLElement | null = null;

    /**
     * 显示自定义确认对话框
     * @param title 标题
     * @param message 消息内容
     * @returns Promise<boolean> - true表示确认，false表示取消
     */
    public async confirm(title: string, message: string): Promise<boolean> {
        return new Promise((resolve) => {
            this.createDialog(title, message, resolve);
        });
    }

    /**
     * 显示自定义提示对话框（仅确认按钮）
     * @param title 标题
     * @param message 消息内容
     */
    public async alert(title: string, message: string): Promise<void> {
        return new Promise((resolve) => {
            this.createAlertDialog(title, message, resolve);
        });
    }

    private createDialog(title: string, message: string, resolve: (value: boolean) => void) {
        // 创建遮罩层
        this.overlay = document.createElement('div');
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            backdrop-filter: blur(4px);
        `;

        // 创建对话框
        this.dialog = document.createElement('div');
        this.dialog.style.cssText = `
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            max-width: 400px;
            width: 90%;
            max-height: 80vh;
            overflow: hidden;
            animation: dialogFadeIn 0.2s ease-out;
        `;

        // 添加动画
        const style = document.createElement('style');
        style.textContent = `
            @keyframes dialogFadeIn {
                from {
                    opacity: 0;
                    transform: scale(0.9);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }
        `;
        if (!document.querySelector('#custom-dialog-style')) {
            style.id = 'custom-dialog-style';
            document.head.appendChild(style);
        }

        // 标题
        const titleElement = document.createElement('div');
        titleElement.style.cssText = `
            padding: 20px 20px 15px;
            font-size: 18px;
            font-weight: 600;
            color: #333;
            border-bottom: 1px solid #eee;
            font-family: "Source Han Sans SC", "Noto Sans SC", "Microsoft YaHei", sans-serif;
        `;
        titleElement.textContent = title;

        // 消息内容
        const messageElement = document.createElement('div');
        messageElement.style.cssText = `
            padding: 20px;
            font-size: 14px;
            color: #333;
            line-height: 1.6;
            text-align: left;
            width: 100%;              /* 新增：让它撑满对话框宽度 */
            box-sizing: border-box;   /* 新增：padding 不算在 width 外 */
            max-height: 60vh;
            overflow-y: auto;
            white-space: pre-wrap;
            word-wrap: break-word;
            font-family: "Source Han Sans SC", "Noto Sans SC", "Microsoft YaHei", sans-serif;
        `;
        const cleanMsg = message.split('\n').map(l => l.trimStart()).join('\n');
        messageElement.textContent = cleanMsg;

        // 按钮容器
        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.cssText = `
            padding: 15px 20px;
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            border-top: 1px solid #eee;
        `;

        // 取消按钮
        const cancelButton = document.createElement('button');
        cancelButton.textContent = '取消';
        cancelButton.style.cssText = `
            padding: 10px 24px;
            border: 1px solid #ddd;
            background: white;
            color: #333;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s;
            font-family: "Source Han Sans SC", "Noto Sans SC", "Microsoft YaHei", sans-serif;
        `;
        cancelButton.addEventListener('mouseenter', () => {
            cancelButton.style.background = '#f5f5f5';
        });
        cancelButton.addEventListener('mouseleave', () => {
            cancelButton.style.background = 'white';
        });
        cancelButton.addEventListener('click', () => {
            this.closeDialog();
            resolve(false);
        });

        // 确认按钮
        const confirmButton = document.createElement('button');
        confirmButton.textContent = '确认';
        confirmButton.style.cssText = `
            padding: 10px 24px;
            border: none;
            background: #1890ff;
            color: white;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s;
            font-family: "Source Han Sans SC", "Noto Sans SC", "Microsoft YaHei", sans-serif;
        `;
        confirmButton.addEventListener('mouseenter', () => {
            confirmButton.style.background = '#40a9ff';
        });
        confirmButton.addEventListener('mouseleave', () => {
            confirmButton.style.background = '#1890ff';
        });
        confirmButton.addEventListener('click', () => {
            this.closeDialog();
            resolve(true);
        });

        // 组装对话框
        buttonsContainer.appendChild(cancelButton);
        buttonsContainer.appendChild(confirmButton);

        this.dialog.appendChild(titleElement);
        this.dialog.appendChild(messageElement);
        this.dialog.appendChild(buttonsContainer);

        this.overlay.appendChild(this.dialog);
        document.body.appendChild(this.overlay);

        // 点击遮罩层关闭（可选）
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.closeDialog();
                resolve(false);
            }
        });

        // ESC键关闭
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                this.closeDialog();
                resolve(false);
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);
    }

    private createAlertDialog(title: string, message: string, resolve: () => void) {
        // 创建遮罩层
        this.overlay = document.createElement('div');
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            text-align: left;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            backdrop-filter: blur(4px);
        `;

        // 创建对话框
        this.dialog = document.createElement('div');
        this.dialog.style.cssText = `
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            max-width: 400px;
            width: 90%;
            max-height: 80vh;
            overflow: hidden;
            animation: dialogFadeIn 0.2s ease-out;
        `;

        // 标题
        const titleElement = document.createElement('div');
        titleElement.style.cssText = `
            padding: 20px 20px 15px;
            font-size: 18px;
            font-weight: 600;
            color: #333;
            border-bottom: 1px solid #eee;
            font-family: "Source Han Sans SC", "Noto Sans SC", "Microsoft YaHei", sans-serif;
        `;
        titleElement.textContent = title;

        // 消息内容
        const messageElement = document.createElement('div');
        messageElement.style.cssText = `
            padding: 20px;
            font-size: 16px;
            color: #333;
            text-align: left;
            width: 100%;              /* 新增：让它撑满对话框宽度 */
            box-sizing: border-box;   /* 新增：padding 不算在 width 外 */
            line-height: 1.6;
            max-height: 60vh;
            overflow-y: auto;
            white-space: pre-wrap;
            word-wrap: break-word;
            font-family: "Source Han Sans SC", "Noto Sans SC", "Microsoft YaHei", sans-serif;
        `;
        const cleanMsg = message.split('\n').map(l => l.trimStart()).join('\n');
        messageElement.textContent = cleanMsg;

        // 按钮容器
        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.cssText = `
            padding: 15px 20px;
            display: flex;
            justify-content: flex-end;
            border-top: 1px solid #eee;
        `;

        // 确认按钮
        const confirmButton = document.createElement('button');
        confirmButton.textContent = '确认';
        confirmButton.style.cssText = `
            padding: 10px 24px;
            border: none;
            background: #1890ff;
            color: white;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s;
            font-family: "Source Han Sans SC", "Noto Sans SC", "Microsoft YaHei", sans-serif;
        `;
        confirmButton.addEventListener('mouseenter', () => {
            confirmButton.style.background = '#40a9ff';
        });
        confirmButton.addEventListener('mouseleave', () => {
            confirmButton.style.background = '#1890ff';
        });
        confirmButton.addEventListener('click', () => {
            this.closeDialog();
            resolve();
        });

        // 组装对话框
        buttonsContainer.appendChild(confirmButton);

        this.dialog.appendChild(titleElement);
        this.dialog.appendChild(messageElement);
        this.dialog.appendChild(buttonsContainer);

        this.overlay.appendChild(this.dialog);
        document.body.appendChild(this.overlay);

        // 点击遮罩层关闭
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.closeDialog();
                resolve();
            }
        });

        // ESC键关闭
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                this.closeDialog();
                resolve();
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);
    }

    private closeDialog() {
        if (this.overlay && this.overlay.parentNode) {
            this.overlay.parentNode.removeChild(this.overlay);
        }
        this.overlay = null;
        this.dialog = null;
    }
}

// 导出单例
const customDialog = new CustomDialog();
export { customDialog, CustomDialog };