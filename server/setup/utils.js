var _ = require('lodash');

var boxesIntersect = function (l1, l2) {
  return (l1.p1[0] <= l2.p2[0] &&
         l1.p2[0] >= l2.p1[0] &&
         l1.p1[1] >= l2.p2[1] &&
         l1.p2[1] <= l2.p2[1]) ||
        (l2.p1[0] <= l1.p2[0] &&
         l2.p2[0] >= l1.p1[0] &&
         l2.p1[1] >= l1.p2[1] &&
         l2.p2[1] <= l1.p2[1]);
};

var crossProduct = function (line, point) {
  // l1, l2 are line segments consisting of two points, {p1: [x, y], p2: [x, y]}
  return (line.p2[0] - line.p1[0]) * (point[1] - line.p2[1]) - (line.p2[1] - line.p1[1]) * (point[0] - line.p2[0]);
};

var lineIntersectsSegment = function (line, segment) {
  var cp1 = crossProduct(line, segment.p1);
  var cp2 = crossProduct(line, segment.p2);

  return (!cp1 || !cp2) || (cp1 < 0 && cp2 > 0) || (cp1 > 0 && cp2 < 0);
};

var lineSegmentsIntersect = function (l1, l2) {
  return lineIntersectsSegment(l1, l2) && lineIntersectsSegment(l2, l1);
};

var boxIntersect = function (zip, points) {
  // if bounding boxes don't intersect, return false
  var box1 = {
    p1: [zip.minLong, zip.maxLat],
    p2: [zip.maxLong, zip.minLat]
  };
  var box2 = {
    p1: [Math.min(points.p1[0], points.p2[0]), Math.max(points.p1[1], points.p2[1])],
    p2: [Math.max(points.p1[0], points.p2[0]), Math.min(points.p1[1], points.p2[1])]
  };

  if (!boxesIntersect(box1, box2)) {
    return false;
  }

  var upperLeft = [zip.minLong, zip.maxLat];
  var upperRight = [zip.maxLong, zip.maxLat];
  var lowerLeft = [zip.minLong, zip.minLat];
  var lowerRight = [zip.maxLong, zip.minLat];

  // l1, l2 are line segments consisting of two points, {p1: [x, y], p2: [x, y]}
  return lineSegmentsIntersect({ p1: upperLeft, p2: upperRight }, points) ||
         lineSegmentsIntersect({ p1: upperRight, p2: lowerRight }, points) ||
         lineSegmentsIntersect({ p1: lowerRight, p2: lowerLeft }, points) ||
         lineSegmentsIntersect({ p1: lowerLeft, p2: upperLeft }, points);
};

var polyIntersect = function (coords, points) {
  for (var i = 1; i < coords.length; i++) {
    if (lineSegmentsIntersect({ p1: coords[i-1], p2: coords[i] }, points)) {
      return true;
    }
  }
  // test final segment
  return lineSegmentsIntersect({ p1: coords[coords.length - 1], p2: coords[0] }, points);
};

var firstFilter = function(zips, points) {
  // filter on boxes
  return _.filter(zips, function (zip) {
    return boxIntersect(zip.minMax, points);
  });
};

var secondFilter = function (zips, points) {
  // filter on all segments
  return _.filter(zips, function (zip) {
    return polyIntersect(zip.coordinates, points);
  });
};

module.exports = {
  filter: function (zips, points) {
    points = {
      p1: JSON.parse(points.point1),
      p2: JSON.parse(points.point2)
    };

    var filteredZips = firstFilter(zips, points);
    return secondFilter(filteredZips, points);
  }
};
