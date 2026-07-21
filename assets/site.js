// Dynamo ČB fanouškovský web — sdílená logika
// Data se načítají z /data/*.json (statické soubory, edituje se přes admin.html
// a export -> commit do repozitáře).

const DATA_BASE = "data/";

async function loadJSON(name) {
  try {
    const res = await fetch(DATA_BASE + name, { cache: "no-store" });
    if (!res.ok) throw new Error(res.status);
    return await res.json();
  } catch (e) {
    console.warn("Nepodařilo se načíst", name, e);
    return null;
  }
}

function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d)) return iso;
  return d.toLocaleDateString("cs-CZ", { day: "numeric", month: "long", year: "numeric" });
}

function escapeHTML(s) {
  return (s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function reportCardHTML(r) {
  const hd = r.homeAway === "away" ? "venku" : "doma";
  return `
    <a class="card" href="reportaze.html?id=${encodeURIComponent(r.id)}">
      <div class="kolo">${escapeHTML(r.kolo || "")} · ${hd}</div>
      <h3>Dynamo ${r.homeAway === "away" ? "–" : "vs"} ${escapeHTML(r.opponent || "")}</h3>
      <div class="score-line">${escapeHTML(r.score || "—:—")}</div>
      <p>${escapeHTML(r.perex || "")}</p>
      <div class="date">${fmtDate(r.date)} · ${escapeHTML(r.stadium || "")}</div>
    </a>`;
}

function protocolHTML(r) {
  const home = r.homeAway === "away" ? r.opponent : "Dynamo ČB";
  const away = r.homeAway === "away" ? "Dynamo ČB" : r.opponent;
  return `
    <div class="protocol">
      <div class="protocol-top">
        <span>${escapeHTML(r.kolo || "")}</span>
        <span>${fmtDate(r.date)}</span>
      </div>
      <div class="protocol-score">
        <div class="team away">${escapeHTML(away || "")}</div>
        <div class="score">${escapeHTML(r.score || "—:—")}</div>
        <div class="team home">${escapeHTML(home || "")}</div>
      </div>
      <div class="protocol-meta">
        <span>Stadion: ${escapeHTML(r.stadium || "—")}</span>
        <span>Diváci: ${escapeHTML(r.attendance || "—")}</span>
        ${r.scorers ? `<span>Branky: ${escapeHTML(r.scorers)}</span>` : ""}
      </div>
    </div>`;
}

function tableHTML(rows, clubName) {
  if (!rows || !rows.length) {
    return `<div class="empty">Tabulka zatím není vyplněná — doplň ji přes admin.html.</div>`;
  }
  const body = rows.map((t, i) => `
    <tr class="${t.team === clubName ? "club-row" : ""}">
      <td class="num">${i + 1}</td>
      <td class="team">${escapeHTML(t.team)}</td>
      <td class="num">${t.p ?? ""}</td>
      <td class="num">${t.w ?? ""}</td>
      <td class="num">${t.d ?? ""}</td>
      <td class="num">${t.l ?? ""}</td>
      <td class="num">${t.gf ?? ""}:${t.ga ?? ""}</td>
      <td class="num pts">${t.pts ?? ""}</td>
    </tr>`).join("");
  return `
    <table class="leaguetable">
      <thead><tr>
        <th class="num">#</th><th>Klub</th><th class="num">Z</th><th class="num">V</th>
        <th class="num">R</th><th class="num">P</th><th class="num">Skóre</th><th class="num">B</th>
      </tr></thead>
      <tbody>${body}</tbody>
    </table>`;
}

function setActiveNav() {
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("nav.mainnav a").forEach((a) => {
    if (a.getAttribute("href") === path) a.classList.add("active");
  });
}

document.addEventListener("DOMContentLoaded", setActiveNav);
