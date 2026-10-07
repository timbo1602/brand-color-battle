(() => {
  "use strict";
  const data = window.PUB_QUIZ_DATA;
  const categories = data?.categories || [];
  const container = document.getElementById("planned-categories");
  categories.forEach((category) => {
    const tag = document.createElement("span");
    tag.textContent = category.label;
    container.appendChild(tag);
  });
  const questionCount = categories.reduce((total, category) => total + category.questions.length, 0);
  document.getElementById("question-count").textContent = questionCount
    ? `${questionCount} Fragen vorbereitet.`
    : "Noch keine Fragen veröffentlicht.";
})();
