existy = function(x) { return x != null };

truthy = function(x) { return (x !== false) && existy(x); };

is_empty = function(x) { return _.reduce(x, function(first, next) { return (next == null) ? next : false; }, true); };

is_null = function(x) { return x == null; };

contains = function(x, y) { return (x.indexOf(y) != -1); };

position = function(data, text) { console.log('position'); return data.indexOf(text); };

strip = function(data, text) { return contains(data, text) ? data.slice(0, position(data, text)) : data; };

keep = function(data, text) { return contains(data, text) ? data.slice(position(data, text)+1) : false; };

splat = function(fun) { return function(array) { return fun.apply(null, array); }; };

cat = function() { 
	var head = _.first(arguments); 
	if (existy(head)) 
		return head.concat.apply(head, _.rest(arguments)); 
	else 
		return []; 
};

construct = function(head, tail) { 
	return cat([head], _.toArray(tail)); 
};

mapcat = function(fun, coll) { 
	return cat.apply(null, _.map(coll, fun)); 
};

butLast = function(coll) {
	return _.toArray(coll).slice(0, -1); 
};

interpose = function(inter, coll) {
	return butLast(mapcat(function(e) { 
		return construct(e, [inter]); 
	}, 
	coll)); 
};

tostring = function(obj) { return _.reduce(obj, function(start, next) { return start + next; }, ""); };

extract = function(type, data) {
	var types = {command_name : "({", commands : "});", args : "},{", sub_args : ":", sub_arg_name : "/", options : "/", options_name: "+", options_args : "/"};
	return parser(type, types[type], data);
}

merge = function(obj_a, obj_b) {
	_.each(obj_b, function(value, key) {
		obj_a[key] = value;
	});
	console.log(obj_a);
	return obj_a;
}

first_rest = function(first, rest, data, type) {
	type = truthy(type) ? type : "normal";
	var types = {
		normal : function() {
			var args = process(data);
			var one = first + _.first(args) + "\n";
			var others = _.map(_.rest(args), function(clause) {
				return rest + clause + "\n";
			});	
			return _.union(one, others);
		},
		special : function() {
			var args = process_special(data);
			var one = first + _.first(args) + "\n";
			var others = _.map(_.rest(args), function(clause) {
				return rest + clause + "\n";
			});	
			return _.union(one, others);
		},
		no_process : function() {
			var one = first + _.first(data) + "\n";
			var others = _.map(_.rest(data), function(clause) {
				return rest + clause + "\n";
			});	
			return _.union(one, others);
		}
	}
	return _.result(types, type);
}

cat_array = function(short_array, long_array) {
	var i = 0;
	return _.map(short_array, function(item) {
		var temp = existy(long_array[i]) ? short_array[i]+" "+long_array[i] : short_array[i];
		i ++;
		return temp; 
	});
}

prefix = function(fix, data) {
	return _.map(data, function(item) {
		return contains(item, ".") ? item : fix+item;
	});
}

add_option = function(option, data) {
	return _.map(data, function(item) {
		return contains(item, "/") ? item : item + option;
	});
}

process = function(data) {
	//Only works for arguments where the option name is after the /, so it won't work for gb & ob, but those are taken care of by first_rest/conditions.
	return _.map(data, function(item) {
		var name = extract("sub_arg_name", item);
		var options = extract("options_args", item);
		return truthy(options) ? transform(_.first(options), options, name) : name;
	});
}

process_special = function(data) {
	return _.map(data, function(item) {
		var name = extract("sub_arg_name", item);
		var options = extract("options_args", item);
		return truthy(options) ? transform(name, options) : name;
	});
}

requirements = function(type, args) {
	var checks = {
		process_block : function() {
			
		},
		submit_command : function() {
			
		},
		run : function() {
			
		},
		create : function() {
			
		},
		add_metric : function() {
			
		},
		create_metric : function() {
			
		},
		raw : function() {
			
		},
		comment : function() {
			
		}
	}
}

