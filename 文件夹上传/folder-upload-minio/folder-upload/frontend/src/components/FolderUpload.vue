<template>
  <div class="app">
    <!-- 顶部 Header -->
    <header>
      <div class="hlogo"></div>
      <h1>FOLDER_UPLOAD</h1>
      <span class="hbadge">MinIO</span>
      <span class="htag">SpringBoot 2.4 · 断点续传 · 秒传</span>
    </header>

    <div class="layout">
      <!-- 左面板 -->
      <div class="lp">
        <!-- 拖拽区 -->
        <div class="lp-sec">
          <div class="sec-lbl">选择文件夹</div>
          <div class="dz" :class="{ over: isDragOver }" @dragover="onDragOver" @dragleave="onDragLeave" @drop="onDrop">
            <input type="file" ref="fileInput" webkitdirectory multiple @change="onFileSelect">
            <div class="dz-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
                <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/>
                <path d="M12 12v5M9.5 14.5 12 12l2.5 2.5"/>
              </svg>
            </div>
            <div class="dz-t">拖拽文件夹 / 点击选择</div>
            <div class="dz-s">保留目录结构 · MD5秒传 · 黑名单校验<br>并发上传 · 取消可清理 OSS</div>
          </div>
        </div>

        <!-- 文件夹信息 -->
        <div class="lp-sec" v-if="showMeta">
          <div class="sec-lbl">文件夹信息</div>
          <div class="meta-grid">
            <div class="mi">
              <div class="mi-k">NAME</div>
              <div class="mi-v">{{ folderInfo.name }}</div>
            </div>
            <div class="mi">
              <div class="mi-k">FILES</div>
              <div class="mi-v">{{ folderInfo.count }}</div>
            </div>
            <div class="mi">
              <div class="mi-k">SIZE</div>
              <div class="mi-v">{{ folderInfo.size }}</div>
            </div>
          </div>
        </div>

        <!-- 文件URL列表 -->
        <div class="lp-sec" v-if="showUrls">
          <div class="sec-lbl">
            文件URL列表
            <button class="btn btn-g" style="margin-left:8px;padding:2px 8px;font-size:10px" @click="copyAllUrls">复制全部</button>
          </div>
          <div class="url-list">
            <div class="url-item" v-for="(f, i) in fileUrls" :key="i">
              <input type="text" :value="f.url" readonly>
              <button class="copy-btn" @click="copyUrl(f.url)">复制</button>
            </div>
          </div>
        </div>

        <!-- 校验日志 -->
        <div class="lp-sec" v-if="showVlog">
          <div class="sec-lbl">校验日志</div>
          <div class="vlog">
            <div class="vlog-item" v-for="(log, i) in vlog" :key="i">{{ log }}</div>
          </div>
        </div>

        <!-- 按钮 -->
        <div class="btns">
          <button class="btn btn-p" @click="startUpload" :disabled="!canUpload">
            开始上传 ({{ validFiles.length }})
          </button>
          <button class="btn btn-g" @click="reset" :disabled="!canReset">重置</button>
          <button class="btn btn-d" @click="cancel" :disabled="!canCancel">取消</button>
        </div>

        <!-- 整体进度 -->
        <div class="lp-sec" v-if="showProg">
          <div class="sec-lbl">整体进度</div>
          <div class="prog-card">
            <div class="prog-top">
              <span class="prog-lbl">{{ progressLabel }}</span>
              <span class="prog-num">{{ progressPct }}%</span>
            </div>
            <div class="bar"><div class="bar-f" :class="{ ok: isUploadComplete }" :style="{ width: progressPct + '%' }"></div></div>
            <div class="prog-stats">
              <span>{{ doneCount }}</span>/<span>{{ totalCount }}</span>
              <span>·</span>
              <span>{{ instantCount }} 秒传</span>
              <span>·</span>
              <span>{{ uploadSpeed }}</span>
              <span>·</span>
              <span>{{ eta }}</span>
            </div>
          </div>
        </div>

        <!-- 文件列表 -->
        <div class="lp-sec" v-if="showFileList">
          <div class="sec-lbl">文件列表</div>
          <div class="fl-wrap">
            <div class="fi" v-for="(f, i) in validFiles" :key="i" :id="'fi-' + i">
              <div class="fi-dot" :class="getFileStatus(i)"></div>
              <div class="fi-name" :title="f.relativePath">{{ f.displayName }}</div>
              <div class="fi-size">{{ f.sizeFormatted }}</div>
              <div class="fi-bar">
                <div class="fi-bar-f" :class="getFileBarClass(i)" :style="{ width: getFileProgress(i) + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 图例 -->
        <div class="legend">
          <span class="leg"><span class="leg-dot" style="background:#4a5370"></span>等待</span>
          <span class="leg"><span class="leg-dot" style="background:#3b82f6"></span>上传中</span>
          <span class="leg"><span class="leg-dot" style="background:#10b981"></span>完成</span>
          <span class="leg"><span class="leg-dot" style="background:#a855f7"></span>秒传</span>
          <span class="leg"><span class="leg-dot" style="background:#f59e0b"></span>已跳过</span>
          <span class="leg"><span class="leg-dot" style="background:#ef4444"></span>失败</span>
        </div>
      </div>

      <!-- 右面板 -->
      <div class="rp">
        <div class="sec-lbl">OSS 目录树</div>
        <div class="tree-empty" v-if="!showTree">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/>
          </svg>
          <p>上传完成后显示 OSS 目录结构</p>
        </div>
        <div class="tree" v-else v-html="treeHtml"></div>
      </div>
    </div>

    <!-- 状态栏 -->
    <div class="sb">
      <div class="sb-dot"></div>
      <span>{{ apiHost }}</span>
      <span>SESSION: {{ sessionId || '—' }}</span>
      <span style="margin-left:auto">{{ currentTime }}</span>
    </div>

    <!-- Toast 提示 -->
    <div class="toasts">
      <div class="toast" v-for="(t, i) in toasts" :key="i" :class="t.type">{{ t.message }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FolderUpload',
  data() {
    return {
      // 配置
      API: 'http://localhost:8080/api/upload',
      CONC: 4,
      FORBIDDEN_EXT: new Set(['exe', 'bat', 'cmd', 'sh', 'ps1', 'jar', 'war', 'php', 'jsp']),
      MAX_FILE_SIZE: 100 * 1024 * 1024,

      // 状态
      allFiles: [],
      validFiles: [],
      sessionId: null,
      uploading: false,
      cancelled: false,
      doneCount: 0,
      instantCount: 0,
      qIdx: 0,
      startTime: 0,
      bytesDone: 0,
      totalBytes: 0,

      // UI 状态
      isDragOver: false,
      showMeta: false,
      showUrls: false,
      showVlog: false,
      showProg: false,
      showFileList: false,
      showTree: false,
      vlog: [],
      fileUrls: [],
      treeData: [],
      treeHtml: '',
      toasts: [],

      // 文件状态映射
      fileStatus: {},  // { index: 'waiting' | 'up' | 'ok' | 'instant' | 'err' | 'skip' }
      fileProgress: {},

      // 计时器
      timeInterval: null,
      currentTime: '',

      // SparkMD5
      SparkMD5: window.SparkMD5
    };
  },
  computed: {
    folderInfo() {
      if (!this.validFiles.length) return { name: '—', count: '—', size: '—' };
      return {
        name: this.folderName,
        count: this.validFiles.length + (this.vlog.length ? ` (+${this.vlog.length} 跳过)` : ''),
        size: this.formatSize(this.totalBytes)
      };
    },
    folderName() {
      if (!this.validFiles.length) return '—';
      const firstRel = this.validFiles[0].relativePath;
      return firstRel.split('/')[0];
    },
    canUpload() {
      return this.validFiles.length > 0 && !this.uploading;
    },
    canReset() {
      return this.validFiles.length > 0 && !this.uploading;
    },
    canCancel() {
      return this.uploading;
    },
    progressPct() {
      return this.validFiles.length ? Math.round(this.doneCount / this.validFiles.length * 100) : 0;
    },
    progressLabel() {
      return this.isUploadComplete ? '上传完成' : '上传中';
    },
    isUploadComplete() {
      return this.doneCount > 0 && this.doneCount === this.totalCount;
    },
    totalCount() {
      return this.validFiles.length;
    },
    uploadSpeed() {
      const elapsed = (Date.now() - this.startTime) / 1000 || 0.001;
      const speed = this.bytesDone / elapsed;
      return this.formatSize(speed) + '/s';
    },
    eta() {
      const elapsed = (Date.now() - this.startTime) / 1000 || 0.001;
      const speed = this.bytesDone / elapsed;
      const remain = this.totalBytes - this.bytesDone;
      const s = speed > 0 ? remain / speed : 0;
      return this.formatTime(s);
    },
    apiHost() {
      return 'http://localhost:8080';
    }
  },
  mounted() {
    // 加载 SparkMD5
    if (!window.SparkMD5) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/spark-md5@3.0.2/spark-md5.min.js';
      script.onload = () => { this.SparkMD5 = window.SparkMD5; };
      document.head.appendChild(script);
    }

    // 更新时间
    this.timeInterval = setInterval(() => {
      this.currentTime = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    }, 1000);
  },
  beforeDestroy() {
    if (this.timeInterval) clearInterval(this.timeInterval);
  },
  methods: {
    // 拖拽处理
    onDragOver(e) {
      e.preventDefault();
      e.stopPropagation();
      this.isDragOver = true;
    },
    onDragLeave(e) {
      e.preventDefault();
      e.stopPropagation();
      this.isDragOver = false;
    },
    async onDrop(e) {
      e.preventDefault();
      e.stopPropagation();
      this.isDragOver = false;

      // 优先尝试使用 webkitGetAsEntry 读取目录
      const items = [...e.dataTransfer.items];
      let files = [];

      try {
        for (const item of items) {
          const entry = item.webkitGetAsEntry && item.webkitGetAsEntry();
          if (entry) {
            await this.readEntry(entry, '', files);
          }
        }
      } catch (err) {
        console.warn('webkitGetAsEntry failed, using fallback:', err);
      }

      // 如果没有读取到文件，尝试使用 dataTransfer.files
      if (!files.length && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        files = [...e.dataTransfer.files];
        // 为每个文件设置相对路径
        for (let i = 0; i < files.length; i++) {
          const f = files[i];
          if (!f.webkitRelativePath) {
            f._rel = f.name;
          }
        }
      }

      if (files.length) {
        this.allFiles = files;
        this.onReady();
      } else {
        this.showToast('无法读取文件夹，请使用点击选择', 'err');
      }
    },
    readEntry(entry, path, files) {
      return new Promise(resolve => {
        if (entry.isFile) {
          entry.file(f => {
            f._rel = (path ? path + '/' : '') + f.name;
            files.push(f);
            resolve();
          });
        } else {
          const reader = entry.createReader();
          const readAll = cb => reader.readEntries(async entries => {
            if (!entries.length) return cb();
            for (const e of entries) {
              await this.readEntry(e, (path ? path + '/' : '') + entry.name, files);
            }
            readAll(cb);
          });
          readAll(resolve);
        }
      });
    },

    // 文件选择
    onFileSelect(e) {
      console.log('File selected, files count:', e.target.files.length);
      this.allFiles = [...e.target.files];
      console.log('allFiles set, count:', this.allFiles.length);
      this.onReady();
    },

    // 文件预处理
    onReady() {
      console.log('onReady called, allFiles count:', this.allFiles.length);
      if (!this.allFiles.length) {
        console.warn('No files selected');
        return;
      }

      this.vlog = [];
      this.validFiles = [];
      const skipped = [];

      for (const f of this.allFiles) {
        const rel = f.webkitRelativePath || f._rel || f.name;
        const ext = rel.split('.').pop().toLowerCase();

        if (this.FORBIDDEN_EXT.has(ext)) {
          skipped.push({ rel, reason: '禁止类型 .' + ext });
          continue;
        }
        if (f.size > this.MAX_FILE_SIZE) {
          skipped.push({ rel, reason: '超出 100MB' });
          continue;
        }

        f.relativePath = rel;
        f.displayName = rel.split('/').pop(); // 显示用的文件名
        f.sizeFormatted = this.formatSize(f.size);
        this.validFiles.push(f);
      }

      if (skipped.length) {
        this.showVlog = true;
        this.vlog = skipped.map(s => `✕ ${s.rel}  (${s.reason})`);
      }

      if (!this.validFiles.length) {
        this.showToast('没有可上传的文件', 'err');
        console.warn('No valid files after filtering, skipped:', skipped);
        return;
      }

      console.log('Valid files count:', this.validFiles.length);

      // 元信息
      this.totalBytes = this.validFiles.reduce((s, f) => s + f.size, 0);

      // 初始化文件状态
      this.fileStatus = {};
      this.fileProgress = {};
      this.validFiles.forEach((_, i) => {
        this.fileStatus[i] = 'waiting';
        this.fileProgress[i] = 0;
      });

      this.showMeta = true;
      this.showFileList = true;
      this.showProg = true;
    },

    // 开始上传
    async startUpload() {
      if (this.uploading || !this.validFiles.length) return;
      this.uploading = true;
      this.cancelled = false;
      this.doneCount = 0;
      this.instantCount = 0;
      this.qIdx = 0;
      this.bytesDone = 0;
      this.startTime = Date.now();

      // 1. 初始化会话
      const folderName = this.folderName;
      try {
        const r = await this.api('/init', 'POST', { folderName });
        this.sessionId = r.data.sessionId;
        this.showToast('会话已创建', 'info');
      } catch (e) {
        this.showToast('初始化失败: ' + e.message, 'err');
        this.resetState();
        return;
      }

      // 2. 并发上传
      const workers = [];
      for (let i = 0; i < Math.min(this.CONC, this.validFiles.length); i++) {
        workers.push(this.worker());
      }
      await Promise.all(workers);

      if (!this.cancelled) {
        this.showToast('全部完成！秒传 ' + this.instantCount + ' 个', 'ok');
        await this.loadTree();
        await this.loadFileUrls();
      }
      this.uploading = false;
    },

    async worker() {
      while (true) {
        const idx = this.qIdx++;
        if (idx >= this.validFiles.length || this.cancelled) break;
        await this.uploadOne(this.validFiles[idx], idx);
      }
    },

    async uploadOne(file, idx) {
      this.$set(this.fileStatus, idx, 'up');
      const rel = file.relativePath;

      // 计算 MD5
      let md5 = '';
      try {
        md5 = await this.calcMd5(file);
      } catch (e) { /* 跳过 MD5 */ }

      // 秒传检查
      if (md5) {
        try {
          const ck = await this.api('/check', 'POST', { md5, sessionId: this.sessionId, relativePath: rel });
          if (ck.data && ck.data.instant) {
            this.$set(this.fileStatus, idx, 'instant');
            this.$set(this.fileProgress, idx, 100);
            this.doneCount++;
            this.instantCount++;
            this.bytesDone += file.size;
            return;
          }
        } catch (e) { /* 秒传失败则继续上传 */ }
      }

      // 正常上传
      const formData = new FormData();
      formData.append('sessionId', this.sessionId);
      formData.append('relativePath', rel);
      formData.append('file', file);

      try {
        await this.uploadFile(formData, (pct) => {
          this.$set(this.fileProgress, idx, pct);
        });
        this.$set(this.fileStatus, idx, 'ok');
        this.$set(this.fileProgress, idx, 100);
        this.bytesDone += file.size;
      } catch (e) {
        this.$set(this.fileStatus, idx, 'err');
        this.$set(this.fileProgress, idx, 100);
        console.error('upload fail:', rel, e);
      }

      this.doneCount++;
    },

    uploadFile(formData, onProgress) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', this.API + '/file');
        xhr.upload.onprogress = e => {
          if (e.lengthComputable) {
            onProgress(Math.round(e.loaded / e.total * 100));
          }
        };
        xhr.onload = () => {
          try {
            const r = JSON.parse(xhr.responseText);
            r.success ? resolve() : reject(new Error(r.message));
          } catch (e) { reject(e); }
        };
        xhr.onerror = () => reject(new Error('网络错误'));
        xhr.send(formData);
      });
    },

    // 取消上传
    async cancel() {
      if (!this.uploading) return;
      this.cancelled = true;
      this.showToast('正在取消并清理 OSS...', 'info');
      if (this.sessionId) {
        try {
          await this.api('/session/' + this.sessionId, 'DELETE');
        } catch (e) { }
        this.sessionId = null;
      }
      this.showToast('已取消', 'info');
      this.resetState();
    },

    // 重置
    reset() {
      if (this.uploading) return;
      this.allFiles = [];
      this.validFiles = [];
      this.sessionId = null;
      this.qIdx = 0;
      this.showMeta = false;
      this.showVlog = false;
      this.showFileList = false;
      this.showProg = false;
      this.showUrls = false;
      this.showTree = false;
      this.fileUrls = [];
      this.vlog = [];
      this.treeData = [];
      this.fileStatus = {};
      this.fileProgress = {};
      this.$refs.fileInput.value = '';
      this.resetState();
    },

    resetState() {
      this.uploading = false;
      this.qIdx = 0;
    },

    // 加载目录树
    async loadTree() {
      try {
        const r = await this.api('/tree/' + this.sessionId, 'GET');
        this.showTree = true;
        this.treeData = r.data.children || [];
        this.treeHtml = this.renderTreeNodes(this.treeData, 0);
      } catch (e) {
        this.showToast('加载目录树失败', 'err');
      }
    },

    // 加载文件URL列表
    async loadFileUrls() {
      try {
        const r = await this.api('/files/' + this.sessionId, 'GET');
        this.fileUrls = r.data || [];
        if (this.fileUrls.length > 0) {
          this.showUrls = true;
        }
      } catch (e) {
        console.error('加载文件URL失败', e);
      }
    },

    // 渲染目录树
    renderTreeNodes(nodes, depth) {
      let html = '';
      for (const node of nodes) {
        // 缩进
        let indent = '';
        for (let i = 0; i < depth; i++) {
          indent += '<span style="display:inline-block;width:16px;flex-shrink:0"></span>';
        }

        // 图标
        const icon = node.isDir
          ? '<svg viewBox="0 0 16 16" fill="none" stroke="#3b82f6" stroke-width="1.4"><path d="M1.5 4h4.5l1.5 1.5h7V13h-13z"/></svg>'
          : '<svg viewBox="0 0 16 16" fill="none" stroke="#4a5370" stroke-width="1.4"><rect x="3" y="1.5" width="10" height="13" rx="1"/><path d="M5.5 5h5M5.5 7.5h5M5.5 10h3"/></svg>';

        const nameClass = node.isDir ? 'tn-name dir' : 'tn-name';
        const size = node.isDir ? '' : `<span class="tn-sz">${this.formatSize(node.size || 0)}</span>`;

        html += `
          <div class="tn-row">
            ${indent}
            <span style="width:14px;flex-shrink:0;display:inline-flex">${icon}</span>
            <span class="${nameClass}">${node.name}</span>
            ${size}
          </div>`;

        if (node.isDir && node.children) {
          html += this.renderTreeNodes(node.children, depth + 1);
        }
      }
      return html;
    },

    // 获取文件状态样式
    getFileStatus(idx) {
      return this.fileStatus[idx] || 'waiting';
    },
    getFileBarClass(idx) {
      const status = this.fileStatus[idx];
      if (status === 'ok') return 'ok';
      if (status === 'instant') return 'instant';
      if (status === 'err') return 'err';
      return '';
    },
    getFileProgress(idx) {
      return this.fileProgress[idx] || 0;
    },

    // 复制URL
    copyUrl(url) {
      navigator.clipboard.writeText(url);
      this.showToast('已复制', 'ok');
    },
    copyAllUrls() {
      const urls = this.fileUrls.map(f => f.url).join('\n');
      navigator.clipboard.writeText(urls);
      this.showToast('已复制全部URL', 'ok');
    },

    // MD5 计算
    calcMd5(file) {
      return new Promise((resolve, reject) => {
        if (!this.SparkMD5) {
          // 等待 SparkMD5 加载
          const check = setInterval(() => {
            if (this.SparkMD5) {
              clearInterval(check);
              this.doCalcMd5(file, resolve, reject);
            }
          }, 100);
        } else {
          this.doCalcMd5(file, resolve, reject);
        }
      });
    },
    doCalcMd5(file, resolve, reject) {
      const spark = new this.SparkMD5.ArrayBuffer();
      const reader = new FileReader();
      reader.onload = e => {
        spark.append(e.target.result);
        resolve(spark.end());
      };
      reader.onerror = () => reject(new Error('md5 read error'));
      reader.readAsArrayBuffer(file);
    },

    // API 请求
    async api(path, method, body) {
      const opt = {
        method,
        headers: { 'Content-Type': 'application/json' }
      };
      if (body) opt.body = JSON.stringify(body);
      const r = await fetch(this.API + path, opt);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    },

    // 工具函数
    formatSize(b) {
      if (b < 1024) return b + ' B';
      if (b < 1 << 20) return (b / (1 << 10)).toFixed(1) + ' KB';
      if (b < 1 << 30) return (b / (1 << 20)).toFixed(1) + ' MB';
      return (b / (1 << 30)).toFixed(2) + ' GB';
    },
    formatTime(s) {
      if (s < 60) return Math.round(s) + 's';
      if (s < 3600) return Math.floor(s / 60) + 'm' + Math.round(s % 60) + 's';
      return Math.floor(s / 3600) + 'h' + Math.floor((s % 3600) / 60) + 'm';
    },
    showToast(message, type = 'info') {
      const toast = { message, type };
      this.toasts.push(toast);
      setTimeout(() => {
        const idx = this.toasts.indexOf(toast);
        if (idx > -1) this.toasts.splice(idx, 1);
      }, 3500);
    }
  }
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500&family=Noto+Sans+SC:wght@300;400;500&display=swap');

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --bg: #0b0e14;
  --s1: #111520;
  --s2: #171c28;
  --bd: #1e2435;
  --bd2: #28304a;
  --tx: #bcc4d8;
  --mu: #4a5370;
  --ac: #3b82f6;
  --ac2: #22d3ee;
  --ok: #10b981;
  --warn: #f59e0b;
  --err: #ef4444;
  --instant: #a855f7;
  --mono: 'JetBrains Mono', monospace;
  --sans: 'Noto Sans SC', sans-serif;
}

