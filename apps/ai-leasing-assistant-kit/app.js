(() => {
  "use strict";

  /* ---------------- Persona tab switching ---------------- */
  const personaTabs = document.querySelectorAll(".persona-switch .tab");
  const personaViews = {
    renter: document.getElementById("view-renter"),
    agent: document.getElementById("view-agent"),
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

  /* ---------------- Agent sub-screen switching ---------------- */
  const screenTabs = document.querySelectorAll(".screen-tab");
  const screens = {
    home: document.getElementById("agent-home"),
    analysis: document.getElementById("agent-analysis"),
    settings: document.getElementById("agent-settings"),
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
     RENTER VIEW: Kit チャット内見予約デモ
     ================================================================ */
  const UNIT_LABELS = {
    studio: "ワンルーム",
    "1br": "1ベッドルーム",
    "2br": "2ベッドルーム",
  };

  const SLOT_SETS = {
    weeknight: ["火曜 19:30", "水曜 20:00", "木曜 18:30"],
    weekend: ["土曜 10:00", "土曜 14:00", "日曜 11:00"],
    anytime: ["火曜 19:30", "土曜 10:00", "日曜 11:00"],
  };

  // リーシングオフィスは土曜稼働が一般的なため、平日夜間と日曜のみを「時間外」として扱う
  const AFTER_HOURS = new Set(["火曜 19:30", "水曜 20:00", "木曜 18:30", "日曜 11:00"]);

  let currentUnit = "studio";

  const unitPicker = document.getElementById("unitPicker");
  const chatBody = document.getElementById("chatBody");
  const chatQuickReplies = document.getElementById("chatQuickReplies");

  function scrollChatToBottom() {
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function addBubble(from, html) {
    const row = document.createElement("div");
    row.className = `chat-bubble-row from-${from}`;
    if (from === "kit") {
      const avatar = document.createElement("span");
      avatar.className = "chat-mini-avatar";
      avatar.textContent = "K";
      row.appendChild(avatar);
    }
    const bubble = document.createElement("div");
    bubble.className = "chat-bubble";
    bubble.innerHTML = html;
    row.appendChild(bubble);
    chatBody.appendChild(row);
    scrollChatToBottom();
  }

  function addBookingCard(unitLabel, slot) {
    const row = document.createElement("div");
    row.className = "chat-bubble-row from-kit";
    const avatar = document.createElement("span");
    avatar.className = "chat-mini-avatar";
    avatar.textContent = "K";
    row.appendChild(avatar);
    const card = document.createElement("div");
    card.className = "booking-card";
    const afterHours = AFTER_HOURS.has(slot);
    card.innerHTML = `
      <strong>✓ 内見予約が確定しました</strong>
      ${unitLabel}・${slot}<br>
      ${afterHours ? "（営業時間外にKitが自動で設定しました）" : ""}<br>
      現地の担当者にも共有されます。当日は鍵の準備をしてお待ちしています。
    `;
    row.appendChild(card);
    chatBody.appendChild(row);
    scrollChatToBottom();
  }

  function showTyping(callback, delay = 700) {
    const row = document.createElement("div");
    row.className = "chat-bubble-row from-kit";
    row.id = "typingRow";
    const avatar = document.createElement("span");
    avatar.className = "chat-mini-avatar";
    avatar.textContent = "K";
    row.appendChild(avatar);
    const bubble = document.createElement("div");
    bubble.className = "chat-bubble";
    bubble.innerHTML = '<span class="chat-typing"><span></span><span></span><span></span></span>';
    row.appendChild(bubble);
    chatBody.appendChild(row);
    scrollChatToBottom();
    setTimeout(() => {
      const typingRow = document.getElementById("typingRow");
      if (typingRow) typingRow.remove();
      callback();
    }, delay);
  }

  function setQuickReplies(options) {
    chatQuickReplies.innerHTML = "";
    chatQuickReplies.classList.toggle("empty", options.length === 0);
    options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "quick-reply-btn";
      btn.textContent = opt.label;
      btn.addEventListener("click", () => {
        setQuickReplies([]);
        addBubble("user", opt.label);
        showTyping(() => opt.onSelect());
      });
      chatQuickReplies.appendChild(btn);
    });
  }

  function askDayPreference(unitLabel) {
    addBubble("kit", "承知しました。ご希望の曜日・時間帯はありますか？");
    setQuickReplies([
      { label: "平日の夜がいい", onSelect: () => offerSlots(unitLabel, "weeknight") },
      { label: "週末がいい", onSelect: () => offerSlots(unitLabel, "weekend") },
      { label: "いつでも大丈夫", onSelect: () => offerSlots(unitLabel, "anytime") },
    ]);
  }

  function offerSlots(unitLabel, setKey) {
    addBubble("kit", "以下の枠が空いています。ご都合の良い時間をお選びください。");
    const slots = SLOT_SETS[setKey];
    setQuickReplies(
      slots.map((slot) => ({
        label: slot,
        onSelect: () => {
          addBookingCard(unitLabel, slot);
          setTimeout(() => {
            setQuickReplies([{ label: "もう一度体験する", onSelect: () => loadUnit(currentUnit) }]);
          }, 300);
        },
      }))
    );
  }

  function startBookingFlow(unitLabel) {
    askDayPreference(unitLabel);
  }

  function loadUnit(key) {
    currentUnit = key;
    const unitLabel = UNIT_LABELS[key];
    chatBody.innerHTML = "";
    const note = document.createElement("p");
    note.className = "chat-system-note";
    note.textContent = "この会話はAIアシスタント「Kit」による自動応答です";
    chatBody.appendChild(note);
    addBubble("kit", `こんにちは、Rowan Residential Groupの Kitです。${unitLabel}にご興味をお持ちなんですね。今日はどのようなご用件でしょうか？`);
    setQuickReplies([
      {
        label: "内見の予約をしたい",
        onSelect: () => startBookingFlow(unitLabel),
      },
      {
        label: "質問がある",
        onSelect: () => {
          addBubble("kit", "もちろん、何でもお聞きください。ただ、一番早いのは先に内見の日程を押さえてしまうことです。よろしければ予約から進めましょうか？");
          setQuickReplies([{ label: "内見の予約をしたい", onSelect: () => startBookingFlow(unitLabel) }]);
        },
      },
    ]);
  }

  unitPicker.addEventListener("click", (e) => {
    const btn = e.target.closest(".case-btn");
    if (!btn) return;
    unitPicker.querySelectorAll(".case-btn").forEach((b) => b.classList.toggle("active", b === btn));
    loadUnit(btn.dataset.unit);
  });

  loadUnit("studio");

  /* ================================================================
     AGENT VIEW: 対応カバレッジ Before/After（イメージ）
     ================================================================ */
  const coverageChart = document.getElementById("coverageChart");

  function renderCoverageRow(label, cls, startPct, endPct) {
    const row = document.createElement("div");
    row.className = "coverage-row";
    const lbl = document.createElement("span");
    lbl.className = "coverage-row-label";
    lbl.textContent = label;
    const track = document.createElement("div");
    track.className = "coverage-track";
    const fill = document.createElement("div");
    fill.className = `coverage-fill ${cls}`;
    fill.style.left = `${startPct}%`;
    fill.style.width = `${endPct - startPct}%`;
    track.appendChild(fill);
    row.appendChild(lbl);
    row.appendChild(track);
    return row;
  }

  // 導入前：一般的な営業時間帯（9時〜18時）のみ対応と想定（イメージ）
  coverageChart.appendChild(renderCoverageRow("導入前（想定）", "before", 37.5, 75));
  // 導入後：24時間365日、Kitが即時応答（実績）
  coverageChart.appendChild(renderCoverageRow("導入後（実績）", "after", 0, 100));

  const scale = document.createElement("div");
  scale.className = "coverage-scale";
  ["0時", "6時", "12時", "18時", "24時"].forEach((t) => {
    const span = document.createElement("span");
    span.textContent = t;
    scale.appendChild(span);
  });
  coverageChart.appendChild(scale);

  /* ================================================================
     AGENT VIEW: 内見予約 時間帯別シェア（実績: 70〜72%）
     ================================================================ */
  const AFTER_HOURS_MIN = 70;
  const AFTER_HOURS_MAX = 72;
  const AFTER_HOURS_MID = (AFTER_HOURS_MIN + AFTER_HOURS_MAX) / 2;

  const afterSeg = document.querySelector(".split-bar-seg.after");
  const bizSeg = document.querySelector(".split-bar-seg.biz");
  if (afterSeg && bizSeg) {
    afterSeg.style.width = `${AFTER_HOURS_MID}%`;
    bizSeg.style.width = `${100 - AFTER_HOURS_MID}%`;
  }

  /* ================================================================
     AGENT VIEW: 時間外予約 試算シミュレーター
     実績値（時間外シェア70〜72%）を、入力件数に掛け合わせて概算する。
     ================================================================ */
  const tourRange = document.getElementById("tourRange");
  const tourInput = document.getElementById("tourInput");
  const simTours = document.getElementById("simTours");

  function updateTourSim(source) {
    let value = source === "range" ? tourRange.value : tourInput.value;
    value = Math.max(1, Math.min(2000, Number(value) || 1));
    tourRange.value = Math.min(300, value);
    tourInput.value = value;
    const low = Math.round(value * (AFTER_HOURS_MIN / 100));
    const high = Math.round(value * (AFTER_HOURS_MAX / 100));
    simTours.textContent = low === high ? `約${low}件` : `約${low}〜${high}件`;
  }

  tourRange.addEventListener("input", () => updateTourSim("range"));
  tourInput.addEventListener("input", () => updateTourSim("number"));
  updateTourSim("number");

  /* ================================================================
     AGENT VIEW: 覆面調査（ミステリーショップ）評価
     ================================================================ */
  const mysteryBars = document.getElementById("mysteryBars");
  const MYSTERY_CATEGORIES = [
    { label: "即時性", score: 100 },
    { label: "一貫性", score: 100 },
    { label: "パーソナライズ", score: 100 },
    { label: "予約設定", score: 100 },
  ];

  MYSTERY_CATEGORIES.forEach((cat) => {
    const row = document.createElement("div");
    row.className = "mystery-row";
    row.innerHTML = `
      <span class="mystery-label">${cat.label}</span>
      <span class="mystery-track"><span class="mystery-fill" style="width:${cat.score}%"></span></span>
      <span class="mystery-score">${cat.score}/100</span>
    `;
    mysteryBars.appendChild(row);
  });

  /* ================================================================
     AGENT VIEW: 物件ごとの導入設定（見た目のみのデモ）
     ================================================================ */
  const PROPERTY_SETTINGS = [
    { name: "Harborcrest Apartments（実証物件）", kit: true, lea: "ok", state: "ok" },
    { name: "Willowbrook Commons（実証物件）", kit: true, lea: "ok", state: "ok" },
    { name: "Meadow Ridge Apartments", kit: false, lea: "ok", state: "pending" },
    { name: "Brookstone Village", kit: false, lea: "pending", state: "pending" },
  ];

  const propertySettingsBody = document.getElementById("propertySettingsBody");
  PROPERTY_SETTINGS.forEach((p, i) => {
    const tr = document.createElement("tr");
    const leaLabel = p.lea === "ok" ? "連携済み" : "未連携";
    const stateLabel = p.state === "ok" ? "稼働中" : "導入準備中";
    tr.innerHTML = `
      <td>${p.name}</td>
      <td>
        <label class="mini-switch">
          <input type="checkbox" ${p.kit ? "checked" : ""} data-property="${i}">
          <span class="mini-slider"></span>
        </label>
      </td>
      <td><span class="status-pill ${p.lea === "ok" ? "ok" : "pending"}">${leaLabel}</span></td>
      <td><span class="status-pill ${p.state}">${stateLabel}</span></td>
    `;
    propertySettingsBody.appendChild(tr);
  });
})();