transform = function(type, args, to) {
	var transforms = {
		gb : function() { 
 			return "GROUP BY " + tostring(interpose(",", args));
		},
		ob : function() {
			return "ORDER BY " + tostring(interpose(",", args));
		},
		m : function() {
			return "MULTISET "+_.reduce(_.rest(args), function(memo, next) { return memo+transforms[next];},"");
		}, 
		v : function() {
			return "VOLATILE "+_.reduce(_.rest(args), function(memo, next) { return memo+transforms[next];},"");;
		},
		t : function() {
			return "TEMP"+_.reduce(_.rest(args), function(memo, next) { return memo+transforms[next];},"");;
		},
		c : function() {
			return "COUNT("+to+")";
		},
		s : function() {
			return "SUM("+to+")";
		},
		a : function() {
			return "AVG("+to+")";
		},
		min : function() {
			return "MIN("+to+")";
		},
		max : function() {
			return "MAX("+to+")";
		},
		left : function() {
			return "LEFT("+args[0]+","+args[1]+")";
		},
		d : function() {
			return "DISTINCT "+to;
		},
		list : function() {
			return " IN ("+tostring(interpose(",", args))+")";
		},
		bt : function() {
			return " BETWEEN "+args[0]+" AND "+args[1];
		},
		rj : function() {
			return "RIGHT JOIN " + to;
		},
		lj : function() {
			return "LEFT JOIN " + to;
		},
		ij : function() {
			return "INNER JOIN "+to;
		},
		oj : function() {
			return "FULL OUTER JOIN "+to;
		},
		w : function() {
			return ", " + to;
		},
		ne : function() {
			return " <> ";
		},
		e : function() {
			return " = ";
		},
		gt : function() {
			return " > ";
		},
		lt : function() {
			return " < ";
		},
		gte : function() {
			return " >= ";
		},
		lte : function() {
			return " <= ";
		}
	};
	return _.result(transforms, type);
}

parser = function(type, find, data) {
	var operations = {
		command_name : function() {
			return data.slice(0, position(data, find));
		},
		commands : function() {
			return _.map(data.split('});'), function(command) {return command + '});' ;} );
		},
		args : function() {
			return data.slice(position(data, "({")+2, position(data, "});")).split("},{");
		},
		sub_args : function() {
			return data.replace("{","").replace("}","").split(find);
		},
		sub_arg_name : function() {
			return strip(data, find);
		},
		options : function() {
			return keep(data, find);
		},
		options_name : function() {
			return strip(data, find);
		},
		options_args : function() {
			return truthy(keep(data, find)) ? keep(data, find).split("+") : false;
		}
	};
	return _.result(operations, type);
}

start_obj = function(output) {
	var today = new Date;
	var datetime = today.today() + " @ " + today.timeNow();
	output = {
		user_id : Meteor.userId(),
		command_time : datetime,
		success : false,
		active : true,
		command_block : Session.get("current_command")
	};
	return output;
}

fetch = function(what, where) {
	var places = {
		metric_library : _.first(metric_library.find({metric_name : what}).fetch()),
		build_commands : _.first(build_commands.find({active : true}, {sort : {command_time : -1}}).fetch())
	};
	return places[where];
}

add_to = function(what, where) {
	var places = {
		metric_library : metric_library.insert(what),
		build_commands : build_commands.insert(what)
	};
	return _.result(places[where]);
}

table_name = function(name, type) {
	var options = extract("option_args", name);
	var beginning = {m : "MULTISET", v: "VOLATILE"};
	var ending = {v : "ON COMMIT PRESERVE ROWS"};
	var extra_sql = truthy(options) ? _.reduce(options, function(memo, opt) { return memo + beginning[opt] + " ";},"") : "";
	var begin_sql = "CREATE " + extra_sql + "TABLE "+type+"_" + extract("sub_arg_name", name) + " as (\n";
	var end_sql = truthy(options) ? _.reduce(options, function(memo, opt) { return memo + _.has(ending, opt) ? ending[opt] : "";}) : "";
	var result = {
		begin : begin_sql,
		end : end_sql
	}
	return result;
}