.app {
  background: var(--bg);
  color: var(--tx);
  font-family: var(--sans);
  font-weight: 300;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 顶栏 */
header {
  background: var(--s1);
  border-bottom: 1px solid var(--bd);
  height: 48px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.hlogo {
  width: 8px;
  height: 24px;
  background: var(--ac);
  border-radius: 2px;
}

.hlogo::after {
  content: '';
  display: block;
  width: 8px;
  height: 8px;
  background: var(--ac2);
  border-radius: 2px;
  margin-top: 3px;
}

header h1 {
  font-family: var(--mono);
  font-size: 13px;
  font-weight: 400;
  letter-spacing: 0.1em;
  color: var(--tx);
}

.htag {
  margin-left: auto;
  font-family: var(--mono);
  font-size: 10px;
  color: var(--mu);
}

.hbadge {
  font-family: var(--mono);
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 3px;
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: var(--ac);
}

/* 布局 */
.layout {
  flex: 1;
  display: grid;
  grid-template-columns: 400px 1fr;
  overflow: hidden;
}

/* 左面板 */
.lp {
  border-right: 1px solid var(--bd);
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow-y: auto;
}

.lp-sec {
  padding: 20px;
  border-bottom: 1px solid var(--bd);
}

.sec-lbl {
  font-family: var(--mono);
  font-size: 10px;
  letter-spacing: 0.14em;
  color: var(--mu);
  text-transform: uppercase;
  margin-bottom: 12px;
}

/* 拖拽区 */
.dz {
  border: 1px dashed var(--bd2);
  border-radius: 6px;
  padding: 28px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  background: rgba(59, 130, 246, 0.015);
}

.dz:hover,
.dz.over {
  border-color: var(--ac);
  background: rgba(59, 130, 246, 0.06);
}

.dz input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
  width: 100%;
  height: 100%;
}

.dz-icon {
  margin: 0 auto 12px;
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  color: var(--ac);
  opacity: 0.6;
}

.dz-t {
  font-size: 13px;
  color: var(--tx);
  margin-bottom: 5px;
}

.dz-s {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--mu);
  line-height: 1.7;
}

