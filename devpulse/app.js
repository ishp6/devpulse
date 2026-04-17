// app.js — DevPulse core logic

/**
 * DevPulse sends code to an AI backend for review.
 * 
 * HOW TO WIRE UP YOUR OWN AI BACKEND:
 * Replace the `callAI(prompt)` function below with a call to your
 * own backend (Node/Express, FastAPI, etc.) that proxies to the
 * Anthropic API — never expose your API key in frontend code.
 *
 * Example backend endpoint: POST /api/review
 * Body: { code, language }
 * Response: { score, skill_level, issues: [...], learn_next: {...} }
 */

const STATUS_EL = document.getElementById('status');
const RESULT_EL = document.getElementById('result');

// ── Score helpers ──────────────────────────────────────────────

function scoreColor(score) {
  if (score >= 80) return '#4dd9b8';
  if (score >= 60) return '#f7c843';
  return '#f97b6b';
}

function scoreLabel(score) {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Needs Work';
  return 'Critical Issues';
}

function skillStyle(score) {
  if (score >= 85) return { label: 'Senior-level',  color: '#4dd9b8', bg: 'rgba(77,217,184,0.12)',  border: 'rgba(77,217,184,0.25)' };
  if (score >= 70) return { label: 'Mid-level',     color: '#7c6dfa', bg: 'rgba(124,109,250,0.12)', border: 'rgba(124,109,250,0.25)' };
  if (score >= 50) return { label: 'Junior-level',  color: '#f7c843', bg: 'rgba(247,200,67,0.12)',  border: 'rgba(247,200,67,0.25)' };
  return             { label: 'Beginner',           color: '#f97b6b', bg: 'rgba(249,123,107,0.12)', border: 'rgba(249,123,107,0.25)' };
}

// ── Render result ──────────────────────────────────────────────

function renderResult(data) {
  const { score = 0, issues = [], learn_next = {} } = data;
  const color = scoreColor(score);
  const skill = skillStyle(score);

  const issueTypeColors = { error: '#f97b6b', warn: '#f7c843', good: '#4dd9b8', info: '#7c6dfa' };
  const issueTypeLabels = { error: 'bug', warn: 'perf', good: 'good', info: 'tip' };

  const issuesHTML = issues.map(issue => {
    const c = issueTypeColors[issue.type] || '#7c6dfa';
    const lbl = issueTypeLabels[issue.type] || 'note';
    const snip = issue.suggestion
      ? `<div class="code-snip">${escHtml(issue.suggestion)}</div>`
      : '';
    return `
      <div class="issue ${issue.type}">
        <div class="issue-head">
          <span class="tag ${issue.type}">${lbl}</span>
          ${escHtml(issue.title)}
        </div>
        <div class="issue-body">${escHtml(issue.description)}${snip}</div>
      </div>`;
  }).join('');

  const learnHTML = learn_next.topic ? `
    <div class="rc-learn">
      <div class="learn-label">what to learn next</div>
      <div class="learn-topic">${escHtml(learn_next.topic)}</div>
      <div class="learn-body">${escHtml(learn_next.reason)}</div>
    </div>` : '';

  RESULT_EL.innerHTML = `
    <div class="result-card">
      <div class="rc-header">
        <div class="rc-score-wrap">
          <span class="rc-score" style="color:${color}">${score}</span>
          <span class="rc-score-label">/ 100 — ${scoreLabel(score)}</span>
        </div>
        <span class="rc-skill" style="color:${skill.color};background:${skill.bg};border:1px solid ${skill.border}">${skill.label}</span>
      </div>
      <div class="rc-issues">${issuesHTML}</div>
      ${learnHTML}
    </div>`;
}

// ── AI call (replace with your backend) ───────────────────────

async function callAI(code, language) {
  /**
   * TODO: Replace this with a real backend call, e.g.:
   *
   * const res = await fetch('/api/review', {
   *   method: 'POST',
   *   headers: { 'Content-Type': 'application/json' },
   *   body: JSON.stringify({ code, language })
   * });
   * return res.json();
   *
   * Your backend should call the Anthropic API with a prompt like
   * the one in BACKEND_PROMPT below and return parsed JSON.
   */
  throw new Error('No backend connected. See app.js for wiring instructions.');
}

// The prompt your backend should send to the Anthropic API:
const BACKEND_PROMPT = `
You are DevPulse, an expert code reviewer. Analyze the provided code and respond ONLY with a JSON object.

JSON format:
{
  "score": <integer 0-100>,
  "skill_level": "<Beginner|Junior|Mid-level|Senior>",
  "issues": [
    {
      "type": "<error|warn|info|good>",
      "title": "<short title>",
      "description": "<1-2 sentence explanation>",
      "suggestion": "<1 line of improved code or null>"
    }
  ],
  "learn_next": {
    "topic": "<topic to study>",
    "reason": "<1 sentence why>"
  }
}

Rules:
- 3 to 5 issues (mix of problems and positives)
- "good" type = something done well
- suggestion = actual code when possible, otherwise null
`.trim();

// ── Main review function ───────────────────────────────────────

async function review() {
  const code = document.getElementById('code').value.trim();
  const lang = document.getElementById('lang').value;

  if (!code) {
    STATUS_EL.textContent = 'paste some code first';
    return;
  }

  STATUS_EL.textContent = 'analysing...';
  RESULT_EL.innerHTML = `<p class="dp-placeholder">Reviewing your ${lang} code...</p>`;

  try {
    const result = await callAI(code, lang);
    renderResult(result);
    STATUS_EL.textContent = `score: ${result.score ?? '—'}`;
  } catch (err) {
    RESULT_EL.innerHTML = `
      <p class="dp-placeholder" style="color:#f97b6b">
        Backend not connected.<br><br>
        Open <code>app.js</code> and replace <code>callAI()</code>
        with a fetch to your own API server.<br><br>
        See the comment block at the top of app.js for details.
      </p>`;
    STATUS_EL.textContent = 'not connected';
    console.error(err);
  }
}

// ── Utility ───────────────────────────────────────────────────

function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
