existy = function(x) { return x != null };

truthy = function(x) { return (x !== false) && existy(x); };

is_empty = function(x) { return _.reduce(x, function(first, next) { return (next == null) ? next : false; }, true); };

is_null = function(x) { return x == null; };

contains = function(x, y) { return (x.indexOf(y) != -1); };

position = function(data, text) { console.log('position'); return data.indexOf(text); };

strip = function(data, text) { return contains(data, text) ? data.slice(0, position(data, text)) : data; };

keep = function(data, text) { return contains(data, text) ? data.slice(position(data, text)+1) : false; };

splat = function(fun) { return function(array) { return fun.apply(null, array); }; };

default_to = function(x, y) { return truthy(x) ? x : y; };

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

stringify = function(x, z) {
	return existy(z) ? tostring(interpose(z, x)) : tostring(x);
}

bookend = function(x,y,z) {
	console.log(x+y+z);
	return x + y + z;
}

from_obj = function(obj) {
	return _.values(obj);
}

load_me = function() {
	var up = []; 
	_.each(arguments, function(x) { up.push(x); });
	return up;
}

cat_array = function(short_array, long_array) {
	var i = 0;
	return _.map(short_array, function(item) {
		var temp = existy(long_array[i]) ? short_array[i]+" "+long_array[i] : short_array[i];
		i ++;
		return temp; 
	});
}

extend_array = function(array, length) {
	return false;
}

merge = function(obj_a, obj_b) {
	_.each(obj_b, function(value, key) {
		obj_a[key] = default_to(value, obj_a[key]);
	});
	return obj_a;
}

first_rest = function(first, rest, data, type) {
	type = default_to(type, "normal");
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
			var one = checker(_.first(args).slice(0,8), ["GROUP BY", "ORDER BY"]) ? _.first(args) + "\n" : first + _.first(args) + "\n";
			var others = _.map(_.rest(args), function(clause) {
				return checker(clause.slice(0,8), ["GROUP BY", "ORDER BY"]) ? clause + "\n" : rest + clause + "\n";
			});
			console.log(one);
			console.log(others);	
			return _.union(one, others);
		},
		no_process : function() {
			var one = first + _.first(data) + "\n";
			var others = _.map(_.rest(data), function(clause) {
				return rest + clause + "\n";
			});	
			return _.union(one, others);
		}, 
		func : function() {
			var one = first(data) + "\n";
			var others = _.map(_.rest(data), function(clause) {
				return rest(clause) + "\n";
			});
			return _.union(one, others);
		}		
	}
	return _.result(types, type);
}

extract = function(type, data) {
	var types = {command_name : "({", commands : "});", args : "},{", sub_args : ":", sub_arg_name : "/", options : "/", options_name: "+", options_args : "/"};
	return parser(type, types[type], data);
}

rm_whitespace = function(text) {
	return text.replace(/\}\)\; +/g, "});").replace(/: +/g, ":").replace(/ +:/g, ":").replace(/[\r\n]/g, "");
}

pkg_merge = function() {
	var next = [];
	_.each(arguments, function(arg) {  
		is_empty(arg) ? console.log('skipped') : _.each(extract("sub_args", arg), function(x) { next.push(x); }); 
	});
	return tostring(interpose(":",_.uniq(next)));
}

prefix = function(fix, data) {
	return _.map(data, function(item) {
		return contains(item, ".") ? item : fix+item;
	});
}

checker = function(x, y) {
	return _.reduce(y, function(memo, next) {
		return (next == x) ? true : memo;
	}, false);
}

