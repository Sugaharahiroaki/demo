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

  /* ---------------- Patient view: simulated AI call ---------------- */
  const chatLog = document.getElementById("chatLog");
  const chatForm = document.getElementById("chatForm");
  const chatInput = document.getElementById("chatInput");

  const LOCATIONS = ["表参道院", "梅田院", "栄院", "博多院"];

  function addMessage(text, from) {
    const div = document.createElement("div");
    div.className = `msg ${from}`;
    div.textContent = text;
    chatLog.appendChild(div);
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function aiReply(userText) {
    const text = userText.toLowerCase();

    if (text.includes("変更") || text.includes("キャンセル")) {
      return "予約の変更・キャンセルですね。お名前とご来院予定日を確認できましたら、その場で変更いたします。変更後の空き状況もすぐにご案内できます。";
    }
    if (text.includes("料金") || text.includes("値段") || text.includes("いくら")) {
      return "料金の詳しいご相談は、カウンセラーが直接お話を伺った方が安心かと思います。お名前とご連絡先を伺えれば、担当スタッフより折り返しご連絡いたします。";
    }
    if (text.includes("空") || text.includes("土曜") || text.includes("日曜") || text.includes("午後") || text.includes("午前")) {
      const loc = pick(LOCATIONS);
      const time = pick(["11:00", "13:30", "15:00", "17:30", "19:00"]);
      return `確認しました。${loc}であれば ${time} にお席のご用意が可能です。他の院の空き状況もあわせてご案内できますが、いかがしましょうか？`;
    }
    if (text.includes("予約") || text.includes("ボトックス") || text.includes("施術") || text.includes("メニュー")) {
      const loc = pick(LOCATIONS);
      const time = pick(["11:00", "13:30", "16:00", "18:30"]);
      return `かしこまりました。ご希望のメニューで、${loc}に ${time} のお枠がございます。このままご予約を確定してもよろしいですか？「はい」とご返信いただければ確定します。`;
    }
    if (text.includes("はい") || text.includes("お願い") || text.includes("確定")) {
      return "ご予約を確定しました。前日にリマインドのご連絡をいたします。ご来院、お待ちしております。";
    }
    return "ありがとうございます。ご希望のメニューやご都合の良い時間帯を教えていただけますか？複数院の空き状況をまとめて確認いたします。";
  }

  function handleUserMessage(text) {
    if (!text.trim()) return;
    addMessage(text, "user");
    chatInput.value = "";
    const thinking = document.createElement("div");
    thinking.className = "msg ai";
    thinking.textContent = "…";
    chatLog.appendChild(thinking);
    chatLog.scrollTop = chatLog.scrollHeight;
    setTimeout(() => {
      thinking.remove();
      addMessage(aiReply(text), "ai");
    }, 550);
  }

  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleUserMessage(chatInput.value);
  });

  document.querySelectorAll(".quick").forEach((btn) => {
    btn.addEventListener("click", () => handleUserMessage(btn.dataset.msg));
  });

  addMessage("お電話ありがとうございます、Bloom Aesthetics AI受付です。ご希望のメニューやご相談内容を教えてください。", "ai");

  /* ---------------- Staff view: dashboard mock data ---------------- */
  const hourData = [
    { label: "9時", value: 6, afterHours: false },
    { label: "11時", value: 14, afterHours: false },
    { label: "13時", value: 18, afterHours: false },
    { label: "15時", value: 16, afterHours: false },
    { label: "17時", value: 12, afterHours: false },
    { label: "19時", value: 20, afterHours: true },
    { label: "21時", value: 15, afterHours: true },
    { label: "23時", value: 9, afterHours: true },
  ];

  const hourBars = document.getElementById("hourBars");
  const maxVal = Math.max(...hourData.map((d) => d.value));
  hourData.forEach((d) => {
    const col = document.createElement("div");
    col.className = "bar-col";
    const fill = document.createElement("div");
    fill.className = "bar-fill" + (d.afterHours ? " after-hours" : "");
    fill.style.height = `${(d.value / maxVal) * 100}%`;
    fill.title = `${d.label}: ${d.value}件`;
    const label = document.createElement("span");
    label.className = "bar-label";
    label.textContent = d.label;
    col.appendChild(fill);
    col.appendChild(label);
    hourBars.appendChild(col);
  });

  const escalations = [
    { text: "アレルギー既往歴についての確認依頼", meta: "梅田院 ・ 3分前" },
    { text: "施術の副作用に関する詳しい質問", meta: "表参道院 ・ 9分前" },
    { text: "クレーム対応（前回施術の仕上がり）", meta: "栄院 ・ 22分前" },
    { text: "法人契約プランについての問い合わせ", meta: "博多院 ・ 41分前" },
  ];

  const escalationList = document.getElementById("escalationList");
  escalations.forEach((item) => {
    const li = document.createElement("li");
    li.className = "escalation-item";
    li.innerHTML = `
      <span>
        <span class="esc-text">${item.text}</span>
        <span class="esc-meta">${item.meta}</span>
      </span>
      <button type="button" class="esc-btn">対応する</button>
    `;
    const btn = li.querySelector(".esc-btn");
    btn.addEventListener("click", () => {
      btn.textContent = "対応済み";
      btn.classList.add("done");
      btn.disabled = true;
    });
    escalationList.appendChild(li);
  });

  const queueRows = [
    { time: "19:42", loc: "表参道院", topic: "新規予約（ボトックス）", result: "予約確定", status: "ok" },
    { time: "19:35", loc: "梅田院", topic: "予約変更", result: "変更完了", status: "ok" },
    { time: "19:28", loc: "栄院", topic: "副作用に関する質問", result: "スタッフへ引き継ぎ", status: "escalated" },
    { time: "19:15", loc: "博多院", topic: "空き状況の確認", result: "案内のみ", status: "ok" },
    { time: "19:02", loc: "表参道院", topic: "キャンセル", result: "キャンセル完了", status: "ok" },
    { time: "18:47", loc: "梅田院", topic: "料金の相談", result: "スタッフへ引き継ぎ", status: "escalated" },
  ];

  const queueBody = document.getElementById("queueBody");
  queueRows.forEach((row) => {
    const tr = document.createElement("tr");
    const statusLabel = row.status === "ok" ? "AI完結" : "要対応";
    tr.innerHTML = `
      <td>${row.time}</td>
      <td>${row.loc}</td>
      <td>${row.topic}</td>
      <td>${row.result}</td>
      <td><span class="status-pill ${row.status}">${statusLabel}</span></td>
    `;
    queueBody.appendChild(tr);
  });
})();
