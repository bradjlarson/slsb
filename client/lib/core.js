/*
var run = {};

//Thoughts on metric/build_command setup:

//For the build_commands, I may want to capture each of the arguments by name
//Particularly I'll need to capture the join_cols and the indices
//In some/most cases, the join_cols probably are the indices
//This will allow me to inherit indices and join columns when adding metrics to a script (like when I have acct_id and a date)

//Need to check that create still works, and is storing data correctly
//Need to double check that all of the simple forms still work correctly
	//-Make sure that arguments have redundant { and } stripping in the subfunctions

//Need update the block commands to store join conditions and indices, so that those conditions can be inherited

////////////////////////////////////
//Core language functions
////////////////////////////////////

pkg_merge = function(pkg1, pkg2) {
	if (pkg1 && pkg2)
	{	
		var unpkg1 = pkg1.replace('{','').replace('}','').split(':');
		var unpkg2 = pkg2.replace('{','').replace('}','').split(':');
		var merged = _.union(unpkg1, unpkg2);
		var repkg = '{';
		var i = 0;
		for (item in merged)
		{
			repkg += merged[item]+':';
		}
		repkg += '}';
		var repkg_fix = repkg.replace(/:}/g,'}');
		//console.log(repkg);
		return repkg_fix;
	}
	else
	{
		return 'Error - only 1 pkg sent';
	}
};


pre_run_check = function(command) {
	//console.log(command.indexOf('//'));
	if (command.indexOf(';') == -1)
	{
		Session.set("pre_run_error", "Valid commands must end with ;");
		return false;
	}
	else if (command.indexOf('(') == -1 && command.indexOf('//') == -1)
	{
		Session.set("pre_run_error", "Valid commands must have opening (");
		return false;
		//console.log(command.indexOf('//'));
	}
	else if (command.indexOf('(') == -1 && command.indexOf('//') == -1)
	{
		Session.set("pre_run_error", "Valid commands must have closing )");
		return false;
	}
	else
	{
		Session.set("pre_run_error", false);
		return true;
	}
};

parse = function(command_block) {
	//Need to be able to split command block more intelligently. 
	//Ideally I'd like it to recognize quotations, parentheses sets, bracket sets, and then use that information to generate the arguments
	//This will probably be rather difficult
	var command = command_block.slice(0,command_block.indexOf('('));
};

script_eval = function(command_block) {
	//This works for now, but the split method forces a new delimiter for each level. 
	//, is the first level delimiter
	//: is the second level delimiter
	//+ is probably going to be the third level delimiter, but that isn't final yet
	//An alternate method would be to ditch the split method, and instead read until the closing bracket had been found
	//This would be a cleaner method, and would yield a cleaner syntax as well - allowing all arguments to be separated by ,
if (command_block)
{
	Session.set("current_command", command_block);
	var commands = command_block.split(';')
	var command = "";
	var output;
	for (arg in commands)
	{
		command = false;
		output = false;
		command = commands[arg];
		//console.log(command);
		if(command)
		{
			if (command.slice(0,2) != '//')
			{
				var command_type = command.slice(0,command.indexOf('('));
				var args = command.slice(command.indexOf('(')+1,command.indexOf(');')).split('},{');
				//console.log(args);
				output = run[command_type](args);
			}
			else
			{
				//console.log("comment");
				//console.log(comment(command));
				output = comment(command);
			}
			
			if (output)
			{
				build_commands.insert(output);
				//console.log("output");
				//console.log("script eval done");
				//console.log(output);
				//console.log("Command:"+command);
			}
		}	
	}
}		
};

recompile = function(block_id, command_block) {
	//This will update the SQL output for all of the blocks currently in your stack. 
	//This allows you to change the underlying metrics, and see the changes reflected in your script, without having to re-enter everything
	//I also probably need to add the ability to edit your commands after they have been entered.
	//console.log("recompile running");
	command = "";
	output = false;
	command = command_block;
	Session.set("current_command", command_block);
	if(command != "")
	{
		if (command.slice(0,2) != '//')
		{
			var command_type = command.slice(0,command.indexOf('('));
			var args = command.slice(command.indexOf('(')+1,command.indexOf(')')).split('},{');
			//console.log(args);
			if (command_type != "create_metric")
			{
				output = run[command_type](args);
			}
		}
		else
		{
			output = comment(command);
		}
	}
	//console.log("output");
	//console.log(output);
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

/////////////////////////////////
//	Add Metric Command functions
/////////////////////////////////

//Auxiliary Functions associated with add_metric command:
//join_type : determines type of join used in the add_ table
//table_name : strips options, returns plain table name (probably not necessary)
//add_join : builds join conditions for add_ table
//in_builder : builds in option for a join condition
//comparison : allows for join conditions other than = (which is the default)
//cols_added : builds select stmt of add_ table
//join_cols : appears to be an outdated version of add_join (probably can be removed)
//indices : builds indices SQL (also used by create command)
//prep_sql : builds preparatory SQL
//extra_sq : builds extra sql in add_ table (like where, group by, etc...)  

add_metric = function(args) {
	//console.log('add metric command');
	var metric_name = args[0] ? args[0].replace('{','').replace('}','') : 'your_metric';
	var metric_name_only = '';
	if (metric_name.indexOf('/') != -1)
	{
		metric_name_only = metric_name.slice(0,metric_name.indexOf('/'));
	}
	else
	{
		metric_name_only = metric_name;
	}
	var join_table = args[1] ? args[1].replace('{','').replace('}','') : 'your_table';
	var join_cols = args[2] ? args[2].replace('{','').replace('}','').split(':') : '{your:columns}';
	var option_set = args[3];
	var metric = metric_library.find({metric_name : metric_name_only}).fetch()[0];
	var metric_cols = metric.join_cols.replace('{','').replace('}','').split(':');
	var output_sql = "";
	if (metric.prep_sql)
	{
		output_sql += prep_sql(metric.prep_sql, join_table)+"\n";
	}
	output_sql += 	"CREATE "+table_type("add_"+metric_name)+" AS (\n"+
					"SELECT a.*"+cols_added(metric.cols_added)+"\n"+
					"FROM "+table_name(join_table)+" a\n"+
					join_type(join_table)+metric.join_src+" b\n"+
					add_join(metric_cols, join_cols)+
					extra_sql(metric.extra_sql)+
					") WITH DATA\n"+
					"PRIMARY INDEX("+indices(metric.indices)+")\n"+
					"ON COMMIT PRESERVE ROWS;\n";
	var success = true;
	Session.set("last_table", "add_"+metric_name);
	var today = new Date();
	var datetime = today.today()+" @ "+today.timeNow();
	var output_text = "Metric: "+metric.metric_name+" added to script!";
	build_constructor = {
						user_id : Meteor.userId(),
						command : "Add Metric: "+metric_name,
						command_time : datetime,
						success : true,
						output_text : output_text,
						sql_output : output_sql,
						metric_name : metric_name_only,
						command_block : Session.get("current_command"),
						active : true,
						join_cols : args[2],
						indices : metric.indices	
						};
	//console.log(build_constructor);
	metric_library.update(metric['_id'], {$inc : {used : 1}});					
	//build_commands.insert(build_constructor);
	return build_constructor;									
};

join_type = function(join_table) {
	//the 'w' option, equivalent to where, is not functional right now. Use inner join instead, which is functionally equivalent.
	var options = {lj : "LEFT JOIN ", rj : "RIGHT JOIN ", oj : "OUTER JOIN ", ij : "INNER JOIN ", w : ", "};
	if (join_table.indexOf('/') != -1)
	{
		return options[join_table.slice(join_table.indexOf('/')+1)];
	}
	else
	{
		return "LEFT JOIN ";
	}
};

table_name = function(join_table) {
	//Need to add ability to reference the last table in the stack
	var table = '';
	if(join_table.slice(0,4) == "last")
	{
		table = Session.get("last_table");
	}
	else
	{
		if (join_table.indexOf('/') != -1)
		{
			table = join_table.slice(0,join_table.indexOf('/'));
		}
		else
		{
			table = join_table;		
		}
	}
	return table;
};

add_join = function(metric_join, driver_join) {
	//console.log(metric_join);
	//console.log(driver_join);
	var i = 0;
	var sql = "";
	for (col in driver_join)
	{
		if (i == 0)
		{
			sql +="ON a."+comparison(driver_join[i])+" b."+metric_join[i]+"\n";
		}
		else
		{
			sql +="AND a."+comparison(driver_join[i])+" b."+metric_join[i]+"\n";
		}
		i++;
	}
	//console.log(sql);
	return sql;	
};

in_builder = function(args) {
	//I don't think this function works 100% yet. I'm pretty sure it's still half baked.
	//Yep, this one won't work at all. The commas will cause the initial read to fail. (update, changed to +)
	var list_column = args.slice(0,args.indexOf('/'));
	var list_command = args.slice(args.indexOf('/list')+1);
	var list_options = list_command.split('+');
	var sql = "";
	var i = 0;
	for (opt in list_options)
	{
		if (i == 0)
		{
			sql +=list_column+" in ("+list_options[opt];
		}
		else
		{
			sql+=", "+list_options[opt];
		}
		i++;
	}
	sql += ")\n";
	return sql;
};

tweener = function(args) {
	var column = args.slice(0,args.indexOf('/'));
	var command = args.slice(args.indexOf('/bt')+1);
	var options = list_command.split('+');
	var sql = "";
	sql = column+" between "+options[0]+" and "+options[1]+"\n";
	return sql;
}

comparison = function(arg) {
	//This should work good, except for list
	var options = {ne : "<>", gt : ">", gte : ">=", lt : "<", lte : "<="};
	var opt_functions = {list : in_builder, bt: tweener};
	var col = arg.slice(0,arg.indexOf('/'));
	var opt = arg.slice(arg.indexOf('/')+1);
	if (arg.indexOf('/') != -1)
	{
		if (opt in options)
		{
			return col+" "+options[opt];
		}
		else
		{
			return col+" "+options[opt](opt);
		}
	}
	else
	{
		return arg+" =";
	}
};

cols_added = function(cols) {
	var separate_cols = cols.split(':');
	var col_string = '';
	for (col in separate_cols)
	{
		col_string += ', b.'+separate_cols[col].replace('{','').replace('}','');
	}
	return col_string;
};

join_cols = function(cols) {
	var separate_cols = cols.split(':');
	var col_string = '';
	if (separate_cols)
	{
		var i = 1;
		for (col in separate_cols)
		{
			if (i == 1) 
			{
				col_string += 'ON a.<user_col'+i+'> = b.'+separate_cols[col].replace('{','').replace('}','');
				if (i != separate_cols.length)
				{
					col_string += '\n'
				}
			}
			else
			{
				col_string += 'AND a.<user_col'+i+'> = b.'+separate_cols[col].replace('{','').replace('}','');
				if (i != separate_cols.length)
				{
					col_string += '\n'
				}
			}	
			i++;	
		}
		return col_string;
	}
	else
	{
		return '';
	}
};

indices = function(cols) {
		var separate_cols = cols.split(':');
		var col_string = '';
		var i = 1;
		for (col in separate_cols)
		{
			if (i != separate_cols.length)
			{
				col_string += separate_cols[col].replace('{','').replace('}','')+',';
			}
			else
			{
				col_string += separate_cols[col].replace('{','').replace('}','');
			}
			i++;	
		}
		return col_string;
};

prep_sql = function(text, table_name) {
	var display_text = "--SQL Preview for "+Session.get("metric_name")+":";
	if (text) 
	{
		display_text +='\n'+text.replace(/<user_table>/g,table_name);
		console.log(display_text);
	}
	return display_text;
};

extra_sql = function(text){
	if (text) 
	{
		return text+"\n";
	}
	else
	{
		return "";
	}
};

/////////////////////////////////
//	Create Metric Functions
/////////////////////////////////

//Auxiliary functions associated with create_metric command
//NONE	

create_metric = function(args) { 
	//This function take an argument string containing the following:
	//  -metric_name : Metric Name
	//  -cols_added : Columns from join table you'd like to append to future table
	//  -join_src : Table or query that data resides in
	//  -join_cols : Columns that future queries can join on (in order of importance)
	//  -indices : Primary index (note the order difference)
	//  -extra_sql : Any additional conditions: where, and, group by, order by (optional)
	var metric_constructor = {};
	var today = new Date();
	var datetime = today.today()+" @ "+today.timeNow();
	metric_constructor["metric_name"] = args[0];
	if (metric_library.find({metric_name : metric_constructor.metric_name}).count() == 0)
	{
	metric_constructor["cols_added"] = args[1];
	metric_constructor["join_src"] = args[2];
	metric_constructor["join_cols"] = args[3];
	metric_constructor["indices"] = args[4];
	metric_constructor["extra_sql"] = args[5] ? args[5] : '--None';
	metric_constructor["creator"] = Meteor.userId();
	metric_constructor["create_time"] = datetime;
	metric_library.insert(metric_constructor, function(err) {
		if (!err) {
			console.log('Metric Inserted');
			//$('#create_metric_form')[0].reset();
		}
		else
		{
			console.log(err);
		}
	});
	var output_text = "Metric: "+args[0]+" added to Metric Library!";
	var build_constructor = {
						user_id : Meteor.userId(),
						command : "Create Metric: "+args[0],
						command_time : datetime,
						success : true,
						output_text : output_text,
						command_block : Session.get("current_command"),
						active : true	
						};
	//console.log(build_constructor);					
	build_commands.insert(build_constructor);
	}
	else
	{
		var output_text = "Metric: "+args[0]+" already exists, please choose another name.";
		var build_constructor = {
							user_id : Meteor.userId(),
							command : "Create Metric: "+args[0],
							command_time : datetime,
							success : false,
							output_text : output_text,
							command_block : Session.get("current_command"),
							active : true	
							};
		console.log(build_constructor);					
		build_commands.insert(build_constructor);
	}
	//console.log(args);
	//console.log('create metric command');
	return false;
}

/////////////////////////////////
//	Create Functions
/////////////////////////////////

//Auxiliary functions associated with Create command:
//table_type : allows user to specify what type of table to create (also used by add_metric)

create = function(args) {
	//This command is basically a select command, with a few extra arguments (table name, {indices})
	//console.log(args);
	//console.log('create command');
	var table_name = args[0] ? args[0].replace('{','').replace('}','') : 'your_table';
	var what = args[1] ? args[1] : '{your:columns}';
	var where = args[2] ? args[2].replace('{','').replace('}','') : 'your.table';
	var how = args[3] ? args[3].replace('{','').replace('}','') : '';
	var indices_pkg = args[4] ? args[4].replace('{','').replace('}','') : ' ';
	var metric_search = table_name.slice(table_name.indexOf('_')+1);
	console.log(metric_search);
	var metric_find = metric_library.find({metric_name : metric_search}).fetch()[0];
	var prep_sql = metric_find ? metric_find.prep_sql : '';
	var output_sql = prep_sql ? prep_sql : '';
	output_sql += "CREATE "+table_type(table_name)+" AS (\n";
	output_sql += "SELECT "+selectify(what)+"\n";
	output_sql += fromify(where)+"\n";
	output_sql += whereify(how);
 	if (indices_pkg)
	{
		output_sql += ") WITH DATA\n"+"PRIMARY INDEX("+indices(indices_pkg)+")\nON COMMIT PRESERVE ROWS;\n";
	}
	else
	{
		output_sql += ") WITH DATA;\n";
	}
	var success = true;
	var today = new Date();
	var datetime = today.today()+" @ "+today.timeNow();
	var output_text = "Create table: "+table_name+" added to script!";
	var build_constructor = {
						user_id : Meteor.userId(),
						command : "Create table: "+table_name,
						command_time : datetime,
						success : true,
						output_text : output_text,
						sql_output : output_sql,
						metric_name : table_name,
						command_block : Session.get("current_command"),
						active : true,
						join_cols : args[1],
						indices : args[4]	
						};
	//console.log(build_constructor);
	var table_name_only ="";
	if (table_name.indexOf('/') != -1)
	{
		table_name_only = table_name.slice(0,table_name.indexOf('/'));
	}
	else
	{
		table_name_only = table_name;
	}
	Session.set("last_table", table_name_only);					
	//build_commands.insert(build_constructor);
	return build_constructor;
}

table_type = function(table) {
	var options = {v : "VOLATILE", m : "MULTISET", t : "TEMPORARY"};
	var table_sql = '';
	if (table.indexOf('/') != -1) 
	{
		var type = table.slice(table.indexOf('/')+1).split('+');
		var table = table.slice(0,table.indexOf('/'));
		console.log(type);
		console.log(table);
		for (opt in type)
		{
			console.log(options[type[opt]]);
			table_sql += options[type[opt]]+" "; 
		}
		table_sql += "TABLE "+table;
	}
	else
	{
		table_sql += "TABLE "+table;
	}
	return table_sql;
}


/////////////////////////////////
//	Select Functions
/////////////////////////////////

//Auxiliary functions associated with SELECT command:
//selectify : transforms {what} argument into select portion of the select stmt (also used by create command)
//fromify : returns from ... portion of select stmt (also used by create command)
//whereify : transforms {how} argument into SQL (also used by create command)

select = function(args) {
	//Basic structure will be select({what},from where,{how});
	//console.log(args);
	//console.log('select command');
	var what = args[0] ? args[0] : '{your:columns}';
	var where = args[1] ? args[1].replace('{','').replace('}','') : 'your.table';
	var how = args[2];
	var output_sql = "SELECT "+selectify(what)+"\n";
	output_sql += fromify(where)+"\n";
	output_sql += whereify(how)+";\n";
	var success = true;
	var today = new Date();
	var datetime = today.today()+" @ "+today.timeNow();
	var output_text = "Select: "+what+" added to script!";
	var build_constructor = {
						user_id : Meteor.userId(),
						command : "Select Stmt: "+what,
						command_time : datetime,
						success : true,
						output_text : output_text,
						sql_output : output_sql,
						metric_name : 'Select Stmt',
						command_block : Session.get("current_command"),
						active : true,
						join_cols : false,
						indices : false	
						};
	//console.log(build_constructor);					
	//build_commands.insert(build_constructor);
	return build_constructor;
}

selectify = function(arg) {
	//Select columns can have an optional operation type
	//This type is passed through the standard option syntax / (i.e. column_name/option)
	//Right now all of the math functions are supported
	//Note that in order to use these aggregate functions with segmentation will require the use of group bys in your where clause
	//
	//The selectify function takes a : delimited package of columns or the * argument, which translates to select *
	var options = {c : "count(", s : "sum(", a : "avg(", max : "max(", min : "min(", d : "distinct " };
	//var opt_functions = {left : left_str, substr : sub_str};
	var select_sql = "";
	if (arg == '*')
	{
		console.log('select all');
		return '*';
	}
	else
	{
		cols = arg.replace('{','').replace('}','').split(':');
		var i = 1;
		for (col in cols) 
		{
			if (cols[col].indexOf('/') != -1)
			{
				var name = cols[col].slice(0,cols[col].indexOf('/'));
				var opt = cols[col].slice(cols[col].indexOf('/')+1);
				var builder = options[opt] ? options[opt] : opt_functions[opt](opt);
				select_sql += options[opt]+name;
				if (opt != "d") { select_sql +=")";}
				if (i != cols.length)
				{
					select_sql +=', ';
				}
				i++;
			}
			else
			{
				select_sql += cols[col];
				if (i != cols.length)
				{
					select_sql +=', ';
				}
				i++;
			}
		}
		return select_sql;
	}
}

fromify = function(arg) {
	return 'FROM '+arg;
}

whereify = function(how) {
if (how)
{
	//right now gb and ob take their arguments delimited by + (i.e gb/1+2+3+4+5)
	var options = {gb : 'group by ', ob : 'order by ', q : 'qualify row_number() over (partition by /parts/ order by /order/) /limit/ '};
	var where_sql = '';
	var args = how.replace('{','').replace('}','').split(':');
	var i = 1;
	for (arg in args) {
		var opt = args[arg].slice(0,args[arg].indexOf('/'));
		var condition = args[arg].slice(args[arg].indexOf('/')+1).replace(/\+/g,",");
		//console.log(condition);
		if (args[arg].indexOf('/') == -1)
		{
			if(i == 1)
			{
				where_sql += 'WHERE '+args[arg]+" \n";
			}
			else
			{
				where_sql += 'AND '+args[arg]+' \n';
			}
			i++;
		}
		else
		{
			where_sql += options[opt]+condition+' \n'
			i++;
		}
	}
	//where_sql +=";";
	return where_sql ? where_sql : ' ';
}
else
{
	return ' ';
}

}

/////////////////////////////////
//	Chain Functions
/////////////////////////////////

//Auxiliary functions associated with Chain command: (not functional right now)
//build_prep_sql : will eventually return a condensed version of all associated prep_sql


chain = function(args) {
	//Basic structure will be chain(chain_name,{metrics:here},{chain:conditions);
	//Chain should only be used when the metrics share the same join condition.
	//It is also useful for creating metric packages from the DB Explorer columns.
	//If several metrics share the same join.src, they will be condensed into a single add_metric
	//Currently, if multiple metrics add the same column name, only the first will be kept
	//console.log(args);
	//console.log('chain command');
	var today = new Date();
	var datetime = today.today()+" @ "+today.timeNow();
	var name = args[0];
	var metrics = args[1].replace('{','').replace('}','').split(':');
	var conditions = args[2].replace('{','').replace('}','').split(':');
	var join_check = false;
	var metric_constructor = {};
	var cols_added = "";
	var prep_sql = "";
	var indice = "";
	var cur_metric = [];
	var success = 0;
	var last_metric = "";
	metric_constructor["metric_name"] = name;
	metric_constructor["creator"] = Meteor.userId();
	metric_constructor["create_time"] = datetime;
	metric_constructor["join_cols"] = args[2];

	//need to check if the metrics have the required join conditions
	//will also need to check how many metrics match conditions
	//Need to check if metrics can be condensed first (see if multiple metrics have same join.src);
	for (metric in metrics)
	{
		cur_metric = metric_library.find({metric_name : metrics[metric]}).fetch()[0];
		if (check(conditions, cur_metric.join_cols))
		{
			cols_added = merge(cols_added,cur_metric.cols_added);
			prep_sql += build_prep_sql(cur_metric,last_metric,conditions); 
			last_metric = "add_"+cur_metric.metric_name;
			success ++;
		}
	}
	metric_constructor["cols_added"] = cols_added;
	metric_constructor["prep_sql"] = prep_sql;
	metric_constructor["extra_sql"] = "--None";
	metric_constructor["indices"] = cur_metric.indices;
	metric_constructor["used"] = 0;
	metric_library.insert(metric_constructor);
	build_constructor = {
		user_id : Meteor.userId(),
		command : "Create chain metric: "+name,
		command_time : datetime,
		success : true,
		output_text : "Chain created as Metric: "+name+"!",
		command_block : Session.get("current_command"),
		active : true
	};
	build_commands.insert(build_constructor);
	return false;
		
}

build_prep_sql = function(metric,last_metric,join_cols) {
	if (last_metric)
	{
		//This handles the cases when there is more than 1 chain link, and this is the 2nd or greater link
		var metric_cols = metric.join_cols.replace('{','').replace('}','').split(':');
		var output_sql = "";
		if (metric.prep_sql)
		{
			output_sql += prep_sql(metric.prep_sql)+"\n";
		}
		output_sql += 	"CREATE TABLE add_"+metric.metric_name+" as (\n"+
						"SELECT a.*"+cols_added(metric.cols_added)+"\n"+
						"FROM "+table_name(join_table)+" a\n"+
						join_type(join_table)+metric.join_src+" b\n"+
						add_join(metric_cols, join_cols)+
						extra_sql(metric.extra_sql)+
						") WITH DATA\n"+
						"PRIMARY INDEX("+indices(metric.indices)+");\n";
		return output_sql;
	}
	else
	{
		//This handles the case when there is more than 1 chain link, and this is the first link
		//The normal sql is converted into a psuedo driver table, with a where x in (select x from y) to help with pull size;
	}
	
}

/////////////////////////////////
//	Help Functions
/////////////////////////////////

//No auxiliary functions

help = function(args) {
	//Basic structure will be help(main_topic,sub_topic (optional));
	//console.log(args);
	//console.log('help command');
	var help_file = help_docs.find({topic_name : args[0]}).fetch();
	var today = new Date();
	var datetime = today.today()+" @ "+today.timeNow();
	var build_constructor = {
		user_id : Meteor.userId(),
		command : 'Help file for : '+args[0],
		command_time : datetime,
		success : help_file ? true : false,
		output_text : help_file[0]['help_text'],
		command_block : Session.get("current_command"),
		active : true
	};
	//console.log(build_constructor);
	build_commands.insert(build_constructor);
	return false;
}

/////////////////////////////////
//	Comment Functions
/////////////////////////////////

//No auxiliary functions

comment = function(text){
	//Posts a comment to the current script in the single line format (i.e. --Comment Text)
	var today = new Date();
	var datetime = today.today()+" @ "+today.timeNow();
	var build_constructor = {user_id : Meteor.userId(), 
							command : text, 
							metric_name : 'Comment', 
							sql_output : text.replace('//', '--'), 
							success : true, 
							commmand_time : datetime, 
							output_text : 'Done.',
							command_block : Session.get("current_command"),
							active : true };
	//console.log('comment');
	return build_constructor;
}

/////////////////////////////////
//	Raw SQL Functions
/////////////////////////////////

//No auxiliary functions

raw = function(text){
	//Posts a comment to the current script in the single line format (i.e. --Comment Text)
	var today = new Date();
	var datetime = today.today()+" @ "+today.timeNow();
	console.log(text);
	var sql = text+';';
	var build_constructor = {user_id : Meteor.userId(), 
							command : "Raw SQL", 
							metric_name : 'Raw SQL', 
							sql_output : sql,
							success : true, 
							commmand_time : datetime, 
							output_text : 'Raw SQL added',
							command_block : Session.get("current_command"),
							active : true };
	//console.log('comment');
	return build_constructor;
}

run['add_metric'] = add_metric;
run['create_metric'] = create_metric;
run['select'] = select;
run['chain'] = chain;
run['help'] = help;
run['create'] = create;
run['raw'] = raw;


*/
