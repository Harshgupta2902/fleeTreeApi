const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');

// Function to fetch data from a single page
async function fetchData(pageNumber) {
  const url = `https://pub.dev/packages?q=is%3Adart3-compatible&sort=popularity&page=${pageNumber}`;

  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const packages = [];

    $('.packages-item').each((index, element) => {
      const titleElement = $(element).find('.packages-title a');
      const name = titleElement.text().trim();
      const link = titleElement.attr('href');
      const description = $(element).find('.packages-description span').text().trim();
      const version = $(element).find('.packages-metadata-block a').first().text().trim();
      const publishedAgo = $(element).find('.packages-metadata-block .-x-ago').text().trim();
      const publisher = $(element).find('.packages-metadata-block a[href^="/publishers"]').text().trim();
      const license = $(element).find('.packages-metadata-block img[alt="verified publisher"]').next().text().trim();
      const compatibility = $(element).find('.package-badge').text().trim();

      const likes = $(element).find('.packages-score-like .packages-score-value-number').text().trim();
      const pubPoints = $(element).find('.packages-score-health .packages-score-value-number').text().trim();
      const popularity = $(element).find('.packages-score-popularity .packages-score-value-number').text().trim();

      const pubTagBadges = $(element).find('.-pub-tag-badge').map((index, tagBadge) => {
        const mainTag = $(tagBadge).find('.tag-badge-main').text().trim();
        const subTags = $(tagBadge).find('.tag-badge-sub').map((i, el) => $(el).text().trim()).get();
        return { mainTag, subTags };
      }).get();

      packages.push({
        name,
        link: `https://pub.dev${link}`,
        description,
        version,
        publishedAgo,
        publisher,
        license,
        compatibility,
        scores: {
          likes,
          pubPoints,
          popularity
        },
        pubTagBadges: JSON.stringify(pubTagBadges)
      });
    });

    return packages;
  } catch (error) {
    throw new Error(`Error fetching data for page ${pageNumber}: ${error.message}`);
  }
}

async function scrapeData() {
    const totalPages = 400;
    const pagesPerFile = 50;
    const delayBetweenPages = 60000;
    let allPackages = [];
    let fileCounter = 1;
  
    for (let page = 1; page <= totalPages; page++) {
      console.log(`Scraping data from page ${page}...`);
      const packages = await fetchData(page);
      allPackages = allPackages.concat(packages);
  
      // Check if it's time to save the data to a new file
      if (page % pagesPerFile === 0) {
        console.log(`Saving data to file ${fileCounter}...`);
        writeToFile(allPackages, fileCounter);
        allPackages = []; // Reset the packages array
        fileCounter++; // Increment the file counter
  
        // Add delay after every 50 pages
        console.log(`Waiting for ${delayBetweenPages / 1000} seconds before scraping the next page...`);
        await new Promise(resolve => setTimeout(resolve, delayBetweenPages));
      }
    }
  
    // Save any remaining packages
    if (allPackages.length > 0) {
      console.log(`Saving remaining data to file ${fileCounter}...`);
      writeToFile(allPackages, fileCounter);
    }
  
    console.log('Scraping complete.');
  }
  
  // Function to write data to a JSON file
  function writeToFile(data, fileCounter) {
    const fileName = `scraped_data_${fileCounter}.json`;
    fs.writeFile(fileName, JSON.stringify(data, null, 2), err => {
      if (err) {
        console.error(`Error writing to file ${fileName}:`, err);
      } else {
        console.log(`Data has been written to ${fileName}`);
      }
    });
  }
  
  // Call the scrapeData function
  scrapeData()
    .catch(error => {
      console.error('Error scraping data:', error);
    });