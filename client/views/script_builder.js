//Script Builder
Date.prototype.today = function(){ 
	console.log(this.getDate());
    return ((this.getDate() < 10)?"0":"") + this.getDate() +"/"+(((this.getMonth()+1) < 10)?"0":"") + (this.getMonth()+1) +"/"+ this.getFullYear() 
};
//For the time now
Date.prototype.timeNow = function(){
     return ((this.getHours() < 10)?"0":"") + this.getHours() +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() +":"+ ((this.getSeconds() < 10)?"0":"") + this.getSeconds();
};
/*
Template.script_builder.command = function() {
	return build_commands.find({user_id: Meteor.userId()}, {sort: {command_time: -1}, limit: 10});
}
*/
Template.script_builder.current_script = function() {
	return build_commands.find({user_id: Meteor.userId(), success: true}, {$sort: {command_time: 1}});
}

Template.script_builder.all_metrics = function() {
	return metric_library.find({}, {$sort: {used: -1}, limit: 10});
}

Template.script_builder.pre_run = function() {
	var error = Session.get("pre_run_error");
	if (error)
	{
		return Session.get("pre_run_error");
	}
}

/////////////////////////////////////////////////
//Script Builder Events
Template.script_builder.events = {
	'change #console_input' : function(event) {
		if (pre_run_check(event.target.value))
		{
			script_eval(event.target.value);
		}
		event.target.value = '';
	},
	'click #clear_current_script' : function(event) {
		var metrics = build_commands.find().fetch();
		for (metric in metrics)
		{
			build_commands.remove(metrics[metric]['_id']);
		}
	},
	'click .remove_script_metric' : function(event) {
		var metric = event.target;
		console.log(event.target.id);
		var metric_id = $(metric).attr("id");
		console.log(metric_id);
		build_commands.remove(metric_id);
	},
	
}

function pre_run_check(command) {
	console.log(command.indexOf('//'));
	if (command.indexOf(';') == -1)
	{
		Session.set("pre_run_error", "Valid commands must end with ;");
		return false;
	}
	else if (command.indexOf('(') == -1 && command.indexOf('//') == -1)
	{
		Session.set("pre_run_error", "Valid commands must have opening (");
		return false;
		console.log(command.indexOf('//'));
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
}

var run = {};
run['add_metric'] = add_metric;
run['create_metric'] = create_metric;
run['select'] = select;
run['chain'] = chain;
run['help'] = help;

function script_eval(command_block) {
	//This works for now, but the split method forces a new delimiter for each level. 
	//, is the first level delimiter
	//: is the second level delimiter
	//+ is probably going to be the third level delimiter, but that isn't final yet
	//An alternate method would be to ditch the split method, and instead read until the closing bracket had been found
	//This would be a cleaner method, and would yield a cleaner syntax as well - allowing all arguments to be separated by ,
	Session.set("current_command", command_block);
	var commands = command_block.split(';')
	var command = "";
	for (arg in commands)
	{
		command = commands[arg];
		if(command != "")
		{
			if (command.slice(0,2) != '//')
			{
				var command_type = command.slice(0,command.indexOf('('));
				var args = command.slice(command.indexOf('(')+1,command.indexOf(')')).split(',');
				console.log(args);
				run[command_type](args);
			}
			else
			{
				comment(command);
			}
		}	
	}	
}

function add_metric(args) {
	console.log('add metric command');
	var metric_name = args[0];
	var join_table = args[1];
	var join_cols = args[2].replace('{','').replace('}','').split(':');
	var option_set = args[3];
	var metric = metric_library.find({metric_name : metric_name}).fetch()[0];
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
	var success = true;
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
						metric_name : metric_name,
						command_block : Session.get("current_command")	
						};
	console.log(build_constructor);					
	build_commands.insert(build_constructor);									
}

function join_type(join_table) {
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
}

function table_name(join_table) {
	if (join_table.indexOf('/') != -1)
	{
		return join_table.slice(0,join_table.indexOf('/'));
	}
	else
	{
		return join_table;		
	}
}

function add_join(metric_join, driver_join) {
	console.log(metric_join);
	console.log(driver_join);
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
	console.log(sql);
	return sql;	
}

function in_builder(args) {
	//I don't think this function works 100% yet. I'm pretty sure it's still half baked.
	//Yep, this one won't work at all. The commas will cause the initial read to fail. 
	var list_column = args.slice(0,args.indexOf('/'));
	var list_command = args.slice(args.indexOf('/')+1);
	var list_options = args.slice(list_command.indexOf('('),list_command.indexOf(')')).split(',');
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
	return sql;
}