/* 元信息 */
.meta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
}

.mi {
  background: var(--s2);
  border: 1px solid var(--bd);
  border-radius: 4px;
  padding: 10px 12px;
}

.mi-k {
  font-family: var(--mono);
  font-size: 9px;
  letter-spacing: 0.1em;
  color: var(--mu);
  text-transform: uppercase;
  margin-bottom: 4px;
}

.mi-v {
  font-family: var(--mono);
  font-size: 12px;
  color: var(--ac2);
}

/* 进度 */
.prog-card {
  background: var(--s2);
  border: 1px solid var(--bd);
  border-radius: 4px;
  padding: 14px;
}

.prog-top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 8px;
}

.prog-lbl {
  font-size: 12px;
  color: var(--tx);
}

.prog-num {
  font-family: var(--mono);
  font-size: 22px;
  font-weight: 500;
  color: var(--ac);
}

.bar {
  height: 3px;
  background: var(--bd2);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 8px;
}

.bar-f {
  height: 100%;
  background: var(--ac);
  border-radius: 2px;
  transition: width 0.25s ease;
}

.bar-f.ok {
  background: var(--ok);
}

.prog-stats {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--mu);
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

/* 文件列表 */
.fl-wrap {
  border: 1px solid var(--bd);
  border-radius: 4px;
  max-height: 260px;
  overflow-y: auto;
}

