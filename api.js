const express = require("express");
const details = require("./details");
const insert = require("./insert");

const app = express();

// Define API endpoints
app.use("/details", details);
app.use("/insert", insert);

app.listen(3000, () => {
  console.log(`Server is running on port ${3000}`);
});
