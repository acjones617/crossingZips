var express   = require('express');
var handler = require('./handler');
var url = require('url');
var morgan = require('morgan');
var cors = require('cors');

var zips = [];

module.exports = function (app) {
  require('./processZips')(function (processedZips) {
    zips = processedZips;
  });

  app.use(morgan('dev'));

  app.use(cors());

  app.route('/zips')
    .get(function (req, res) {
      res.send(handler.returnZips(zips, url.parse(req.url, true).query));
    });
};
