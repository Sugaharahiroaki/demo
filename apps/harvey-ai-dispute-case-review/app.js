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
    review: document.getElementById("staff-review"),
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
     DIRECTOR VIEW: ケース処理能力シミュレーター
     実績（ケース処理能力35%増）を根拠に、比例配分で概算する。
     ================================================================ */
  const CAPACITY_GROWTH = 0.35; // 報告されている実績値

  const caseRange = document.getElementById("caseRange");
  const caseInput = document.getElementById("caseInput");
  const simNewCapacity = document.getElementById("simNewCapacity");
  const simAdditional = document.getElementById("simAdditional");
  const simAnnual = document.getElementById("simAnnual");
  const simBarBefore = document.getElementById("simBarBefore");
  const simBarAfter = document.getElementById("simBarAfter");

  function updateSim(source) {
    let value = source === "range" ? caseRange.value : caseInput.value;
    value = Math.max(1, Math.min(300, Math.round(Number(value) || 1)));
    caseRange.value = Math.min(60, value);
    caseInput.value = value;

    const newCapacity = Math.round(value * (1 + CAPACITY_GROWTH));
    const additional = newCapacity - value;
    const annual = additional * 12;

    simNewCapacity.textContent = `${newCapacity}件/月`;
    simAdditional.textContent = `+${additional}件/月`;
    simAnnual.textContent = `年間換算 約${annual}件の追加対応が可能に`;

    const maxScale = Math.max(value, newCapacity, 60);
    simBarBefore.style.width = `${Math.max(4, (value / maxScale) * 100)}%`;
    simBarAfter.style.width = `${Math.max(4, (newCapacity / maxScale) * 100)}%`;
  }

  caseRange.addEventListener("input", () => updateSim("range"));
  caseInput.addEventListener("input", () => updateSim("number"));
  updateSim("number");

  /* ================================================================
     STAFF VIEW: ケースレビュー デモ
     ================================================================ */
  const CASES = {
    a: {
      label: "案件A：遅延損害請求",
      docCount: { invoices: 48, contracts: 12 },
      summary: [
        "遅延の起算日について、契約書上の記載と請求書類の日付に3週間の齟齬が見つかりました。",
        "追加費用請求の一部（約12%）に該当する契約条項の引用が明記されていません。",
        "サプライヤーへの支払い遅延に関する通知書が2通、時系列から漏れている可能性があります。",
      ],
      questions: [
        "遅延の起算日について、現場責任者はいつ、どの文書で最初に認識しましたか。",
        "追加費用の請求根拠となる契約条項について、担当者はどの時点で確認していますか。",
        "サプライヤーへの支払い遅延通知は、誰が、いつ送付しましたか。",
      ],
      memo: "本件について、初期レビューを完了しました。遅延の起算日に関する記載の齟齬や、追加費用請求の一部条項引用の不足など、今後精査が必要な論点を確認しています。次回ミーティングにて、優先順位を含めてご説明いたします。",
    },
    b: {
      label: "案件B：契約変更紛争",
      docCount: { invoices: 65, contracts: 8, orders: 23 },
      summary: [
        "変更指示書（Variation Order）のうち5件について、承認者の署名日が発注日より後になっています。",
        "変更範囲の説明文言が、当初契約の仕様書と一部矛盾しています。",
        "追加人件費の算定根拠となるタイムシートが3週分欠落しています。",
      ],
      questions: [
        "この変更指示書の承認プロセスにおいて、発注前に口頭合意はありましたか。",
        "仕様書との矛盾について、現場側からいつ、誰に報告されましたか。",
        "欠落しているタイムシートの期間、追加人員は実際に現場に配置されていましたか。",
      ],
      memo: "本件について、初期レビューを完了しました。変更指示書の承認日と発注日の前後関係、仕様書との記載の齟齬、タイムシートの一部欠落という3点を主な論点として確認しています。次回ミーティングにて詳細をご説明いたします。",
    },
    c: {
      label: "案件C：$133M規模の大型仲裁案件",
      docCount: { invoices: 1240, contracts: 146 },
      docNote: "※実際の書類件数は非公開のため、大型案件を想定した目安件数です",
      summary: [
        "総請求額$133M規模のうち、約40%が追加工事（Variation）関連の請求として分類されました。",
        "主要契約（FIDIC準拠）における紛争解決条項の解釈について、複数の解釈が併存し得る条項が3箇所特定されました。",
        "過去18か月分の月次進捗報告書のあいだで、工程遅延の主因に関する記述の一貫性に差異が見られました。",
      ],
      questions: [
        "本紛争解決条項の解釈について、契約締結時にどのような協議が行われましたか。",
        "工程遅延の主因について、月次報告書間の記述の差異はどのような経緯で生じましたか。",
        "追加工事に関する請求のうち、事前承認を得ていたものはどの範囲までですか。",
      ],
      memo: "本件（$133M規模）について、初期レビューを完了しました。追加工事関連請求の比率、紛争解決条項の解釈が分かれ得る箇所、月次報告書間の記述差異という3点を主要論点として整理しています。規模の大きい案件のため、次回ミーティングでは優先順位付けを中心にご説明いたします。",
    },
  };

  let currentCase = "a";
  let currentData = null;

  const casePicker = document.getElementById("casePicker");
  const docsPlaceholder = document.getElementById("docsPlaceholder");
  const docsView = document.getElementById("docsView");
  const docsStatus = document.getElementById("docsStatus");
  const docsCountText = document.getElementById("docsCountText");
  const uploadBtn = document.getElementById("uploadBtn");
  const analyzeBtn = document.getElementById("analyzeBtn");
  const docStack = document.getElementById("docStack");
  const docsSummaryLine = document.getElementById("docsSummaryLine");
  const summaryList = document.getElementById("summaryList");
  const questionsList = document.getElementById("questionsList");
  const reviewRow = document.getElementById("reviewRow");
  const reviewBtn = document.getElementById("reviewBtn");
  const reviewStatus = document.getElementById("reviewStatus");
  const memoNote = document.getElementById("memoNote");
  const memoNoteText = document.getElementById("memoNoteText");
  const copyNoteBtn = document.getElementById("copyNoteBtn");
  const copyFeedback = document.getElementById("copyFeedback");

  function resetReviewScreen() {
    docsPlaceholder.hidden = false;
    docsView.hidden = true;
    docsStatus.textContent = "未アップロード";
    docsCountText.textContent = "まだ書類がアップロードされていません";
    summaryList.innerHTML = '<li class="findings-empty">書類をアップロードし「Harveyで要約・質問案を生成」を押すと、ここに要点が表示されます。</li>';
    questionsList.innerHTML = "";
    reviewRow.hidden = true;
    reviewStatus.textContent = "";
    memoNote.hidden = true;
    copyFeedback.textContent = "";
    docStack.innerHTML = "";
  }

  function totalDocs(counts) {
    return Object.values(counts).reduce((a, b) => a + b, 0);
  }

  function drawDocStack(counts) {
    docStack.innerHTML = "";
    const entries = Object.entries(counts);
    const max = Math.max(...entries.map(([, v]) => v));
    entries.forEach(([, v]) => {
      const bar = document.createElement("div");
      bar.className = "doc-bar";
      const height = 24 + (v / max) * 60;
      bar.style.height = `${height}px`;
      docStack.appendChild(bar);
    });
  }

  function loadCase(key) {
    currentCase = key;
    currentData = CASES[key];
    resetReviewScreen();
  }

  casePicker.addEventListener("click", (e) => {
    const btn = e.target.closest(".case-btn");
    if (!btn) return;
    casePicker.querySelectorAll(".case-btn").forEach((b) => b.classList.toggle("active", b === btn));
    loadCase(btn.dataset.case);
  });

  uploadBtn.addEventListener("click", () => {
    docsStatus.textContent = "取り込み中";
    uploadBtn.textContent = "アップロード中…";
    uploadBtn.disabled = true;
    setTimeout(() => {
      docsPlaceholder.hidden = true;
      docsView.hidden = false;
      docsStatus.textContent = "取り込み完了";
      uploadBtn.textContent = "書類をアップロード";
      uploadBtn.disabled = false;
      drawDocStack(currentData.docCount);
      const total = totalDocs(currentData.docCount);
      const noteSuffix = currentData.docNote ? `　${currentData.docNote}` : "";
      docsSummaryLine.textContent = `請求書類・契約書 計${total.toLocaleString()}件を取り込みました${noteSuffix}`;
    }, 600);
  });

  analyzeBtn.addEventListener("click", () => {
    analyzeBtn.textContent = "Harveyが解析中…";
    analyzeBtn.disabled = true;
    docsStatus.textContent = "AI解析中";
    setTimeout(() => {
      docsStatus.textContent = "要約・質問案 生成済み";
      analyzeBtn.textContent = "Harveyで要約・質問案を生成";
      analyzeBtn.disabled = false;
      renderList(summaryList, currentData.summary);
      renderList(questionsList, currentData.questions);
      reviewRow.hidden = false;
      reviewStatus.textContent = "";
      reviewBtn.disabled = false;
      reviewBtn.textContent = "専門家レビュー完了としてマーク（デモ）";
      memoNote.hidden = true;
    }, 900);
  });

  function renderList(el, items) {
    el.innerHTML = "";
    items.forEach((text) => {
      const li = document.createElement("li");
      li.className = "finding-item";
      li.innerHTML = `
        <span class="finding-main">${text}</span>
        <span class="confidence-tag draft">下書き</span>
      `;
      el.appendChild(li);
    });
  }

  reviewBtn.addEventListener("click", () => {
    reviewStatus.textContent = "レビュー済み・クライアントへの初期報告準備が整いました";
    reviewBtn.disabled = true;
    memoNote.hidden = false;
    memoNoteText.textContent = currentData.memo;
    copyFeedback.textContent = "";
  });

  copyNoteBtn.addEventListener("click", () => {
    const text = memoNoteText.textContent;
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
     STAFF VIEW: 拠点別 Harvey導入状況（見た目のみのデモ）
     ================================================================ */
  const regionSettings = [
    { name: "UAE本部（ドバイ）", harvey: true, pms: "ok" },
    { name: "インド拠点", harvey: true, pms: "ok" },
    { name: "欧州拠点", harvey: true, pms: "ok" },
    { name: "東南アジア拠点", harvey: false, pms: "pending" },
  ];

  const regionSettingsBody = document.getElementById("regionSettingsBody");
  regionSettings.forEach((r, i) => {
    const tr = document.createElement("tr");
    const statusLabel = r.pms === "ok" ? "連携済み" : "設定中";
    tr.innerHTML = `
      <td>${r.name}</td>
      <td>
        <label class="mini-switch">
          <input type="checkbox" ${r.harvey ? "checked" : ""} data-region="${i}">
          <span class="mini-slider"></span>
        </label>
      </td>
      <td><span class="status-pill ${r.pms}">${statusLabel}</span></td>
      <td><span class="status-pill ${r.harvey ? "ok" : "pending"}">${r.harvey ? "稼働中" : "準備中"}</span></td>
    `;
    regionSettingsBody.appendChild(tr);
  });
})();
