const express = require("express");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "API is running"
  });
});

app.post("/api/event", (req, res) => {
  console.log("Event received:", req.body);

  res.json({
    success: true,
    received: req.body
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
