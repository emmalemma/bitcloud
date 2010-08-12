function request_op(op)
{
	console.log("Requesting op");
	$.ajax({type: 'POST',
			url: "/op/",
			data: JSON.stringify(op),
			success: op_requested,
			dataType: 'json' });
}

function op_requested(data, textStatus, XMLHttpRequest)
{
	console.log(data.op_id);
}

function get_new_op()
{
	$.ajax({type: 'GET',
			url: "/op/",
			success: received_op,
			dataType: 'json' });
}

function received_op(data, textStatus, XMLHttpRequest)
{
	op = data.op
	op['returns'] = perform_op(op.op, op.args);
	$.ajax({type: 'PUT',
			url: "/op/",
			data: JSON.stringify(op),
			success: returned_op,
			dataType: 'json' });
}

function perform_op(op, args)
{
	switch (op)
	{
		case '|':
			return args[0] | args[1];
			break;
		case '&':
			return args[0] & args[1];
			break;
		case '^':
			return args[0] ^ args[1];
			break;
		case '!':
			return !args[0];
			break;

	}
}

function returned_op(data, textStatus, XMLHttpRequest)
{
	if (data["status"] == "return")
		console.log(data.return.value);
	
}