.fl-wrap::-webkit-scrollbar {
  width: 3px;
}

.fl-wrap::-webkit-scrollbar-thumb {
  background: var(--bd2);
  border-radius: 2px;
}

.fi {
  display: grid;
  grid-template-columns: 8px 1fr 64px 90px;
  gap: 8px;
  align-items: center;
  padding: 7px 10px;
  border-bottom: 1px solid var(--bd);
  font-size: 11px;
}

.fi:last-child {
  border-bottom: none;
}

.fi-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--bd2);
}

.fi-dot.up {
  background: var(--ac);
  animation: blink 0.7s infinite;
}

.fi-dot.ok {
  background: var(--ok);
}

.fi-dot.instant {
  background: var(--instant);
}

.fi-dot.err {
  background: var(--err);
}

.fi-dot.skip {
  background: var(--warn);
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

.fi-name {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--tx);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fi-size {
  font-family: var(--mono);
  color: var(--mu);
  text-align: right;
}

.fi-bar {
  height: 2px;
  background: var(--bd2);
  border-radius: 1px;
  overflow: hidden;
}

.fi-bar-f {
  height: 100%;
  background: var(--ac);
  transition: width 0.15s;
}

.fi-bar-f.ok {
  background: var(--ok);
}

.fi-bar-f.instant {
  background: var(--instant);
}

.fi-bar-f.err {
  background: var(--err);
}

/* 按钮 */
.btns {
  display: flex;
  gap: 8px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--bd);
}

