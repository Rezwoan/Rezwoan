import { lc } from "./lib.mjs";
// Fetches everything the cards draw. Needs a token that can see private work (PROFILE_TOKEN: classic PAT with `repo` + `read:user`),
// otherwise private contributions are silently left out. Run: GITHUB_TOKEN=$(gh auth token) node scripts/skins/gen.mjs
const gql = async (query, variables = {}) => {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN is not set");
  const r = await fetch("https://api.github.com/graphql", { method: "POST", headers: { Authorization: `bearer ${token}`, "User-Agent": "gen-skins" }, body: JSON.stringify({ query, variables }) });
  const j = await r.json();
  if (!j.data) throw new Error("GraphQL: " + JSON.stringify(j.errors ?? j));
  return j.data;
};

const YEAR = `totalCommitContributions totalPullRequestContributions totalIssueContributions totalPullRequestReviewContributions restrictedContributionsCount contributionCalendar{totalContributions}`;

const rest = async (path) => {
  const r = await fetch("https://api.github.com" + path, { headers: { Authorization: `bearer ${process.env.GITHUB_TOKEN}`, "User-Agent": "gen-skins" } });
  return r.ok ? r.json() : [];
};

// Turn raw events into display rows. Private events are rolled up into counts per day; their repo names are never read.
function timeline(events) {
  const rows = new Map();
  const add = (e, kind, repo) => {
    const day = e.created_at.slice(0, 10), pub = e.public === true, key = `${day}|${kind}|${pub ? repo : "private"}`;
    const r = rows.get(key) ?? { kind, day, ts: e.created_at, pub, repo: pub ? repo : "", n: 0, num: e.payload?.number ?? e.payload?.pull_request?.number };
    r.n++; rows.set(key, r);
  };
  for (const e of events) {
    const t = e.type, a = e.payload?.action;
    if (t === "PushEvent") add(e, "push", e.repo.name);
    else if (t === "PullRequestEvent") add(e, a === "opened" ? "pr-open" : a === "merged" || e.payload.pull_request?.merged ? "pr-merge" : "pr-close", e.repo.name);
    else if (t === "PullRequestReviewEvent") add(e, "review", e.repo.name);
    else if (t === "IssuesEvent") add(e, a === "opened" ? "issue-open" : "issue-close", e.repo.name);
    else if (t === "IssueCommentEvent" || t === "CommitCommentEvent") add(e, "comment", e.repo.name);
    else if (t === "ReleaseEvent") add(e, "release", e.repo.name);
    else if (t === "CreateEvent") add(e, e.payload.ref_type === "repository" ? "create-repo" : "branch", e.repo.name);
    else if (t === "WatchEvent") add(e, "star", e.repo.name);
    else if (t === "ForkEvent") add(e, "fork", e.repo.name);
  }
  return [...rows.values()].sort((a, b) => (a.ts < b.ts ? 1 : -1));
}

// Commits per day, tagged with the repo's main language. Repo names are used only to fetch history and are never kept.
async function dayLanguages(repos, login, since, calendar) {
  // 8 repositories at a time, to stay clear of GitHub's secondary rate limit
  const queue = [...repos], per = async (r) => {
    const out = [];
    for (let page = 1; page <= 12; page++) {
      const j = await rest(`/repos/${r.owner}/${r.name}/commits?author=${login}&since=${since}&per_page=100&page=${page}`);
      if (!Array.isArray(j)) break;
      for (const c of j) out.push({ ts: new Date(c.commit.author.date).getTime(), lang: r.lang });
      if (j.length < 100) break;
    }
    return out;
  };
  const raw = [];
  await Promise.all(Array.from({ length: 8 }, async () => { for (let r; (r = queue.shift()); ) raw.push(...(await per(r))); }));
  const dayOf = (ts, off) => new Date(ts + off * 36e5).toISOString().slice(0, 10);
  // the calendar's day boundary is the profile's timezone; pick the offset that best agrees with it
  let best = 0, bestMiss = Infinity;
  for (const off of [0, 6, 5.5, 1, 2, 3, 4, -5, -8]) { const miss = raw.filter((c) => !(calendar.get(dayOf(c.ts, off)) > 0)).length; if (miss < bestMiss) { bestMiss = miss; best = off; } }
  const days = new Map(), total = new Map();
  for (const c of raw) {
    const day = dayOf(c.ts, best), key = c.lang?.name ?? "Other", m = days.get(day) ?? new Map();
    const e = m.get(key) ?? { name: key, color: lc(key, c.lang?.color), n: 0 }; e.n++; m.set(key, e); days.set(day, m);
    const t = total.get(key) ?? { name: key, color: e.color, n: 0 }; t.n++; total.set(key, t);
  }
  return { days, total: [...total.values()].sort((a, b) => b.n - a.n), offset: best, commits: raw.length };
}

