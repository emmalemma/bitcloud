var app = require('express').createServer();

app.get('/', function(req, res){
    res.send(req.param);
});

app.listen(3000);