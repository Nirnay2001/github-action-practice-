# Learnspace

A small, responsive learning dashboard built with Node.js and plain HTML, CSS, and JavaScript. It is designed as a friendly learning project: there are no external packages or build steps, and the course data and browser interactions are easy to explore.

## Run it

1. Install [Node.js](https://nodejs.org/) if it is not already installed.
2. In this folder, run `npm start`.
3. Open [http://127.0.0.1:3000](http://127.0.0.1:3000).

Set the `PORT` environment variable to use a different port.

## Run with Docker

Build the image and start the container:

```sh
docker build -t learnspace .
docker run --rm -p 3000:3000 learnspace
```

Open [http://localhost:3000](http://localhost:3000). Set `PORT` when starting the container to use a different port, and publish the same container port with `-p`.

## What to try

- Search and filter the sample courses by category.
- Save a course for later, or open a course and mark the next lesson complete.
- Refresh the page: saved courses, progress, and learning time are kept in your browser's local storage.
- Resize the browser to try the mobile layout and navigation.

## A few places to learn from

- `server.js` shows how Node's built-in `http`, `fs`, and `path` modules can serve static files.
- `public/app.js` keeps the sample course data, updates the interface, and saves learning progress.
- `public/course-data.js` contains the course catalog and reusable course filtering and progress logic.
- `public/styles.css` contains the responsive layout, visual design, and small-screen styles.
- `public/index.html` contains the page structure and accessible labels.
- `test/course-data.test.js` tests course filtering and progress using Node's built-in test runner.

## Test and check

Run `npm test` for unit tests and `npm run check` to check JavaScript syntax. GitHub Actions runs both checks on pushes and pull requests with Node.js 20 and 22.
