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
     DIRECTOR VIEW: 治療同意率シミュレーター
     事実として分かっているのは「同意率が導入前の少なくとも2倍」のみ。
     単価は任意入力のユーザー仮定値であり、事例の公表数値ではない。
     ================================================================ */
  const CONSENT_MULTIPLIER = 2;

  const proposalsRange = document.getElementById("proposalsRange");
  const proposalsInput = document.getElementById("proposalsInput");
  const rateRange = document.getElementById("rateRange");
  const rateInput = document.getElementById("rateInput");
  const valueInput = document.getElementById("valueInput");
  const simBefore = document.getElementById("simBefore");
  const simAfter = document.getElementById("simAfter");
  const simDelta = document.getElementById("simDelta");
  const simRevenue = document.getElementById("simRevenue");

  function syncPair(range, input, min, max, value) {
    const v = Math.max(min, Math.min(max, Number(value) || min));
    range.value = Math.max(Number(range.min), Math.min(Number(range.max), v));
    input.value = v;
    return v;
  }

  function runSim() {
    const proposals = Math.max(1, Math.min(2000, Number(proposalsInput.value) || 1));
    const rate = Math.max(1, Math.min(99, Number(rateInput.value) || 1));

    const beforeCases = Math.round(proposals * (rate / 100));
    const newRate = Math.min(100, rate * CONSENT_MULTIPLIER);
    const afterCases = Math.round(proposals * (newRate / 100));
    const delta = Math.max(0, afterCases - beforeCases);

    simBefore.textContent = `約${beforeCases}件`;
    simAfter.textContent = `約${afterCases}件`;
    simDelta.textContent = `+${delta}件`;

    const unitValue = Number(valueInput.value);
    if (valueInput.value !== "" && unitValue > 0) {
      const additionalRevenue = delta * unitValue;
      simRevenue.textContent = `試算：追加の月間診療額 約¥${additionalRevenue.toLocaleString("ja-JP")}（ご入力の単価にもとづく仮の概算）`;
    } else {
      simRevenue.textContent = "";
    }
  }

  proposalsRange.addEventListener("input", () => {
    syncPair(proposalsRange, proposalsInput, 1, 2000, proposalsRange.value);
    runSim();
  });
  proposalsInput.addEventListener("input", () => {
    syncPair(proposalsRange, proposalsInput, 1, 2000, proposalsInput.value);
    runSim();
  });
  rateRange.addEventListener("input", () => {
    syncPair(rateRange, rateInput, 1, 99, rateRange.value);
    runSim();
  });
  rateInput.addEventListener("input", () => {
    syncPair(rateRange, rateInput, 1, 99, rateInput.value);
    runSim();
  });
  valueInput.addEventListener("input", runSim);

  runSim();

  /* ================================================================
     STAFF VIEW: 朝のハドル チェックリスト（デモ用の仮データ）
     ================================================================ */
  const HUDDLE_CASES = [
    { name: "患者D様（9:30 ご来院予定）", prev: "前回：右下臼歯部にう蝕の疑いを検出。経過確認予定。", tag: "caries", tagLabel: "う蝕" },
    { name: "患者E様（10:15 ご来院予定）", prev: "前回：上顎に軽度の骨吸収所見あり。定期チェック。", tag: "bone", tagLabel: "骨吸収" },
    { name: "患者F様（11:00 ご来院予定）", prev: "前回：歯石の沈着を検出。クリーニングをご案内予定。", tag: "calculus", tagLabel: "歯石" },
  ];

  const huddleList = document.getElementById("huddleList");
  HUDDLE_CASES.forEach((c) => {
    const li = document.createElement("li");
    li.className = "huddle-item";
    li.innerHTML = `
      <span><span class="huddle-name">${c.name}</span><span class="huddle-prev">${c.prev}</span></span>
      <span class="huddle-tag ${c.tag}">${c.tagLabel}</span>
    `;
    huddleList.appendChild(li);
  });

  /* ================================================================
     STAFF VIEW: X線AI解析デモ
     ================================================================ */
  const CASES = {
    a: {
      label: "患者A（30代）",
      highlightTooth: 3,
      findings: [
        {
          main: "右下の奥歯に、う蝕（むし歯）の可能性がある陰影",
          sub: "咬合面から近心にかけての透過像をAIが検出",
          tag: "caries",
          tagLabel: "う蝕の疑い",
        },
        {
          main: "隣接部にごく軽度の歯石の沈着",
          sub: "次回クリーニングでの除去を推奨",
          tag: "calculus",
          tagLabel: "歯石",
        },
      ],
      note: "レントゲンで、右下の奥歯にむし歯の初期段階と思われる影が見つかりました。まだ痛みが出ていない段階のことが多いですが、進行する前に治療のご検討をおすすめしています。あわせて、歯石の沈着も見られるため、クリーニングもご案内します。",
    },
    b: {
      label: "患者B（50代）",
      highlightTooth: 6,
      findings: [
        {
          main: "左上の歯の根尖（根の先）付近に病変が疑われる影",
          sub: "過去の治療歯の根の先に透過像あり",
          tag: "caries",
          tagLabel: "要精査",
        },
        {
          main: "複数箇所で骨吸収がやや進行している範囲",
          sub: "歯周組織の経過観察を推奨",
          tag: "bone",
          tagLabel: "骨吸収の疑い",
        },
      ],
      note: "以前治療した歯の根の先に、少し気になる影が見つかりました。すぐに痛みが出るものではありませんが、放置すると進行する可能性があるため、詳しい検査方法をご案内します。歯を支えている骨の状態にもやや進行が見られるため、定期的なチェックをおすすめしています。",
    },
    c: {
      label: "患者C（70代）",
      highlightTooth: 1,
      findings: [
        {
          main: "複数の歯にわたり骨吸収が進行している範囲",
          sub: "歯周病の進行度をAIが数値化して提示",
          tag: "bone",
          tagLabel: "骨吸収の疑い",
        },
        {
          main: "広い範囲で歯石の沈着を検出",
          sub: "歯ぐきの炎症の一因となっている可能性",
          tag: "calculus",
          tagLabel: "歯石",
        },
      ],
      note: "歯を支えている骨の状態について、進行がやや見られる部分があります。痛みがなくても静かに進むことがあるため、歯科医師より今後の治療計画をご説明します。歯石の沈着も広く見られるため、まずはクリーニングから始めることをおすすめします。",
    },
  };

  let currentCase = "a";
  let currentFindings = null;

  const casePicker = document.getElementById("casePicker");
  const xrayPlaceholder = document.getElementById("xrayPlaceholder");
  const xrayView = document.getElementById("xrayView");
  const xrayStatus = document.getElementById("xrayStatus");
  const xrayLegend = document.getElementById("xrayLegend");
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
  const consentRow = document.getElementById("consentRow");
  const consentYesBtn = document.getElementById("consentYesBtn");
  const consentNoBtn = document.getElementById("consentNoBtn");
  const consentStatus = document.getElementById("consentStatus");
  const statAccepted = document.getElementById("statAccepted");
  const statAcceptedNote = document.getElementById("statAcceptedNote");

  let acceptedCount = 0;

  const TAG_COLOR = { caries: "#ef6a58", bone: "#e0a63e", calculus: "#a385d9" };

  function resetAnalysisScreen() {
    xrayPlaceholder.hidden = false;
    xrayView.hidden = true;
    xrayStatus.textContent = "未取り込み";
    xrayLegend.hidden = true;
    findingsList.innerHTML = '<li class="findings-empty">画像を取り込み「AI所見を色分け表示」を押すと、ここに候補が表示されます。</li>';
    reviewRow.hidden = true;
    reviewStatus.textContent = "";
    patientNote.hidden = true;
    copyFeedback.textContent = "";
    findingMarkers.innerHTML = "";
    consentStatus.textContent = "";
    consentYesBtn.classList.remove("selected");
    consentNoBtn.classList.remove("selected");
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
      rect.setAttribute("fill", i === highlightIndex ? "#f6ecf3" : "#e9d9e6");
      toothRow.appendChild(rect);
    }
  }

  function drawFindingMarkers(highlightIndex, findings) {
    findingMarkers.innerHTML = "";
    const startX = 20;
    const gap = 28;
    findings.forEach((f, i) => {
      const offset = i === 0 ? 0 : 1;
      const idx = Math.min(9, highlightIndex + offset);
      const cx = startX + idx * gap + 10;
      const cy = 82;
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", cx);
      circle.setAttribute("cy", cy);
      circle.setAttribute("r", 15);
      circle.setAttribute("fill", "none");
      circle.setAttribute("stroke", TAG_COLOR[f.tag] || "#ef6a58");
      circle.setAttribute("stroke-width", "2.5");
      circle.classList.add("marker-pulse");
      findingMarkers.appendChild(circle);
    });
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
    analyzeBtn.textContent = "AIが解析中…";
    analyzeBtn.disabled = true;
    xrayStatus.textContent = "AI解析中…";
    setTimeout(() => {
      xrayStatus.textContent = "AI所見あり（色分け表示済み）";
      analyzeBtn.textContent = "AI所見を色分け表示";
      analyzeBtn.disabled = false;
      xrayLegend.hidden = false;
      drawFindingMarkers(currentFindings.highlightTooth, currentFindings.findings);
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
        <span class="finding-tag ${f.tag}">${f.tagLabel}</span>
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
    consentStatus.textContent = "";
    consentYesBtn.classList.remove("selected");
    consentNoBtn.classList.remove("selected");
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

  consentYesBtn.addEventListener("click", () => {
    consentYesBtn.classList.add("selected");
    consentNoBtn.classList.remove("selected");
    consentStatus.textContent = "記録しました（デモ）";
    acceptedCount += 1;
    statAccepted.innerHTML = `${acceptedCount}<span class="stat-unit">件</span>`;
    statAcceptedNote.textContent = "画面を見せてご説明した結果として記録されました";
  });

  consentNoBtn.addEventListener("click", () => {
    consentNoBtn.classList.add("selected");
    consentYesBtn.classList.remove("selected");
    consentStatus.textContent = "記録しました（デモ）・次回改めてご説明予定";
  });

  loadCase("a");

  /* ================================================================
     STAFF VIEW: 担当医師ごとのOverjet連携設定（見た目のみのデモ）
     ================================================================ */
  const providerSettings = [
    { name: "院長", overjet: true, device: "ok" },
    { name: "勤務医（常勤）", overjet: true, device: "ok" },
    { name: "勤務医（非常勤）", overjet: false, device: "pending" },
  ];

  const providerSettingsBody = document.getElementById("providerSettingsBody");
  providerSettings.forEach((p, i) => {
    const tr = document.createElement("tr");
    const statusLabel = p.device === "ok" ? "連携済み" : "設定中";
    tr.innerHTML = `
      <td>${p.name}</td>
      <td>
        <label class="mini-switch">
          <input type="checkbox" ${p.overjet ? "checked" : ""} data-provider="${i}">
          <span class="mini-slider"></span>
        </label>
      </td>
      <td><span class="status-pill ${p.device}">${statusLabel}</span></td>
      <td><span class="status-pill ${p.overjet ? "ok" : "pending"}">${p.overjet ? "稼働中" : "停止中"}</span></td>
    `;
    providerSettingsBody.appendChild(tr);
  });
})();