// This month's pace: commits and lines changed per day on default branches (the commits GitHub counts as contributions), private repos included.
// Only totals are kept; repository names are used to fetch history and then dropped.
async function monthPace(login, userId, lastDate, offset) {
  const monthStart = lastDate.slice(0, 8) + "01", t0 = Date.parse(monthStart + "T00:00:00Z"), elapsed = Number(lastDate.slice(8, 10));
  const total = new Date(Date.UTC(Number(lastDate.slice(0, 4)), Number(lastDate.slice(5, 7)), 0)).getUTCDate();
  const repos = (await gql(`query($u:String!,$f:DateTime!){user(login:$u){contributionsCollection(from:$f){commitContributionsByRepository(maxRepositories:100){repository{name owner{login}}}}}}`, { u: login, f: new Date(t0 - 12 * 36e5).toISOString() })).user.contributionsCollection.commitContributionsByRepository.map((x) => x.repository);
  const since = new Date(t0 - offset * 36e5).toISOString(), nodes = [], queue = [...repos];
  const Q = `query($o:String!,$n:String!,$s:GitTimestamp!,$id:ID!,$a:String){repository(owner:$o,name:$n){defaultBranchRef{target{... on Commit{history(first:100,since:$s,author:{id:$id},after:$a){nodes{additions deletions committedDate}pageInfo{hasNextPage endCursor}}}}}}}`;
  const one = async (r) => { let after = null; for (let i = 0; i < 20; i++) { let h; try { h = (await gql(Q, { o: r.owner.login, n: r.name, s: since, id: userId, a: after })).repository?.defaultBranchRef?.target?.history; } catch { return; } if (!h) return; nodes.push(...h.nodes); if (!h.pageInfo.hasNextPage) return; after = h.pageInfo.endCursor; } };
  await Promise.all(Array.from({ length: 8 }, async () => { for (let r; (r = queue.shift()); ) await one(r); }));
  const byDay = Array.from({ length: elapsed }, (_, i) => ({ date: `${monthStart.slice(0, 8)}${String(i + 1).padStart(2, "0")}`, commits: 0, lines: 0 }));
  let add = 0, del = 0; const sizes = [];
  for (const x of nodes) { const day = new Date(Date.parse(x.committedDate) + offset * 36e5).getUTCDate(), b = byDay[day - 1]; if (!b) continue; b.commits++; b.lines += x.additions + x.deletions; add += x.additions; del += x.deletions; sizes.push(x.additions + x.deletions); }
  sizes.sort((p, q) => p - q);
  return { label: new Date(t0).toLocaleString("en-US", { month: "long", timeZone: "UTC" }), elapsed, total, byDay, add, del, commits: sizes.length, active: byDay.filter((x) => x.commits).length, median: sizes.length ? sizes[Math.floor(sizes.length / 2)] : 0 };
}

