var _ = require('lodash');

var utils = module.exports = {
  boxesIntersect: function (l1, l2) {
    return (l1.p1[0] <= l2.p2[0] &&
           l1.p2[0] >= l2.p1[0] &&
           l1.p1[1] >= l2.p2[1] &&
           l1.p2[1] <= l2.p2[1]) ||
          (l2.p1[0] <= l1.p2[0] &&
           l2.p2[0] >= l1.p1[0] &&
           l2.p1[1] >= l1.p2[1] &&
           l2.p2[1] <= l1.p2[1]);
  },

  crossProduct: function (line, point) {
    // l1, l2 are line segments consisting of two points, {p1: [x, y], p2: [x, y]}
    return (line.p2[0] - line.p1[0]) * (point[1] - line.p2[1]) - (line.p2[1] - line.p1[1]) * (point[0] - line.p2[0]);
  },

  lineIntersectsSegment: function (line, segment) {
    var cp1 = utils.crossProduct(line, segment.p1);
    var cp2 = utils.crossProduct(line, segment.p2);

    return (!cp1 || !cp2) || (cp1 < 0 && cp2 > 0) || (cp1 > 0 && cp2 < 0);
  },

  lineSegmentsIntersect: function (l1, l2) {
    return utils.lineIntersectsSegment(l1, l2) && utils.lineIntersectsSegment(l2, l1);
  },

  boxIntersect: function (zip, points) {
    // if bounding boxes don't intersect, return false
    var box1 = {
      p1: [zip.minLong, zip.maxLat],
      p2: [zip.maxLong, zip.minLat]
    };
    var box2 = {
      p1: [Math.min(points.p1[0], points.p2[0]), Math.max(points.p1[1], points.p2[1])],
      p2: [Math.max(points.p1[0], points.p2[0]), Math.min(points.p1[1], points.p2[1])]
    };

    if (!utils.boxesIntersect(box1, box2)) {
      return false;
    }

    var upperLeft = [zip.minLong, zip.maxLat];
    var upperRight = [zip.maxLong, zip.maxLat];
    var lowerLeft = [zip.minLong, zip.minLat];
    var lowerRight = [zip.maxLong, zip.minLat];

    // l1, l2 are line segments consisting of two points, {p1: [x, y], p2: [x, y]}
    return utils.lineSegmentsIntersect({ p1: upperLeft, p2: upperRight }, points) ||
           utils.lineSegmentsIntersect({ p1: upperRight, p2: lowerRight }, points) ||
           utils.lineSegmentsIntersect({ p1: lowerRight, p2: lowerLeft }, points) ||
           utils.lineSegmentsIntersect({ p1: lowerLeft, p2: upperLeft }, points);
  },

  polyIntersect: function (coords, points) {
    for (var i = 1; i < coords.length; i++) {
      if (utils.lineSegmentsIntersect({ p1: coords[i-1], p2: coords[i] }, points)) {
        return true;
      }
    }
    // test final segment
    return utils.lineSegmentsIntersect({ p1: coords[coords.length - 1], p2: coords[0] }, points);
  },

  firstFilter: function(zips, points) {
    // filter on boxes
    return _.filter(zips, function (zip) {
      return utils.boxIntersect(zip.minMax, points);
    });
  },

  secondFilter: function (zips, points) {
    // filter on all segments
    return _.filter(zips, function (zip) {
      return utils.polyIntersect(zip.coordinates, points);
    });
  },

  filter: function (zips, points) {
    points = {
      p1: JSON.parse(points.point1),
      p2: JSON.parse(points.point2)
    };

    var firstFilter = utils.firstFilter(zips, points);
    return utils.secondFilter(firstFilter, points);
  }
};
