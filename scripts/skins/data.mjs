// Fetches everything the skins draw, in one GraphQL call. Needs GITHUB_TOKEN (Actions token or `gh auth token`).
const Q = `query($u:String!){user(login:$u){
  login name bio location createdAt avatarUrl(size:160)
  followers{totalCount} following{totalCount}
  repositories(first:100,ownerAffiliations:OWNER,isFork:false,orderBy:{field:PUSHED_AT,direction:DESC}){
    totalCount
    nodes{name description stargazerCount forkCount pushedAt createdAt isPrivate
      primaryLanguage{name color}
      languages(first:5,orderBy:{field:SIZE,direction:DESC}){edges{size node{name color}}}}}
  contributionsCollection{
    totalCommitContributions totalPullRequestContributions totalPullRequestReviewContributions totalIssueContributions
    commitContributionsByRepository(maxRepositories:20){contributions{totalCount} repository{name isPrivate owner{login}}}
    contributionCalendar{totalContributions weeks{contributionDays{contributionCount date weekday}}}}
}}`;

export async function loadData(login) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN is not set");
  const r = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `bearer ${token}`, "User-Agent": "gen-skins" },
    body: JSON.stringify({ query: Q, variables: { u: login } }),
  });
  const j = await r.json();
  if (!j.data?.user) throw new Error("GraphQL: " + JSON.stringify(j.errors ?? j));
  const u = j.data.user;
  const cc = u.contributionsCollection;
  const days = cc.contributionCalendar.weeks.flatMap((w) => w.contributionDays);
  const repos = u.repositories.nodes.filter((x) => !x.isPrivate);

  // languages by bytes across public repos
  const lang = new Map();
  for (const rp of repos)
    for (const e of rp.languages.edges) {
      const o = lang.get(e.node.name) ?? { name: e.node.name, color: e.node.color || "#8b949e", size: 0 };
      o.size += e.size;
      lang.set(e.node.name, o);
    }
  const langs = [...lang.values()].sort((a, b) => b.size - a.size);
  const tot = langs.reduce((s, l) => s + l.size, 0) || 1;
  langs.forEach((l) => (l.pct = (l.size / tot) * 100));

  // commits per repo this year; fall back to recent-push order if the API gave none
  const commits = cc.commitContributionsByRepository
    .filter((x) => x.repository.isPrivate === false && x.repository.owner.login === login) // fail closed: private/org repo names never reach a public image
    .map((x) => ({ name: x.repository.name, n: x.contributions.totalCount }))
    .sort((a, b) => b.n - a.n);

  // streaks
  let cur = 0, best = 0, run = 0;
  for (const d of days) { run = d.contributionCount ? run + 1 : 0; best = Math.max(best, run); }
  for (let i = days.length - 1; i >= 0; i--) { if (days[i].contributionCount) cur++; else if (i < days.length - 1) break; }

  return {
    login: u.login, name: u.name || u.login, bio: u.bio || "", location: u.location || "",
    since: new Date(u.createdAt).getFullYear(), avatarUrl: u.avatarUrl,
    followers: u.followers.totalCount, following: u.following.totalCount,
    repoCount: u.repositories.totalCount, repos, langs, commits, days,
    stars: repos.reduce((s, r) => s + r.stargazerCount, 0),
    forks: repos.reduce((s, r) => s + r.forkCount, 0),
    total: cc.contributionCalendar.totalContributions,
    commitsYear: cc.totalCommitContributions, prs: cc.totalPullRequestContributions,
    reviews: cc.totalPullRequestReviewContributions, issues: cc.totalIssueContributions,
    streak: cur, best,
    weeks: cc.contributionCalendar.weeks.map((w) => w.contributionDays.reduce((s, d) => s + d.contributionCount, 0)),
  };
}

export async function avatarDataUri(url) {
  const r = await fetch(url);
  const b = Buffer.from(await r.arrayBuffer());
  return `data:${r.headers.get("content-type") || "image/png"};base64,${b.toString("base64")}`;
}
