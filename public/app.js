const {
  completeLesson,
  createCourses,
  getVisibleCourses: filterCourses,
  restoreProgress,
} = window.Learnspace;
const courses = createCourses();

const state = {
  category: "All",
  search: "",
  savedOnly: false,
  currentCourse: courses[0],
  view: "overview",
};

const storageKeys = {
  progress: "learnspace.progress",
  saved: "learnspace.saved",
  streak: "learnspace.streak",
  weeklyHours: "learnspace.weeklyHours",
};
const savedCourseIds = readSavedCourses();

function readSavedCourses() {
  const storedCourses = readStorage(storageKeys.saved, []);
  return Array.isArray(storedCourses) ? new Set(storedCourses) : new Set();
}

function readStorage(key, fallback) {
  const storedValue = localStorage.getItem(key);
  if (storedValue === null) return fallback;

  try {
    return JSON.parse(storedValue);
  } catch (error) {
    console.error(`Unable to read ${key} from local storage.`, error);
    return fallback;
  }
}

let weeklyHours = readStorage(storageKeys.weeklyHours, 2.5);
const storedProgress = readStorage(storageKeys.progress, {});
restoreProgress(courses, storedProgress);

const courseGrid = document.querySelector("#course-grid");
const emptyState = document.querySelector("#empty-state");
const courseSearch = document.querySelector("#course-search");
const toast = document.querySelector("#toast");
const modal = document.querySelector("#lesson-modal");
let toastTimeout;

function getVisibleCourses() {
  return filterCourses(courses, state, savedCourseIds);
}

function renderCourses() {
  const visibleCourses = getVisibleCourses();
  courseGrid.innerHTML = visibleCourses.map((course) => `
    <article class="course-card">
      <button class="course-open" data-open="${course.id}" aria-label="Open ${course.title}">
        <div class="course-cover ${course.cover}">
          <span class="cover-category">${course.category}</span>
          <span class="cover-orb"></span><span class="cover-symbol">${course.symbol}</span>
        </div>
        <div class="course-info">
          <h3>${course.title}</h3>
          <p class="instructor">${course.instructor}</p>
          <div class="course-meta">
            <span>◷ &nbsp;${course.duration} <span>·</span> ${course.lessons} lessons</span>
            <strong>${course.progress}%</strong>
          </div>
          <div class="card-progress" aria-label="${course.progress}% complete"><span style="width: ${course.progress}%"></span></div>
        </div>
      </button>
      <button class="save-button${savedCourseIds.has(course.id) ? " saved" : ""}" data-save="${course.id}" aria-label="${savedCourseIds.has(course.id) ? "Remove from" : "Save to"} saved courses" aria-pressed="${savedCourseIds.has(course.id)}">${savedCourseIds.has(course.id) ? "♥" : "♡"}</button>
    </article>
  `).join("");

  emptyState.hidden = visibleCourses.length !== 0;
  courseGrid.hidden = visibleCourses.length === 0;
  const courseCount = String(visibleCourses.length).padStart(2, "0");
  document.querySelector("#heading-count").textContent = courseCount;
  document.querySelector("#course-count").textContent = visibleCourses.length;
}

function selectFilter(category) {
  state.category = category;
  document.querySelectorAll(".filter-chip").forEach((chip) => {
    const selected = chip.dataset.filter === category;
    chip.classList.toggle("selected", selected);
    chip.setAttribute("aria-pressed", String(selected));
  });
  renderCourses();
}

function setView(view) {
  state.view = view;
  state.savedOnly = view === "saved";
  state.category = "All";
  state.search = "";
  courseSearch.value = "";
  document.querySelector("#breadcrumb-current").textContent =
    view === "overview" ? "Overview" : view === "discover" ? "Discover" : view === "saved" ? "Saved for later" : "My courses";
  document.querySelector("#course-section-title").innerHTML =
    view === "saved"
      ? 'Saved for later <span class="heading-count" id="heading-count">00</span>'
      : view === "courses"
        ? 'Courses in progress <span class="heading-count" id="heading-count">00</span>'
        : view === "discover"
          ? 'Find your next favorite <span class="heading-count" id="heading-count">00</span>'
          : 'Courses in progress <span class="heading-count" id="heading-count">00</span>';
  document.querySelectorAll(".nav-link").forEach((link) => link.classList.toggle("active", link.dataset.view === view));
  document.querySelectorAll(".filter-chip").forEach((chip) => {
    const selected = chip.dataset.filter === "All";
    chip.classList.toggle("selected", selected);
    chip.setAttribute("aria-pressed", String(selected));
  });
  renderCourses();
  document.querySelector("#courses-section").scrollIntoView({ behavior: "smooth", block: "start" });
}

function showToast(message) {
  window.clearTimeout(toastTimeout);
  toast.textContent = message;
  toast.classList.add("visible");
  toastTimeout = window.setTimeout(() => toast.classList.remove("visible"), 2600);
}

function openLesson(course) {
  state.currentCourse = course;
  document.querySelector("#modal-category").textContent = `${course.category.toUpperCase()} · YOUR NEXT LITTLE LESSON`;
  document.querySelector("#modal-title").textContent = course.nextLesson;
  document.querySelector("#modal-description").textContent = course.description;
  document.querySelector("#modal-duration").textContent = `◷ ${course.lessonDuration}`;
  document.querySelector("#modal-step").textContent = `LESSON ${Math.min(course.completed + 1, course.lessons)} OF ${course.lessons}`;
  document.querySelector("#modal-art").textContent = course.symbol;
  document.querySelector("#complete-lesson").disabled = course.completed >= course.lessons;
  document.querySelector("#complete-lesson").innerHTML = course.completed >= course.lessons
    ? "Course complete <span>✓</span>"
    : 'Mark lesson complete <span>→</span>';
  modal.hidden = false;
  document.querySelector("#modal-close").focus();
}

