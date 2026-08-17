(() => {
  "use strict";

  /* ---------------- Persona tab switching ---------------- */
  const tabs = document.querySelectorAll(".tab");
  const views = {
    patient: document.getElementById("view-patient"),
    staff: document.getElementById("view-staff"),
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const persona = tab.dataset.persona;
      tabs.forEach((t) => {
        t.classList.toggle("active", t === tab);
        t.setAttribute("aria-selected", t === tab ? "true" : "false");
      });
      Object.entries(views).forEach(([key, el]) => {
        el.classList.toggle("active", key === persona);
      });
    });
  });

  /* ---------------- Staff sub-navigation ---------------- */
  const subtabs = document.querySelectorAll(".subtab");
  const staffviews = {
    home: document.getElementById("staff-home"),
    analysis: document.getElementById("staff-analysis"),
    settings: document.getElementById("staff-settings"),
    pricing: document.getElementById("staff-pricing"),
  };

  subtabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const key = tab.dataset.staffview;
      subtabs.forEach((t) => {
        t.classList.toggle("active", t === tab);
        t.setAttribute("aria-selected", t === tab ? "true" : "false");
      });
      Object.entries(staffviews).forEach(([k, el]) => {
        el.classList.toggle("active", k === key);
      });
    });
  });

  /* ================= PATIENT VIEW: scan simulation ================= */
  const startScanBtn = document.getElementById("startScanBtn");
  const stageIntro = document.getElementById("scanStageIntro");
  const stageProgress = document.getElementById("scanStageProgress");
  const stageResult = document.getElementById("scanStageResult");
  const scanPercent = document.getElementById("scanPercent");
  const scanStatusText = document.getElementById("scanStatusText");

  const SCAN_MESSAGES = [
    "画像を取得しています…",
    "肌のキメを解析しています…",
    "毛穴・色ムラを確認しています…",
    "AIが施術提案を作成しています…",
  ];

  const METRICS = [
    { name: "保湿バランス", score: 62 },
    { name: "キメ・なめらかさ", score: 58 },
    { name: "毛穴の目立ちにくさ", score: 71 },
    { name: "明るさ・色ムラ", score: 66 },
    { name: "ハリ・弾力", score: 60 },
  ];

  const SUGGESTIONS = [
    { id: "hydra", title: "ハイドラフェイシャル", desc: "毛穴の詰まりや乾燥が気になる方に。肌をやさしく整える施術です。" },
    { id: "led", title: "LEDフォトセラピー", desc: "色ムラが気になる部分に。低刺激で肌トーンを整えます。" },
    { id: "microneedle", title: "マイクロニードリング", desc: "ハリ・キメの変化を感じたい方に。段階的なケアが可能です。" },
    { id: "vitc", title: "ビタミンC導入", desc: "明るさアップをめざす、負担の少ない導入ケアです。" },
  ];

  let interestCount = 0;

  function renderMetrics() {
    const list = document.getElementById("metricList");
    list.innerHTML = "";
    METRICS.forEach((m) => {
      const row = document.createElement("div");
      row.className = "metric-row";
      row.innerHTML = `
        <span class="metric-name">${m.name}</span>
        <span class="metric-track"><span class="metric-fill" data-score="${m.score}"></span></span>
        <span class="metric-score">${m.score}<span style="font-size:0.7em;">/100</span></span>
      `;
      list.appendChild(row);
    });
    requestAnimationFrame(() => {
      document.querySelectorAll(".metric-fill").forEach((el) => {
        el.style.width = `${el.dataset.score}%`;
      });
    });
  }

  function renderSuggestions() {
    const list = document.getElementById("suggestList");
    list.innerHTML = "";
    SUGGESTIONS.forEach((s) => {
      const card = document.createElement("div");
      card.className = "suggest-card";
      card.innerHTML = `
        <p class="suggest-title">${s.title}</p>
        <p class="suggest-desc">${s.desc}</p>
        <button type="button" class="suggest-btn" data-id="${s.id}">興味リストに追加</button>
      `;
      const btn = card.querySelector(".suggest-btn");
      btn.addEventListener("click", () => {
        const saved = btn.classList.toggle("saved");
        btn.textContent = saved ? "追加済み ✓" : "興味リストに追加";
        interestCount += saved ? 1 : -1;
        updateInterestCount();
      });
      list.appendChild(card);
    });
  }

  function updateInterestCount() {
    document.getElementById("interestCount").textContent = `興味リスト：${interestCount}件`;
  }

  startScanBtn.addEventListener("click", () => {
    startScanBtn.disabled = true;
    stageIntro.classList.add("hidden");
    stageProgress.classList.remove("hidden");

    let pct = 0;
    let msgIdx = 0;
    scanStatusText.textContent = SCAN_MESSAGES[0];

    const interval = setInterval(() => {
      pct += Math.random() * 12 + 6;
      if (pct >= 100) {
        pct = 100;
        clearInterval(interval);
        scanPercent.textContent = "100%";
        setTimeout(() => {
          stageProgress.classList.add("hidden");
          stageResult.classList.remove("hidden");
          renderMetrics();
          renderSuggestions();
        }, 400);
        return;
      }
      scanPercent.textContent = `${Math.floor(pct)}%`;
      const newMsgIdx = Math.min(SCAN_MESSAGES.length - 1, Math.floor((pct / 100) * SCAN_MESSAGES.length));
      if (newMsgIdx !== msgIdx) {
        msgIdx = newMsgIdx;
        scanStatusText.textContent = SCAN_MESSAGES[msgIdx];
      }
    }, 280);
  });

  const consultBtn = document.getElementById("consultBtn");
  const consultNote = document.getElementById("consultNote");
  consultBtn.addEventListener("click", () => {
    consultNote.hidden = !consultNote.hidden;
  });

  const resetScanBtn = document.getElementById("resetScanBtn");
  resetScanBtn.addEventListener("click", () => {
    interestCount = 0;
    updateInterestCount();
    consultNote.hidden = true;
    stageResult.classList.add("hidden");
    stageProgress.classList.add("hidden");
    stageIntro.classList.remove("hidden");
    startScanBtn.disabled = false;
    scanPercent.textContent = "0%";
    scanStatusText.textContent = SCAN_MESSAGES[0];
    document.querySelector(".scan-widget").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  /* ================= STAFF VIEW: dashboard data ================= */
  const BASE_SPEND = 1444;
  const AFTER_SPEND = 1921;

  function renderCompareChart(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = `
      <div class="compare-col">
        <div class="compare-fill before" style="height:${(BASE_SPEND / AFTER_SPEND) * 100}%">
          <span class="compare-fill-value">$${BASE_SPEND.toLocaleString()}</span>
        </div>
        <span class="compare-label">導入前平均</span>
      </div>
      <div class="compare-delta">
        <span class="compare-delta-value">+33%</span>
        <span class="compare-delta-label">45日間の変化</span>
      </div>
      <div class="compare-col">
        <div class="compare-fill after" style="height:100%">
          <span class="compare-fill-value">$${AFTER_SPEND.toLocaleString()}</span>
        </div>
        <span class="compare-label">導入後平均</span>
      </div>
    `;
  }
  renderCompareChart("spendChart");

  /* Jump links (e.g. Home -> Analysis) */
  document.querySelectorAll("[data-jump-staffview]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.jumpStaffview;
      const targetTab = document.querySelector(`.subtab[data-staffview="${key}"]`);
      if (targetTab) targetTab.click();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  const SCAN_STATUS_STAFF = [
    { name: "T.M様", meta: "本日 14:30 来院予定 ・ スキャン完了", done: true },
    { name: "K.S様", meta: "本日 15:00 来院予定 ・ スキャン完了", done: true },
    { name: "N.H様", meta: "本日 15:30 来院予定 ・ 未実施", done: false },
    { name: "R.A様", meta: "本日 16:15 来院予定 ・ スキャン完了", done: true },
    { name: "Y.O様", meta: "明日 10:00 来院予定 ・ 未実施", done: false },
  ];

  const scanStatusListStaff = document.getElementById("scanStatusListStaff");
  SCAN_STATUS_STAFF.forEach((item) => {
    const li = document.createElement("li");
    li.className = "scan-status-item";
    li.innerHTML = `
      <span>${item.name}<span class="ssi-meta">${item.meta}</span></span>
      <span class="status-pill ${item.done ? "ok" : ""}" style="${item.done ? "" : "background:var(--amber-bg);color:var(--amber);"}">${item.done ? "分析結果を確認できます" : "未実施"}</span>
    `;
    scanStatusListStaff.appendChild(li);
  });

  /* Analysis: donut for 61% save rate */
  const donutFill = document.getElementById("donutFill");
  if (donutFill) {
    const circumference = 2 * Math.PI * 50; // r=50
    const rate = 0.61;
    requestAnimationFrame(() => {
      donutFill.style.strokeDashoffset = `${circumference * (1 - rate)}`;
    });
  }

  /* Settings: calendar connect button */
  const connectBtn = document.getElementById("connectCalendarBtn");
  if (connectBtn) {
    connectBtn.addEventListener("click", () => {
      connectBtn.textContent = "接続済み";
      connectBtn.classList.add("connected");
      connectBtn.disabled = true;
    });
  }

  /* ================= Pricing simulator ================= */
  const simPatients = document.getElementById("simPatients");
  const simSpend = document.getElementById("simSpend");
  const simPatientsVal = document.getElementById("simPatientsVal");
  const simSpendVal = document.getElementById("simSpendVal");
  const simMonthly = document.getElementById("simMonthly");
  const simAnnual = document.getElementById("simAnnual");

  function formatUSD(n) {
    return `$${Math.round(n).toLocaleString()}`;
  }

  function updateSimulator() {
    const patients = Number(simPatients.value);
    const spend = Number(simSpend.value);
    simPatientsVal.textContent = `${patients}名 / 月`;
    simSpendVal.textContent = formatUSD(spend);

    // 月間: 45日間実績の +33% 単価アップを月間ベースに換算
    const monthlyUplift = patients * spend * 0.33;
    // 年間: 12カ月換算の +56% 予測を年間ベースに換算
    const annualUplift = patients * 12 * spend * 0.56;

    simMonthly.textContent = formatUSD(monthlyUplift);
    simAnnual.textContent = formatUSD(annualUplift);
  }

  if (simPatients && simSpend) {
    simPatients.addEventListener("input", updateSimulator);
    simSpend.addEventListener("input", updateSimulator);
    updateSimulator();
  }
})();
