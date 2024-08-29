const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

// Function to fetch data from a single link
async function fetchData(link) {
  try {
    const response = await axios.get(`https://pub.dev/packages/${link}`);
    console.log(`Fetched data from ${link}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching data from ${link}:`, error);
    return null;
  }
}

function extractDataFromHTML(html) {
  const $ = cheerio.load(html);

  try {
    const h1Text = $(".title").text().trim();
    const packageNameVersion = h1Text.match(/^[^\d]*(\d+\.\d+\.\d+)/)[0];
    const metadataElement = $(".metadata");
    const publishedAgo = metadataElement.find(".-x-ago").text().trim();
    const publisher = metadataElement.find(".-pub-publisher").text().trim();
    const compatibility = metadataElement.find(".package-badge").text().trim();
    const scoresElement = $(".packages-scores");
    const likes = scoresElement
      .find(".packages-score-like .packages-score-value-number")
      .first()
      .text()
      .trim();
    const pubPoints = scoresElement
      .find(".packages-score-health .packages-score-value-number")
      .first()
      .text()
      .trim();
    const popularity = scoresElement
      .find(".packages-score-popularity .packages-score-value-number")
      .first()
      .text()
      .trim();
    const metadata = $("h3.title.pkg-infobox-metadata").next().text().trim();
    const topics = $("h3.title")
      .filter((index, element) => $(element).text().trim() === "Topics")
      .next()
      .find("a")
      .map((index, element) => $(element).text().trim())
      .get();
    const dependencies = [
      ...new Set(
        $("h3.title")
          .filter(
            (index, element) => $(element).text().trim() === "Dependencies"
          )
          .next()
          .find("a")
          .map((index, element) => $(element).text().trim())
      ),
    ];
    const sdkTags = $(".detail-tags .-pub-tag-badge")
      .filter(
        (index, element) =>
          $(element).find(".tag-badge-main").text().trim() === "SDK"
      )
      .find(".tag-badge-sub")
      .map((index, element) => $(element).text().trim())
      .get();
    const platformTags = $(".detail-tags .-pub-tag-badge")
      .filter(
        (index, element) =>
          $(element).find(".tag-badge-main").text().trim() === "Platform"
      )
      .find(".tag-badge-sub")
      .map((index, element) => $(element).text().trim())
      .get();
    const repositoryAnchor = $(".detail-info-box a").filter(function () {
      return $(this).text().trim() === "Repository (GitHub)";
    });
    const repositoryUrl = repositoryAnchor.attr("href");
    const documentationLink = $("h3.title:contains('Documentation')")
      .next()
      .find("a.link")
      .attr("href");
    const licenseSection = $("h3.title:contains('License')").next();
    const licenseText = licenseSection.text().trim();
    const licenseName = licenseText.split("(")[0].trim();
    const licenseLink = licenseSection.find("a").attr("href");
    return {
      packageNameVersion,
      likes,
      pubPoints,
      popularity,
      publishedAgo,
      publisher,
      compatibility,
      metadata,
      topics,
      dependencies,
      repositoryUrl,
      sdkTags,
      platformTags,
      documentationLink,
      licenseName,
      licenseLink,
    };
  } catch (error) {
    console.error("Error extracting data:", error);
    return null;
  }
}

function extractScore(html) {
  const $ = cheerio.load(html);
  const scoresList = [];

  $(".pkg-report-section").each((i, element) => {
    const heading = $(element).find(".pkg-report-header-title").text().trim();
    const granted = $(element)
      .find(".pkg-report-header-score-granted")
      .text()
      .trim();
    const max = $(element).find(".pkg-report-header-score-max").text().trim();

    const score = {
      heading: heading,
      granted: parseInt(granted, 10),
      max: parseInt(max, 10),
    };

    scoresList.push(score);
  });

  return scoresList;
}

function extractVersion(html) {
  const $ = cheerio.load(html);
  const versions = {
    Stable: [],
    Prerelease: [],
  };

  $("h2").each((i, headingElement) => {
    const headingText = $(headingElement).text().trim();

    if (headingText.includes("Stable versions")) {
      currentCategory = "Stable";
    } else if (headingText.includes("Prerelease versions")) {
      currentCategory = "Prerelease";
    } else {
      return;
    }

    const table = $(headingElement).next("table");

    table.find("tbody tr").each((j, rowElement) => {
      const version = $(rowElement).find(".version a").text().trim();
      const badge = $(rowElement).find(".badge .package-badge").text().trim();
      const sdk = $(rowElement).find(".sdk").text().trim();
      const uploaded = $(rowElement).find(".uploaded a").attr("title").trim();
      const documentation =
        $(rowElement).find(".documentation a").attr("href") || "";
      const archive = $(rowElement).find(".archive a").attr("href") || "";

      const versionDetail = {
        version: version,
        badge: badge,
        sdk: sdk,
        uploaded: uploaded,
        documentation: documentation,
        archive: archive,
      };

      // Add the extracted data to the appropriate category
      versions[currentCategory].push(versionDetail);
    });
  });

  // Remove empty categories if any
  for (const category in versions) {
    if (versions[category].length === 0) {
      delete versions[category];
    }
  }

  return versions;
}

async function fetchAndExtractData(link) {
  const html = await fetchData(link);
  const scoreHtml = await fetchData(`${link}/score`);
  const versionHtml = await fetchData(`${link}/versions`);
  if (html) {
    const data = extractDataFromHTML(html);
    const score = extractScore(scoreHtml);
    const versions = extractVersion(versionHtml);
    return { data, score, versions };
  }
}

router.get("/:package", async (req, res) => {
  try {
    const { package } = req.params;

    if (!package) {
      return res.status(400).json({ error: "No Packages" });
    }

    const data = await fetchAndExtractData(package);
    res.json(data);
  } catch (error) {
    console.error("Error fetching and extracting data:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
