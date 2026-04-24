import { Carousel } from "./carousel.js";

const $ = (s) => document.querySelector(s);

const stackSet = new Set([
  "typescript",
  "python",
  "rust",
  "javascript",
  "ts",
  "js",
  "react",
  "next.js",
  "sveltekit",
  "drizzle orm",
  "sqlite",
  "tailwind css",
]);
const aiSet = new Set([
  "gemini ai",
  "claude sdk",
  "claude api",
  "muapi.ai",
  "mcp",
  "elevenlabs",
  "claude",
]);

async function renderProjects() {
  const track = $("#carouselTrack");
  if (!track) return;

  track.innerHTML =
    '<div style="color: var(--ink-dim);">Loading projects...</div>';

  try {
    const response = await fetch("public/projects.json");
    const data = await response.json();

    const numProjects = data.projects.length;
    if ($("#aboutShipped"))
      $("#aboutShipped").textContent = `${numProjects} projects`;

    let allTech = [];
    data.projects.forEach((p) => {
      if (p.tech) allTech.push(...p.tech);
    });

    let techCounts = {};
    allTech.forEach((t) => {
      techCounts[t] = (techCounts[t] || 0) + 1;
    });
    let sortedTech = Object.keys(techCounts).sort(
      (a, b) => techCounts[b] - techCounts[a],
    );

    let stack = [],
      aiTools = [],
      tools = [];
    sortedTech.forEach((t) => {
      const lower = t.toLowerCase();
      if (aiSet.has(lower) || lower.includes("ai") || lower.includes("claude"))
        aiTools.push(t);
      else if (stackSet.has(lower)) stack.push(t);
      else tools.push(t);
    });

    const topStack = stack.slice(0, 7).join(" · ") || "TS · Python · React";
    const topAi = aiTools.slice(0, 7).join(" · ") || "Claude · Gemini";
    const topTools = tools.slice(0, 7).join(" · ") || "Vite · Playwright";

    if ($("#heroStack")) $("#heroStack").textContent = topStack;
    if ($("#heroTools")) $("#heroTools").textContent = topTools;
    if ($("#aboutLanguages")) $("#aboutLanguages").textContent = topStack;
    if ($("#aboutAiTools")) $("#aboutAiTools").textContent = topAi;

    const projects = data.projects || [];
    track.innerHTML = "";

    const carousel = new Carousel(
      "#carouselTrack",
      "#carPrev",
      "#carNext",
      "#carouselIdx",
    );
    const carItems = [];
    const template = document.getElementById("project-card-template").content;

    projects.forEach((project, index) => {
      const clone = template.cloneNode(true);
      const card = clone.querySelector(".card");

      const shotDiv = clone.querySelector(".card-shot");
      if (project.screenshot) {
        const img = document.createElement("img");
        img.src = `public/${project.screenshot}`;
        img.onload = () => img.classList.add("loaded");
        shotDiv.innerHTML = "";
        shotDiv.appendChild(img);
      } else {
        clone.querySelector(".shot-filename").textContent =
          `${project.name.toLowerCase()}.png`;
      }

      clone.querySelector(".card-tag").textContent = project.type;
      clone.querySelector(".card-year").textContent = project.version;
      clone.querySelector(".project-name").textContent = project.name;
      clone.querySelector(".card-desc").textContent = project.description;

      const stackDiv = clone.querySelector(".card-stack");
      const tags = (project.tech || []).slice(0, 4);
      tags.forEach((t) => {
        const span = document.createElement("span");
        span.className = "chip";
        span.textContent = t;
        stackDiv.appendChild(span);
      });

      const cta = clone.querySelector(".card-cta");
      cta.href = project.github || "#";
      if (!project.github) {
        cta.style.opacity = ".4";
        cta.style.pointerEvents = "none";
      }

      card.addEventListener("click", (e) => {
        if (!card.classList.contains("active")) {
          e.preventDefault();
          carousel.goTo(index);
        }
      });

      track.appendChild(clone);
      carItems.push(card);
    });

    carousel.setItems(carItems);
  } catch (err) {
    console.error("Failed to load projects:", err);
    const track = $("#carouselTrack");
    if (track) {
      track.innerHTML =
        '<div style="color: #ffb547;">Error loading projects. Make sure to run the local server.</div>';
    }
  }
}

async function loadStack() {
  const grid = document.getElementById("stack-grid");
  if (!grid) return;

  try {
    const res = await fetch("public/stack.json");
    const { stack } = await res.json();

    const groups = {};
    stack.forEach((t) => {
      if (!groups[t.category]) groups[t.category] = [];
      groups[t.category].push(t);
    });

    grid.innerHTML = Object.entries(groups)
      .map(
        ([cat, items]) => `
        <div class="stack-group">
          <h4>${cat}</h4>
          <ul>${items
            .map(
              (t) => `
            <li>
              <span>${t.name}</span>
              <span class="bar"><span style="width:${t.proficiency}%"></span></span>
            </li>`,
            )
            .join("")}
          </ul>
        </div>`,
      )
      .join("");
  } catch (err) {
    console.error("Failed to load stack:", err);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  renderProjects();
  loadStack();
  const footerYear = $("#footerYear");
  if (footerYear) footerYear.textContent = new Date().getFullYear();
});
