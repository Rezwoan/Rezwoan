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

export async function loadData(login) {
  const head = await gql(`query($u:String!){viewer{login} user(login:$u){createdAt}}`, { u: login });
  const since = new Date(head.user.createdAt).getUTCFullYear(), now = new Date().getUTCFullYear();
  const years = Array.from({ length: now - since + 1 }, (_, i) => since + i);
  const ys = years.map((y) => `y${y}:contributionsCollection(from:"${y}-01-01T00:00:00Z",to:"${y}-12-31T23:59:59Z"){${YEAR}}`).join(" ");
  const D = await gql(`query($u:String!){user(login:$u){
    login name bio location avatarUrl(size:200) followers{totalCount} following{totalCount}
    all:repositories(ownerAffiliations:OWNER){totalCount} pub:repositories(ownerAffiliations:OWNER,privacy:PUBLIC){totalCount} priv:repositories(ownerAffiliations:OWNER,privacy:PRIVATE){totalCount}
    repositories(first:100,ownerAffiliations:OWNER,isFork:false,privacy:PUBLIC,orderBy:{field:PUSHED_AT,direction:DESC}){nodes{name description stargazerCount forkCount pushedAt primaryLanguage{name color} languages(first:6,orderBy:{field:SIZE,direction:DESC}){edges{size node{name color}}}}}
    cur:contributionsCollection{commitContributionsByRepository(maxRepositories:25){contributions{totalCount} repository{name isPrivate owner{login}}} contributionCalendar{totalContributions weeks{contributionDays{contributionCount date}}}}
    ${ys}}}`, { u: login });
  const u = D.user;
  const sum = (k) => years.reduce((s, y) => s + u["y" + y][k], 0);
  const hidden = sum("restrictedContributionsCount"); // >0 means the token could not see some private work
  const days = u.cur.contributionCalendar.weeks.flatMap((w) => w.contributionDays);
  const thisYear = u["y" + now];

  const lang = new Map();
  for (const rp of u.repositories.nodes) for (const e of rp.languages.edges) { const o = lang.get(e.node.name) ?? { name: e.node.name, color: e.node.color || "#8b949e", size: 0 }; o.size += e.size; lang.set(e.node.name, o); }
  const langs = [...lang.values()].sort((a, b) => b.size - a.size), tot = langs.reduce((s, l) => s + l.size, 0) || 1;
  langs.forEach((l) => (l.pct = (l.size / tot) * 100));

  // public, own-account repos only: private/org repo names must never reach a public image (fail closed on undefined)
  const commits = new Map(u.cur.commitContributionsByRepository.filter((x) => x.repository.isPrivate === false && x.repository.owner.login === login).map((x) => [x.repository.name, x.contributions.totalCount]));
  const repos = u.repositories.nodes.map((r) => ({ ...r, commits: commits.get(r.name) ?? 0 }));

  let cur = 0, best = 0, run = 0;
  for (const d of days) { run = d.contributionCount ? run + 1 : 0; best = Math.max(best, run); }
  for (let i = days.length - 1; i >= 0; i--) { if (days[i].contributionCount) cur++; else if (i < days.length - 1) break; }
  const busy = days.reduce((m, x) => (x.contributionCount > m.contributionCount ? x : m), days[0]);

  // last 12 calendar months of contributions
  const months = [];
  for (let i = 11; i >= 0; i--) { const d = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() - i, 1)); months.push({ key: d.toISOString().slice(0, 7), label: d.toLocaleString("en-US", { month: "short", timeZone: "UTC" }), n: 0 }); }
  for (const d of days) { const m = months.find((x) => x.key === d.date.slice(0, 7)); if (m) m.n += d.contributionCount; }

  return {
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
