var express   = require('express'),
    app       = express();

require('./setup/setup.js')(app);

app.listen(8080);
console.log('Listening on port 8080');
