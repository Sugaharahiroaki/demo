(() => {
  "use strict";

  /* ---------------- Persona tab switching ---------------- */
  const personaTabs = document.querySelectorAll(".persona-switch .tab");
  const personaViews = {
    client: document.getElementById("view-client"),
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

  /* ---------------- Staff screen switching ---------------- */
  const appTabs = document.querySelectorAll(".app-tab");
  const screens = {
    home: document.getElementById("screen-home"),
    review: document.getElementById("screen-review"),
    proposal: document.getElementById("screen-proposal"),
    simulator: document.getElementById("screen-simulator"),
    settings: document.getElementById("screen-settings"),
  };

  appTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const screen = tab.dataset.screen;
      appTabs.forEach((t) => {
        t.classList.toggle("active", t === tab);
        t.setAttribute("aria-selected", t === tab ? "true" : "false");
      });
      Object.entries(screens).forEach(([key, el]) => {
        el.classList.toggle("active", key === screen);
      });
    });
  });

  /* ================================================================
     HOME: 本日の対応待ちタスク（サンプルデータ）
     ================================================================ */
  const TASKS = [
    { text: "業務委託契約書（IT企業向け）のレビュー確認", tag: "review", tagLabel: "確認待ち" },
    { text: "損害賠償請求の申立書（引用チェック済み）", tag: "review", tagLabel: "確認待ち" },
    { text: "新規相談：製造業クライアント向け提案書", tag: "ready", tagLabel: "提出準備完了" },
    { text: "四半期訴訟状況報告書のレビュー確認", tag: "review", tagLabel: "確認待ち" },
    { text: "新規相談：IT企業向け提案書", tag: "ready", tagLabel: "提出準備完了" },
  ];

  const taskList = document.getElementById("taskList");
  if (taskList) {
    TASKS.forEach((t) => {
      const li = document.createElement("li");
      li.innerHTML = `<span>${t.text}</span><span class="task-tag ${t.tag}">${t.tagLabel}</span>`;
      taskList.appendChild(li);
    });
  }

  /* ================================================================
     文書レビュー：ファームワイド・プロンプトでのレビューworkflow
     ================================================================ */
  const DOC_CASES = {
    contract: {
      title: "業務委託契約書（IT企業向け）第3.2版・抜粋",
      body: "第9条（対価）\n甲は乙に対し、本契約に基づく業務の対価として、合理的な期間内に月額報酬を支払うものとする。\n\n第12条（成果物の権利帰属）\n本契約に基づき乙が作成した成果物に関する知的財産権は、対価の支払いをもって甲に帰属する。\n\n第15条（解除）\n甲又は乙は、相手方が第11条に定める是正期間内に本契約違反を是正しない場合、本契約を解除できる。",
      findings: [
        { cat: "構成", sev: "suggest", sevLabel: "提案", main: "支払条件の記載が本文中に分散しています。", sub: "事務所標準の並び順（定義→義務→対価→解除→準拠法）に沿って構成をまとめることを提案します。" },
        { cat: "明確さ", sev: "check", sevLabel: "要確認", main: "「合理的な期間内」という表現が複数箇所にあり、具体的な日数が明記されていません。", sub: "クライアントとの認識齟齬を防ぐため、具体的な期間の明記を検討してください。" },
        { cat: "引用の正確さ", sev: "fix", sevLabel: "要修正", main: "第15条が引用している「第11条」は、本契約書の抜粋内に存在しない条項番号です。", sub: "対応する条項（第9条または第12条）を確認のうえ、条番号の修正が必要です。" },
        { cat: "事務所文体", sev: "suggest", sevLabel: "提案", main: "一部の条項で受動態が多用されています。", sub: "事務所標準の文体ガイドに沿って、能動的な表現への統一を提案します。" },
      ],
    },
    brief: {
      title: "損害賠償請求の申立書・抜粋",
      body: "第1 事実関係\n原告は被告との業務委託契約に基づき、令和6年4月より役務を提供していた。\n\n第2 争点\n被告による契約解除の有効性、及び損害額の算定方法が争点となる。契約解除の有効性については、類似の裁判例（連邦地裁判決集第482巻215頁）が参考になる。\n\n第3 請求の趣旨\n原告は、被告に対し、金●●円及びこれに対する遅延損害金の支払いを求める。",
      findings: [
        { cat: "構成", sev: "suggest", sevLabel: "提案", main: "主張の順序が、事務所標準の型（事実関係→争点→請求の趣旨）と一部異なっています。", sub: "標準構成への並べ替えを提案します。" },
        { cat: "明確さ", sev: "check", sevLabel: "要確認", main: "損害額の算定根拠の説明がやや簡潔です。", sub: "裁判官に伝わりやすいよう、算定根拠の記載を厚くすることを検討してください。" },
        { cat: "引用の正確さ", sev: "fix", sevLabel: "要修正", main: "引用している判例の巻・号・頁の表記に誤りの可能性があります。", sub: "原典との照合を推奨します。" },
        { cat: "事務所文体", sev: "suggest", sevLabel: "提案", main: "事務所標準では冒頭に要旨を置く構成を推奨しています。", sub: "冒頭部分への要旨追加を提案します。" },
      ],
    },
    report: {
      title: "訴訟状況の四半期報告書・抜粋",
      body: "案件A：先方代理人との協議継続中。次回期日は来月上旬を予定。\n案件B：証拠開示手続きが完了し、次のフェーズへ移行。追加でクライアントの確認が必要な事項あり。\n案件C：和解協議が進行中。合意条件の最終調整段階。",
      findings: [
        { cat: "構成", sev: "suggest", sevLabel: "提案", main: "案件ごとの進捗と次のアクションが混在しています。", sub: "事務所標準のテンプレートに沿って「進捗」「リスク」「次のアクション」を分けることを提案します。" },
        { cat: "明確さ", sev: "check", sevLabel: "要確認", main: "専門用語が多く、クライアント向けの要約としてはやや読みにくい可能性があります。", sub: "平易な言葉への言い換えを検討してください。" },
        { cat: "事務所文体", sev: "suggest", sevLabel: "提案", main: "他の報告書と比べて文体のトーンがやや異なります。", sub: "事務所標準の文体ガイドに沿った表現への統一を提案します。" },
      ],
    },
  };

  let currentDoc = "contract";

  const docTypeGrid = document.getElementById("docTypeGrid");
  const docPreview = document.getElementById("docPreview");
  const previewStatus = document.getElementById("previewStatus");
  const reviewRunBtn = document.getElementById("reviewRunBtn");
  const reviewFindings = document.getElementById("reviewFindings");
  const reviewRow = document.getElementById("reviewRow");
  const reviewConfirmBtn = document.getElementById("reviewConfirmBtn");
  const reviewStatus = document.getElementById("reviewStatus");

  function loadDoc(key) {
    currentDoc = key;
    const doc = DOC_CASES[key];
    docPreview.innerHTML = `<span class="doc-title">${doc.title}</span>${doc.body.replace(/\n/g, "<br>")}`;
    previewStatus.textContent = "未レビュー";
    reviewFindings.innerHTML = '<li class="findings-empty">「ファームワイド・プロンプトでレビュー実行」を押すと、ここに指摘候補が表示されます。</li>';
    reviewRow.hidden = true;
    reviewStatus.textContent = "";
    reviewRunBtn.disabled = false;
    reviewRunBtn.textContent = "ファームワイド・プロンプトでレビュー実行";
  }

  if (docTypeGrid) {
    docTypeGrid.addEventListener("click", (e) => {
      const btn = e.target.closest(".doc-type-btn");
      if (!btn) return;
      docTypeGrid.querySelectorAll(".doc-type-btn").forEach((b) => b.classList.toggle("active", b === btn));
      loadDoc(btn.dataset.doc);
    });
  }

  if (reviewRunBtn) {
    reviewRunBtn.addEventListener("click", () => {
      reviewRunBtn.disabled = true;
      reviewRunBtn.textContent = "Harveyがレビュー中…";
      previewStatus.textContent = "レビュー中…";
      setTimeout(() => {
        const doc = DOC_CASES[currentDoc];
        reviewFindings.innerHTML = "";
        doc.findings.forEach((f) => {
          const li = document.createElement("li");
          li.className = "finding-item";
          li.innerHTML = `
            <span class="finding-main"><span class="finding-cat">${f.cat}</span>${f.main}<span class="finding-sub">${f.sub}</span></span>
            <span class="severity-tag ${f.sev}">${f.sevLabel}</span>
          `;
          reviewFindings.appendChild(li);
        });
        previewStatus.textContent = "指摘候補あり";
        reviewRunBtn.disabled = false;
        reviewRunBtn.textContent = "ファームワイド・プロンプトでレビュー実行";
        reviewRow.hidden = false;
        reviewStatus.textContent = "";
        reviewConfirmBtn.disabled = false;
        reviewConfirmBtn.textContent = "弁護士レビュー完了としてマーク（デモ）";
      }, 850);
    });
  }

  if (reviewConfirmBtn) {
    reviewConfirmBtn.addEventListener("click", () => {
      reviewStatus.textContent = "レビュー済み・提出準備が整いました";
      reviewConfirmBtn.disabled = true;
      previewStatus.textContent = "弁護士確認済み";
    });
  }

  loadDoc("contract");

  /* ================================================================
     提案書作成：初回相談から数分でたたき台を生成
     ================================================================ */
  const proposalForm = document.getElementById("proposalForm");
  const proposalOutput = document.getElementById("proposalOutput");
  const proposalStatus = document.getElementById("proposalStatus");
  const proposalMeta = document.getElementById("proposalMeta");
  const metaGenTime = document.getElementById("metaGenTime");
  const proposalSubmit = document.getElementById("proposalSubmit");

  const FOCUS_POINTS = {
    "契約関連（レビュー・交渉）": [
      "対象契約の現状（条項・期間・更新条件）の整理",
      "リスクが高い条項（責任制限・解除条件など）の洗い出し",
      "交渉の優先順位の整理",
    ],
    "紛争・訴訟対応": [
      "紛争の経緯・事実関係の時系列整理",
      "想定される争点と主張の方向性",
      "初動対応（証拠保全・通知等）の要否",
    ],
    "コンプライアンス・規制対応": [
      "関連する規制・ガイドラインの該当性整理",
      "現状の社内体制とのギャップ確認",
      "優先度の高い是正事項の洗い出し",
    ],
    "企業法務全般の顧問対応": [
      "現在の法務体制・相談フローの整理",
      "頻出する相談類型の想定",
      "顧問契約における対応範囲のすり合わせ",
    ],
  };

  function buildProposal(industry, focus, summary) {
    const points = FOCUS_POINTS[focus] || FOCUS_POINTS["企業法務全般の顧問対応"];
    const summaryLine = summary && summary.trim()
      ? summary.trim()
      : `${industry}のお客様より、「${focus}」に関するご相談をいただきました。`;
    return `
      <h4>ご相談の背景整理</h4>
      <p>${summaryLine}</p>
      <h4>想定される論点</h4>
      <ul>${points.map((p) => `<li>${p}</li>`).join("")}</ul>
      <h4>当事務所からのご提案</h4>
      <p>${industry}での対応実績を踏まえ、まずは現状整理のためのヒアリングを実施し、優先度の高い論点から段階的にご支援する進め方をご提案します。契約書・関連資料をお預かりできれば、Harveyによる一次整理をもとに、より具体的な論点をお示しすることも可能です。</p>
      <h4>次のステップ</h4>
      <p>担当パートナー弁護士による詳細ヒアリング（次回30〜45分程度を想定）を設定し、具体的なスコープとお見積りをご案内します。</p>
    `;
  }

  if (proposalForm) {
    proposalForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const industry = document.getElementById("pIndustry").value;
      const focus = document.getElementById("pFocus").value;
      const summary = document.getElementById("pSummary").value;

      proposalSubmit.disabled = true;
      proposalSubmit.textContent = "Harveyが作成中…";
      proposalStatus.textContent = "生成中…";

      setTimeout(() => {
        proposalOutput.innerHTML = buildProposal(industry, focus, summary);
        proposalStatus.textContent = "たたき台を生成しました";
        proposalSubmit.disabled = false;
        proposalSubmit.textContent = "提案書のたたき台を生成する";

        // 実績として報告されている「数分」の範囲内で、デモ用の演出として時間を表示
        const demoMinutes = Math.floor(Math.random() * 4) + 2; // 2〜5分
        metaGenTime.textContent = `約${demoMinutes}分（本デモの演出）`;
        proposalMeta.hidden = false;
      }, 900);
    });
  }

  /* ================================================================
     時間創出シミュレーター
     実績（弁護士1人あたり週7〜10時間超）を根拠に概算する。
     ================================================================ */
  const HOURS_LOW = 7;
  const HOURS_HIGH = 10;
  const WEEKS_PER_MONTH = 4.33;

  const lawyerRange = document.getElementById("lawyerRange");
  const lawyerInput = document.getElementById("lawyerInput");
  const rateInput = document.getElementById("rateInput");
  const simWeekly = document.getElementById("simWeekly");
  const simMonthly = document.getElementById("simMonthly");
  const simValue = document.getElementById("simValue");

  function fmt(n) {
    return Math.round(n).toLocaleString("ja-JP");
  }

  function updateSimulator() {
    const lawyers = Math.max(1, Math.min(2000, Number(lawyerInput.value) || 1));
    const weeklyLow = lawyers * HOURS_LOW;
    const weeklyHigh = lawyers * HOURS_HIGH;
    const monthlyLow = weeklyLow * WEEKS_PER_MONTH;
    const monthlyHigh = weeklyHigh * WEEKS_PER_MONTH;

    simWeekly.textContent = `${fmt(weeklyLow)}〜${fmt(weeklyHigh)}時間`;
    simMonthly.textContent = `${fmt(monthlyLow)}〜${fmt(monthlyHigh)}時間`;

    const rate = Number(rateInput.value);
    if (rate > 0) {
      const valueLow = monthlyLow * rate;
      const valueHigh = monthlyHigh * rate;
      simValue.textContent = `約${fmt(valueLow / 10000)}万円〜${fmt(valueHigh / 10000)}万円`;
    } else {
      simValue.textContent = "単価未入力";
    }
  }

  if (lawyerRange && lawyerInput) {
    lawyerRange.addEventListener("input", () => {
      lawyerInput.value = lawyerRange.value;
      updateSimulator();
    });
    lawyerInput.addEventListener("input", () => {
      let v = Math.max(1, Math.min(2000, Number(lawyerInput.value) || 1));
      lawyerRange.value = Math.min(300, v);
      updateSimulator();
    });
    rateInput.addEventListener("input", updateSimulator);
    updateSimulator();
  }
})();
