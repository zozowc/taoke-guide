(function () {
  'use strict';

  const $ = (sel) => document.querySelector(sel);
  const app = $('#app');

  let config = null;

  function render(config) {
    app.innerHTML = `
      <div class="container">
        <span class="header-icon">🔒</span>
        <h1>${escapeHtml(config.title)}</h1>
        <p class="subtitle">${escapeHtml(config.subtitle)}</p>

        <div class="qr-wrapper">
          <img src="${escapeHtml(config.qr_image)}" alt=""
            onerror="this.closest('.qr-wrapper').innerHTML='<span style=color:#94A3B8;font-size:13px>加载失败，请刷新</span>'"
          />
        </div>

        <hr class="divider" />

        <p class="service-label">服 务 号</p>
        <p class="service-id" id="serviceId">${escapeHtml(config.service_id)}</p>

        <button class="btn-copy" id="copyBtn">
          <span class="icon">📋</span>
          <span class="btn-text">复制服务号</span>
        </button>

        <div class="guide">
          <div class="step">
            <span class="step-num">1</span>
            <span>长按保存上方二维码</span>
          </div>
          <div class="step">
            <span class="step-num">2</span>
            <span>打开你的 App 扫一扫</span>
          </div>
        </div>

        <div class="footer">${escapeHtml(config.footer_text)}</div>
      </div>
    `;

    const copyBtn = $('#copyBtn');
    const serviceId = $('#serviceId');

    copyBtn.addEventListener('click', function () {
      const text = serviceId.textContent.trim();
      if (!text || text === 'your_wechat_id') {
        showToast('请先配置微信号');
        return;
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          onCopied(copyBtn);
        }).catch(() => {
          fallbackCopy(text, copyBtn);
        });
      } else {
        fallbackCopy(text, copyBtn);
      }
    });
  }

  function onCopied(btn) {
    btn.classList.add('copied');
    const textEl = btn.querySelector('.btn-text');
    textEl.textContent = '已复制';
    const icon = btn.querySelector('.icon');
    icon.textContent = '✓';
    setTimeout(() => {
      btn.classList.remove('copied');
      textEl.textContent = '复制服务号';
      icon.textContent = '📋';
    }, 2000);
    showToast('已复制到剪贴板');
  }

  function fallbackCopy(text, btn) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      onCopied(btn);
    } catch (e) {
      showToast('复制失败，请手动复制');
    }
    document.body.removeChild(ta);
  }

  function showToast(msg) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove('show');
    }, 1800);
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function showLoading() {
    app.innerHTML = `
      <div class="container">
        <div class="loading">
          <div class="spinner"></div>
          <p>加载中...</p>
        </div>
      </div>`;
  }

  function showError(msg) {
    app.innerHTML = `
      <div class="container">
        <div class="error-state"><p>${escapeHtml(msg)}</p></div>
      </div>`;
  }

  function init() {
    showLoading();
    fetch('config.json', { cache: 'no-cache' })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        if (!data || !data.service_id) throw new Error('配置文件格式错误');
        config = data;
        render(config);
      })
      .catch(function (err) {
        showError('页面配置加载失败，请检查 config.json');
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
