import { Carousel } from "./carousel.js";

const $ = (s) => document.querySelector(s);

let aiSet, configData;

async function loadConfig() {
  try {
    const res = await fetch("public/config.json");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    configData = await res.json();
    if (!Array.isArray(configData.projects)) throw new Error("Invalid config: missing projects array");
    aiSet = new Set((configData.aiSet || []).map(t => t.toLowerCase()));
  } catch (e) {
    console.error("Failed to load config:", e);
    configData = null;
  }
}

function renderFeatured() {
  const root = $("#featuredProject");
  if (!root || !configData) return;

  const project = (configData.projects || []).find((p) => p._featured);
  if (!project) {
    const section = $("#featured");
    if (section) section.hidden = true;
    return;
  }

  const setText = (sel, value) => {
    const el = root.querySelector(sel);
    if (el) el.textContent = value || "";
  };

  setText("#fpName", project.name);
  setText("#fpTagline", project.tagline);
  setText("#fpDesc", project.description);
  setText("#fpRole", project.role);
  setText("#fpType", project.type);

  const status = root.querySelector("#fpStatus");
  if (status) {
    status.textContent = project.status || "";
    status.hidden = !project.status;
  }

  const shot = root.querySelector("#fpShot");
  const shotCaption = root.querySelector("#fpShotCaption");
  const thumbs = root.querySelector("#fpThumbs");

  const gallery = project.gallery?.length
    ? project.gallery
    : project.screenshot
      ? [{ src: project.screenshot, caption: "" }]
      : [];

  if (shot && gallery.length) {
    shot.addEventListener("error", () => {
      shot.closest(".fp-shot")?.classList.add("fp-shot--empty");
    });

    const buttons = [];
    const show = (i) => {
      const frame = gallery[i];
      shot.src = `public/${frame.src}`;
      shot.alt = `${project.name} — ${frame.caption || "product screenshot"}`;
      if (shotCaption) shotCaption.textContent = frame.caption || "";
      buttons.forEach((b, n) => {
        b.classList.toggle("is-active", n === i);
        b.setAttribute("aria-selected", String(n === i));
        b.tabIndex = n === i ? 0 : -1;
      });
    };

    if (thumbs && gallery.length > 1) {
      gallery.forEach((frame, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "fp-thumb";
        b.setAttribute("role", "tab");
        b.title = frame.caption || `Screen ${i + 1}`;
        b.setAttribute("aria-label", frame.caption || `Screen ${i + 1}`);
        const img = document.createElement("img");
        img.src = `public/${frame.src}`;
        img.alt = "";
        img.loading = "lazy";
        img.decoding = "async";
        b.appendChild(img);
        b.addEventListener("click", () => show(i));
        b.addEventListener("keydown", (e) => {
          const delta = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
          if (!delta) return;
          e.preventDefault();
          const next = (i + delta + gallery.length) % gallery.length;
          show(next);
          buttons[next].focus();
        });
        thumbs.appendChild(b);
        buttons.push(b);
      });
    }

    show(0);
  } else if (shot) {
    shot.closest(".fp-shot")?.classList.add("fp-shot--empty");
  }

  const metrics = root.querySelector("#fpMetrics");
  if (metrics) {
    metrics.replaceChildren(
      ...(project.metrics || []).map((m) => {
        const cell = document.createElement("div");
        cell.className = "fp-metric";
        const value = document.createElement("span");
        value.className = "fp-metric-value mono";
        value.textContent = m.value;
        const label = document.createElement("span");
        label.className = "fp-metric-label";
        label.textContent = m.label;
        cell.append(value, label);
        return cell;
      }),
    );
  }

  const stack = root.querySelector("#fpStack");
  if (stack) {
    stack.replaceChildren(
      ...(project.tech || []).map((t) => {
        const chip = document.createElement("span");
        chip.className = "chip";
        chip.textContent = t;
        return chip;
      }),
    );
  }

  const highlights = root.querySelector("#fpHighlights");
  if (highlights) {
    highlights.replaceChildren(
      ...(project.highlights || []).map((h) => {
        const li = document.createElement("li");
        const title = document.createElement("h5");
        title.textContent = h.title;
        const body = document.createElement("p");
        body.textContent = h.body;
        li.append(title, body);
        return li;
      }),
    );
  }

  const actions = root.querySelector("#fpActions");
  if (actions) {
    const links = [];
    if (project.demo) {
      links.push({
        href: project.demo,
        label: project.demoLabel || "Live site",
        className: "btn primary",
      });
    }
    if (project.github) {
      links.push({
        href: project.github,
        label: "Source on GitHub",
        className: "btn ghost",
      });
    }
    actions.replaceChildren(
      ...links.map(({ href, label, className }) => {
        const a = document.createElement("a");
        a.className = className;
        a.href = href;
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = `${label} \u2197`;
        return a;
      }),
    );
  }
}

async function renderProjects() {
  const track = $("#carouselTrack");
  if (!track) return;
  if (!configData) {
    await loadConfig();
  }

  track.innerHTML =
    '<div style="color: var(--ink-dim);">Loading projects...</div>';

  try {
    const data = configData;

    const shippedProjects = data.projects.filter((p) => !p._hidden);
    const numProjects = shippedProjects.length;
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

    let aiTools = [];
    sortedTech.forEach((t) => {
      const lower = t.toLowerCase();
      if (aiSet.has(lower) || lower.includes("ai") || lower.includes("claude"))
        aiTools.push(t);
    });

    const topAi = aiTools.slice(0, 7).join(" · ") || "Claude · Gemini";

    const coreStack = (configData.stack || [])
      .sort((a, b) => b.proficiency - a.proficiency)
      .slice(0, 5)
      .map(t => t.name)
      .join(" · ");

    if ($("#heroCoreStack")) $("#heroCoreStack").textContent = coreStack;
    if ($("#aboutLanguages")) $("#aboutLanguages").textContent = coreStack;
    if ($("#aboutAiTools")) $("#aboutAiTools").textContent = topAi;

    const projects = (data.projects || []).filter(
      (p) => !p._hidden && !p._featured,
    );
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
        img.alt = project.name;
        img.width = 320;
        img.height = 180;
        img.loading = "lazy";
        img.decoding = "async";
        img.addEventListener("load", () => shotDiv.classList.add("has-shot"));
        img.addEventListener("error", () => {
          img.remove();
          shotDiv.classList.remove("has-shot");
          shotDiv.querySelector(".shot-filename").textContent =
            `${project.name.toLowerCase()}.png`;
        });
        img.src = `public/${project.screenshot}`;
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

      const demo = clone.querySelector(".card-cta--demo");
      if (project.demo) {
        demo.href = project.demo;
      } else {
        demo.style.display = "none";
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
  if (!configData) {
    await loadConfig();
  }

  try {
    const stack = configData.stack;

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

document.addEventListener("DOMContentLoaded", async function () {
  await loadConfig();
  if (!configData) {
    const track = $("#carouselTrack");
    if (track) track.innerHTML = '<div style="color: #ffb547;">Failed to load projects. Please refresh.</div>';
    return;
  }
  renderFeatured();
  renderProjects();
  loadStack();
  const footerYear = $("#footerYear");
  if (footerYear) footerYear.textContent = new Date().getFullYear();
});
