const fs = require("fs");

async function getQuote() {
  try {
    const response = await fetch("https://zenquotes.io/api/random");
    const [quote] = await response.json();
    return `> *"${quote.q}"* - ${quote.a}`;
  } catch (error) {
    console.error("Error fetching quote:", error);
    return null;
  }
}

(async () => {
  const quote = await getQuote();
  if (!quote) {
    process.exit(1);
  }

  const readme = fs.readFileSync("README.md", "utf8");
  const updated = readme.replace(
    /<!--START_QUOTE-->[\s\S]*<!--END_QUOTE-->/,
    `<!--START_QUOTE-->\n${quote}\n<!--END_QUOTE-->`
  );

  if (readme !== updated) {
    fs.writeFileSync("README.md", updated);
    console.log("README updated with new quote.");
  } else {
    console.log("No change in README. Skipping write.");
  }
})();
