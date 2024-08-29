const fs = require("fs");

// Function to read JSON files and merge data into a single list
function mergeData(files) {
  let allData = [];

  files.forEach((file) => {
    try {
      const jsonData = fs.readFileSync(file, "utf8");
      const parsedData = JSON.parse(jsonData);
      allData = allData.concat(parsedData);
    } catch (error) {
      console.error(`Error reading file ${file}:`, error);
    }
  });

  return allData;
}

// List of JSON files containing data
const files = [
  "scraped_data_1.json",
  "scraped_data_2.json",
  "scraped_data_3.json",
  "scraped_data_4.json",
  "scraped_data_5.json",
  "scraped_data_6.json",
  "scraped_data_7.json",
  "scraped_data_8.json",
];

// Merge data from all files
const mergedData = mergeData(files);

// Write merged data to a new JSON file
fs.writeFile("merged_data.json", JSON.stringify(mergedData, null, 2), (err) => {
  if (err) {
    console.error("Error writing merged data to file:", err);
  } else {
    console.log("Merged data has been written to merged_data.json");
  }
});
