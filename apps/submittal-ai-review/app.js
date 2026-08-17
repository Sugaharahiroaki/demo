(() => {
  "use strict";

  /* ================= Nav switching ================= */
  const navItems = document.querySelectorAll(".nav-item");
  const views = {
    home: document.getElementById("view-home"),
    review: document.getElementById("view-review"),
    analytics: document.getElementById("view-analytics"),
    simulator: document.getElementById("view-simulator"),
    settings: document.getElementById("view-settings"),
  };

  const appShell = document.querySelector(".app-shell");
  const menuBtn = document.getElementById("menuBtn");
  const sidebarBackdrop = document.getElementById("sidebarBackdrop");

  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      const key = item.dataset.view;
      navItems.forEach((n) => {
        n.classList.toggle("active", n === item);
        n.setAttribute("aria-selected", n === item ? "true" : "false");
      });
      Object.entries(views).forEach(([k, el]) => el.classList.toggle("active", k === key));
      window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
      if (appShell) appShell.classList.remove("nav-open");
    });
  });

  if (menuBtn && appShell) {
    menuBtn.addEventListener("click", () => appShell.classList.toggle("nav-open"));
  }
  if (sidebarBackdrop && appShell) {
    sidebarBackdrop.addEventListener("click", () => appShell.classList.remove("nav-open"));
  }

  function switchView(key) {
    navItems.forEach((n) => {
      const active = n.dataset.view === key;
      n.classList.toggle("active", active);
      n.setAttribute("aria-selected", active ? "true" : "false");
    });
    Object.entries(views).forEach(([k, el]) => el.classList.toggle("active", k === key));
    window.scrollTo({ top: 0 });
    if (appShell) appShell.classList.remove("nav-open");
  }

  const goToSimBtn = document.getElementById("goToSimBtn");
  if (goToSimBtn) goToSimBtn.addEventListener("click", () => switchView("simulator"));

  /* ================= Chart.js theme helpers ================= */
  const isDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const chartInk = isDark ? "#cdd6e5" : "#5b6472";
  const chartGrid = isDark ? "#263049" : "#e2e5ea";
  if (window.Chart) {
    Chart.defaults.font.family = "'Hiragino Sans','Yu Gothic','Segoe UI',system-ui,sans-serif";
    Chart.defaults.color = chartInk;
  }

  /* ================= Dashboard: trend chart ================= */
  const trendCanvas = document.getElementById("trendChart");
  if (trendCanvas && window.Chart) {
    new Chart(trendCanvas, {
      type: "line",
      data: {
        labels: ["4月", "5月", "6月", "7月", "8月", "9月"],
        datasets: [{
          label: "平均再提出サイクルタイム(日)",
          data: [8.6, 7.9, 6.5, 5.4, 4.6, 4.2],
          borderColor: "#c2600f",
          backgroundColor: "rgba(217,115,28,0.12)",
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: "#c2600f",
          pointBorderColor: "#fff",
          pointBorderWidth: 1.5,
          tension: 0.3,
          fill: true,
        }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: (ctx) => `平均${ctx.parsed.y}日` },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            suggestedMax: 10,
            ticks: { callback: (v) => `${v}日` },
            grid: { color: chartGrid },
          },
          x: { grid: { display: false } },
        },
      },
    });
  }

  /* ================= Dashboard: escalation list ================= */
  const escalations = [
    { text: "鉄骨接合部 詳細図 — 仕様書 Div.05 と溶接規格が不一致", meta: "鉄骨工事 ・ 3分前" },
    { text: "防水層 施工要領書 — 立上り重ね幅が不足", meta: "防水工事 ・ 26分前" },
    { text: "カーテンウォール 割付図 — 層間変位追従量が未記載", meta: "外装工事 ・ 1時間前" },
    { text: "電気幹線 系統図 — 分電盤容量が意匠図と不整合", meta: "電気工事 ・ 2時間前" },
  ];
  const escalationList = document.getElementById("escalationList");
  if (escalationList) {
    escalations.forEach((item) => {
      const li = document.createElement("li");
      li.className = "escalation-item";
      li.innerHTML = `
        <span>
          <span class="esc-text">${item.text}</span>
          <span class="esc-meta">${item.meta}</span>
        </span>
        <button type="button" class="esc-btn">対応する</button>
      `;
      const btn = li.querySelector(".esc-btn");
      btn.addEventListener("click", () => {
        btn.textContent = "対応済み";
        btn.classList.add("done");
        btn.disabled = true;
      });
      escalationList.appendChild(li);
    });
  }

  /* ================= Dashboard: recent queue table ================= */
  const STATUS_LABEL = { ok: "適合", partial: "部分適合", critical: "不適合" };
  const queueRows = [
    { date: "2026/08/17", doc: "鉄骨接合部 詳細図", trade: "鉄骨工事", status: "critical", owner: "佐藤 健一" },
    { date: "2026/08/16", doc: "耐火被覆材 製品仕様書", trade: "内装工事", status: "partial", owner: "田中 誠" },
    { date: "2026/08/16", doc: "外部給排水 配管図", trade: "設備工事", status: "ok", owner: "鈴木 大輔" },
    { date: "2026/08/15", doc: "防水層 施工要領書", trade: "防水工事", status: "critical", owner: "佐藤 健一" },
    { date: "2026/08/14", doc: "カーテンウォール 割付図", trade: "外装工事", status: "partial", owner: "田中 誠" },
    { date: "2026/08/14", doc: "内部建具 製作図", trade: "内装工事", status: "ok", owner: "鈴木 大輔" },
  ];
  const queueBody = document.getElementById("queueBody");
  if (queueBody) {
    queueRows.forEach((row) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${row.date}</td>
        <td class="wrap">${row.doc}</td>
        <td>${row.trade}</td>
        <td><span class="status-pill ${row.status}">${STATUS_LABEL[row.status]}</span></td>
        <td>${row.owner}</td>
        <td><button type="button" class="link-btn">詳細を見る</button></td>
      `;
      const btn = tr.querySelector(".link-btn");
      btn.addEventListener("click", () => switchView("review"));
      queueBody.appendChild(tr);
    });
  }

  /* ================= Review screen: preset submittals ================= */
  const PRESETS = [
    {
      id: "steel",
      name: "鉄骨接合部 詳細図.pdf",
      trade: "鉄骨工事",
      judgment: "critical",
      confidence: 96,
      issues: [
        { tag: "不一致", text: "仕様書 Div.05 51 00 が指定する高力ボルト摩擦接合面処理（ブラスト処理）の記載が図面にない" },
        { tag: "不一致", text: "現場溶接部の余盛り高さが構造図の許容範囲（+1〜3mm）を超えて指定されている" },
        { tag: "確認要", text: "スカラップ形状が標準ディテール集（構造特記仕様書 P.14）と異なる" },
      ],
      submittedSnippet: "溶接：現場溶接、余盛り高さ +4mm、摩擦接合面 特記なし",
      specSnippet: "溶接：<span class=\"diff-highlight\">余盛り高さ +1〜3mm</span>、摩擦接合面は<span class=\"diff-highlight\">ブラスト処理</span>を必須とする",
    },
    {
      id: "fireproof",
      name: "耐火被覆材 製品仕様書.pdf",
      trade: "内装工事",
      judgment: "partial",
      confidence: 88,
      issues: [
        { tag: "確認要", text: "耐火被覆の吹付厚みは仕様書と一致しているが、製品の耐火認定番号が未記載" },
        { tag: "確認要", text: "施工範囲図に梁端部の増し打ち仕様の記載がない" },
      ],
      submittedSnippet: "耐火被覆厚み 45mm、製品名：〇〇耐火被覆材（認定番号 記載なし）",
      specSnippet: "耐火被覆厚み <span class=\"diff-highlight\">45mm以上</span>、<span class=\"diff-highlight\">大臣認定番号を製品仕様書に明記</span>のこと",
    },
    {
      id: "plumbing",
      name: "配管見上げ図.pdf",
      trade: "設備工事",
      judgment: "ok",
      confidence: 92,
      issues: [
        { tag: "適合", text: "配管径・勾配・支持間隔はすべて設備仕様書の記載と一致" },
        { tag: "適合", text: "他業種（電気・空調）との干渉チェックも設計図書の範囲内で問題なし" },
      ],
      submittedSnippet: "配管勾配 1/100、支持間隔 2,000mm 以内",
      specSnippet: "配管勾配 <span class=\"diff-highlight\">1/100以上</span>、支持間隔 <span class=\"diff-highlight\">2,000mm以内</span>",
    },
    {
      id: "waterproof",
      name: "防水層 施工要領書.pdf",
      trade: "防水工事",
      judgment: "critical",
      confidence: 91,
      issues: [
        { tag: "不一致", text: "立上り部の防水層重ね幅が仕様書の規定（100mm以上）に対して不足している" },
        { tag: "不一致", text: "ドレン廻りの補強塗り仕様が特記仕様書と異なる工法で記載されている" },
      ],
      submittedSnippet: "立上り重ね幅 60mm、ドレン廻り 標準工法",
      specSnippet: "立上り重ね幅 <span class=\"diff-highlight\">100mm以上</span>、ドレン廻りは<span class=\"diff-highlight\">補強塗り必須</span>",
    },
  ];

  const presetList = document.getElementById("presetList");
  const dropzone = document.getElementById("dropzone");
  const dropzoneText = document.getElementById("dropzoneText");
  const startBtn = document.getElementById("startReviewBtn");
  const resultEmpty = document.getElementById("resultEmpty");
  const resultProgress = document.getElementById("resultProgress");
  const resultBody = document.getElementById("resultBody");
  const progressFill = document.getElementById("progressFill");
  const progressStep = document.getElementById("progressStep");

  let selectedPreset = null;

  if (presetList) {
    PRESETS.forEach((p) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "preset-btn";
      btn.innerHTML = `<span>${p.name}</span><span class="preset-trade">${p.trade}</span>`;
      btn.addEventListener("click", () => {
        selectedPreset = p;
        document.querySelectorAll(".preset-btn").forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
        dropzone.classList.add("filled");
        dropzoneText.textContent = `選択中：${p.name}`;
        startBtn.disabled = false;
        resultEmpty.classList.remove("hidden");
        resultBody.classList.add("hidden");
        resultProgress.classList.add("hidden");
      });
      presetList.appendChild(btn);
    });
  }

  const PROGRESS_STEPS = [
    "意匠図と照合中…",
    "構造図と照合中…",
    "設備・電気図と照合中…",
    "仕様書（特記仕様書）と照合中…",
    "判定を確定しています…",
  ];

  function judgmentMeta(j) {
    if (j === "critical") return { label: "不適合", cls: "critical", next: "現場での着手前に、必ず設計チームと是正内容を確認してください。" };
    if (j === "partial") return { label: "部分適合", cls: "partial", next: "着手には支障ありませんが、指摘箇所は着手前に確認しておくと安心です。" };
    return { label: "適合", cls: "ok", next: "この内容のまま提出できます。" };
  }

  if (startBtn) {
    startBtn.addEventListener("click", () => {
      if (!selectedPreset) return;
      startBtn.disabled = true;
      resultEmpty.classList.add("hidden");
      resultBody.classList.add("hidden");
      resultProgress.classList.remove("hidden");
      progressFill.style.width = "0%";

      let step = 0;
      const total = PROGRESS_STEPS.length;
      progressStep.textContent = PROGRESS_STEPS[0];
      progressFill.style.width = `${(1 / total) * 100}%`;

      const timer = setInterval(() => {
        step += 1;
        if (step >= total) {
          clearInterval(timer);
          setTimeout(() => renderResult(selectedPreset), 350);
          return;
        }
        progressStep.textContent = PROGRESS_STEPS[step];
        progressFill.style.width = `${((step + 1) / total) * 100}%`;
      }, 480);
    });
  }

  function renderResult(preset) {
    resultProgress.classList.add("hidden");
    resultBody.classList.remove("hidden");
    startBtn.disabled = false;

    const jm = judgmentMeta(preset.judgment);
    const issuesHtml = preset.issues
      .map((i) => `<li><span class="issue-tag">${i.tag}</span><span>${i.text}</span></li>`)
      .join("");

    resultBody.innerHTML = `
      <div class="judgment-banner ${jm.cls}">
        <div>
          <div class="judgment-label">AI判定：${jm.label}</div>
          <div class="judgment-doc">${preset.name} ／ ${preset.trade}</div>
        </div>
        <div class="confidence">AI確信度<br>${preset.confidence}%</div>
      </div>
      <p class="next-action"><strong>次のアクション：</strong>${jm.next}</p>
      <ul class="issue-list">${issuesHtml}</ul>
      <div class="diff-compare">
        <div class="diff-col submitted">
          <h4>提出内容</h4>
          <p>${preset.submittedSnippet}</p>
        </div>
        <div class="diff-col spec">
          <h4>仕様書の規定</h4>
          <p>${preset.specSnippet}</p>
        </div>
      </div>
      <div class="result-actions-head">3. 判断する</div>
      <div class="result-actions">
        <button type="button" class="btn btn-secondary" id="rejectBtn">設計チームへ差し戻す</button>
        <button type="button" class="btn btn-ghost" id="approveBtn">承認して提出</button>
      </div>
    `;

    const rejectBtn = document.getElementById("rejectBtn");
    const approveBtn = document.getElementById("approveBtn");
    rejectBtn.addEventListener("click", () => {
      showToast("設計チームへ差し戻しました（デモのため実際には送信されません）");
    });
    approveBtn.addEventListener("click", () => {
      showToast("承認して提出しました（デモのため実際には送信されません）");
    });
  }

  /* ================= Review screen: GenbaTalk chat ================= */
  const chatLog = document.getElementById("chatLog");
  const chatForm = document.getElementById("chatForm");
  const chatInput = document.getElementById("chatInput");

  function addMessage(html, from) {
    const div = document.createElement("div");
    div.className = `msg ${from}`;
    div.innerHTML = html;
    chatLog.appendChild(div);
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  function aiChatReply(text) {
    if (text.includes("耐火") || text.includes("被覆")) {
      return {
        body: "耐火被覆の吹付厚みは<strong>45mm以上</strong>と規定されています。梁端部は増し打ちが必要です。",
        cite: "出典：特記仕様書 第9章 耐火被覆工事 P.32",
      };
    }
    if (text.includes("溶接") || text.includes("鉄骨") || text.includes("接合")) {
      return {
        body: "現場溶接部の余盛り高さは<strong>+1〜3mm</strong>、高力ボルト摩擦接合面は<strong>ブラスト処理</strong>が必須です。",
        cite: "出典：構造特記仕様書 Div.05 51 00",
      };
    }
    if (text.includes("防水") || text.includes("重ね幅") || text.includes("重ね")) {
      return {
        body: "防水層の立上り部重ね幅は<strong>100mm以上</strong>と規定されています。ドレン廻りは補強塗りが必須です。",
        cite: "出典：特記仕様書 第7章 防水工事 P.18",
      };
    }
    if (text.includes("配管") || text.includes("勾配")) {
      return {
        body: "配管勾配は<strong>1/100以上</strong>、支持間隔は<strong>2,000mm以内</strong>と規定されています。",
        cite: "出典：設備仕様書 第3章 配管工事",
      };
    }
    return {
      body: "該当する記載が見つかりませんでした。工種名や部材名（例：鉄骨、防水、耐火被覆）を含めて質問すると、より正確に検索できます。",
      cite: null,
    };
  }

  function handleChatMessage(text) {
    if (!text.trim()) return;
    addMessage(text, "user");
    chatInput.value = "";
    const thinking = document.createElement("div");
    thinking.className = "msg ai";
    thinking.textContent = "…";
    chatLog.appendChild(thinking);
    chatLog.scrollTop = chatLog.scrollHeight;
    setTimeout(() => {
      thinking.remove();
      const reply = aiChatReply(text);
      const html = reply.cite ? `${reply.body}<span class="msg-cite">${reply.cite}</span>` : reply.body;
      addMessage(html, "ai");
    }, 550);
  }

  if (chatForm) {
    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      handleChatMessage(chatInput.value);
    });
    document.querySelectorAll(".quick").forEach((btn) => {
      btn.addEventListener("click", () => handleChatMessage(btn.dataset.msg));
    });
    addMessage("GenbaTalkです。プロジェクトの図面・仕様書について質問してください。関連箇所を検索してお答えします。", "ai");
  }

  /* ================= Analytics: breakdown doughnut ================= */
  const breakdownCanvas = document.getElementById("breakdownChart");
  if (breakdownCanvas && window.Chart) {
    new Chart(breakdownCanvas, {
      type: "doughnut",
      data: {
        labels: ["不適合（72%）", "部分適合（25%）", "完全適合（3%）"],
        datasets: [{
          data: [72, 25, 3],
          backgroundColor: ["#c53434", "#b8720c", "#0ca30c"],
          borderColor: isDark ? "#161f30" : "#ffffff",
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        cutout: "62%",
        plugins: {
          legend: { position: "bottom", labels: { boxWidth: 12, padding: 14 } },
          tooltip: { callbacks: { label: (ctx) => `${ctx.label}：${ctx.parsed}%` } },
        },
      },
    });
  }

  /* ================= Analytics: trade bar chart ================= */
  const tradeCanvas = document.getElementById("tradeChart");
  if (tradeCanvas && window.Chart) {
    const tradeData = [
      { label: "鉄骨工事", value: 32 },
      { label: "防水工事", value: 27 },
      { label: "外装工事", value: 21 },
      { label: "設備工事", value: 18 },
      { label: "内装工事", value: 14 },
      { label: "土工事", value: 9 },
    ].sort((a, b) => b.value - a.value);

    new Chart(tradeCanvas, {
      type: "bar",
      data: {
        labels: tradeData.map((d) => d.label),
        datasets: [{
          label: "不適合検出率",
          data: tradeData.map((d) => d.value),
          backgroundColor: "#1f3350",
          borderRadius: 5,
          maxBarThickness: 40,
        }],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx) => `${ctx.parsed.x}%` } },
        },
        scales: {
          x: { beginAtZero: true, suggestedMax: 40, ticks: { callback: (v) => `${v}%` }, grid: { color: chartGrid } },
          y: { grid: { display: false } },
        },
      },
    });
  }

  /* ================= Simulator ================= */
  const simCount = document.getElementById("simCount");
  const simHours = document.getElementById("simHours");
  const simWage = document.getElementById("simWage");
  const simCycle = document.getElementById("simCycle");
  const outCycle = document.getElementById("outCycle");
  const outHours = document.getElementById("outHours");
  const outCost = document.getElementById("outCost");

  const REVIEW_TIME_REDUCTION = 0.4; // assumption, disclosed in fine print

  function fmtInt(n) {
    return Math.round(n).toLocaleString("ja-JP");
  }

  function recalcSimulator() {
    const count = Math.max(0, parseFloat(simCount.value) || 0);
    const hours = Math.max(0, parseFloat(simHours.value) || 0);
    const wage = Math.max(0, parseFloat(simWage.value) || 0);
    const cycle = Math.max(0, parseFloat(simCycle.value) || 0);

    const newCycle = cycle * 0.5;
    const annualHoursSaved = count * hours * 12 * REVIEW_TIME_REDUCTION;
    const annualCostSaved = annualHoursSaved * wage;

    outCycle.textContent = `${newCycle.toFixed(1)}日`;
    outHours.textContent = `${fmtInt(annualHoursSaved)}時間`;
    outCost.textContent = `¥${fmtInt(annualCostSaved)}`;
  }

  [simCount, simHours, simWage, simCycle].forEach((el) => {
    if (el) el.addEventListener("input", recalcSimulator);
  });
  recalcSimulator();

  /* ================= Settings ================= */
  document.querySelectorAll(".switch").forEach((sw) => {
    sw.addEventListener("click", () => {
      const nowOn = !sw.classList.contains("on");
      sw.classList.toggle("on", nowOn);
      sw.setAttribute("aria-pressed", nowOn ? "true" : "false");
    });
  });

  document.querySelectorAll('[data-integration="accounting"]').forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.textContent = "接続済み";
      btn.classList.remove("btn-secondary");
      btn.classList.add("btn-connected");
    });
  });

  const REVIEWER_OPTIONS = ["佐藤 健一", "田中 誠", "鈴木 大輔", "伊藤 若葉"];
  const reviewerRows = [
    { trade: "鉄骨工事", owner: "佐藤 健一" },
    { trade: "防水工事", owner: "田中 誠" },
    { trade: "設備工事", owner: "鈴木 大輔" },
    { trade: "電気工事", owner: "伊藤 若葉" },
    { trade: "外装工事", owner: "田中 誠" },
    { trade: "内装工事", owner: "鈴木 大輔" },
  ];
  const reviewerBody = document.getElementById("reviewerBody");
  if (reviewerBody) {
    reviewerRows.forEach((row) => {
      const tr = document.createElement("tr");
      const optionsHtml = REVIEWER_OPTIONS.map(
        (name) => `<option value="${name}" ${name === row.owner ? "selected" : ""}>${name}</option>`
      ).join("");
      tr.innerHTML = `<td>${row.trade}</td><td><select class="reviewer-select">${optionsHtml}</select></td>`;
      reviewerBody.appendChild(tr);
    });
  }

  const saveSettingsBtn = document.getElementById("saveSettingsBtn");
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener("click", () => {
      showToast("設定を保存しました（デモ環境のため実際には保存されません）");
    });
  }

  /* ================= Toast ================= */
  const toastEl = document.getElementById("toast");
  let toastTimer = null;
  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2600);
  }
})();
