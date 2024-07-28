const cors = require("cors");
const express = require("express");
const app = express();
const path = require("path");
const initRoutes = require("./routes");


app.use(cors());
app.use(express.json());
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

initRoutes(app);
// From routers . . .

let PORT = 3000;
app.listen(process.env.PORT || PORT, () => {
  console.log(`Running at localhost:${PORT}`);
});