export async function loadData(login) {
  const head = await gql(`query($u:String!){viewer{login} user(login:$u){createdAt id}}`, { u: login });
  const since = new Date(head.user.createdAt).getUTCFullYear(), now = new Date().getUTCFullYear();
  const years = Array.from({ length: now - since + 1 }, (_, i) => since + i);
  const ys = years.map((y) => `y${y}:contributionsCollection(from:"${y}-01-01T00:00:00Z",to:"${y}-12-31T23:59:59Z"){${YEAR}}`).join(" ");
  const D = await gql(`query($u:String!){user(login:$u){
    login name bio location avatarUrl(size:200) followers{totalCount} following{totalCount}
    all:repositories(ownerAffiliations:OWNER){totalCount} pub:repositories(ownerAffiliations:OWNER,privacy:PUBLIC){totalCount} priv:repositories(ownerAffiliations:OWNER,privacy:PRIVATE){totalCount}
    repositories(first:100,ownerAffiliations:OWNER,isFork:false,privacy:PUBLIC,orderBy:{field:PUSHED_AT,direction:DESC}){nodes{name description stargazerCount forkCount pushedAt primaryLanguage{name color} languages(first:6,orderBy:{field:SIZE,direction:DESC}){edges{size node{name color}}}}}
    allRepos:repositories(first:100,ownerAffiliations:OWNER,isFork:false){nodes{languages(first:6,orderBy:{field:SIZE,direction:DESC}){edges{size node{name color}}}}}
    privRecent:repositories(first:30,ownerAffiliations:OWNER,privacy:PRIVATE,orderBy:{field:PUSHED_AT,direction:DESC}){nodes{pushedAt}}
    cur:contributionsCollection{commitContributionsByRepository(maxRepositories:100){contributions{totalCount} repository{name isPrivate owner{login} primaryLanguage{name color}}} contributionCalendar{totalContributions weeks{contributionDays{contributionCount date}}}}
    ${ys}}}`, { u: login });
  const u = D.user;
  const sum = (k) => years.reduce((s, y) => s + u["y" + y][k], 0);
  const hidden = sum("restrictedContributionsCount"); // >0 means the token could not see some private work
  const days = u.cur.contributionCalendar.weeks.flatMap((w) => w.contributionDays);
  const thisYear = u["y" + now];

  const lang = new Map();
  for (const rp of u.allRepos.nodes) for (const e of rp.languages.edges) { const o = lang.get(e.node.name) ?? { name: e.node.name, color: lc(e.node.name, e.node.color), size: 0 }; o.size += e.size; lang.set(e.node.name, o); }
  const langs = [...lang.values()].sort((a, b) => b.size - a.size), tot = langs.reduce((s, l) => s + l.size, 0) || 1;
  langs.forEach((l) => (l.pct = (l.size / tot) * 100));

  // public, own-account repos only: private/org repo names must never reach a public image (fail closed on undefined)
  const commits = new Map(u.cur.commitContributionsByRepository.filter((x) => x.repository.isPrivate === false && x.repository.owner.login === login).map((x) => [x.repository.name, x.contributions.totalCount]));
  const repos = u.repositories.nodes.map((r) => ({ ...r, primaryLanguage: r.primaryLanguage && { ...r.primaryLanguage, color: lc(r.primaryLanguage.name, r.primaryLanguage.color) }, commits: commits.get(r.name) ?? 0 }));

  let cur = 0, best = 0, run = 0;
  for (const d of days) { run = d.contributionCount ? run + 1 : 0; best = Math.max(best, run); }
  for (let i = days.length - 1; i >= 0; i--) { if (days[i].contributionCount) cur++; else if (i < days.length - 1) break; }
  const busy = days.reduce((m, x) => (x.contributionCount > m.contributionCount ? x : m), days[0]);

  // last 12 calendar months of contributions
  const months = [];
  for (let i = 11; i >= 0; i--) { const d = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() - i, 1)); months.push({ key: d.toISOString().slice(0, 7), label: d.toLocaleString("en-US", { month: "short", timeZone: "UTC" }), n: 0 }); }
  for (const d of days) { const m = months.find((x) => x.key === d.date.slice(0, 7)); if (m) m.n += d.contributionCount; }

  const calendar = new Map(days.map((x) => [x.date, x.contributionCount]));
  const mix = await dayLanguages(u.cur.commitContributionsByRepository.map((x) => ({ owner: x.repository.owner.login, name: x.repository.name, lang: x.repository.primaryLanguage })), login, days[0].date + "T00:00:00Z", calendar);
  const month = await monthPace(login, head.user.id, days[days.length - 1].date, mix.offset);
  const events = timeline(await rest(`/users/${login}/events?per_page=100`));
  const privActive = u.privRecent.nodes.filter((r) => Date.now() - new Date(r.pushedAt) < 30 * 864e5).length;
  return {
    month, events, privActive, dayLangs: mix.days, cityLangs: mix.total, repoLangCount: u.allRepos.nodes.length,
    login: u.login, name: u.name || u.login, bio: u.bio || "", location: u.location || "", since, avatarUrl: u.avatarUrl,
    followers: u.followers.totalCount, following: u.following.totalCount,
    repoTotal: u.all.totalCount, repoPublic: u.pub.totalCount, repoPrivate: u.priv.totalCount,
    repos, langs, days, months, streak: cur, best, busy, hidden,
    stars: u.repositories.nodes.reduce((s, r) => s + r.stargazerCount, 0),
    life: { total: sum("contributionCalendar") ? years.reduce((s, y) => s + u["y" + y].contributionCalendar.totalContributions, 0) : 0, commits: sum("totalCommitContributions"), prs: sum("totalPullRequestContributions"), issues: sum("totalIssueContributions"), reviews: sum("totalPullRequestReviewContributions") },
    year: { total: u.cur.contributionCalendar.totalContributions, commits: thisYear.totalCommitContributions, prs: thisYear.totalPullRequestContributions, issues: thisYear.totalIssueContributions, reviews: thisYear.totalPullRequestReviewContributions },
  };
}

export async function avatarDataUri(url) {
  const r = await fetch(url);
  return `data:${r.headers.get("content-type") || "image/png"};base64,${Buffer.from(await r.arrayBuffer()).toString("base64")}`;
}
