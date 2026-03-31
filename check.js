const screens = Array.from(document.querySelectorAll(".check-screen"));
const ageSelect = document.getElementById("age");
const ageError = document.getElementById("age-error");
const who5Form = document.getElementById("who5-form");
const functioningForm = document.getElementById("functioning-form");
const functioningError = document.getElementById("functioning-error");
const directionForm = document.getElementById("direction-form");
const directionError = document.getElementById("direction-error");
const resultText = document.getElementById("result-text");
const metricWho5 = document.getElementById("metric-who5");
const metricFunctioning = document.getElementById("metric-functioning");
const metricDirection = document.getElementById("metric-direction");
const resultOverloaded = document.getElementById("result-overloaded");
const resultDefaultActions = document.getElementById("result-default-actions");

const WHO_STORAGE_KEY = "kak_ty_who5_answers";
const FUNC_STORAGE_KEY = "kak_ty_functioning_answers";
const DIRECTION_STORAGE_KEY = "kak_ty_direction_answers";
const METRICS_STORAGE_KEY = "kak_ty_metrics";

function showScreen(index) {
  screens.forEach((screen, screenIndex) => {
    screen.classList.toggle("check-screen--active", screenIndex === index);
  });
}

document.querySelectorAll("[data-next]").forEach((btn) => {
  btn.addEventListener("click", () => showScreen(Number(btn.dataset.next)));
});

document.querySelectorAll("[data-prev]").forEach((btn) => {
  btn.addEventListener("click", () => showScreen(Number(btn.dataset.prev)));
});

document.getElementById("age-next").addEventListener("click", () => {
  if (!ageSelect.value) {
    ageError.textContent = "Выбери возраст, чтобы продолжить.";
    return;
  }
  ageError.textContent = "";
  showScreen(2);
});

document.getElementById("who5-next").addEventListener("click", () => {
  showScreen(3);
});

document.getElementById("functioning-next").addEventListener("click", () => {
  const functioningAvg = getFunctioningAverage();

  if (functioningAvg === null) {
    functioningError.textContent = "Отметь хотя бы один пункт, чтобы продолжить.";
    return;
  }
  functioningError.textContent = "";
  showScreen(4);
});

function getFormValues(form) {
  return Array.from(form.querySelectorAll("select")).map((select) =>
    select.value === "" ? null : Number(select.value)
  );
}

function saveFormAnswers(form, storageKey) {
  const payload = {};
  form.querySelectorAll("select").forEach((select) => {
    payload[select.name] = select.value;
  });
  localStorage.setItem(storageKey, JSON.stringify(payload));
}

function restoreFormAnswers(form, storageKey) {
  const saved = localStorage.getItem(storageKey);
  if (!saved) return;

  const payload = JSON.parse(saved);
  form.querySelectorAll("select").forEach((select) => {
    if (payload[select.name] !== undefined) {
      select.value = payload[select.name];
    }
  });
}

function getWho5Average() {
  const answered = getFormValues(who5Form).filter((value) => value !== null);
  if (!answered.length) return null;
  return answered.reduce((sum, value) => sum + value, 0) / answered.length;
}

function getWho5Score() {
  const avg = getWho5Average();
  if (avg === null) return null;
  return avg * 20;
}

function getFunctioningAverage() {
  const answered = getFormValues(functioningForm).filter((value) => value !== null);
  if (!answered.length) return null;
  return answered.reduce((sum, value) => sum + value, 0) / answered.length;
}

function getDirectionMetrics() {
  const transformed = getFormValues(directionForm)
    .map((value, index) => {
      if (value === null) return null;
      if (index === 0 || index === 1) return 6 - value;
      return value;
    })
    .filter((value) => value !== null);

  if (!transformed.length) return null;

  const avg = transformed.reduce((sum, value) => sum + value, 0) / transformed.length;
  const score = ((avg - 1) / 4) * 100;

  return { avg, score };
}

function classifyWho5(score) {
  if (score === null) return "who5_unknown";
  if (score < 50) return "who5_low";
  if (score <= 68) return "who5_mid";
  return "who5_high";
}

function classifyFunctioning(score) {
  if (score <= 1.0) return "functioning_low_impact";
  if (score >= 1.25 && score <= 2.25) return "functioning_noticeable_impact";
  if (score >= 2.5) return "functioning_high_impact";
  return "functioning_borderline";
}