selecting = function(what_a, what_b) {
	var cols_a = prefix("a.", extract("sub_args", what_a));
	var cols_b = truthy(what_b) ? prefix("b.", extract("sub_args", what_b)) : false;
	cols_a = process(cols_a);
	cols_b = truthy(cols_b) ? process(cols_b) : false;
	var part1 = tostring(interpose(", ", cols_a));
	var part2 = truthy(cols_b) ? ", "+tostring(interpose(", ", cols_b)) : "";
	return "SELECT " + part1 + part2 + "\n";
}

from = function(where) {
	var table_refs = ['a \n', 'b \n', 'c \n', 'd \n', 'e \n', 'f \n', 'g \n', 'h \n', 'i \n', 'k \n'];
	var srcs = extract("sub_args", where);
	var srcs2 = process(srcs);
	srcs2 = cat_array(srcs2, table_refs);
	var thing = _.map(srcs, function(item) {
		var options = extract("options_args", item);
		var result = is_empty(_.rest(options)) ? "" : tostring(first_rest("ON ", "AND ", _.rest(options), "no_process"));
		return result;
	});
	srcs2 = cat_array(srcs2, thing);
	return "FROM "+tostring(srcs2);
}

conditions = function(how) {
	var clauses = extract("sub_args", how);
	return tostring(first_rest("WHERE ", "AND ", clauses, "special"));
}

specify = function(things) {
	var indices = extract("sub_args", things);
	return "WITH DATA PRIMARY INDEX("+tostring(interpose(",", indices))+")\n";
}

join_on = function(primary, secondary) {
	var a = extract("sub_args", primary);
	var b = extract("sub_args", secondary);
	a = add_option("/e", a);
	a = process(a, "sub_args");
	b = process(b, "sub_args");
	return tostring(first_rest("ON ", "AND ", cat_array(a, b), "normal"));
}		

check_joins = function(where) {
	return false;
}

