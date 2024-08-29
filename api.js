const express = require("express");
const details = require("./details");

const app = express();

// Define API endpoints
app.use("/details", details);

app.listen(3000, () => {
  console.log(`Server is running on port ${3000}`);
});
