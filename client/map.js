var map;

function initialize() {

  var Geocoder = new google.maps.Geocoder();

  var populate = function (point1, point2) {
    $('#map-canvas').empty();
    var center = { lat: (point1.lat + point2.lat) / 2, lng: (point1.lng + point2.lng) / 2 };

    map = new google.maps.Map(document.getElementById('map-canvas'), {
      center: center,
      zoom: 8,
      maptype: 'roadmap'
    });
    var marker1 = new google.maps.Marker({
      position: point1,
      map: map,
      title: 'point1'
    });
    var marker2 = new google.maps.Marker({
      position: point2,
      map: map,
      title: 'point2'
    });

    var bounds = new google.maps.LatLngBounds();
    bounds.extend(new google.maps.LatLng(point1.lat, point1.lng));
    bounds.extend(new google.maps.LatLng(point2.lat, point2.lng));
    map.fitBounds(bounds);


    // point1=[lng,lat]&
    var qs = ['point1=', JSON.stringify([point1.lng, point1.lat]), '&point2=', JSON.stringify([point2.lng, point2.lat])].join('');

    $.get('http://localhost:8080/zips?' + qs, function (data) {
      // draw polygons on map.
      drawZips(data);
    });

    // draw path
    new google.maps.Polyline({
      map: map,
      path: [point1, point2],
      geodesic: false,
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 2
    });
  };

  var drawZips = function (zips) {
    // array of coordinates in coordinates

    var zipPolylineOptions = {
      map: map,
      geodesic: true,
      strokeColor: '#000000',
      strokeOpacity: 1.0,
      strokeWeight: 2.0
    };

    var coords;
    _.each(zips, function (zip) {
      coords = _.map(zip.coordinates, function (coord) {
        return {
          lat: coord[1],
          lng: coord[0]
        }
      });
      zipPolylineOptions.path = coords;
      new google.maps.Polyline(zipPolylineOptions);
    });
  };

  var geocodeAndPopulate = function () {
    var count = 0;
    var point1;
    var point2;

    var addresses = [$('.address1').val(), $('.address2').val()];

    // find lat/long of address
    _.each(addresses, function (address) {
      Geocoder.geocode({ address: address }, function (results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
          if (count === 0) {
            point1 = { lng: results[0].geometry.location.lng(), lat: results[0].geometry.location.lat() };
          } else if (count === 1) {
            point2 = { lng: results[0].geometry.location.lng(), lat: results[0].geometry.location.lat() };
            populate(point1, point2);
          }
        }
        count++;
      });
    });
  };
  
  $('button').on('click', geocodeAndPopulate);

  // Default endpoints
  $('.address1').val('Ocean Beach, San Francisco, CA');
  $('.address2').val('Yosemite, CA');
  // kick off with initial addresses
  geocodeAndPopulate();
};

google.maps.event.addDomListener(window, 'load', initialize);