.btn {
  height: 36px;
  border: none;
  border-radius: 4px;
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition: all 0.15s;
  padding: 0 16px;
}

.btn-p {
  background: var(--ac);
  color: #fff;
  flex: 1;
}

.btn-p:hover {
  background: #5b92f7;
}

.btn-p:disabled {
  background: var(--bd);
  color: var(--mu);
  cursor: not-allowed;
}

.btn-g {
  background: transparent;
  color: var(--mu);
  border: 1px solid var(--bd2);
}

.btn-g:hover {
  border-color: var(--ac);
  color: var(--ac);
}

.btn-g:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.btn-d {
  background: transparent;
  color: var(--err);
  border: 1px solid rgba(239, 68, 68, 0.25);
}

.btn-d:hover {
  background: rgba(239, 68, 68, 0.08);
}

.btn-d:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

/* 校验日志 */
.vlog {
  max-height: 100px;
  overflow-y: auto;
  font-family: var(--mono);
  font-size: 11px;
  line-height: 1.8;
}

.vlog-item {
  color: var(--err);
  padding: 1px 0;
}

.vlog-item.warn {
  color: var(--warn);
}

/* 右面板 */
.rp {
  padding: 20px;
  overflow-y: auto;
}

.tree-empty {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--mu);
}

.tree-empty svg {
  opacity: 0.15;
}

