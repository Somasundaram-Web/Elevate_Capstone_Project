# GitHub Project Explorer

A React single-page app for discovering, comparing, bookmarking and analyzing open-source repositories using the **GitHub REST API**.

## Features

| Page | What it does |
|---|---|
| **Dashboard** | Summary cards (repos, total stars/forks, top language) and Chart.js charts (language doughnut, top-10 by stars, top-10 by forks). Switch between the global top repos and **your bookmarks**. |
| **Explorer** | Debounced keyword search, language filter, sort (stars, forks, updated, help-wanted issues, best match), ascending/descending, cards/table views, pagination. |
| **Trending** | Most-starred repositories created this week / month / last 3 months, filterable by language. |
| **Compare** | Compare up to 4 repositories side by side (add from any card or by `owner/name` / URL). Best values are highlighted, with a stars-vs-forks chart. |
| **Bookmarks** | Save repositories, write personal notes, search/sort them, export as JSON. Stored in `localStorage`. |

Also: live **API rate-limit indicator** in the navbar, friendly error messages (rate limit, bad token, network, not found), loading and empty states, toasts, responsive layout with a mobile drawer menu.

## Tech stack

- React 18 + React Router 6 (Create React App / `react-scripts` 5)
- Tailwind CSS 3
- Chart.js 4 + react-chartjs-2
- Axios
- React Context for global state (bookmarks, notes, comparison list)

## Quick start

Requirements: **Node.js 18+** and npm.

```bash
# 1. install dependencies
npm install

# 2. (recommended) add a GitHub token - see below
cp .env.example .env
#    then edit .env and paste your token after REACT_APP_GITHUB_TOKEN=

# 3. run the dev server  ->  http://localhost:3000
npm start

# 4. run the unit tests
npm test

# 5. production build  ->  ./build
npm run build
```

### GitHub token (recommended)

Without a token GitHub allows **60 requests/hour** (and 10 searches/minute). With one: **5,000/hour** (30 searches/minute).

1. Go to <https://github.com/settings/tokens>
2. Create a token (classic with **no scopes**, or fine-grained with *Public repositories – read only*)
3. Put it in `.env`: `REACT_APP_GITHUB_TOKEN=ghp_xxxxx`
4. Restart `npm start` (env vars are read at start-up)

> Create React App embeds `REACT_APP_*` variables into the browser bundle. Use a read-only, no-scope token and never commit `.env` (it is in `.gitignore`). For a public deployment, put the token behind a small proxy/backend instead.

## Project structure

```
github-project-explorer/
├── public/                      index.html, favicon
├── src/
│   ├── components/
│   │   ├── Common/              Navbar, Sidebar, Footer, LoadingSpinner, ErrorAlert, Pagination, RepoCard*
│   │   ├── Dashboard/           DashboardOverview, AnalyticsCharts
│   │   ├── Explorer/            ExplorerView*, RepositoryList, SearchBar, FilterSortBar
│   │   ├── Trending/            TrendingView
│   │   ├── Comparison/          RepositoryCompare
│   │   └── Bookmarks/           BookmarksView, NotesModal
│   ├── context/AppContext.jsx   bookmarks, notes, compare list, toasts (persisted to localStorage)
│   ├── hooks/useGitHubApi.js    loading/error/data wrapper + useRateLimit
│   ├── services/githubService.js  the only module that calls api.github.com
│   ├── utils/formatters.js(+test) 1.2k numbers, dates, sizes, language colors
│   ├── App.jsx                  layout + routes
│   ├── index.js                 entry point
│   └── index.css                Tailwind + shared component classes
├── .env.example  .gitignore  package.json  tailwind.config.js  README.md
```
`*` = two files added to your original tree: `Common/RepoCard.jsx` (card shared by Explorer, Trending and Bookmarks) and `Explorer/ExplorerView.jsx` (the Explorer page that wires search, filters, list and pagination together).

## Architecture

```
Components  ->  useGitHubApi (state)  ->  githubService (HTTP)  ->  GitHub REST API
     ^                                         |
     |                                         +--> rate-limit store --> useRateLimit --> Navbar badge
     +-- AppContext (bookmarks, notes, compare) <-> localStorage
```

- **Service layer** builds queries, normalizes payloads to a small stable shape, converts HTTP failures into readable errors and tracks `x-ratelimit-*` headers.
- **`useGitHubApi(fn)`** returns `{ data, loading, error, execute }`. `execute` is stable, ignores out-of-order responses and never updates state after unmount.
- **Context** owns everything the user creates (bookmarks, notes, comparison list) and persists it.

## Notes & limitations

- GitHub has no official "trending" endpoint; **Trending** uses the search API (recently created repos sorted by stars).
- GitHub's search API only exposes the **first 1,000 results**, so pagination stops there.
- Bookmarks store a snapshot of the repository metadata from when you saved it.
- Data lives in your browser's `localStorage` (per browser, per device).

## Troubleshooting

| Symptom | Fix |
|---|---|
| "GitHub API rate limit reached" | Wait until the time shown, or add a token (see above). |
| "GitHub rejected your access token" | Token is wrong/expired. Re-create it, update `.env`, restart `npm start`. |
| Token seems ignored | Variable must be named `REACT_APP_GITHUB_TOKEN`; restart the dev server after editing `.env`. |
| Styles missing | Make sure `npm install` completed (Tailwind is a dev dependency) and `tailwind.config.js` is in the project root. |
| Port 3000 busy | `PORT=3001 npm start` (macOS/Linux) or `set PORT=3001 && npm start` (Windows cmd). |

## Deploying

`npm run build` creates a static site in `build/`. Deploy it to Netlify, Vercel, GitHub Pages, etc. For client-side routing, configure a fallback to `index.html`. For GitHub Pages under a sub-path, add `"homepage": "/your-repo-name"` to `package.json`.
