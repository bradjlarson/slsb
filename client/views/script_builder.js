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
	return build_commands.find({user_id: Meteor.userId()}, {$sort: {command_time: 1}});
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

Template.script_builder.chistory = function() {
	return Session.get("current_command");
}

Template.script_builder.current_command = function() {
	if (Session.get("current_command"))
	{
		var num = Session.get("history_num");
		if (build_commands.find().fetch())
		{
			return build_commands.find({},{$sort : {command_time : -1}}).fetch()[0][num];
		}
		else
		{
			return "";
		}
		
	}
	else
	{
		return "";
	}
}
/*
Template.script_builder.key_cuts = function() {
	Mousetrap.bind('up', function() {var current_num = Session.get("history_num"); var new_num = current_num ++; Session.set("history_num", new_num);});
}
*/

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
run['create'] = create;

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

/////////////////////////////////
//	Add Metric Command functions
/////////////////////////////////

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
	metric_library.update(metric['_id'], {$inc : {used : 1}});					
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
	else
	{
		return '';
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

/////////////////////////////////
//	Create Metric Functions
/////////////////////////////////	

function create_metric(args) { 
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
						command_block : Session.get("current_command")	
						};
	console.log(build_constructor);					
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
							command_block : Session.get("current_command")	
							};
		console.log(build_constructor);					
		build_commands.insert(build_constructor);
	}
	console.log(args);
	console.log('create metric command');
}

/////////////////////////////////
//	Create Functions
/////////////////////////////////

function create(args) {
	//This command is basically a select command, with a few extra arguments (table name, {indices})
	console.log(args);
	console.log('create command');
	var table_name = args[0];
	var what = args[1];
	var where = args[2];
	var how = args[3];
	var indices_pkg = args[4];
	var output_sql = "CREATE "+table_type(table_name)+" AS (\n";
	output_sql += "SELECT "+selectify(what)+"\n";
	output_sql += fromify(where)+"\n";
	output_sql += whereify(how);
 	if (indices_pkg)
	{
		output_sql += ") WITH DATA\n"+"PRIMARY INDEX("+indices(indices_pkg)+");\n";
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
						metric_name : 'Create Table',
						command_block : Session.get("current_command")	
						};
	console.log(build_constructor);					
	build_commands.insert(build_constructor);
}

function table_type(table) {
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
		table_sql += table;
	}
	else
	{
		table_sql += table;
	}
	return table_sql;
}


/////////////////////////////////
//	Select Functions
/////////////////////////////////

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
	//var opt_functions = {left : left_str, substr : sub_str};
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

function fromify(arg) {
	return 'FROM '+arg;
}

function whereify(how) {
if (how)
{
	//right now gb and ob take their arguments delimited by + (i.e gb/1+2+3+4+5)
	var options = {gb : 'group by ', ob : 'order by ', q : 'qualify row_number() over (partition by /parts/ order by /order/) /limit/ '};
	var where_sql = '';
	var args = how.replace('{','').replace('}','').split(':');
	var i = 1;
	for (arg in args) {
		var opt = args[arg].slice(0,args[arg].indexOf('/'));
		var condition = args[arg].slice(args[arg].indexOf('/')+1).replace('+',',');
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

function chain(args) {
	//Basic structure will be chain(chain_name,{metrics:here},{chain:conditions);
	//Chain should only be used when the metrics share the same join condition.
	//It is also useful for creating metric packages from the DB Explorer columns.
	//If several metrics share the same join.src, they will be condensed into a single add_metric
	//Currently, if multiple metrics add the same column name, only the first will be kept
	console.log(args);
	console.log('chain command');
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
		command_block : Session.get("current_command")
	};
	build_commands.insert(build_constructor);
		
}



function build_prep_sql(metric,last_metric,join_cols) {
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

/////////////////////////////////
//	Comment Functions
/////////////////////////////////

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