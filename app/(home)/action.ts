export async function fetchTrendingTypeScriptRepos() {
  // Calculate date 7 days ago in YYYY-MM-DD format
  const now = new Date();
  const lastWeek = new Date(now);
  lastWeek.setDate(now.getDate() - 7);
  const since = lastWeek.toISOString().slice(0, 10);

  // Construct the search query
  const query = ["language:typescript", `created:>${since}`].join("+");

  const url = `https://api.github.com/search/repositories?q=${query}&sort=stars&order=desc&per_page=20`;

  const res = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}`,
    },
  });

  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  // Return the array of repositories
  return data.items;
}
