const path = require("path");

const first = (req, res) => {
  return res.redirect('https://sjssn.onrender.com/schools/ST%20Joseph%20Secondary%20school%20Nyiman%20Makurdi/home');
};
const home = (req, res) => {
  return res.sendFile(path.join(`${__dirname}/../views/index.html`));
};

module.exports = {
  first,
  home
};