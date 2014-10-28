var shapefile = require('shapefile');
var _ = require('lodash');

module.exports = function (cb) {
  var processZips = function (zips) {
    var coords;
    var box;
    return _.map(zips, function (zip) {
      coords = zip.geometry.coordinates[0];
      box = _.reduce(coords, function (boxModel, coord) {
        if (coord[0] < boxModel.minLong) {
          boxModel.minLong = coord[0];
        }
        if (coord[0] > boxModel.maxLong) {
          boxModel.maxLong = coord[0];
        }
        if (coord[1] < boxModel.minLat) {
          boxModel.minLat = coord[1];
        }
        if (coord[1] > boxModel.maxLat) {
          boxModel.maxLat = coord[1];
        }
        return boxModel;
      }, {
        minLong: coords[0][0],
        maxLong: coords[0][0],
        minLat: coords[0][1],
        maxLat: coords[0][1]
      });
      return {
        zip: zip.properties.GEOID10,
        minMax: box,
        coordinates: coords
      }
    });
  }

  // takes ~8 seconds
  shapefile.read(__dirname + '/shapefile/cb_2013_us_zcta510_500k.shp', function (error, collection) {
    if (error) {
      console.log(error);
    }
    cb(processZips(collection.features));
    console.log('Zips in memory');
  });
};