function classifyDirection(score) {
  if (score <= 39) return "direction_low_contact";
  if (score <= 64) return "direction_mixed";
  return "direction_stable_contact";
}

function classifyHeadlineKey(who5Score, functioningAvg, directionScore) {
  if ((who5Score !== null && who5Score < 50) || functioningAvg >= 2.5) {
    return "headline_overloaded";
  }

  if (who5Score !== null && who5Score >= 50 && functioningAvg < 2.5 && directionScore < 40) {
    return "headline_not_only_fatigue";
  }

  if (who5Score !== null && who5Score > 68 && functioningAvg < 1.25 && directionScore >= 65) {
    return "headline_resource_for_depth";
  }

  if (
    (who5Score !== null && who5Score >= 50 && who5Score <= 68) ||
    (functioningAvg >= 1.25 && functioningAvg <= 2.25) ||
    (directionScore >= 40 && directionScore <= 64)
  ) {
    return "headline_unstable_support";
  }

  return "headline_fallback";
}

function headlineByKey(key) {
  const map = {
    headline_overloaded: "Похоже, сейчас на тебе слишком много",
    headline_not_only_fatigue: "Похоже, дело не только в усталости — тебе важно лучше понять себя",
    headline_unstable_support: "Ты держишься, но опора сейчас не очень устойчива",
    headline_resource_for_depth: "У тебя есть ресурс, чтобы разбираться глубже",
    headline_fallback: "Похоже, тебе поможет спокойный разговор со специалистом"
  };
  return map[key] || map.headline_fallback;
}

who5Form.querySelectorAll("select").forEach((select) => {
  select.addEventListener("change", () => saveFormAnswers(who5Form, WHO_STORAGE_KEY));
});

functioningForm.querySelectorAll("select").forEach((select) => {
  select.addEventListener("change", () => saveFormAnswers(functioningForm, FUNC_STORAGE_KEY));
});

directionForm.querySelectorAll("select").forEach((select) => {
  select.addEventListener("change", () => saveFormAnswers(directionForm, DIRECTION_STORAGE_KEY));
});

document.getElementById("direction-next").addEventListener("click", () => {
  const who5Score = getWho5Score();
  const functioningAvg = getFunctioningAverage();
  const direction = getDirectionMetrics();

  if (!direction) {
    directionError.textContent = "Отметь хотя бы один пункт, чтобы получить следующий шаг.";
    return;
  }
  directionError.textContent = "";

  const who5Band = classifyWho5(who5Score);
  const functioningBand = classifyFunctioning(functioningAvg);
  const directionBand = classifyDirection(direction.score);
  const headlineKey = classifyHeadlineKey(who5Score, functioningAvg, direction.score);
  const headline = headlineByKey(headlineKey);

  const metricsPayload = {
    who5: who5Score === null ? null : Number(who5Score.toFixed(0)),
    functioning: Number(functioningAvg.toFixed(2)),
    direction: Number(direction.score.toFixed(0)),
    who5_band: who5Band,
    functioning_band: functioningBand,
    direction_band: directionBand,
    headline_key: headlineKey
  };

  localStorage.setItem(METRICS_STORAGE_KEY, JSON.stringify(metricsPayload));
  renderMetrics(metricsPayload);
  toggleResultBlocks(headlineKey);

  resultText.textContent = headline;

  showScreen(5);
});

function renderMetrics(metrics) {
  metricWho5.textContent = metrics.who5 === null ? "Нет данных" : String(metrics.who5);
  metricFunctioning.textContent = String(metrics.functioning);
  metricDirection.textContent = String(metrics.direction);
}

function toggleResultBlocks(headlineKey) {
  const isOverloaded = headlineKey === "headline_overloaded";
  resultOverloaded.hidden = !isOverloaded;
  resultDefaultActions.hidden = isOverloaded;
}

function restoreMetrics() {
  const saved = localStorage.getItem(METRICS_STORAGE_KEY);
  if (!saved) return;
  const metrics = JSON.parse(saved);
  renderMetrics(metrics);
  toggleResultBlocks(metrics.headline_key);
}

restoreFormAnswers(who5Form, WHO_STORAGE_KEY);
restoreFormAnswers(functioningForm, FUNC_STORAGE_KEY);
restoreFormAnswers(directionForm, DIRECTION_STORAGE_KEY);
restoreMetrics();
