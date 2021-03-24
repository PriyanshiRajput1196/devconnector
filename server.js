const express = require("express");
const app = express();
const connectDB = require("./config/db");
const cors = require("cors");

app.get("/", function (req, res) {
  res.send("API Running");
});
connectDB();
const PORT = process.env.PORT || 5000;

//Middleware, instead of bodyparser.json we will use express.json
app.use(express.json({ extended: false }));
//Middleware cors
app.use(cors());

//define routes
app.use("/api/users", require("./routes/api/users"));
app.use("/api/posts", require("./routes/api/posts"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/profile", require("./routes/api/profile"));

app.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
});