.tree-empty p {
  font-family: var(--mono);
  font-size: 12px;
}

/* 目录树 */
.tree {
  font-family: var(--mono);
  font-size: 12px;
}

.tn-row {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 2px 4px;
  border-radius: 3px;
  cursor: default;
  transition: background 0.1s;
}

.tn-row:hover {
  background: rgba(59, 130, 246, 0.07);
}

.tn-name {
  color: var(--tx);
}

.tn-name.dir {
  color: var(--ac);
}

.tn-sz {
  margin-left: auto;
  font-size: 10px;
  color: var(--mu);
  white-space: nowrap;
}

.tn-inst {
  font-size: 9px;
  color: var(--instant);
  margin-left: 4px;
  letter-spacing: 0.06em;
}

/* 图例 */
.legend {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  padding: 12px 20px;
  border-top: 1px solid var(--bd);
  font-family: var(--mono);
  font-size: 10px;
  color: var(--mu);
}

.leg {
  display: flex;
  align-items: center;
  gap: 5px;
}

.leg-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

/* 状态栏 */
.sb {
  border-top: 1px solid var(--bd);
  background: var(--s1);
  height: 26px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  font-family: var(--mono);
  font-size: 10px;
  color: var(--mu);
  flex-shrink: 0;
}

.sb-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--ok);
}

