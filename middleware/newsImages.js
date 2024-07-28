const util = require("util");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const dbConfig = require("../config/db");

var storage = new GridFsStorage({
  url: dbConfig.url + dbConfig.database,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    const match = ["image/png", "image/jpeg"];

    if (match.indexOf(file.mimetype) === -1) {
      const filename = `${Date.now()}-${req.params.sname}-${file.originalname}`;
      return filename;
    }

    return {
      bucketName: dbConfig.newsBucket,
      filename: `${Date.now()}-${modifiedString(req.params.sname)}-${file.originalname}`
    };
  }
});

var uploadFiles = multer({ storage: storage }).single("image");
var uploadFilesMiddleware = util.promisify(uploadFiles);
module.exports = uploadFilesMiddleware

function modifiedString(token) {
  return token.replace(/\s+/g, '-').toLowerCase();
}