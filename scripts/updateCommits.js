const fs = require("fs");
const fetch = require("node-fetch");

const username = process.env.GH_USERNAME;
const token = process.env.GH_TOKEN;
const headers = { Authorization: `token ${token}` };

const excludeRepos = [
  "siyabuilds",
  "project-1",
  "acn-syllabus",
  "bbd-immersion-day-booking",
];

async function getCommitCount() {
  const reposResponse = await fetch(
    `https://api.github.com/users/${username}/repos?per_page=100`,
    { headers }
  );
  const repos = await reposResponse.json();

  let totalCommits = 0;

  for (const repo of repos) {
    if (excludeRepos.includes(repo.name.toLowerCase())) continue;

    const commitsResponse = await fetch(
      `https://api.github.com/repos/${username}/${repo.name}/commits?per_page=1`,
      { headers }
    );

    const linkHeader = commitsResponse.headers.get("link");
    if (linkHeader && linkHeader.includes('rel="last"')) {
      const match = linkHeader.match(/&page=(\d+)>; rel="last"/);
      const count = match ? parseInt(match[1]) : 1;
      totalCommits += count;
    } else {
      const commits = await commitsResponse.json();
      totalCommits += commits.length;
    }
  }

  return totalCommits;
}

(async () => {
  try {
    const total = await getCommitCount();

    const badge = `<img src="https://img.shields.io/badge/COMMITS-${total}-blue?style=flat-square&color=blue" height="25"/>`;

    const readme = fs.readFileSync("README.md", "utf8");
    const updated = readme.replace(
      /<img src="https:\/\/img\.shields\.io\/badge\/COMMITS-.*?" height="25"\/>/,
      badge
    );

    if (readme !== updated) {
      fs.writeFileSync("README.md", updated);
      console.log(`README updated with ${total} commits`);
    } else {
      console.log("No change in commit count. Skipping write.");
    }
  } catch (error) {
    console.error("Error updating commit count:", error);
    process.exit(1);
  }
})();
