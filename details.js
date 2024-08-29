const express = require("express");
const fs = require("fs");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

function readLinksFromFile(file) {
  try {
    const data = fs.readFileSync(file, "utf8");
    return data.split("\n").filter((link) => link.trim() !== "");
  } catch (error) {
    console.error(`Error reading file ${file}:`, error);
    return [];
  }
}

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

// Function to extract data from HTML
function extractDataFromHTML(html) {
  const $ = cheerio.load(html);

  try {
    // Extract name from h1
    const h1Text = $(".title").text().trim();
    const packageNameVersion = h1Text.match(/^[^\d]*(\d+\.\d+\.\d+)/)[0];

    // Extract metadata
    const metadataElement = $(".metadata");
    const publishedAgo = metadataElement.find(".-x-ago").text().trim();
    const publisher = metadataElement.find(".-pub-publisher").text().trim();
    const compatibility = metadataElement.find(".package-badge").text().trim();

    // Extracting aside
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

    // Extract GitHub URL
    const repositoryAnchor = $(".detail-info-box a").filter(function () {
      return $(this).text().trim() === "Repository (GitHub)";
    });
    const repositoryUrl = repositoryAnchor.attr("href");

    return {
      packageNameVersion,
      publishedAgo,
      publisher,
      compatibility,
      metadata,
      topics,
      dependencies,
      repositoryUrl,
    };
  } catch (error) {
    console.error("Error extracting data:", error);
    return null;
  }
}

async function fetchAndExtractData(link) {
  const html = await fetchData(link);
  if (html) {
    const data = extractDataFromHTML(html);
    return data;
  }
  // return data;
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
