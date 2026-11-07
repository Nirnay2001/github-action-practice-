(function (root, factory) {
  const learnspace = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = learnspace;
  } else {
    root.Learnspace = learnspace;
  }
}(globalThis, function () {
  const courseCatalog = [
    {
      id: "design",
      title: "The Art of Seeing",
      instructor: "with Olivia Chen",
      category: "Design",
      cover: "cover-design",
      symbol: "a.",
      lessons: 12,
      duration: "2h 40m",
      progress: 38,
      completed: 4,
      nextLesson: "Finding inspiration in the everyday",
      lessonDuration: "12 min",
      description: "Train your eye to notice the little details that make great design feel effortless.",
    },
    {
      id: "development",
      title: "Creative Coding 101",
      instructor: "with Theo Martins",
      category: "Development",
      cover: "cover-code",
      symbol: "{ }",
      lessons: 16,
      duration: "3h 15m",
      progress: 62,
      completed: 10,
      nextLesson: "Make your first interactive sketch",
      lessonDuration: "18 min",
      description: "Turn a few lines of code into something you can play with, share, and make your own.",
    },
    {
      id: "business",
      title: "Start Small, Grow Well",
      instructor: "with Maya Patel",
      category: "Business",
      cover: "cover-business",
      symbol: "↗",
      lessons: 10,
      duration: "2h 05m",
      progress: 24,
      completed: 2,
      nextLesson: "A business idea worth growing",
      lessonDuration: "14 min",
      description: "Shape a thoughtful idea into a small business that grows at its own pace.",
    },
    {
      id: "writing",
      title: "Words That Connect",
      instructor: "with Alex Rivera",
      category: "Design",
      cover: "cover-writing",
      symbol: "Aa",
      lessons: 8,
      duration: "1h 50m",
      progress: 0,
      completed: 0,
      nextLesson: "Start with a story",
      lessonDuration: "10 min",
      description: "Find a clear, human voice for the things you want to say.",
    },
  ];

  function createCourses() {
    return courseCatalog.map((course) => ({ ...course }));
  }

  function restoreProgress(courses, storedProgress) {
    if (!storedProgress || typeof storedProgress !== "object" || Array.isArray(storedProgress)) {
      return;
    }

    courses.forEach((course) => {
      const completed = storedProgress[course.id];
      if (Number.isInteger(completed) && completed >= 0 && completed <= course.lessons) {
        course.completed = completed;
        course.progress = Math.round((completed / course.lessons) * 100);
      }
    });
  }

  function getVisibleCourses(courses, filters, savedCourseIds = new Set()) {
    const category = filters.category || "All";
    const search = (filters.search || "").trim().toLowerCase();
    const savedOnly = filters.savedOnly === true;
    const inProgressOnly = filters.view === "courses";

    return courses.filter((course) => {
      const matchesCategory = category === "All" || course.category === category;
      const matchesSearch = `${course.title} ${course.instructor} ${course.category}`
        .toLowerCase()
        .includes(search);
      const matchesSaved = !savedOnly || savedCourseIds.has(course.id);
      const matchesProgress = !inProgressOnly || course.completed < course.lessons;
      return matchesCategory && matchesSearch && matchesSaved && matchesProgress;
    });
  }

  function completeLesson(course) {
    if (course.completed >= course.lessons) {
      return false;
    }

    course.completed += 1;
    course.progress = Math.round((course.completed / course.lessons) * 100);
    return true;
  }

  return { completeLesson, createCourses, getVisibleCourses, restoreProgress };
}));
