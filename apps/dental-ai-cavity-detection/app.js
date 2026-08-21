(() => {
  "use strict";

  /* ---------------- Persona tab switching ---------------- */
  const personaTabs = document.querySelectorAll(".persona-switch .tab");
  const personaViews = {
    director: document.getElementById("view-director"),
    staff: document.getElementById("view-staff"),
  };

  personaTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const persona = tab.dataset.persona;
      personaTabs.forEach((t) => {
        t.classList.toggle("active", t === tab);
        t.setAttribute("aria-selected", t === tab ? "true" : "false");
      });
      Object.entries(personaViews).forEach(([key, el]) => {
        el.classList.toggle("active", key === persona);
      });
    });
  });

  /* ---------------- Staff sub-screen switching ---------------- */
  const screenTabs = document.querySelectorAll(".screen-tab");
  const screens = {
    home: document.getElementById("staff-home"),
    analysis: document.getElementById("staff-analysis"),
    settings: document.getElementById("staff-settings"),
  };

  screenTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const screen = tab.dataset.screen;
      screenTabs.forEach((t) => {
        t.classList.toggle("active", t === tab);
        t.setAttribute("aria-selected", t === tab ? "true" : "false");
      });
      Object.entries(screens).forEach(([key, el]) => {
        el.classList.toggle("active", key === screen);
      });
    });
  });

  /* ================================================================
     DIRECTOR VIEW: 検出数 Before/After 棒グラフ
     実績値: 145枚中、目視12件 / Pearl AI解析44件
     ================================================================ */
  const DETECT_BEFORE = 12;
  const DETECT_AFTER = 44;
  const DETECT_SCALE_MAX = 50; // グラフの目盛り上限（見た目の余白確保）

  const barBefore = document.getElementById("barBefore");
  const barAfter = document.getElementById("barAfter");
  const valBefore = document.getElementById("valBefore");
  const valAfter = document.getElementById("valAfter");
  const detectCallout = document.getElementById("detectCallout");
  const runDetectBtn = document.getElementById("runDetectBtn");

  function animateCount(el, target, duration) {
    const start = performance.now();
    function tick(now) {
      const progress = Math.min(1, (now - start) / duration);
      const current = Math.round(target * progress);
      el.textContent = `${current}件`;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function runDetectChart() {
    barBefore.style.height = "0%";
    barAfter.style.height = "0%";
    valBefore.textContent = "0件";
    valAfter.textContent = "0件";
    detectCallout.classList.remove("show");
    // force reflow so the height transition restarts cleanly
    void barBefore.offsetHeight;
    requestAnimationFrame(() => {
      barBefore.style.height = `${(DETECT_BEFORE / DETECT_SCALE_MAX) * 100}%`;
      barAfter.style.height = `${(DETECT_AFTER / DETECT_SCALE_MAX) * 100}%`;
      animateCount(valBefore, DETECT_BEFORE, 900);
      animateCount(valAfter, DETECT_AFTER, 900);
      setTimeout(() => detectCallout.classList.add("show"), 300);
    });
  }

  runDetectBtn.addEventListener("click", runDetectChart);
  // 初回表示時に自動で一度実行
  setTimeout(runDetectChart, 400);

  /* ================================================================
     DIRECTOR VIEW: 見逃し機会 簡易シミュレーター
     実績比率（目視 12/145 ＝ 8.3% / AI 44/145 ＝ 30.3%）を
     入力された月間X線枚数に機械的に当てはめて概算する。
     ================================================================ */
  const BASE_XRAYS = 145;
  const BASE_BEFORE = 12;
  const BASE_AFTER = 44;
  const RATE_BEFORE = BASE_BEFORE / BASE_XRAYS;
  const RATE_AFTER = BASE_AFTER / BASE_XRAYS;

  const xrayRange = document.getElementById("xrayRange");
  const xrayInput = document.getElementById("xrayInput");
  const simBefore = document.getElementById("simBefore");
  const simAfter = document.getElementById("simAfter");
  const simGap = document.getElementById("simGap");

  function updateOpportunitySim(source) {
    let value = source === "range" ? xrayRange.value : xrayInput.value;
    value = Math.max(10, Math.min(2000, Number(value) || 10));
    xrayRange.value = Math.min(400, value);
    xrayInput.value = value;
    const beforeCount = Math.round(value * RATE_BEFORE);
    const afterCount = Math.round(value * RATE_AFTER);
    simBefore.textContent = `${beforeCount}件`;
    simAfter.textContent = `${afterCount}件`;
    simGap.textContent = `${Math.max(0, afterCount - beforeCount)}件`;
  }

  xrayRange.addEventListener("input", () => updateOpportunitySim("range"));
  xrayInput.addEventListener("input", () => updateOpportunitySim("number"));
  updateOpportunitySim("number");

  /* ================================================================
     STAFF VIEW: 患者説明シミュレーション（レントゲン解析）
     ================================================================ */
  const CASES = {
    a: {
      label: "患者A（30代）",
      highlightTooth: 3,
      markerType: "caries",
      findings: [
        {
          main: "右下奥歯（第一大臼歯）に、う蝕（むし歯）の疑いがある陰影",
          sub: "咬合面から近心にかけての透過像を検出",
          type: "caries",
          typeLabel: "赤：要確認",
        },
        {
          main: "隣接する歯に、ごく初期のう蝕の可能性がある淡い所見",
          sub: "エナメル質にとどまる範囲の透過像",
          type: "early",
          typeLabel: "オレンジ：経過観察",
        },
      ],
      note: "レントゲンで、右下の奥歯にむし歯の初期段階と思われる影が見つかりました。まだ痛みが出ていない段階のことが多いので、次回のご来院で歯科医師が詳しく確認いたします。あわせて予防のため、フッ素洗口液やフロスのご案内もさせていただきます。",
    },
    b: {
      label: "患者B（50代）",
      highlightTooth: 6,
      markerType: "bone",
      findings: [
        {
          main: "左上の歯ぐき付近に、歯周ポケットの深さがやや進行している所見",
          sub: "骨吸収の初期兆候の可能性",
          type: "bone",
          typeLabel: "紫：歯周・骨の所見",
        },
        {
          main: "同じ範囲の歯に、初期う蝕の疑いがある淡い所見",
          sub: "隣接面のごく初期の透過像",
          type: "early",
          typeLabel: "オレンジ：経過観察",
        },
      ],
      note: "歯ぐきの状態について少し気になる部分が見つかりましたので、定期的なメンテナンスでの経過観察をおすすめしています。あわせて、初期のむし歯のサインも見つかっていますので、歯科医師より詳しいご説明をさせていただきます。",
    },
    c: {
      label: "患者C（70代）",
      highlightTooth: 8,
      markerType: "caries",
      findings: [
        {
          main: "過去に治療した歯の根元付近に、う蝕の疑いがある陰影",
          sub: "詰め物の境目からの透過像",
          type: "caries",
          typeLabel: "赤：要確認",
        },
      ],
      note: "以前治療した歯の詰め物の境目に、少し気になる影が見つかりました。すぐに痛みが出るものではありませんが、次回の診察で歯科医師が詳しく確認し、必要な対応をご案内します。",
    },
  };

  let currentFindings = null;

  const casePicker = document.getElementById("casePicker");
  const xrayPlaceholder = document.getElementById("xrayPlaceholder");
  const xrayView = document.getElementById("xrayView");
  const xrayStatus = document.getElementById("xrayStatus");
  const uploadBtn = document.getElementById("uploadBtn");
  const analyzeBtn = document.getElementById("analyzeBtn");
  const toothRow = document.getElementById("toothRow");
  const findingMarkers = document.getElementById("findingMarkers");
  const findingsList = document.getElementById("findingsList");
  const legendStrip = document.getElementById("legendStrip");
  const reviewRow = document.getElementById("reviewRow");
  const reviewBtn = document.getElementById("reviewBtn");
  const reviewStatus = document.getElementById("reviewStatus");
  const patientNote = document.getElementById("patientNote");
  const patientNoteText = document.getElementById("patientNoteText");
  const copyNoteBtn = document.getElementById("copyNoteBtn");
  const copyFeedback = document.getElementById("copyFeedback");

  const MARKER_COLOR = { caries: "#c8455a", early: "#d98a34", bone: "#7b5ea7" };

  function resetAnalysisScreen() {
    xrayPlaceholder.hidden = false;
    xrayView.hidden = true;
    xrayStatus.textContent = "未取り込み";
    findingsList.innerHTML = '<li class="findings-empty">画像を取り込み「Pearlで解析する」を押すと、ここに所見が表示されます。</li>';
    legendStrip.hidden = true;
    reviewRow.hidden = true;
    reviewStatus.textContent = "";
    patientNote.hidden = true;
    copyFeedback.textContent = "";
    findingMarkers.innerHTML = "";
  }

  function drawToothRow(highlightIndex) {
    toothRow.innerHTML = "";
    const teeth = 10;
    const startX = 20;
    const gap = 28;
    for (let i = 0; i < teeth; i++) {
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", startX + i * gap);
      rect.setAttribute("y", 55);
      rect.setAttribute("width", 20);
      rect.setAttribute("height", 55);
      rect.setAttribute("rx", 6);
      rect.setAttribute("fill", i === highlightIndex ? "#f2e8db" : "#c9b39a");
      toothRow.appendChild(rect);
    }
  }

  function drawFindingMarker(highlightIndex, type) {
    findingMarkers.innerHTML = "";
    const startX = 20;
    const gap = 28;
    const cx = startX + highlightIndex * gap + 10;
    const cy = 82;
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", cx);
    circle.setAttribute("cy", cy);
    circle.setAttribute("r", 16);
    circle.setAttribute("fill", "none");
    circle.setAttribute("stroke", MARKER_COLOR[type] || "#c8455a");
    circle.setAttribute("stroke-width", "2.5");
    circle.classList.add("marker-pulse");
    findingMarkers.appendChild(circle);
  }

  function loadCase(key) {
    currentFindings = CASES[key];
    resetAnalysisScreen();
    drawToothRow(currentFindings.highlightTooth);
  }

  casePicker.addEventListener("click", (e) => {
    const btn = e.target.closest(".case-btn");
    if (!btn) return;
    casePicker.querySelectorAll(".case-btn").forEach((b) => b.classList.toggle("active", b === btn));
    loadCase(btn.dataset.case);
  });

  uploadBtn.addEventListener("click", () => {
    xrayStatus.textContent = "解析待ち";
    uploadBtn.textContent = "取り込み中…";
    uploadBtn.disabled = true;
    setTimeout(() => {
      xrayPlaceholder.hidden = true;
      xrayView.hidden = false;
      xrayStatus.textContent = "画像を取り込みました";
      uploadBtn.textContent = "レントゲン画像を取り込む";
      uploadBtn.disabled = false;
    }, 600);
  });

  analyzeBtn.addEventListener("click", () => {
    analyzeBtn.textContent = "Pearlが解析中…";
    analyzeBtn.disabled = true;
    xrayStatus.textContent = "Pearl解析中…";
    setTimeout(() => {
      xrayStatus.textContent = "Pearl所見あり";
      analyzeBtn.textContent = "Pearlで解析する";
      analyzeBtn.disabled = false;
      drawFindingMarker(currentFindings.highlightTooth, currentFindings.markerType);
      renderFindings(currentFindings.findings);
      legendStrip.hidden = false;
      reviewRow.hidden = false;
      reviewStatus.textContent = "";
      reviewBtn.disabled = false;
      reviewBtn.textContent = "歯科医師レビュー完了としてマーク（デモ）";
      patientNote.hidden = true;
    }, 900);
  });

  function renderFindings(findings) {
    findingsList.innerHTML = "";
    findings.forEach((f) => {
      const li = document.createElement("li");
      li.className = "finding-item";
      li.innerHTML = `
        <span class="finding-main">${f.main}<span class="finding-sub">${f.sub}</span></span>
        <span class="confidence-tag ${f.type}">${f.typeLabel}</span>
      `;
      findingsList.appendChild(li);
    });
  }

  reviewBtn.addEventListener("click", () => {
    reviewStatus.textContent = "レビュー済み・患者様へのご説明準備が整いました";
    reviewBtn.disabled = true;
    patientNote.hidden = false;
    patientNoteText.textContent = currentFindings.note;
    copyFeedback.textContent = "";
  });

  copyNoteBtn.addEventListener("click", () => {
    const text = patientNoteText.textContent;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        copyFeedback.textContent = "コピーしました";
      }).catch(() => {
        copyFeedback.textContent = "コピーできませんでした（デモ環境の制限の可能性があります）";
      });
    } else {
      copyFeedback.textContent = "このブラウザではコピー機能に対応していません";
    }
  });

  loadCase("a");

  /* ================================================================
     STAFF VIEW: カラーコード表示のカスタマイズ（見た目のみのデモ）
     ================================================================ */
  const colorSettings = [
    { name: "う蝕の疑い（要確認）", type: "caries", label: "赤", shown: true },
    { name: "初期う蝕（経過観察）", type: "early", label: "オレンジ", shown: true },
    { name: "歯周・骨の所見", type: "bone", label: "紫", shown: true },
  ];

  const colorSettingsBody = document.getElementById("colorSettingsBody");
  colorSettings.forEach((c, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${c.name}</td>
      <td><span class="color-pill ${c.type}"><i class="swatch ${c.type}"></i>${c.label}</span></td>
      <td>
        <label class="mini-switch">
          <input type="checkbox" ${c.shown ? "checked" : ""} data-color="${i}">
          <span class="mini-slider"></span>
        </label>
      </td>
    `;
    colorSettingsBody.appendChild(tr);
  });
})();
