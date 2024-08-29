const fs = require("fs");

// Function to read JSON file and extract links
function extractLinksFromFile(file) {
  try {
    const jsonData = fs.readFileSync(file, "utf8");
    const parsedData = JSON.parse(jsonData);
    const links = parsedData.map((item) => item.link);
    return links;
  } catch (error) {
    console.error(`Error reading file ${file}:`, error);
    return [];
  }
}

// List of JSON files containing data
const files = [
  "merged_data.json", // Replace with your file name
];

// Extract links from all files
let allLinks = [];
files.forEach((file) => {
  const links = extractLinksFromFile(file);
  allLinks = allLinks.concat(links);
});

// Write links to a new file
fs.writeFile("extracted_links.txt", allLinks.join("\n"), (err) => {
  if (err) {
    console.error("Error writing links to file:", err);
  } else {
    console.log("Links have been written to extracted_links.txt");
  }
});
