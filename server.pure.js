var http = require('http');

http.createServer(function (request, response) {
	var parts = request["url"].slice(1).split('?')
	var args = parts[1].split('&')
	var value = null;
	switch (parts[0])
	{
		case 'true':
			value = true;
			break;
		case 'false':
			value = false;
			break;
		case 'null':
			value = null;
			break;
		case 'not':
			value = !callout(args[0])
			break;
		case 'and':
			value = callout(args[0]) & callout(args[1])
			break;
		case 'or':
			value = callout(args[0]) | callout(args[1])
			break;
		case 'xor':
			value = callout(args[0]) ^ callout(args[1])
			break;
		case 'if':
			if callout(args[0])
				value = callout(args[1]);
			else
				value = callout(args[2])
			break;
	}
  response.writeHead(200, {'Content-Type': 'application/json'});
  response.end(value);
}).listen(8124);

function callout (arg)
{
	var client = var http = require('http');
	var google = http.createClient(80, 'www.google.com');
	var request = google.request('GET', '/',
	  {'host': 'www.google.com'});
	request.end();
	request.on('response', function (response) {
	  console.log('STATUS: ' + response.statusCode);
	  console.log('HEADERS: ' + JSON.stringify(response.headers));
	  response.setEncoding('utf8');
	  response.on('data', function (chunk) {
	    console.log('BODY: ' + chunk);
	  });
	});
}

console.log('Server running at http://127.0.0.1:8124/');