/* Toast */
.toasts {
  position: fixed;
  bottom: 32px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  z-index: 999;
}

.toast {
  background: var(--s2);
  border: 1px solid var(--bd2);
  border-radius: 4px;
  padding: 8px 14px;
  font-family: var(--mono);
  font-size: 11px;
  animation: tin 0.2s ease;
  max-width: 300px;
}

.toast.ok {
  border-left: 3px solid var(--ok);
  color: var(--ok);
}

.toast.err {
  border-left: 3px solid var(--err);
  color: var(--err);
}

.toast.info {
  border-left: 3px solid var(--ac);
  color: var(--ac);
}

.toast.inst {
  border-left: 3px solid var(--instant);
  color: var(--instant);
}

@keyframes tin {
  from {
    opacity: 0;
    transform: translateX(16px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

/* URL 列表 */
.url-list {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid var(--bd);
  border-radius: 4px;
}

.url-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-bottom: 1px solid var(--bd);
  font-size: 11px;
}

.url-item:last-child {
  border-bottom: none;
}

.url-item input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--tx);
  font-family: var(--mono);
  font-size: 10px;
  outline: none;
}

.url-item .copy-btn {
  background: transparent;
  border: 1px solid var(--bd2);
  color: var(--mu);
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  cursor: pointer;
  flex-shrink: 0;
}

.url-item .copy-btn:hover {
  border-color: var(--ac);
  color: var(--ac);
}

.url-count {
  font-family: var(--mono);
  font-size: 10px;
  color: var(--mu);
  padding: 4px 0;
}
</style>
