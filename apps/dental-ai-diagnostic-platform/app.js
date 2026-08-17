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
     DIRECTOR VIEW: 導入スピードシミュレーター
     実績（210医院 / 2週間）を根拠に、比例配分で概算する。
     ================================================================ */
  const CLINICS_BASE = 210;
  const WEEKS_BASE = 2;
  const CLINICS_PER_WEEK = CLINICS_BASE / WEEKS_BASE; // 105医院/週の導入ペース

  const clinicRange = document.getElementById("clinicRange");
  const clinicInput = document.getElementById("clinicInput");
  const simWeeks = document.getElementById("simWeeks");

  function computeWeeks(count) {
    const n = Math.max(1, Math.min(2000, Number(count) || 0));
    const weeks = Math.max(WEEKS_BASE, Math.ceil(n / CLINICS_PER_WEEK));
    return weeks;
  }

  function updateSim(source) {
    let value = source === "range" ? clinicRange.value : clinicInput.value;
    value = Math.max(1, Math.min(2000, Number(value) || 1));
    clinicRange.value = Math.min(500, value);
    clinicInput.value = value;
    const weeks = computeWeeks(value);
    simWeeks.textContent = `約${weeks}週間`;
  }

  clinicRange.addEventListener("input", () => updateSim("range"));
  clinicInput.addEventListener("input", () => updateSim("number"));
  updateSim("number");

  /* ================================================================
     DIRECTOR VIEW: 診断の一貫性 Before/After（概念図）
     実測値ではなく、ばらつきが狭まるイメージをドットの散らばりで表現。
     ================================================================ */
  const consistencyChart = document.getElementById("consistencyChart");
  // 5人の医師を想定した「所見のばらつき」の相対位置（0-100, 概念値）
  const beforeSpread = [18, 34, 52, 68, 86];
  const afterSpread = [44, 49, 52, 55, 60];

  function renderSpreadColumn(label, values, cls) {
    const col = document.createElement("div");
    col.className = "consistency-col";
    const colLabel = document.createElement("span");
    colLabel.className = "consistency-col-label";
    colLabel.textContent = label;
    const track = document.createElement("div");
    track.className = "spread-track";
    values.forEach((v) => {
      const dot = document.createElement("span");
      dot.className = `spread-dot ${cls}`;
      dot.style.left = `${v}%`;
      track.appendChild(dot);
    });
    col.appendChild(track);
    col.appendChild(colLabel);
    return col;
  }

  consistencyChart.appendChild(renderSpreadColumn("導入前（医師5名・イメージ）", beforeSpread, "before"));
  consistencyChart.appendChild(renderSpreadColumn("導入後（医師5名・イメージ）", afterSpread, "after"));

  /* ================================================================
     STAFF VIEW: レントゲン解析デモ
     ================================================================ */
  const CASES = {
    a: {
      label: "患者A（40代）",
      highlightTooth: 4,
      findings: [
        {
          main: "右下奥歯（第一大臼歯）に、う蝕（むし歯）の可能性がある陰影",
          sub: "咬合面から近心にかけての透過像を検出",
          confidence: "high",
          confidenceLabel: "要確認",
        },
        {
          main: "隣接する歯に歯周ポケットの深さがやや進行している所見",
          sub: "骨吸収の初期兆候の可能性",
          confidence: "mid",
          confidenceLabel: "経過観察",
        },
      ],
      note: "レントゲンで、右下の奥歯にむし歯の初期段階と思われる影が見つかりました。まだ痛みが出ていない段階のことが多いので、次回のご来院で歯科医師が詳しく確認いたします。あわせて、隣の歯ぐきの状態も少し気になる部分があるため、経過を見させていただきます。",
    },
    b: {
      label: "患者B（60代）",
      highlightTooth: 7,
      findings: [
        {
          main: "左上の歯に根尖（歯の根の先）付近の病変が疑われる影",
          sub: "過去の治療歯の根の先に透過像あり",
          confidence: "high",
          confidenceLabel: "要確認",
        },
        {
          main: "全体的に骨吸収の進行がやや目立つ範囲",
          sub: "複数箇所で歯周組織の経過観察を推奨",
          confidence: "mid",
          confidenceLabel: "経過観察",
        },
      ],
      note: "以前治療した歯の根の先に、少し気になる影が見つかりました。すぐに痛みが出るものではありませんが、放置すると進行することがあるため、歯科医師より詳しい検査方法をご案内します。歯ぐき全体についても、定期的なチェックをおすすめしています。",
    },
    c: {
      label: "患者C（20代）",
      highlightTooth: 2,
      findings: [
        {
          main: "親知らず付近に軽度のむし歯の可能性",
          sub: "隣接面のごく初期の透過像",
          confidence: "mid",
          confidenceLabel: "経過観察",
        },
      ],
      note: "奥の親知らずの近くに、ごく初期のむし歯のサインが見つかりました。今のところ小さな変化ですが、歯科医師が次回の診察で状態を確認し、必要であれば早めの対応をご案内します。",
    },
  };

  let currentCase = "a";
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
  const reviewRow = document.getElementById("reviewRow");
  const reviewBtn = document.getElementById("reviewBtn");
  const reviewStatus = document.getElementById("reviewStatus");
  const patientNote = document.getElementById("patientNote");
  const patientNoteText = document.getElementById("patientNoteText");
  const copyNoteBtn = document.getElementById("copyNoteBtn");
  const copyFeedback = document.getElementById("copyFeedback");

  function resetAnalysisScreen() {
    xrayPlaceholder.hidden = false;
    xrayView.hidden = true;
    xrayStatus.textContent = "未アップロード";
    findingsList.innerHTML = '<li class="findings-empty">画像をアップロードし「AI所見を確認」を押すと、ここに候補が表示されます。</li>';
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
      rect.setAttribute("fill", i === highlightIndex ? "#e7eef2" : "#cfe3ee");
      toothRow.appendChild(rect);
    }
  }

  function drawFindingMarker(highlightIndex) {
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
    circle.setAttribute("stroke", "#f2a541");
    circle.setAttribute("stroke-width", "2.5");
    circle.classList.add("marker-pulse");
    findingMarkers.appendChild(circle);
  }

  function loadCase(key) {
    currentCase = key;
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
    uploadBtn.textContent = "アップロード中…";
    uploadBtn.disabled = true;
    setTimeout(() => {
      xrayPlaceholder.hidden = true;
      xrayView.hidden = false;
      xrayStatus.textContent = "画像を取り込みました";
      uploadBtn.textContent = "レントゲン画像をアップロード";
      uploadBtn.disabled = false;
    }, 600);
  });

  analyzeBtn.addEventListener("click", () => {
    analyzeBtn.textContent = "AIが解析中…";
    analyzeBtn.disabled = true;
    xrayStatus.textContent = "AI解析中…";
    setTimeout(() => {
      xrayStatus.textContent = "AI所見あり";
      analyzeBtn.textContent = "AI所見を確認";
      analyzeBtn.disabled = false;
      drawFindingMarker(currentFindings.highlightTooth);
      renderFindings(currentFindings.findings);
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
        <span class="confidence-tag ${f.confidence}">${f.confidenceLabel}</span>
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
     STAFF VIEW: 医院ごとの導入設定（見た目のみのデモ）
     ================================================================ */
  const clinicSettings = [
    { name: "本院（フラッグシップ）", videa: true, trinity: "ok" },
    { name: "第2医院", videa: true, trinity: "ok" },
    { name: "第3医院", videa: true, trinity: "ok" },
    { name: "第4医院", videa: false, trinity: "pending" },
    { name: "第5医院", videa: true, trinity: "ok" },
  ];

  const clinicSettingsBody = document.getElementById("clinicSettingsBody");
  clinicSettings.forEach((c, i) => {
    const tr = document.createElement("tr");
    const statusLabel = c.trinity === "ok" ? "連携済み" : "設定中";
    tr.innerHTML = `
      <td>${c.name}</td>
      <td>
        <label class="mini-switch">
          <input type="checkbox" ${c.videa ? "checked" : ""} data-clinic="${i}">
          <span class="mini-slider"></span>
        </label>
      </td>
      <td><span class="status-pill ${c.trinity}">${statusLabel}</span></td>
      <td><span class="status-pill ${c.videa ? "ok" : "pending"}">${c.videa ? "稼働中" : "停止中"}</span></td>
    `;
    clinicSettingsBody.appendChild(tr);
  });
})();
