Template.engine.helpers({
	pre_run_check : function(command) {
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
	},
	script_eval : function(command_block) {
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
	},
	add_metric: function(args) {
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
	},
	join_type: function(join_table) {
		if (join_table.indexOf('/') != -1)
		{
			//doesn't accept arguments yet, but has the ability to
			//probably will need the ability to do different join types
			return join_table.slice(0,join_table.indexOf('/'));
		}
		else
		{
			return join_table;		
		}
	},
	table_name: function(join_table) {
		if (join_table.indexOf('/') != -1)
		{
			return join_table.slice(0,join_table.indexOf('/'));
		}
		else
		{
			return join_table;		
		}
	},
	add_join: function(metric_join, driver_join) {
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
	},
	in_builder: function(args) {
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
	},
	comparison: function(arg) {
		//in option doesn't work
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
	},
	cols_added: function(cols) {
		var separate_cols = cols.split(':');
		var col_string = '';
		for (col in separate_cols)
		{
			col_string += ', b.'+separate_cols[col].replace('{','').replace('}','');
		}
		return col_string;
	},
	join_cols: function(cols) {
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
	},
	indices: function(cols) {
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
	},
	prep_sql: function(text) {
		var display_text = "--SQL Preview for "+Session.get("metric_name")+":";
		if (text) 
		{
			display_text +='\n'+text;
		}
		return display_text;
	},
	extra_sql: function(text) {
		if (text) 
		{
			return text+"\n";
		}
		else
		{
			return "";
		}
	},
	create_metric: function(args) {
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
	},
	select: function(args) {
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
	},
	selectify: function(arg) {
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
	},
	fromify: function(arg) {
		return 'FROM '+arg;
	},
	whereify: function(how) {
		if (how)
		{
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
			return where_sql ? where_sql : ' ';
		}
		else
		{
			return ' ';
		}
	},
	chain: function(args) {
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
	},
	build_prep_sql: function(metric,last_metric,join_cols) {
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
	},
	help: function(args) {
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
	},
	comment: function(text) {
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
});