var http = require('http');
var cookie = require( "ext/cookie-node" );
var paperboy = require( "ext/node-paperboy" );

var sys = require('sys');
var path = require('path');

var done_ops = {};
var oplist = [];
var opowners = {};

var PORT = 9292;
var WEBROOT = path.join(path.dirname(__filename), 'public');
console.log("serving public files from " + WEBROOT);

http.createServer(function (request, response) {
	if (request.url.split('/')[1] == 'public') { //kind of a hack, but oh well
		request.url = request.url.slice(7);
		do_paperboy(request, response);
	} else
		switch (request.method)
		{
			case 'GET':
				pop_op(request, response);
				break;
			case 'POST':
				request.on('data', push_op);
				break;
			case 'PUT':
				request.on('data', return_op);
				break;
		}
	
	
	function push_op(chunk)
	{
		session = setup_session(this, false);
		op = JSON.parse(chunk);
		op_id = Math.random().toString(36);
		op['id'] = op_id;
		wrapped_op = {session: session, op: op};
		oplist.push(wrapped_op);
		
		opowners[op_id] = session;

	  response.writeHead(200, {'Content-Type': 'application/json'});
	  response.end(JSON.stringify({status: 'queued', op_id: op_id}));
	}
	
	function pop_op(request, response)
	{
		session = setup_session(request, response);
		op = oplist.shift();
		if (op) {
			stripped_op = op['op'];
		  response.writeHead(200, {'Content-Type': 'application/json'});
		  response.end(JSON.stringify({op: stripped_op}));
		} else {
		  response.writeHead(404, {'Content-Type': 'application/json'});
		  response.end(JSON.stringify({status: "no op"}));
		}
	}
	
	function return_op(chunk)
	{
		session = setup_session(request, response);
		op = JSON.parse(chunk);
		done_ops[opowners[op.id]] = op;
		if (done_ops[session]) {
			stripped_op = op['op'];
		  response.writeHead(200, {'Content-Type': 'application/json'});
		  response.end(JSON.stringify({status: 'return', return: {id:op.id, value:op.returns}}));
			done_ops[session] = null;
		} else {
		  response.writeHead(200, {'Content-Type': 'application/json'});
		  response.end(JSON.stringify({status: "success"}));
		}
	}
}).listen(PORT);

function do_paperboy(req, res)
{
	var ip = req.connection.remoteAddress;
  paperboy
    .deliver(WEBROOT, req, res)
    .addHeader('Expires', 300)
    .addHeader('X-PaperRoute', 'Node')
    .before(function() {
      sys.log('Received Request')
    })
    .after(function(statCode) {
      console.log(statCode, req.url, ip);
    })
    .error(function(statCode,msg) {
      res.writeHead(statCode, {'Content-Type': 'text/plain'});
      res.write("Error: " + statCode);
      res.close();
      console.log(statCode, req.url, ip, msg);
    })
    .otherwise(function(err) {
      var statCode = 404;
      res.writeHead(statCode, {'Content-Type': 'text/plain'});
      console.log(statCode, req.url, ip, err);
    });
}

function setup_session(request, response)
{
	var sess = request.getCookie("session");
	if (!sess || sess == "") {
		sess = Math.random().toString(36);
		response.setCookie("session", sess);
	}
	return sess;
}




console.log('Server running at http://127.0.0.1:9292/');