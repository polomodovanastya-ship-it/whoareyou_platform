const form = document.getElementById("state-form");
const error = document.getElementById("form-error");
const resultCard = document.getElementById("state-result");
const title = document.getElementById("state-title");
const text = document.getElementById("state-text");
const prompts = document.getElementById("state-prompts");
const STORAGE_ANSWERS_KEY = "kak_ty_state_answers_v1";
const STORAGE_RESULT_KEY = "kak_ty_state_result_v1";

function getValues() {
  return Array.from(form.querySelectorAll("select")).map((select) => Number(select.value));
}

function buildResult(values) {
  const avg = values.reduce((sum, value) => sum + value, 0) / values.length;

  if (avg <= 2.2) {
    return {
      title: "Сейчас, похоже, тебе тяжело",
      text: "Это не оценка и не диагноз. Похоже, ресурса сейчас мало, и важно дать себе больше поддержки.",
      prompts: [
        "Что в последние дни забирает у меня больше всего сил?",
        "Кому я могу написать сегодня, чтобы не оставаться с этим в одиночку?",
        "Что будет самым маленьким бережным шагом для меня сегодня?"
      ]
    };
  }

  if (avg <= 3.4) {
    return {
      title: "Состояние смешанное",
      text: "Похоже, часть сфер держится, а часть проседает. Это частая картина при перегрузе и неопределенности.",
      prompts: [
        "В каких ситуациях мне становится заметно легче, а в каких тяжелее?",
        "Что из моего расписания можно упростить на этой неделе?",
        "Где мне сейчас нужнее поддержка: учеба, отношения, сон или тревога?"
      ]
    };
  }

  return {
    title: "Есть опора, с которой можно двигаться дальше",
    text: "Сейчас у тебя сохранен ресурс. Можно использовать его, чтобы лучше понять себя и не доводить до срыва.",
    prompts: [
      "Что помогает мне чувствовать себя устойчивее?",
      "Какие мои привычки поддержки точно стоит сохранить?",
      "Какой вопрос о себе я давно откладывал(а), но хочу разобрать спокойно?"
    ]
  };
}

function renderResult(result) {
  title.textContent = result.title;
  text.textContent = result.text;
  prompts.innerHTML = result.prompts.map((item) => `<li>${item}</li>`).join("");
  resultCard.hidden = false;
}

function saveAnswers(values) {
  localStorage.setItem(STORAGE_ANSWERS_KEY, JSON.stringify(values));
}

function saveResult(result) {
  localStorage.setItem(STORAGE_RESULT_KEY, JSON.stringify(result));
}

function restoreState() {
  const savedAnswersRaw = localStorage.getItem(STORAGE_ANSWERS_KEY);
  if (savedAnswersRaw) {
    try {
      const savedAnswers = JSON.parse(savedAnswersRaw);
      const selects = form.querySelectorAll("select");
      savedAnswers.forEach((value, index) => {
        if (selects[index] && Number.isFinite(value) && value >= 1 && value <= 5) {
          selects[index].value = String(value);
        }
      });
    } catch {
      localStorage.removeItem(STORAGE_ANSWERS_KEY);
    }
  }

  const savedResultRaw = localStorage.getItem(STORAGE_RESULT_KEY);
  if (savedResultRaw) {
    try {
      const savedResult = JSON.parse(savedResultRaw);
      if (
        savedResult &&
        typeof savedResult.title === "string" &&
        typeof savedResult.text === "string" &&
        Array.isArray(savedResult.prompts)
      ) {
        renderResult(savedResult);
      }
    } catch {
      localStorage.removeItem(STORAGE_RESULT_KEY);
    }
  }
}

if (form) {
  restoreState();

  form.querySelectorAll("select").forEach((select) => {
    select.addEventListener("change", () => {
      saveAnswers(getValues());
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    error.textContent = "";

    const values = getValues();

    if (values.some((value) => Number.isNaN(value))) {
      error.textContent = "Ответь на все вопросы, чтобы увидеть результат.";
      return;
    }

    const result = buildResult(values);
    saveAnswers(values);
    saveResult(result);
    renderResult(result);
    resultCard.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}
