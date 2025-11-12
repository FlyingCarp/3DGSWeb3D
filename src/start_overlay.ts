// start_overlay.ts
export class StartOverlay {
  private overlay: HTMLElement;
  private resolved = false;

  constructor() {
    this.createOverlay();
  }

  private createOverlay(): void {
    this.overlay = document.createElement('div');
    this.overlay.style.cssText = `
      position: fixed; inset: 0;
      background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
      display: flex; 
      flex-direction: column;
      align-items: center; 
      justify-content: center;
      z-index: 9999; 
      font-family: -apple-system, sans-serif;
    `;

    const box = document.createElement('div');
    box.style.textAlign = 'center';
    box.style.color = 'white';
    box.innerHTML = `
      <h1 style="font-size:48px;margin:0 0 20px;">数据驱动材料科研团队</h1>
      <p style="font-size:20px;margin:0 0 50px;">拼命加载中…</p>
    `;

    const btn = document.createElement('button');
    btn.textContent = '立即开始';
    btn.style.cssText = `
      padding: 18px 60px; 
      font-size: 20px; 
      color: #fff;
      background: rgba(255,255,255,.2); 
      border: 2px solid #fff;
      border-radius: 50px; 
      cursor: pointer;
      transition: transform .15s ease;
    `;
    btn.onmousedown = () => (btn.style.transform = 'scale(0.95)');
    btn.onmouseup = btn.onmouseleave = () => (btn.style.transform = 'scale(1)');
    btn.onclick = () => this.hide();

    box.appendChild(btn);
    this.overlay.appendChild(box);

    // 备案信息容器
    const footer = document.createElement('div');
    footer.style.cssText = `
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      color: rgba(255, 255, 255, 0.6);
      font-size: 14px;
      text-align: center;
      display: flex;
      flex-direction: column; /* 垂直排列 */
      gap: 8px; /* 行间距 */
    `;

    // ICP 备案信息
    const icp = document.createElement('div');
    icp.innerHTML = `
      <a href="https://beian.miit.gov.cn/" 
         target="_blank" 
         style="color: rgba(255, 255, 255, 0.6); text-decoration: none;">
        豫ICP备2025149739号
      </a>
    `;

   // 公安备案信息
    const police = document.createElement('div');
    police.style.whiteSpace = 'nowrap';          // 关键：不换行
    police.innerHTML = `
    <a href="http://www.beian.gov.cn/portal/registerSystemInfo" 
        target="_blank" 
        style="color: rgba(255,255,255,.6); text-decoration: none; display: inline-flex; align-items: center;">
        <img src="/media/images/police-icon.png" 
            style="width:16px; height:16px; margin-right:5px; flex-shrink:0;">
        粤公网安备44198202000136号
    </a>
    `;

    footer.appendChild(icp);
    footer.appendChild(police);
    this.overlay.appendChild(footer);

    document.body.appendChild(this.overlay);
  }

  public hide(): void {
    if (this.resolved) return;
    this.resolved = true;
    this.overlay.style.transition = 'opacity .3s';
    this.overlay.style.opacity = '0';
    this.overlay.addEventListener('transitionend', () => this.overlay.remove(), { once: true });
  }
}