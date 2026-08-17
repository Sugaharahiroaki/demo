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

  /* ---------------- Staff app: screen switching ---------------- */
  const appTabs = document.querySelectorAll(".app-tab");
  const screens = {
    home: document.getElementById("screen-home"),
    draft: document.getElementById("screen-draft"),
    search: document.getElementById("screen-search"),
    analytics: document.getElementById("screen-analytics"),
    simulator: document.getElementById("screen-simulator"),
    settings: document.getElementById("screen-settings"),
  };

  let chartsBooted = false;

  appTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.screen;
      appTabs.forEach((t) => {
        t.classList.toggle("active", t === tab);
        t.setAttribute("aria-selected", t === tab ? "true" : "false");
      });
      Object.entries(screens).forEach(([key, el]) => {
        el.classList.toggle("active", key === target);
      });
      if (!chartsBooted) {
        bootCharts();
        chartsBooted = true;
      }
    });
  });

  /* ================= Document draft simulation ================= */
  const DOC_TYPES = {
    poa: {
      label: "委任状",
      before: 25,
      after: 6,
      build: (c, cp, s) => `
        <h4>委任状（ドラフト）</h4>
        <p class="doc-field"><span class="doc-field-label">委任者</span>${escapeHtml(c)}</p>
        <p class="doc-field"><span class="doc-field-label">受任者</span>弁護士法人 桜坂総合法律事務所　担当：佐伯 直人</p>
        <p class="doc-field"><span class="doc-field-label">委任事項</span>${s || "下記事件に関する一切の裁判上・裁判外の行為"}</p>
        <p>上記委任者は、上記受任者に対し、${cp ? escapeHtml(cp) + "を相手方とする" : ""}下記事件について、訴訟提起、和解交渉、書類の受領その他これに付随する一切の行為を委任する。</p>
        <p class="doc-field"><span class="doc-field-label">作成日</span>${todayLabel()}（クイックドラフトAIによる自動生成）</p>
      `,
    },
    retainer: {
      label: "顧問契約書",
      before: 38,
      after: 10,
      build: (c, cp, s) => `
        <h4>顧問契約書（ドラフト）</h4>
        <p class="doc-field"><span class="doc-field-label">甲（依頼者）</span>${escapeHtml(c)}</p>
        <p class="doc-field"><span class="doc-field-label">乙（受任者）</span>弁護士法人 桜坂総合法律事務所</p>
        <p>甲は乙に対し、${s || "日常の法律相談及び契約書レビュー等の業務"}を委託し、乙はこれを受託する。</p>
        <p>第1条（業務範囲）第2条（顧問料及び支払方法）第3条（秘密保持）第4条（契約期間）……（以下、標準条項に基づき自動挿入）</p>
        <p class="doc-field"><span class="doc-field-label">作成日</span>${todayLabel()}（クイックドラフトAIによる自動生成）</p>
      `,
    },
    brief: {
      label: "準備書面・申立書",
      before: 180,
      after: 45,
      build: (c, cp, s) => `
        <h4>準備書面（ドラフト）</h4>
        <p class="doc-field"><span class="doc-field-label">原告</span>${escapeHtml(c)}</p>
        <p class="doc-field"><span class="doc-field-label">被告</span>${cp ? escapeHtml(cp) : "（未入力）"}</p>
        <p class="doc-field"><span class="doc-field-label">事件の概要</span>${s || "業務委託契約に基づく債権回収請求事件"}</p>
        <p>第1　請求の趣旨に対する主張<br>原告は、被告に対し、上記契約に基づく債務の履行を求める。関連判例・条文候補は「判例AIサーチ」画面から確認できます。</p>
        <p>第2　争点についての主張（AIが過去の類似書面から論点候補を抽出し、たたき台として提示）</p>
        <p class="doc-field"><span class="doc-field-label">作成日</span>${todayLabel()}（クイックドラフトAIによる自動生成）</p>
      `,
    },
    records: {
      label: "資料開示請求書",
      before: 20,
      after: 5,
      build: (c, cp, s) => `
        <h4>資料開示請求書（ドラフト）</h4>
        <p class="doc-field"><span class="doc-field-label">請求者</span>${escapeHtml(c)}</p>
        <p class="doc-field"><span class="doc-field-label">請求先</span>${cp ? escapeHtml(cp) : "（未入力）"}</p>
        <p>下記事件の遂行にあたり、${s || "関連する取引記録・契約関連資料一式"}の開示を請求いたします。</p>
        <p>つきましては、本書面到達後2週間以内に、上記資料の写しをご送付くださいますようお願い申し上げます。</p>
        <p class="doc-field"><span class="doc-field-label">作成日</span>${todayLabel()}（クイックドラフトAIによる自動生成）</p>
      `,
    },
    notice: {
      label: "内容証明郵便",
      before: 15,
      after: 4,
      build: (c, cp, s) => `
        <h4>内容証明郵便（ドラフト）</h4>
        <p class="doc-field"><span class="doc-field-label">差出人</span>${escapeHtml(c)}（代理人　弁護士法人 桜坂総合法律事務所）</p>
        <p class="doc-field"><span class="doc-field-label">受取人</span>${cp ? escapeHtml(cp) : "（未入力）"}</p>
        <p>前略　貴殿に対し、${s || "下記の件"}について通知いたします。本書面到達後2週間以内に、誠意あるご対応をいただけない場合、やむを得ず法的手続を検討せざるを得ません。</p>
        <p class="doc-field"><span class="doc-field-label">作成日</span>${todayLabel()}（クイックドラフトAIによる自動生成）</p>
      `,
    },
  };

  function todayLabel() {
    const d = new Date();
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  }

  function escapeHtml(str) {
    return String(str || "").replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[ch]));
  }

  let selectedDoc = "poa";
  const docTypeGrid = document.getElementById("docTypeGrid");
  docTypeGrid.querySelectorAll(".doc-type-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedDoc = btn.dataset.doc;
      docTypeGrid.querySelectorAll(".doc-type-btn").forEach((b) => b.classList.toggle("active", b === btn));
    });
  });

  const draftForm = document.getElementById("draftForm");
  const draftOutput = document.getElementById("draftOutput");
  const draftStatus = document.getElementById("draftStatus");
  const draftMeta = document.getElementById("draftMeta");
  const metaThisTime = document.getElementById("metaThisTime");
  const metaBeforeTime = document.getElementById("metaBeforeTime");
  const draftSubmit = document.getElementById("draftSubmit");

  draftForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const doc = DOC_TYPES[selectedDoc];
    const client = document.getElementById("fClient").value.trim() || "（依頼者名未入力）";
    const counter = document.getElementById("fCounter").value.trim();
    const summary = document.getElementById("fSummary").value.trim();

    draftSubmit.disabled = true;
    draftStatus.textContent = "生成中…";
    draftOutput.classList.add("loading");
    draftOutput.innerHTML = `<span class="spinner" aria-hidden="true"></span><span>クイックドラフトAIが${doc.label}のドラフトを作成しています…</span>`;
    draftMeta.hidden = true;

    setTimeout(() => {
      draftOutput.classList.remove("loading");
      draftOutput.innerHTML = doc.build(client, counter, summary);
      draftStatus.textContent = "ドラフト生成完了";
      metaThisTime.textContent = `約${doc.after}分`;
      metaBeforeTime.textContent = `約${doc.before}分`;
      draftMeta.hidden = false;
      draftSubmit.disabled = false;
    }, 1100);
  });

  /* ================= Case search simulation ================= */
  const searchForm = document.getElementById("searchForm");
  const searchInput = document.getElementById("searchInput");
  const searchResults = document.getElementById("searchResults");

  const CASE_DB = [
    {
      match: ["業務委託", "債務不履行", "損害賠償"],
      title: "業務委託契約における債務不履行に基づく損害賠償請求事件",
      cite: "最高裁判所 第三小法廷 判例集要旨（民集）／類似事案 3件",
      snippet: "業務委託契約の履行遅滞について、契約書上の履行期限の記載と実際の履行状況を照らし合わせ、催告の要否が争点となった事案。催告なしの解除が認められた例として参照可。",
      score: 92,
    },
    {
      match: ["残業代", "消滅時効", "未払い"],
      title: "未払い残業代請求における消滅時効の起算点に関する裁判例",
      cite: "労働関係民事裁判例集／類似事案 5件",
      snippet: "賃金請求権の消滅時効の起算点について、給与支払日を基準とした判断枠組みを整理。時効の起算点・中断事由の主張構成のたたき台として利用可能。",
      score: 88,
    },
    {
      match: ["契約解除", "予告期間", "妥当性"],
      title: "継続的取引契約の解除における予告期間の相当性が争われた事案",
      cite: "下級裁判所裁判例集／類似事案 4件",
      snippet: "継続的契約関係の解除にあたり、取引期間・依存度を踏まえた相当な予告期間の考え方を示した裁判例。予告期間の妥当性を主張する際の参考条文候補も併せて表示。",
      score: 85,
    },
  ];

  function renderSearchResults(query) {
    const q = query.toLowerCase();
    const matched = CASE_DB.filter((item) => item.match.some((kw) => q.includes(kw.toLowerCase())));
    const results = matched.length ? matched : [CASE_DB[0]];

    searchResults.innerHTML = "";
    results.forEach((item) => {
      const card = document.createElement("div");
      card.className = "result-card";
      card.innerHTML = `
        <div class="result-head">
          <span class="result-title">${item.title}</span>
          <span class="result-score">関連度 ${item.score}%</span>
        </div>
        <p class="result-cite">${item.cite}</p>
        <p class="result-snippet">${item.snippet}</p>
      `;
      searchResults.appendChild(card);
    });
    const note = document.createElement("p");
    note.className = "search-note";
    note.textContent = "※検索結果は参考情報です。実際の主張構成・引用の可否は担当弁護士が最終確認します。";
    searchResults.appendChild(note);
  }

  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = searchInput.value.trim();
    if (!q) return;
    renderSearchResults(q);
  });

  document.querySelectorAll(".quick[data-q]").forEach((btn) => {
    btn.addEventListener("click", () => {
      searchInput.value = btn.dataset.q;
      renderSearchResults(btn.dataset.q);
    });
  });

  searchResults.innerHTML = '<p class="search-placeholder">検索したい内容を入力するか、上のクイック候補を選んでください。</p>';

  /* ================= Simulator ================= */
  const simCount = document.getElementById("simCount");
  const simMinutes = document.getElementById("simMinutes");
  const simAfterMinutes = document.getElementById("simAfterMinutes");
  const simMonthlyHours = document.getElementById("simMonthlyHours");
  const simYearlyHours = document.getElementById("simYearlyHours");
  const simExtraCases = document.getElementById("simExtraCases");

  function runSimulator() {
    const count = Math.max(0, Number(simCount.value) || 0);
    const minutes = Math.max(0, Number(simMinutes.value) || 0);
    const after = minutes * 0.25;
    const savedPerDoc = minutes - after;
    const monthlyMinutesSaved = count * savedPerDoc;
    const monthlyHours = monthlyMinutesSaved / 60;
    const yearlyHours = monthlyHours * 12;
    const extraCases = Math.floor(monthlyMinutesSaved / 60);

    simAfterMinutes.textContent = `約${after.toFixed(1)}分`;
    simMonthlyHours.textContent = `約${monthlyHours.toFixed(1)}時間`;
    simYearlyHours.textContent = `約${yearlyHours.toFixed(0)}時間`;
    simExtraCases.textContent = `月${extraCases}件相当`;
  }

  [simCount, simMinutes].forEach((el) => el.addEventListener("input", runSimulator));
  runSimulator();

  /* ================= Charts ================= */
  function bootCharts() {
    if (typeof Chart === "undefined") return;

    Chart.defaults.font.family = "'Hiragino Sans','Yu Gothic',system-ui,sans-serif";
    Chart.defaults.color = "#626e7d";

    const docLabels = ["委任状", "顧問契約書", "準備書面・申立書", "資料開示請求書", "内容証明郵便"];
    const docCounts = [30, 18, 14, 40, 26];
    const beforeMinutes = [25, 38, 180, 20, 15];
    const afterMinutes = [6, 10, 45, 5, 4];

    const homeVolumeEl = document.getElementById("chartHomeVolume");
    if (homeVolumeEl) {
      new Chart(homeVolumeEl, {
        type: "bar",
        data: {
          labels: docLabels,
          datasets: [{
            label: "作成件数",
            data: docCounts,
            backgroundColor: "#2e5580",
            borderRadius: 4,
            maxBarThickness: 36,
          }],
        },
        options: {
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, grid: { color: "#e6ecf3" } }, x: { grid: { display: false } } },
        },
      });
    }

    const homeTrendEl = document.getElementById("chartHomeTrend");
    if (homeTrendEl) {
      new Chart(homeTrendEl, {
        type: "line",
        data: {
          labels: ["3月", "4月", "5月", "6月", "7月", "8月"],
          datasets: [{
            label: "月間削減時間（時間）",
            data: [18, 26, 34, 45, 55, 66],
            borderColor: "#96731f",
            backgroundColor: "rgba(150,115,31,0.12)",
            fill: true,
            tension: 0.35,
            pointRadius: 3,
          }],
        },
        options: {
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, grid: { color: "#e6ecf3" } }, x: { grid: { display: false } } },
        },
      });
    }

    const beforeAfterEl = document.getElementById("chartAnalyticsBeforeAfter");
    if (beforeAfterEl) {
      new Chart(beforeAfterEl, {
        type: "bar",
        data: {
          labels: docLabels,
          datasets: [
            { label: "導入前（分）", data: beforeMinutes, backgroundColor: "#c9d3df", borderRadius: 4, maxBarThickness: 26 },
            { label: "AI活用後（分）", data: afterMinutes, backgroundColor: "#2e5580", borderRadius: 4, maxBarThickness: 26 },
          ],
        },
        options: {
          plugins: { legend: { position: "bottom" } },
          scales: { y: { beginAtZero: true, grid: { color: "#e6ecf3" } }, x: { grid: { display: false } } },
        },
      });
    }

    const breakdownEl = document.getElementById("chartAnalyticsBreakdown");
    if (breakdownEl) {
      new Chart(breakdownEl, {
        type: "doughnut",
        data: {
          labels: docLabels,
          datasets: [{
            data: docCounts,
            backgroundColor: ["#12233b", "#2e5580", "#3f6a97", "#96731f", "#b08d3f"],
            borderWidth: 2,
            borderColor: "#ffffff",
          }],
        },
        options: {
          plugins: { legend: { position: "bottom", labels: { boxWidth: 12, font: { size: 11 } } } },
        },
      });
    }
  }

  // Boot charts immediately for the default "home" screen (first view a staff user sees
  // once they switch personas), and again lazily when other screens are opened.
  document.addEventListener("DOMContentLoaded", () => {
    if (!chartsBooted) {
      bootCharts();
      chartsBooted = true;
    }
  });
})();
