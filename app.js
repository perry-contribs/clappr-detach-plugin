var Express = require('express');
var path = require('path');
var app = Express();
var server;

const PATH_DIST = path.resolve(__dirname, './');

app.use(Express.static(PATH_DIST));

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, './example.html'));
});

server = app.listen(process.env.PORT || 3000, () => {
  var port = server.address().port;
  console.log('listening at %s', port);
});
