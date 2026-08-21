(() => {
  "use strict";

  /* ---------------- Persona tab switching ---------------- */
  const personaTabs = document.querySelectorAll(".persona-switch .tab");
  const personaViews = {
    genba: document.getElementById("view-genba"),
    hachu: document.getElementById("view-hachu"),
  };

  function activatePersona(persona) {
    personaTabs.forEach((t) => {
      const isActive = t.dataset.persona === persona;
      t.classList.toggle("active", isActive);
      t.setAttribute("aria-selected", isActive ? "true" : "false");
    });
    Object.entries(personaViews).forEach(([key, el]) => {
      el.classList.toggle("active", key === persona);
    });
  }

  personaTabs.forEach((tab) => {
    tab.addEventListener("click", () => activatePersona(tab.dataset.persona));
  });

  /* Cross-link from the site-supervisor view into a specific screen of the owner/GC view */
  document.querySelectorAll("[data-goto-hachu]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      activatePersona("hachu");
      activateScreen(link.dataset.gotoHachu);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  /* ---------------- Owner/GC sub-screen switching ---------------- */
  const screenTabs = document.querySelectorAll(".screen-tab");
  const screens = {
    home: document.getElementById("hachu-home"),
    takeoff: document.getElementById("hachu-takeoff"),
    analytics: document.getElementById("hachu-analytics"),
    simulator: document.getElementById("hachu-simulator"),
    settings: document.getElementById("hachu-settings"),
  };

  function activateScreen(screen) {
    screenTabs.forEach((t) => {
      const isActive = t.dataset.screen === screen;
      t.classList.toggle("active", isActive);
      t.setAttribute("aria-selected", isActive ? "true" : "false");
    });
    Object.entries(screens).forEach(([key, el]) => {
      el.classList.toggle("active", key === screen);
    });
  }

  screenTabs.forEach((tab) => {
    tab.addEventListener("click", () => activateScreen(tab.dataset.screen));
  });

  /* ================================================================
     TAKEOFF DEMO: 図面アップロード → AIによる電気記号自動認識
     ================================================================ */
  const CATEGORY_COLOR = {
    outlet: "#e8a862",
    light: "#f2cf7a",
    panel: "#7fb3d1",
    conduit: "#b7c1c9",
    switch: "#7fd6a3",
  };

  const CASES = {
    panel: {
      label: "住宅用パネル図",
      categories: [
        { key: "outlet", label: "コンセント", sub: "壁付き・15A/20A標準タイプ", count: 18, confidence: 99 },
        { key: "light", label: "照明器具", sub: "天井直付け・ダウンライト", count: 9, confidence: 98 },
        { key: "panel", label: "パネル表記", sub: "主開閉器・分電盤", count: 1, confidence: 99 },
        { key: "conduit", label: "配管記号", sub: "EMT配管ルート", count: 6, confidence: 92 },
        { key: "switch", label: "スイッチ", sub: "単極・3路スイッチ", count: 7, confidence: 97 },
      ],
      summary: "住宅用パネル図のテイクオフが完了しました。分電盤1面と各回路の数量を確認できます。実務ではこの規模の図面で平均1〜2時間ほどかかりますが、AIによる自動認識自体は数分で完了します。",
    },
    outlet: {
      label: "商業ビル コンセント配置図",
      categories: [
        { key: "outlet", label: "コンセント", sub: "壁付き・床埋込・什器用混在", count: 34, confidence: 98 },
        { key: "light", label: "照明器具", sub: "オフィス天井照明", count: 14, confidence: 96 },
        { key: "panel", label: "パネル表記", sub: "各階分電盤", count: 2, confidence: 99 },
        { key: "conduit", label: "配管記号", sub: "床下配管・立上りルート", count: 11, confidence: 91 },
        { key: "switch", label: "スイッチ", sub: "調光・タイマースイッチ", count: 9, confidence: 95 },
      ],
      summary: "商業ビルのコンセント配置図は記号密度が高く、従来は特に手間のかかる図面でした。AIが記号種別ごとに自動でカウントし、確信度が低い配管記号は「要確認」として見積担当のレビューに回っています。",
    },
    lighting: {
      label: "照明・スイッチ配線図",
      categories: [
        { key: "outlet", label: "コンセント", sub: "壁付き標準タイプ", count: 8, confidence: 96 },
        { key: "light", label: "照明器具", sub: "ダウンライト・ペンダント", count: 22, confidence: 98 },
        { key: "panel", label: "パネル表記", sub: "主開閉器", count: 1, confidence: 99 },
        { key: "conduit", label: "配管記号", sub: "天井裏配線ルート", count: 5, confidence: 93 },
        { key: "switch", label: "スイッチ", sub: "3路・4路スイッチ", count: 17, confidence: 97 },
      ],
      summary: "照明・スイッチ配線図のテイクオフが完了しました。3路・4路スイッチなど結線の複雑な記号も種別ごとに区別してカウントされています。",
    },
  };

  let currentCaseKey = "panel";
  let currentThreshold = 90;

  const casePicker = document.getElementById("casePicker");
  const drawingPlaceholder = document.getElementById("drawingPlaceholder");
  const drawingView = document.getElementById("drawingView");
  const drawingStatus = document.getElementById("drawingStatus");
  const uploadBtn = document.getElementById("uploadBtn");
  const analyzeBtn = document.getElementById("analyzeBtn");
  const gridLines = document.getElementById("gridLines");
  const symbolLayer = document.getElementById("symbolLayer");
  const markerLayer = document.getElementById("markerLayer");
  const findingsList = document.getElementById("findingsList");
  const confidenceSummary = document.getElementById("confidenceSummary");
  const confidenceSummaryValue = document.getElementById("confidenceSummaryValue");
  const reviewRow = document.getElementById("reviewRow");
  const reviewBtn = document.getElementById("reviewBtn");
  const reviewStatus = document.getElementById("reviewStatus");
  const summaryNote = document.getElementById("summaryNote");
  const summaryNoteText = document.getElementById("summaryNoteText");

  function drawGrid() {
    gridLines.innerHTML = "";
    for (let x = 20; x < 320; x += 30) {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", x); line.setAttribute("y1", 0);
      line.setAttribute("x2", x); line.setAttribute("y2", 200);
      gridLines.appendChild(line);
    }
    for (let y = 20; y < 200; y += 30) {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", 0); line.setAttribute("y1", y);
      line.setAttribute("x2", 320); line.setAttribute("y2", y);
      gridLines.appendChild(line);
    }
  }

  function layoutSymbols(categories) {
    const bandHeight = 200 / categories.length;
    const symbols = [];
    categories.forEach((cat, i) => {
      const y = bandHeight * i + bandHeight / 2;
      const visualCount = Math.min(cat.count, 12); // cap dots drawn for legibility; list shows true count
      for (let j = 0; j < visualCount; j++) {
        const x = 16 + (288 / (visualCount + 1)) * (j + 1);
        symbols.push({ cat: cat.key, x, y });
      }
    });
    return symbols;
  }

  function drawSymbolLayer(categories) {
    symbolLayer.innerHTML = "";
    markerLayer.innerHTML = "";
    const symbols = layoutSymbols(categories);
    symbols.forEach((s) => {
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", s.x - 3);
      rect.setAttribute("y", s.y - 3);
      rect.setAttribute("width", 6);
      rect.setAttribute("height", 6);
      rect.setAttribute("rx", 1.5);
      rect.setAttribute("fill", "#28495c");
      symbolLayer.appendChild(rect);
    });
    return symbols;
  }

  function revealMarkers(categories) {
    markerLayer.innerHTML = "";
    const symbols = layoutSymbols(categories);
    symbols.forEach((s, i) => {
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", s.x);
      circle.setAttribute("cy", s.y);
      circle.setAttribute("r", 4.2);
      circle.setAttribute("fill", CATEGORY_COLOR[s.cat] || "#e8a862");
      circle.classList.add("symbol-dot");
      circle.style.transitionDelay = `${Math.min(i * 18, 900)}ms`;
      markerLayer.appendChild(circle);
      requestAnimationFrame(() => {
        setTimeout(() => circle.classList.add("visible"), 10);
      });
    });
  }

  function resetTakeoffScreen() {
    drawingPlaceholder.hidden = false;
    drawingView.hidden = true;
    drawingStatus.textContent = "未アップロード";
    findingsList.innerHTML = '<li class="findings-empty">図面をアップロードし「AIに電気記号を認識させる」を押すと、ここに集計結果が表示されます。</li>';
    confidenceSummary.hidden = true;
    reviewRow.hidden = true;
    reviewStatus.textContent = "";
    reviewBtn.disabled = false;
    summaryNote.hidden = true;
    markerLayer.innerHTML = "";
  }

  function loadCase(key) {
    currentCaseKey = key;
    resetTakeoffScreen();
    drawGrid();
    drawSymbolLayer(CASES[key].categories);
  }

  casePicker.addEventListener("click", (e) => {
    const btn = e.target.closest(".case-btn");
    if (!btn) return;
    casePicker.querySelectorAll(".case-btn").forEach((b) => b.classList.toggle("active", b === btn));
    loadCase(btn.dataset.case);
  });

  uploadBtn.addEventListener("click", () => {
    drawingStatus.textContent = "アップロード中…";
    uploadBtn.textContent = "アップロード中…";
    uploadBtn.disabled = true;
    setTimeout(() => {
      drawingPlaceholder.hidden = true;
      drawingView.hidden = false;
      drawingStatus.textContent = "図面を取り込みました";
      uploadBtn.textContent = "PDF図面をアップロード";
      uploadBtn.disabled = false;
    }, 600);
  });

  analyzeBtn.addEventListener("click", () => {
    analyzeBtn.textContent = "AIが記号を認識中…";
    analyzeBtn.disabled = true;
    drawingStatus.textContent = "AI認識中…";
    setTimeout(() => {
      const data = CASES[currentCaseKey];
      drawingStatus.textContent = "記号認識が完了しました";
      analyzeBtn.textContent = "AIに電気記号を認識させる";
      analyzeBtn.disabled = false;
      revealMarkers(data.categories);
      renderFindings(data.categories);
      renderConfidenceSummary(data.categories);
      reviewRow.hidden = false;
      reviewStatus.textContent = "";
      reviewBtn.disabled = false;
      reviewBtn.textContent = "見積担当レビュー完了としてマーク（デモ）";
      summaryNote.hidden = true;
    }, 1100);
  });

  function renderFindings(categories) {
    findingsList.innerHTML = "";
    categories.forEach((c) => {
      const li = document.createElement("li");
      li.className = "finding-item";
      const needsReview = c.confidence < currentThreshold;
      const tagClass = needsReview ? "mid" : "high";
      const tagLabel = needsReview ? `要確認 ${c.confidence}%` : `確信度 ${c.confidence}%`;
      li.innerHTML = `
        <span class="finding-main">${c.label}：${c.count}個<span class="finding-sub">${c.sub}</span></span>
        <span class="confidence-tag ${tagClass}">${tagLabel}</span>
      `;
      findingsList.appendChild(li);
    });
  }

  function renderConfidenceSummary(categories) {
    const avg = Math.round(categories.reduce((sum, c) => sum + c.confidence, 0) / categories.length);
    confidenceSummaryValue.textContent = `${avg}%`;
    confidenceSummary.hidden = false;
  }

  reviewBtn.addEventListener("click", () => {
    const data = CASES[currentCaseKey];
    reviewStatus.textContent = "レビュー済み・入札書類の作成に進める状態です";
    reviewBtn.disabled = true;
    summaryNote.hidden = false;
    summaryNoteText.textContent = data.summary;
  });

  loadCase("panel");

  /* ================================================================
     ANALYTICS: 確信度ゲージのラベル位置調整（静的だが再計算しやすいよう関数化）
     ================================================================ */
  // ゲージ自体はCSSで固定表示（95〜99%の実績レンジ）のため追加のJS計算は不要。

  /* ================================================================
     SIMULATOR: 月間案件数 → 削減時間 / 追加対応可能件数の試算
     根拠：1件あたりのテイクオフ所要時間が実績で 20時間 → 1〜2時間（中間値1.5時間）
     ================================================================ */
  const HOURS_BEFORE = 20;
  const HOURS_AFTER_AVG = 1.5;

  const jobRange = document.getElementById("jobRange");
  const jobInput = document.getElementById("jobInput");
  const simHoursSaved = document.getElementById("simHoursSaved");
  const simDaysSaved = document.getElementById("simDaysSaved");
  const simExtraJobs = document.getElementById("simExtraJobs");

  function updateSimulator(source) {
    let value = source === "range" ? jobRange.value : jobInput.value;
    value = Math.max(1, Math.min(200, Number(value) || 1));
    jobRange.value = Math.min(60, value);
    jobInput.value = value;

    const hoursSaved = value * (HOURS_BEFORE - HOURS_AFTER_AVG);
    const daysSaved = hoursSaved / 8;
    const extraJobs = Math.floor(hoursSaved / HOURS_BEFORE);

    simHoursSaved.textContent = `約${Math.round(hoursSaved).toLocaleString()}時間／月`;
    simDaysSaved.textContent = `約${daysSaved.toFixed(1)}日分`;
    simExtraJobs.textContent = `+${extraJobs}件／月`;
  }

  jobRange.addEventListener("input", () => updateSimulator("range"));
  jobInput.addEventListener("input", () => updateSimulator("number"));
  updateSimulator("number");

  /* ================================================================
     SETTINGS: 記号カテゴリ一覧 / 確信度しきい値
     ================================================================ */
  const CATEGORY_INFO = [
    { name: "コンセント", desc: "壁付き・床埋込・什器用など、コンセント種別ごとに区別してカウント" },
    { name: "照明器具", desc: "ダウンライト・天井直付け・ペンダントなど、器具クラスごとに区別" },
    { name: "パネル表記", desc: "分電盤・主開閉器などのパネル表記を検出" },
    { name: "配管記号", desc: "EMT配管ルートなど、配管記号を検出（他カテゴリに比べ確信度が下がりやすい傾向）" },
    { name: "スイッチ", desc: "単極・3路・4路など、スイッチ種別ごとに区別してカウント" },
  ];

  const categorySettingsBody = document.getElementById("categorySettingsBody");
  CATEGORY_INFO.forEach((c, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${c.name}</td>
      <td>${c.desc}</td>
      <td>
        <label class="mini-switch">
          <input type="checkbox" checked data-category="${i}">
          <span class="mini-slider"></span>
        </label>
      </td>
    `;
    categorySettingsBody.appendChild(tr);
  });

  const thresholdRange = document.getElementById("thresholdRange");
  const thresholdValue = document.getElementById("thresholdValue");
  thresholdRange.addEventListener("input", () => {
    currentThreshold = Number(thresholdRange.value);
    thresholdValue.textContent = `${currentThreshold}%`;
    // 現在表示中のテイクオフ結果があれば、しきい値変更を即座に反映する
    if (!findingsList.querySelector(".findings-empty")) {
      renderFindings(CASES[currentCaseKey].categories);
    }
  });
})();