add_option = function(option, data) {
	return _.map(data, function(item) {
		return contains(item, "/") ? item + '+'+ stringify(_.rest(extract("options_args", option)), "+") : item + option;
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
		if (checker(name, ["gb", "ob"]))
		{
			return truthy(options) ? transform(name, options) : name;
		}
		else
		{
			return truthy(options) ? transform(_.first(options), options, name) : name;
		}
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
			return "MULTISET "+ _.reduce(_.rest(args), function(memo, next) { return memo+_.result(transforms, next);},"");
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
			return "LEFT("+to+","+args[1]+")";
		},
		d : function() {
			return "DISTINCT "+to;
		},
		in : function() {
			return to+" IN ("+tostring(interpose(",", _.rest(args)))+")";
		},
		nin : function() {
			return to+" NOT IN ("+tostring(interpose(",", _.rest(args)))+")";
		},
		lk : function() {
			return to+" LIKE ('"+args[1]+"')";
		},
		lk_any : function() {
			return to+" LIKE ANY ('"+stringify("','", _.rest(args))+"')";
		},
		nlk : function() {
			return to+" NOT LIKE ('"+args[1]+"')";
		},
		nlk_any : function() {
			return to+" NOT LIKE ANY ('"+stringify(_.rest(args), "','")+"')";
		},
		bt : function() {
			return " BETWEEN "+args[1]+" AND "+args[2];
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
		u : function() {
			return "UNION \n" + selecting(stringify(_.rest(args), ":")) + from(to); 
		},
		ua : function() {
			return "UNION ALL \n" + selecting(stringify(_.rest(args), ":")) + from(to); 
		},
		ne : function() {
			return to+" <> ";
		},
		e : function() {
			return to+" = ";
		},
		gt : function() {
			return to+" > ";
		},
		lt : function() {
			return to+" < ";
		},
		gte : function() {
			return to+" >= ";
		},
		lte : function() {
			return to+" <= ";
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
		build_commands : _.first(build_commands.find({active : true, table_name : {$ne : ""}}, {sort : {command_time : -1}}).fetch())
	};
	return places[where];
}
/*
insert_into = function(what, where) {
	var places = {
		metric_library : metric_library.insert(what),
		build_commands : build_commands.insert(what),
		scripts : scripts.insert(what)
	};
	return _.result(places[where]);
}
*/

table_name = function(name, type) {
	var options = extract("options_args", name);
	var beginning = {m : "MULTISET", v: "VOLATILE"};
	var ending = {v : "ON COMMIT PRESERVE ROWS"};
	var extra_sql = truthy(options) ? _.reduce(options, function(memo, opt) { return memo + beginning[opt] + " ";},"") : "";
	var begin_sql = "CREATE " + extra_sql + "TABLE "+type+"_" + extract("sub_arg_name", name) + " AS (\n";
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
	return is_empty(_.without(clauses, "")) ? "" : tostring(first_rest("WHERE ", "AND ", _.without(clauses, ""), "special"));
}

specify = function(things) {
	var indices = extract("sub_args", things);
	return Session.equals("syntax-type", "teradata") ? ") WITH DATA PRIMARY INDEX("+tostring(interpose(",", indices))+")\n" : ")";
}

join_on = function(primary, secondary) {
	var a = extract("sub_args", primary);
	var b = extract("sub_args", secondary);
	a = add_option("/e", a);
	a = prefix("a.", process(a, "sub_args"));
	b = prefix("b.", process(b, "sub_args"));
	return tostring(first_rest("ON ", "AND ", cat_array(a, b), "normal"));
}		

check_joins = function(where) {
	return false;
}

get_timestamp = function() {
	var today = new Date;
	return today.today() + " @ " + today.timeNow();
}

proxy_metric = function(obj, type) {
	type = default_to(type, "obj");
	var metric = {
		metric_name: "",
		cols_added: "",
		join_src : "",
		join_cols: "",
		extra_sql: "",
		indices: "",
		prep_sql: "",
		collection: "",
		description: "",
		create_time: get_timestamp(),
		creator: Meteor.userId(),
		used: 0
	};
	var types = {
		'array' : function() {
			return merge(metric, _.object(_.keys(metric), obj));
		},
		'object' : function() {
			return merge(metric, obj);
		}
	};
	return _.result(types, type);
}

generate_sql = function(type, metric_name, command) {
	var command = existy(command) ? command : predict(type, fetch(metric_name, "metric_library"));
	var command_name = extract("command_name", command);
	var args = extract("args", command);
	return run(command_name, args).sql_output;
}

predict = function(type, metric, add_to) {
	var predictions = {
		create : function() {
			var args = load_me(metric.metric_name, pkg_merge(metric.join_cols, metric.indices, metric.cols_added), metric.join_src, metric.extra_sql, metric.indices, metric.prep_sql);
			return generate_command("create", args);
		},
		add_metric : function() {
			return is_empty(add_to) ? generate_command("add_metric", load_me(metric.metric_name, "your_table", "your:joins", pkg_merge("your:indices", metric.indices))) : generate_command("add_metric", load_me(metric.metric_name, add_to.table_name, add_to.join_cols, pkg_merge(add_to.indices, metric.indices)));
		},
		select : function() {
			return generate_command("select", load_me(pkg_merge(metric.cols_added, metric.join_cols), metric.join_src, metric.extra_sql));
		},
		raw : function() {
			return generate_command("raw", [generate_sql("create", metric.metric_name)]);
		},
		create_metric : function() {
			return generate_command("create_metric", load_me(metric.metric_name, metric.cols_added, metric.join_src, metric.join_cols, metric.extra_sql, metric.indices, "", "Collection Name", "Metric Description"));
		}
	};
	return _.result(predictions, type);
}



generate_command = function(type, args) {
	var commands = {
		"create" : splat(function(metric_name, what, where, how, indices, prep_sql) {
			return bookend("create({", stringify(arguments, "},{"), "});");
			//return "create({"+tostring(interpose("},{", arguments))+"});";
		}),
		"add_metric" : splat(function(metric_name, to, joins, indices) {
			return bookend("add_metric({", stringify(arguments, "},{"), "});");
		}),
		"select" : splat(function(what, where, how) {
			console.log('select');
			console.log(arguments);
			return bookend("select({", stringify(arguments, "},{"), "});");
		}),
		"raw" : splat(function(sql_preview) {
			return bookend("raw({", sql_preview, "});");
		}),
		create_metric : splat(function(metric_name, cols_added, join_src, join_cols, extra_sql, indices, prep_sql, collection, description) {
			return bookend("create_metric({",stringify(arguments, "},{"), "});");
		})
	};
	return commands[type](args);
}

run = function(command, args) {
	var results = {};
	var commands = {
		create : splat(function(name, what, where, how, indices, prep_sql) {
			//requirements("create", arguments);
			var metric = fetch(extract("sub_arg_name", name), "metric_library");
			var prep = truthy(metric) ? _.has(metric, "prep_sql") ? metric.prep_sql + "\n" : "" : ""
			var first = table_name(name, "get");
			results.sql_output = prep + first.begin + selecting(what) + from(where) + conditions(how) + specify(indices) + first.end +";";
			results.output_text = "SQL to create table: "+name+" generated.";
			results.table_name = "get_"+extract("sub_arg_name", name);
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
			var prep = _.has(metric, "prep_sql") ? metric.prep_sql+"\n" : "";
			var first = table_name(name, "add");
			var second = selecting("*", metric.cols_added);
			var third = from(contains(where, "/") ? extract("sub_arg_name", where) + ":" + metric.join_src +"/"+ extract("options", where) : where+":"+ metric.join_src+"/lj");
			var fourth = join_on(joins, metric.join_cols);
			var fifth = conditions(metric.extra_sql);
			var sixth = specify(existy(indices) ? indices : adding_to.indices);
			results.sql_output = prep + first.begin + second + third + fourth + fifth + sixth + first.end +";";  
			results.command = "Add Metric Command...";
			results.output_text = "SQL to add "+extract("sub_arg_name", name)+" to "+extract("sub_arg_name", where)+" generated.";
			results.table_name = "add_"+extract("sub_arg_name", name);
			results.metric_name = extract("sub_arg_name", name);
			results.indices = indices ? indices : adding_to.indices;
			results.join_cols = adding_to.join_cols; //inherits join columns from source table
			results.columns = _.union(adding_to.columns, metric.cols_added);
		}),
		create_metric : splat(function(metric_name, cols_added, join_src, join_cols, extra_sql, indices, prep_sql, collection, description) {
			//requirements("create_metric", arguments);
			var args = [default_to(metric_name, "metric_name"),default_to(cols_added, "your:columns"),default_to(join_src, "your.table"),default_to(join_cols, "your:joins"),default_to(extra_sql, ""),default_to(indices, "your:indices"),default_to(prep_sql, ""),default_to(collection, ""),default_to(description, "")];
			metric_library.insert(proxy_metric(args, "array"));
			results.output_text = "Metric: " + default_to(metric_name, "metric_name") + " added to the library";
			results.command = "Create Metric Command...";
			results.metric_name = "";
			results.table_name = "";
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
			results.table_name = "";
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
			results.table_name = "";
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
			results.table_name = "";
			results.indices = "";
			results.join_cols = "";
			results.metric_name = "";			
		}),
		drop : splat(function(table) {
			results.sql_output = bookend("DROP TABLE ", table, ";\n");
			results.command = "Drop command...";
			results.output_text = "Drop table SQL added to script";
			results.columns = "";
			results.table_name = "";
			results.indices = "";
			results.join_cols = "";
			results.metric_name = "";
		}),
		chain : splat(function(all_metrics, to) {
			var anchor = [];
			var metric_records = _.map(extract("sub_args", all_metrics), function(item) {return fetch(item, "metric_library");});
			if (existy(to))
			{
				_.reduce(metric_records, function(memo, next) {
					anchor.push(predict("add_metric", next, memo));
					return next;
				}, fetch(to, "metric_library"));
			}
			else
			{
				anchor.push([predict("create", _.first(metric_records))]);
				_.reduce(_.rest(metric_records), function(memo, next) {
					anchor.push(predict("add_metric", next, memo));
					return next;
				}, _.first(metric_records));
			}
			process_block(stringify(anchor));
			results.command = "Chain command...";
			results.output_text = "Build commands for those metrics added to script";
			results.columns = "";
			results.table_name = "";
			results.indices = "";
			results.join_cols = "";
			results.metric_name = "";
		})
	};
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
		build_commands.insert(output);
		return true;
	}
}

process_block = function(block) {
	//requirements("process_block", arguments);
	var commands = extract("commands", rm_whitespace(block));
	_.each(commands, submit_command);
};

recompile = function(block_id, command_block) {
	//This will update the SQL output for all of the blocks currently in your stack. 
	var command = "";
	var output = false;
	command = command_block;
	if(command != "")
	{
		Session.set("current_command", command_block);
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
		build_commands.update(block_id, {$set : {command_block : Session.get("current_command")}});
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

build_script = function(blocks, name, desc) {
	var commands = _.pluck(blocks, 'command_block');
	var sql_output = stringify(_.pluck(blocks, 'sql_output'), "\n");
	var obj = {
		script_name: name,
		description: desc,
		user_id: Meteor.userId(),
		creator: Meteor.userId(),
		create_time: get_timestamp(),
		build_commands : commands,
		commands_input : stringify(commands, "\n"),
		sql_output : sql_output
	};
	scripts.insert(obj);
	return obj;
}
