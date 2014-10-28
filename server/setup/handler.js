var utils = require('./utils');

module.exports = {
  returnZips: function (zips, points) {
    return utils.filter(zips, points);
  }
}
