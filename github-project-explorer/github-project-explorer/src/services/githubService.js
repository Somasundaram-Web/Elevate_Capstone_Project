/**
 * GitHub REST API client.
 *
 * This is the ONLY module that talks to api.github.com. It
 *  - attaches the optional personal access token,
 *  - tracks the rate-limit headers from every response,
 *  - converts raw HTTP errors into friendly Error messages,
 *  - normalizes repository payloads to a small, stable shape.
 */
import axios from 'axios';

const TOKEN = (process.env.REACT_APP_GITHUB_TOKEN || '').trim();
export const hasToken = Boolean(TOKEN);

const client = axios.create({
  baseURL: 'https://api.github.com',
  timeout: 15000,
  headers: { Accept: 'application/vnd.github+json' },
});

if (hasToken) {
  client.defaults.headers.common.Authorization = `Bearer ${TOKEN}`;
}

/* ------------------------------------------------------------------ */
/* Rate-limit tracking (tiny external store, consumed by useRateLimit) */
/* ------------------------------------------------------------------ */

let rateLimit = {
  limit: null,
  remaining: null,
  reset: null, // epoch milliseconds
  authenticated: hasToken,
};
const listeners = new Set();

export const getRateLimitState = () => rateLimit;

export const subscribeRateLimit = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

function readHeader(headers, name) {
  if (!headers) return undefined;
  if (typeof headers.get === 'function') return headers.get(name);
  return headers[name];
}

function updateRateLimit(headers) {
  const limit = parseInt(readHeader(headers, 'x-ratelimit-limit'), 10);
  const remaining = parseInt(readHeader(headers, 'x-ratelimit-remaining'), 10);
  const reset = parseInt(readHeader(headers, 'x-ratelimit-reset'), 10);
  if (Number.isNaN(limit) || Number.isNaN(remaining)) return;

  rateLimit = {
    limit,
    remaining,
    reset: Number.isNaN(reset) ? null : reset * 1000,
    authenticated: hasToken,
  };
  listeners.forEach((listener) => listener());
}

/* ------------------------------------------------------------------ */
/* Error handling                                                      */
/* ------------------------------------------------------------------ */

function toFriendlyError(err) {
  const status = err.response?.status;
  const apiMessage = err.response?.data?.message || '';
  let message = 'Something went wrong while contacting GitHub.';
  let isRateLimit = false;

  if (!err.response) {
    message =
      err.code === 'ECONNABORTED'
        ? 'The request to GitHub timed out. Please try again.'
        : 'Network error. Check your internet connection and try again.';
  } else if (
    (status === 403 || status === 429) &&
    (rateLimit.remaining === 0 || /rate limit/i.test(apiMessage))
  ) {
    isRateLimit = true;
    const when = rateLimit.reset
      ? new Date(rateLimit.reset).toLocaleTimeString()
      : 'a little later';
    message = `GitHub API rate limit reached. You can try again at ${when}.${
      hasToken
        ? ''
        : ' Add a personal access token to your .env file to raise the limit.'
    }`;
  } else if (status === 401) {
    message =
      'GitHub rejected your access token. Check REACT_APP_GITHUB_TOKEN in your .env file.';
  } else if (status === 404) {
    message = 'The requested repository was not found.';
  } else if (status === 422) {
    message = 'GitHub could not understand that search. Try simpler keywords.';
  } else if (apiMessage) {
    message = apiMessage;
  }

  const error = new Error(message);
  error.status = status;
  error.isRateLimit = isRateLimit;
  return error;
}

client.interceptors.response.use(
  (response) => {
    updateRateLimit(response.headers);
    return response;
  },
  (err) => {
    if (err.response) updateRateLimit(err.response.headers);
    return Promise.reject(toFriendlyError(err));
  }
);

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** Reduce the huge GitHub payload to what the UI actually needs. */
export function normalizeRepo(raw) {
  return {
    id: raw.id,
    name: raw.name,
    fullName: raw.full_name,
    owner: raw.owner?.login || '',
    avatar: raw.owner?.avatar_url || '',
    url: raw.html_url,
    homepage: raw.homepage || '',
    description: raw.description || '',
    language: raw.language || '',
    stars: raw.stargazers_count || 0,
    forks: raw.forks_count || 0,
    openIssues: raw.open_issues_count || 0,
    license: raw.license?.spdx_id || raw.license?.name || '',
    topics: raw.topics || [],
    size: raw.size || 0,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    pushedAt: raw.pushed_at,
  };
}

/** Build a GitHub search "q" string from the UI inputs. */
export function buildQuery({ query = '', language = '', extra = [] } = {}) {
  const parts = [];
  const keywords = query.trim();
  if (keywords) parts.push(keywords);
  if (language) parts.push(`language:"${language}"`);
  parts.push(...extra);
  // The search API rejects an empty query, so default to "popular repos".
  return parts.length ? parts.join(' ') : 'stars:>100';
}

/** Accepts "owner/repo" or a github.com URL; returns "owner/repo" or null. */
export function parseRepoInput(input) {
  if (!input) return null;
  const cleaned = input
    .trim()
    .replace(/^https?:\/\/(www\.)?github\.com\//i, '')
    .replace(/\.git$/i, '')
    .replace(/\/+$/, '');
  const match = cleaned.match(/^([\w.-]+)\/([\w.-]+)/);
  return match ? `${match[1]}/${match[2]}` : null;
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

/** Search repositories. Returns { items, total }. */
export async function searchRepositories({
  query = '',
  language = '',
  sort = 'stars',
  order = 'desc',
  page = 1,
  perPage = 12,
} = {}) {
  const params = {
    q: buildQuery({ query, language }),
    per_page: perPage,
    page,
  };
  if (sort && sort !== 'best-match') {
    params.sort = sort;
    params.order = order;
  }
  const { data } = await client.get('/search/repositories', { params });
  return { items: data.items.map(normalizeRepo), total: data.total_count };
}

/** Repositories created within the last `days` days, ordered by stars. */
export async function getTrendingRepositories({
  days = 7,
  language = '',
  page = 1,
  perPage = 12,
} = {}) {
  const since = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
  const params = {
    q: buildQuery({ language, extra: [`created:>${since}`] }),
    sort: 'stars',
    order: 'desc',
    per_page: perPage,
    page,
  };
  const { data } = await client.get('/search/repositories', { params });
  return { items: data.items.map(normalizeRepo), total: data.total_count };
}

/** Fetch one repository by "owner/repo" (or a URL). */
export async function getRepository(input) {
  const fullName = parseRepoInput(input);
  if (!fullName) {
    throw new Error('Enter a repository as "owner/name" or paste its GitHub URL.');
  }
  const { data } = await client.get(`/repos/${fullName}`);
  return normalizeRepo(data);
}

/** Refresh rate-limit info (this endpoint does not consume quota). */
export async function fetchRateLimit() {
  await client.get('/rate_limit');
  return rateLimit;
}
