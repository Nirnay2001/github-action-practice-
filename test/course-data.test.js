const test = require("node:test");
const assert = require("node:assert/strict");
const {
  completeLesson,
  createCourses,
  getVisibleCourses,
  restoreProgress,
} = require("../public/course-data.js");

test("creates independent copies of the course catalog", () => {
  const first = createCourses();
  const second = createCourses();

  first[0].completed = 0;

  assert.equal(first.length, 4);
  assert.equal(second[0].completed, 4);
  assert.equal(new Set(first.map((course) => course.id)).size, first.length);
});

test("filters courses by category", () => {
  const designCourses = getVisibleCourses(createCourses(), { category: "Design" });

  assert.deepEqual(designCourses.map((course) => course.id), ["design", "writing"]);
});

test("searches course titles, instructors, and categories case-insensitively", () => {
  const courses = createCourses();

  assert.deepEqual(
    getVisibleCourses(courses, { search: "  OLIVIA  " }).map((course) => course.id),
    ["design"],
  );
  assert.deepEqual(
    getVisibleCourses(courses, { search: "development" }).map((course) => course.id),
    ["development"],
  );
});

test("combines category and search filters", () => {
  const matches = getVisibleCourses(createCourses(), {
    category: "Design",
    search: "words",
  });

  assert.deepEqual(matches.map((course) => course.id), ["writing"]);
});

test("shows only saved courses when requested", () => {
  const matches = getVisibleCourses(createCourses(), {
    savedOnly: true,
  }, new Set(["business", "writing"]));

  assert.deepEqual(matches.map((course) => course.id), ["business", "writing"]);
});

test("shows only unfinished courses in the courses view", () => {
  const courses = createCourses();
  courses[0].completed = courses[0].lessons;

  const matches = getVisibleCourses(courses, { view: "courses" });

  assert.deepEqual(matches.map((course) => course.id), ["development", "business", "writing"]);
});

test("restores valid saved lesson progress and calculates percentages", () => {
  const courses = createCourses();

  restoreProgress(courses, { design: 6, development: 16 });

  assert.equal(courses[0].completed, 6);
  assert.equal(courses[0].progress, 50);
  assert.equal(courses[1].completed, 16);
  assert.equal(courses[1].progress, 100);
});

test("ignores invalid saved lesson progress", () => {
  const courses = createCourses();

  restoreProgress(courses, {
    design: -1,
    development: 16.5,
    business: 11,
    writing: "3",
    missing: 2,
  });

  assert.equal(courses[0].completed, 4);
  assert.equal(courses[1].completed, 10);
  assert.equal(courses[2].completed, 2);
  assert.equal(courses[3].completed, 0);
});

test("ignores malformed saved progress", () => {
  for (const invalidProgress of [null, [], "invalid"]) {
    const courses = createCourses();

    restoreProgress(courses, invalidProgress);

    assert.equal(courses[0].completed, 4);
  }
});

test("completes one lesson and updates the percentage", () => {
  const course = createCourses()[3];

  assert.equal(completeLesson(course), true);
  assert.equal(course.completed, 1);
  assert.equal(course.progress, 13);
});

test("does not complete additional lessons after a course is finished", () => {
  const course = createCourses()[3];
  course.completed = course.lessons;
  course.progress = 100;

  assert.equal(completeLesson(course), false);
  assert.equal(course.completed, course.lessons);
  assert.equal(course.progress, 100);
});