run = function(command, args) {
	var results = {};
	var commands = {
		create : splat(function(name, what, where, how, indices, prep_sql) {
			//requirements("create", arguments);
			var metric = fetch(extract("sub_arg_name", name), "metric_library");
			var prep = truthy(metric) ? _.has(metric, "prep_sql") ? metric.prep_sql : "" : ""
			var first = table_name(name, "get");
			results.sql_output = prep + first.begin + selecting(what) + from(where) + conditions(how) + specify(indices) + first.end +";";
			results.output_text = "SQL to create table: "+name+" generated.";
			results.metric_name = extract("sub_arg_name", name);
			results.command = "Create Table Command...";
			results.indices = indices;
			results.join_cols = check_joins(where) ? check_joins(where) : indices;
			results.columns = what;
		}),
		add_metric : splat(function(name, where, joins, indices) {
			//requirements("add_metric", arguments);
			var metric = fetch(extract("sub_arg_name", name), "metric_library");
			var adding_to = fetch(extract("sub_arg_name", where), "build_commands");
			var prep = _.has(metric, "prep_sql") ? metric.prep_sql : "";
			var first = table_name(name, "add");
			var second = selecting("*", metric.cols_added);
			var third = from(contains(where, "/") ? extract("sub_arg_name", where) + ":" + metric.join_src +"/"+ extract("options", where) : where+":"+ metric.join_src+"/lj");
			var fourth = join_on(joins, metric.join_cols);
			var fifth = conditions(metric.extra_sql);
			var sixth = specify(existy(indices) ? indices : adding_to.indices);
			results.sql_output = prep + first.begin + second + third + fourth + fifth + sixth + first.end +";";  
			results.command = "Add Metric Command...";
			results.output_text = "SQL to add "+extract("sub_arg_name", name)+" to "+extract("sub_arg_name", where)+" generated.";
			results.metric_name = extract("sub_arg_name", name);
			results.indices = indices ? indices : adding_to.indices;
			results.join_cols = adding_to.join_cols; //inherits join columns from source table
			results.columns = _.union(adding_to.columns, metric.cols_added);
		}),
		create_metric : splat(function(metric_name, cols_added, join_src, join_cols, indices, extra_sql, prep_sql, collection, description) {
			//requirements("create_metric", arguments);
			build_metric(metric_name, cols_added, join_src, join_cols, indices, extra_sql, prep_sql, collection, description);
			results.output_text = "Metric: "+metric_name+" added to the library";
			results.command = "Create Metric Command...";
			results.metric_name = "";
			results.indices = "";
			results.join_cols = "";
			results.columns = "";
			results.sql_output = "";
		}),
		select : splat(function(what, where, how) {
			//requirements("select", arguments);
			results.sql_output = selecting(what) + from(where) + conditions(how) +";";
			results.output_text = "SQL for select stmt generated.";
			results.metric_name = "select stmt";
			results.command = "Select Command...";
			results.columns = what;
			results.indices = "";
			results.join_cols = "";
		}),
		raw : splat(function(sql) {
			//requirements("raw", arguments);
			results.sql_output = sql +";";
			results.command = "Raw SQL Command...";
			results.output_text = "SQL added to script";
			results.metric_name = "raw sql";
			results.columns = "";
			results.indices = "";
			results.join_cols = "";
		}),
		comment : splat(function(text, type) {
			//requirements("comment", arguments);
			results.sql_output = existy(type) ? '/*' + text + '*/' : "--"+text;
			results.command = "Comment Command...";
			results.output_text = "Comment added to script";
			results.columns = "";
			results.indices = "";
			results.join_cols = "";
			results.metric_name = "";			
		})
	}
	results.command = command;
	commands[command](args);
	//_.result(commands, command(args));
	return results;
}

check = function(output) {
	output.success = true;
	return output;
}

submit_command = function(command) {
	//requirements("submit_command", arguments);
	if (contains(command, "({"))
	{
		Session.set("current_command", command);
		var command_name = extract("command_name", command);
		var args = extract("args", command);
		var output = {};
		output = start_obj(output);
		var results = run(command_name, args);
		output = merge(output, results);
		output = check(output);
		console.log(output);
		add_to(output, "build_commands");
		return true;
	}
}

process_block = function(block) {
	//requirements("process_block", arguments);
	var commands = extract("commands", block);
	_.each(commands, submit_command);
};

recompile = function(block_id, command_block) {
	//This will update the SQL output for all of the blocks currently in your stack. 
	var command = "";
	var output = false;
	command = command_block;
	Session.set("current_command", command_block);
	if(command != "")
	{
		var command_name = extract("command_name", command_block);
		var args = extract("args", command_block); 
		output = run(command_name, args);
	}
	if (output)
	{
		build_commands.update(block_id, {$set : {command : output['command']}});
		build_commands.update(block_id, {$set : {output_text : output['ouput_text']}});
		build_commands.update(block_id, {$set : {sql_output : output['sql_output']}});
		build_commands.update(block_id, {$set : {metric_name : output['metric_name']}});
		build_commands.update(block_id, {$set : {command_block : output['command_block']}});
		build_commands.update(block_id, {$set : {join_cols : output['join_cols']}});
		build_commands.update(block_id, {$set : {indices : output['indices']}});
	}
};

pre_run_check = function(command) {
	if (command.indexOf('});') == -1)
	{
		Session.set("pre_run_error", "Valid commands must end with });");
		return false;
	}
	else if (command.indexOf('({') == -1)
	{
		Session.set("pre_run_error", "Valid commands must have opening ({");
		return false;
	}
	else if (command.indexOf('(') == -1)
	{
		Session.set("pre_run_error", "Valid commands must have closing })");
		return false;
	}
	else
	{
		Session.set("pre_run_error", false);
		return true;
	}
};