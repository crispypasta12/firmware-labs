const KEY = "firmware-labs:completed";

function readCompleted(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(KEY);
    const values = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(values) ? values.filter((v) => typeof v === "string") : []);
  } catch {
    return new Set();
  }
}

function writeCompleted(completed: Set<string>) {
  window.localStorage.setItem(KEY, JSON.stringify([...completed].sort()));
}

function updateDom(completed: Set<string>) {
  document.querySelectorAll<HTMLElement>("[data-progress-lab]").forEach((el) => {
    const slug = el.dataset.progressLab || "";
    const done = completed.has(slug);
    el.dataset.done = done ? "true" : "false";
    el.textContent = done ? "Complete" : "Not complete";
  });

  document.querySelectorAll<HTMLElement>("[data-progress-track]").forEach((el) => {
    const slugs = (el.dataset.progressLabs || "").split(",").filter(Boolean);
    const count = slugs.filter((slug) => completed.has(slug)).length;
    el.textContent = `${count}/${slugs.length}`;
  });
}

export function setupProgressControls() {
  if (typeof window === "undefined") return;
  const completed = readCompleted();
  updateDom(completed);

  document.querySelectorAll<HTMLButtonElement>("[data-progress-toggle]").forEach((button) => {
    const slug = button.dataset.progressToggle || "";
    const render = () => {
      const done = completed.has(slug);
      button.textContent = done ? "Marked complete" : "Mark complete";
      button.setAttribute("aria-pressed", done ? "true" : "false");
    };
    render();
    button.addEventListener("click", () => {
      if (completed.has(slug)) completed.delete(slug);
      else completed.add(slug);
      writeCompleted(completed);
      render();
      updateDom(completed);
    });
  });
}
