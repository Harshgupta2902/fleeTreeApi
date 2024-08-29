const express = require("express");
const details = require("./details");

const app = express();

// Define API endpoints
app.use("/details", details);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
