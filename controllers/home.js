const path = require("path");

const first = (req, res) => {
  return res.redirect('https://orbital-node-platform.onrender.com/home');
};
const home = (req, res) => {
  return res.sendFile(path.join(`${__dirname}/../views/index.html`));
};

module.exports = {
  first,
  home
};