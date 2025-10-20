// src/RevealEffect.ts
export class RevealEffect {
    private canvas: HTMLCanvasElement;
    private isAnimating: boolean = false;
    
    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
    }
    
    async start(): Promise<void> {
        if (this.isAnimating) return;
        this.isAnimating = true;
        
        // 点云效果
        this.canvas.style.filter = 'blur(3px)';
        this.canvas.style.opacity = '0.6';
        await this.wait(2000);
        
        // 扫描线
        this.canvas.style.filter = 'blur(1px)';
        const scanLine = this.createScanLine();
        document.body.appendChild(scanLine);
        await this.animateScanLine(scanLine);
        scanLine.remove();
        
        // 完整显示
        this.canvas.style.transition = 'filter 0.5s, opacity 0.5s';
        this.canvas.style.filter = 'none';
        this.canvas.style.opacity = '1.0';
        await this.wait(500);
        
        this.canvas.style.transition = '';
        this.isAnimating = false;
    }
    
    private createScanLine(): HTMLElement {
        const scanLine = document.createElement('div');
        const rect = this.canvas.getBoundingClientRect();
        
        scanLine.style.cssText = `
            position: fixed;
            top: ${rect.top}px;
            left: -50px;
            width: 30px;
            height: ${rect.height}px;
            background: linear-gradient(to right, transparent, rgba(0,255,255,0.9), transparent);
            box-shadow: 0 0 40px rgba(0,255,255,0.8);
            z-index: 9999;
            pointer-events: none;
        `;
        
        return scanLine;
    }
    
    private animateScanLine(scanLine: HTMLElement): Promise<void> {
        return new Promise((resolve) => {
            const rect = this.canvas.getBoundingClientRect();
            scanLine.style.transition = 'left 2.5s ease-in-out';
            scanLine.offsetHeight;
            scanLine.style.left = `${rect.right + 50}px`;
            setTimeout(resolve, 2500);
        });
    }
    
    private wait(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    skip(): void {
        this.canvas.style.transition = '';
        this.canvas.style.filter = 'none';
        this.canvas.style.opacity = '1.0';
        this.isAnimating = false;
    }
}