function updateHeroProgress() {
  const course = courses[0];
  document.querySelector("#hero-progress-label").textContent = `${course.completed} of ${course.lessons} lessons`;
  document.querySelector("#hero-progress-bar").style.width = `${course.progress}%`;
  document.querySelector("#hero-progress-value").textContent = `${course.progress}%`;
}

function recordLearningSession() {
  weeklyHours = Math.round((weeklyHours + 0.25) * 100) / 100;
  const nextHours = weeklyHours;
  localStorage.setItem(storageKeys.weeklyHours, JSON.stringify(nextHours));
  document.querySelector("#week-total").textContent = nextHours.toFixed(1);

  const nextStreak = Math.max(5, readStorage(storageKeys.streak, 5));
  localStorage.setItem(storageKeys.streak, JSON.stringify(nextStreak));
  document.querySelector("#streak-value").textContent = `${nextStreak} day streak`;
}

document.querySelectorAll(".filter-chip").forEach((chip) => {
  chip.setAttribute("aria-pressed", String(chip.classList.contains("selected")));
  chip.addEventListener("click", () => {
    state.view = "overview";
    state.savedOnly = false;
    selectFilter(chip.dataset.filter);
  });
});

courseSearch.addEventListener("input", (event) => {
  state.search = event.target.value.trim().toLowerCase();
  renderCourses();
});

courseGrid.addEventListener("click", (event) => {
  const saveButton = event.target.closest("[data-save]");
  if (saveButton) {
    const courseId = saveButton.dataset.save;
    if (savedCourseIds.has(courseId)) {
      savedCourseIds.delete(courseId);
      showToast("Course removed from your saved list.");
    } else {
      savedCourseIds.add(courseId);
      showToast("Course saved for a little later.");
    }
    localStorage.setItem(storageKeys.saved, JSON.stringify([...savedCourseIds]));
    renderCourses();
    return;
  }

  const openButton = event.target.closest("[data-open]");
  if (openButton) {
    const course = courses.find((item) => item.id === openButton.dataset.open);
    if (course) openLesson(course);
  }
});

document.querySelector("#continue-button").addEventListener("click", () => openLesson(courses[0]));

document.querySelector("#complete-lesson").addEventListener("click", () => {
  const course = state.currentCourse;
  if (!completeLesson(course)) return;
  storedProgress[course.id] = course.completed;
  localStorage.setItem(storageKeys.progress, JSON.stringify(storedProgress));
  updateHeroProgress();
  recordLearningSession();
  renderCourses();
  showToast(course.completed === course.lessons ? "You finished the course. What a lovely milestone!" : "Nicely done! Your progress has been saved.");
  modal.hidden = true;
});

document.querySelector("#modal-close").addEventListener("click", () => { modal.hidden = true; });
modal.addEventListener("click", (event) => { if (event.target === modal) modal.hidden = true; });
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    modal.hidden = true;
    document.querySelector("#sidebar").classList.remove("open");
    document.querySelector("#menu-button").setAttribute("aria-expanded", "false");
  }
});

document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    setView(link.dataset.view);
    document.querySelector("#sidebar").classList.remove("open");
    document.querySelector("#menu-button").setAttribute("aria-expanded", "false");
  });
});

document.querySelectorAll(".category-link").forEach((link) => {
  link.addEventListener("click", () => {
    state.view = "overview";
    state.savedOnly = false;
    selectFilter(link.dataset.category);
    document.querySelector("#course-section-title").innerHTML = `${link.dataset.category} courses <span class="heading-count" id="heading-count">00</span>`;
    document.querySelector("#courses-section").scrollIntoView({ behavior: "smooth", block: "start" });
    document.querySelector("#sidebar").classList.remove("open");
    document.querySelector("#menu-button").setAttribute("aria-expanded", "false");
  });
});

document.querySelector("#see-all-button").addEventListener("click", () => setView("courses"));
document.querySelector("#explore-button").addEventListener("click", () => setView("discover"));

document.querySelector("#menu-button").addEventListener("click", (event) => {
  const sidebar = document.querySelector("#sidebar");
  const isOpen = sidebar.classList.toggle("open");
  event.currentTarget.setAttribute("aria-expanded", String(isOpen));
});

document.querySelectorAll(".nav-link").forEach((link) => {
  link.setAttribute("aria-current", link.classList.contains("active") ? "page" : "false");
});

document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    document.querySelectorAll(".nav-link").forEach((item) => {
      item.setAttribute("aria-current", item === link ? "page" : "false");
    });
  });
});

document.querySelector("#today-label").textContent = new Intl.DateTimeFormat("en", {
  weekday: "long",
  month: "long",
  day: "numeric",
}).format(new Date());
document.querySelector("#week-total").textContent = Number(weeklyHours).toFixed(1);
document.querySelector("#streak-value").textContent = `${readStorage(storageKeys.streak, 5)} day streak`;
updateHeroProgress();
renderCourses();