function comparison(arg) {
	//This should work good, except for list
	var options = {ne : "<>", gt : ">", gte : ">=", lt : "<", lte : "<=", list : in_builder};
	var col = arg.slice(0,arg.indexOf('/'));
	var opt = arg.slice(arg.indexOf('/')+1);
	if (arg.indexOf('/') != -1)
	{
		return col+" "+options[opt];
	}
	else
	{
		return arg+" =";
	}
}

function cols_added(cols) {
	var separate_cols = cols.split(':');
	var col_string = '';
	for (col in separate_cols)
	{
		col_string += ', b.'+separate_cols[col].replace('{','').replace('}','');
	}
	return col_string;
}

function join_cols(cols) {
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
}

function indices(cols) {
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
}

function prep_sql(text) {
	var display_text = "--SQL Preview for "+Session.get("metric_name")+":";
	if (text) 
	{
		display_text +='\n'+text;
	}
	return display_text;
}

function extra_sql(text){
	if (text) 
	{
		return text+"\n";
	}
	else
	{
		return "";
	}
}

function create_metric(args) {
	console.log(args);
	console.log('create metric command');
}

function select(args) {
	//Basic structure will be select({what},from where,{how});
	console.log(args);
	console.log('select command');
	var what = args[0];
	var where = args[1];
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
						command_block : Session.get("current_command")	
						};
	console.log(build_constructor);					
	build_commands.insert(build_constructor);
}

function selectify(arg) {
	//Select columns can have an optional operation type
	//This type is passed through the standard option syntax / (i.e. column_name/option)
	//Right now all of the math functions are supported
	//Note that in order to use these aggregate functions with segmentation will require the use of group bys in your where clause
	//
	//The selectify function takes a : delimited package of columns or the * argument, which translates to select *
	var options = {c : "count(", s : "sum(", a : "avg(", max : "max(", min : "min(" };
	var opt_functions = {left : left_str, substr : sub_str};
	var select_sql = "";
	if (arg == '*')
	{
		console.log('select all');
		return '*';
	}
	else
	{
		cols = arg.replace("{","").replace('}','').split(':');
		var i = 1;
		for (col in cols) 
		{
			if (cols[col].indexOf('/') != -1)
			{
				var name = cols[col].slice(0,cols[col].indexOf('/'));
				var opt = cols[col].slice(cols[col].indexOf('/')+1);
				var builder = options[opt] ? options[opt] : opt_functions[opt](opt);
				select_sql += options[opt]+name+')';
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

function left_str() {
	
}

function fromify(arg) {
	return 'FROM '+arg;
}

function whereify(how) {
	//right now gb and ob take their arguments delimited by + (i.e gb/1+2+3+4+5)
	options = {gb : 'group by ', ob : 'order by ', q : 'qualify row_number() over (partition by /parts/ order by /order/) /limit/ '};
	var where_sql = '';
	var args = how.replace('{','').replace('}','').split(':');
	for (arg in args) {
		var opt = args[arg].slice(0,args[arg].indexOf('/'));
		var condition = args[arg].slice(args[arg].indexOf('/')+1).replace('+',',');
		var i = 1;
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
	return where_sql;
}

function chain(args) {
	//Basic structure will be chain(chain_name,{metrics:here},{chain:conditions);
	//Chain should only be used when the metrics share the same join condition.
	//It is also useful for creating metric packages from the DB Explorer columns.
	//If several metrics share the same join.src, they will be condensed into a single add_metric
	console.log(args);
	console.log('chain command');
	var name = args[0];
	var metrics = args[1].replace('{','').replace('}','').split(':');
	var conditions = args[2].replace('{','').replace('}','').split(':');
	
	
}

function help(args) {
	//Basic structure will be help(main_topic,sub_topic (optional));
	console.log(args);
	console.log('help command');
	var help_file = help_docs.find({topic_name : args[0]}).fetch();
	var today = new Date();
	var datetime = today.today()+" @ "+today.timeNow();
	var build_constructor = {
		user_id : Meteor.userId(),
		command : 'Help file for : '+args[0],
		command_time : datetime,
		success : help_file ? true : false,
		output_text : help_file[0]['help_text'],
		command_block : Session.get("current_command")
	};
	console.log(build_constructor);
	build_commands.insert(build_constructor);
/*
Help commands will be:
add_metric: Basic syntax
create_metric : Basic syntax
comment :
help : 
select : 
chain : 
list : 
find : 
save : 
*/
}

function comment(text){
	//Posts a comment to the current script in the single line format (i.e. --Comment Text)
	var today = new Date();
	var datetime = today.today()+" @ "+today.timeNow();
	build_commands.insert({user_id : Meteor.userId(), 
							command : text, 
							metric_name : 'Comment', 
							sql_output : text.replace('//', '--'), 
							success : true, 
							commmand_time : datetime, 
							output_text : 'Done.',
							command_block : Session.get("current_command") });
	console.log('comment');
}
