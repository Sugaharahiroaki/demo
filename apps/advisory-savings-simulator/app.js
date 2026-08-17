(() => {
  "use strict";

  /* ---------------- Persona tab switching ---------------- */
  const tabs = document.querySelectorAll(".topbar .tab");
  const views = {
    client: document.getElementById("view-client"),
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
      if (persona === "staff") {
        requestAnimationFrame(renderChartsIfNeeded);
      }
    });
  });

  /* ---------------- Staff home: jump to simulator ---------------- */
  const openSimBtn = document.getElementById("openSimFromStaff");
  if (openSimBtn) {
    openSimBtn.addEventListener("click", () => {
      const clientTab = document.querySelector('.tab[data-persona="client"]');
      if (clientTab) clientTab.click();
      const demoPanel = document.querySelector(".demo-panel");
      if (demoPanel) {
        requestAnimationFrame(() => demoPanel.scrollIntoView({ behavior: "smooth", block: "start" }));
      }
    });
  }

  /* ---------------- Staff sub-nav switching ---------------- */
  const subtabs = document.querySelectorAll(".subtab");
  const panels = {
    home: document.getElementById("panel-home"),
    analysis: document.getElementById("panel-analysis"),
    settings: document.getElementById("panel-settings"),
  };

  subtabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const panel = tab.dataset.panel;
      subtabs.forEach((t) => {
        t.classList.toggle("active", t === tab);
        t.setAttribute("aria-selected", t === tab ? "true" : "false");
      });
      Object.entries(panels).forEach(([key, el]) => {
        el.classList.toggle("active", key === panel);
      });
      if (panel === "analysis") {
        requestAnimationFrame(renderChartsIfNeeded);
      }
    });
  });

  /* ---------------- Simulator (client view) ---------------- */
  const simForm = document.getElementById("simForm");
  const simResult = document.getElementById("simResult");
  const resCurrent = document.getElementById("resCurrent");
  const resProposed = document.getElementById("resProposed");
  const resRange = document.getElementById("resRange");
  const simPointsList = document.getElementById("simPointsList");
  const feeError = document.getElementById("feeError");
  const feeInput = document.getElementById("currentFee");

  // 年商規模ごとの想定倍率。海外事例（既存クライアント平均 +109% ≒ 約2.1倍）を
  // 上限の目安とし、規模に応じて保守的な範囲で調整した参考値。
  const TIER_MULTIPLIER = {
    "30": 1.55,
    "80": 1.75,
    "200": 1.95,
    "400": 2.10,
  };

  const TOPIC_POINTS = {
    tax: [
      "中小企業向け税額控除の適用可否の確認",
      "少額減価償却資産の特例が活用できているか",
      "役員報酬の設計・法人成りの最適化余地",
    ],
    cashflow: [
      "資金繰り表をもとにした資金ショートの早期把握",
      "保証付融資など資金調達手段の活用余地",
      "支払サイト・在庫回転の改善余地",
    ],
    succession: [
      "自社株評価の圧縮余地の試算",
      "事業承継税制の適用可否の確認",
      "後継者への移転スケジュールの検討",
    ],
    growth: [
      "設備投資に伴う税制優遇の適用可否",
      "投資回収シミュレーションの実施",
      "資金調達方法の比較検討",
    ],
  };

  function formatMan(n) {
    return `${n.toLocaleString("ja-JP", { maximumFractionDigits: 1 })}万円`;
  }

  if (simForm) {
    simForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const revenue = document.getElementById("revenue").value;
      const currentFee = parseFloat(feeInput.value);
      const topic = document.getElementById("topic").value;

      if (!currentFee || currentFee <= 0) {
        feeError.hidden = false;
        feeInput.focus();
        simResult.hidden = true;
        return;
      }
      feeError.hidden = true;

      const mult = TIER_MULTIPLIER[revenue] || 1.7;
      const low = Math.max(currentFee * (mult - 0.2), currentFee * 1.2);
      const high = currentFee * (mult + 0.15);
      const proposed = currentFee * mult;

      resCurrent.textContent = formatMan(currentFee);
      resProposed.textContent = `${formatMan(Math.round(proposed * 10) / 10)}/月`;
      const pctLow = Math.round((low / currentFee - 1) * 100);
      const pctHigh = Math.round((high / currentFee - 1) * 100);
      resRange.textContent = `目安レンジ ${formatMan(Math.round(low * 10) / 10)}〜${formatMan(Math.round(high * 10) / 10)}（現行比 +${pctLow}%〜+${pctHigh}%）`;

      simPointsList.innerHTML = "";
      (TOPIC_POINTS[topic] || TOPIC_POINTS.tax).forEach((text) => {
        const li = document.createElement("li");
        li.textContent = text;
        simPointsList.appendChild(li);
      });

      simResult.hidden = false;
      simResult.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  /* ---------------- Staff: today's task list ---------------- */
  const TASKS = [
    { tag: "下書き完了", type: "done", text: "山吹製作所 様 — 節税プランニング試算" },
    { tag: "要確認", type: "warn", text: "北条商事 様 — 事業承継アドバイザリー試算" },
    { tag: "リサーチ中", type: "progress", text: "こはく食品 様 — 設備投資の税制優遇リサーチ" },
    { tag: "下書き完了", type: "done", text: "青葉ロジスティクス 様 — 資金繰り改善試算" },
    { tag: "面談準備中", type: "progress", text: "はなぶさ工業 様 — 来週の面談用データ整理" },
  ];

  const taskList = document.getElementById("taskList");
  if (taskList) {
    TASKS.forEach((t) => {
      const li = document.createElement("li");
      const span = document.createElement("span");
      span.textContent = t.text;
      const tag = document.createElement("span");
      tag.className = `task-tag task-tag--${t.type}`;
      tag.textContent = t.tag;
      li.appendChild(span);
      li.appendChild(tag);
      taskList.appendChild(li);
    });
  }

  /* ---------------- Charts (Chart.js, loaded via CDN) ---------------- */
  let chartsRendered = false;

  function renderChartsIfNeeded() {
    if (chartsRendered || typeof Chart === "undefined") return;
    const trendCanvas = document.getElementById("trendChart");
    const existingCanvas = document.getElementById("existingChart");
    const newClientCanvas = document.getElementById("newClientChart");
    if (!trendCanvas && !existingCanvas && !newClientCanvas) return;
    const anyVisible = [trendCanvas, existingCanvas, newClientCanvas].some((c) => c && c.offsetParent !== null);
    if (!anyVisible) return;

    chartsRendered = true;

    Chart.defaults.font.family = "'Hiragino Sans','Yu Gothic',sans-serif";
    Chart.defaults.color = "#667085";

    if (trendCanvas) {
      new Chart(trendCanvas, {
        type: "line",
        data: {
          labels: ["導入前", "3ヶ月目", "6ヶ月目", "9ヶ月目", "12ヶ月目以降"],
          datasets: [{
            label: "クライアント平均月間請求額（イメージ, USD）",
            data: [146, 190, 230, 270, 305],
            borderColor: "#1e3660",
            backgroundColor: "rgba(30,54,96,0.12)",
            fill: true,
            tension: 0.35,
            pointRadius: 4,
            pointBackgroundColor: "#1e3660",
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { grid: { color: "#e3e7ef" }, ticks: { callback: (v) => "$" + v } },
            x: { grid: { display: false } },
          },
        },
      });
    }

    function barChart(canvas, labels, before, after, colorAfter) {
      if (!canvas) return;
      new Chart(canvas, {
        type: "bar",
        data: {
          labels,
          datasets: [
            { label: "導入前", data: before, backgroundColor: "#aab6cc", borderRadius: 4, barPercentage: 0.5 },
            { label: "導入後", data: after, backgroundColor: colorAfter, borderRadius: 4, barPercentage: 0.5 },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: "bottom" } },
          scales: {
            y: { grid: { color: "#e3e7ef" }, ticks: { callback: (v) => "$" + v } },
            x: { grid: { display: false } },
          },
        },
      });
    }

    barChart(existingCanvas, ["平均月額請求額"], [146], [305], "#1e3660");
    barChart(newClientCanvas, ["契約後12ヶ月平均"], [573], [4588], "#8c6a22");
  }

  // Render once on load in case staff view is default-visible on wide screens later,
  // and also try immediately (client view is default, so this mostly no-ops until switched).
  window.addEventListener("load", renderChartsIfNeeded);
})();
