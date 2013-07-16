//Script Builder
Date.prototype.today = function(){ 
	//console.log(this.getDate());
    return (((this.getMonth()+1) < 10)?"0":"") + (this.getMonth()+1) +"/"+((this.getDate() < 10)?"0":"") + this.getDate() +"/"+ this.getFullYear() 
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
Template.script_builder.existing_scripts = function() {
	return scripts.find();
}

Template.script_builder.current_script = function() {
	return build_commands.find({user_id : Meteor.userId(), active : true}, {sort : {command_time: 1}});
}

Template.command_line.current_script = function() {
	return build_commands.find({user_id : Meteor.userId(), active : true}, {sort : {command_time: 1}});
}

Template.command_history.past_command = function() {
	if (Session.get("history_search_query"))
	{
		return build_commands.find({user_id : Meteor.userId(), command_block : Session.get("history_search_query")});
	}
	else
	{
		return build_commands.find({user_id : Meteor.userId()}, {sort : {command_time : -1}, limit : 10});
	}
	
}

Template.script_builder.all_metrics = function() {
	return metric_library.find({}, {sort: {used: -1}, limit: 10});
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
			console.log('change_triggered');
			console.log(event.target.value);
			if (event.target.value)
			{
				process_block(event.target.value);
				$('#save_current_script').html('Save');
			}
		}
		//event.target.value = '';
	},
	'click #clear_current_script' : function(event) {
		var metrics = build_commands.find().fetch();
		for (metric in metrics)
		{
			build_commands.update(metrics[metric]['_id'], {$set : {active : false}});
		}
	},
	'click #save_current_script' : function(event) {
		$('#script_save_modal').modal('show');
		/*
		var metrics = build_commands.find({active : true}).fetch();
		build_script(metrics);
		$(event.target).html("Saved!");
		*/
	},
	'change #script_name_old' : function(event) {
		Session.set("update_script_id", $(event.target).val());
	},
	'change #script_name' : function(event) {
		Session.set("update_script_id", false);
	},
	'click #save_script' : function(event) {
		if(Session.get("update_script_id"))
		{
			var blocks = build_commands.find({active : true}, {sort : {command_time : 1}}).fetch();
			update_script(Session.get("update_script_id"), blocks, ($('#script_desc').val().length > 0) ? $('#script_desc').val() : false);
			$('#save_current_script').html('Saved!');
		}
		else
		{
			var blocks = build_commands.find({active : true}, {sort : {command_time : 1}}).fetch();
			build_script(blocks, $('#script_name').val(), $('#script_desc').val());
			$('#save_current_script').html('Saved!');
		}
	},
	'click .remove_script_metric' : function(event) {
		var metric = event.target;
		//console.log(event.target.id);
		var metric_id = $(metric).attr("id");
		//console.log(metric_id);
		build_commands.update(metric_id, {$set : {active : false}});
	},
	'change .edit-command' : function(event) {
		var command_id = $(event.target).attr("name");
		var new_val = $(event.target).val();
		//console.log(command_id);
		console.log(new_val);
		//build_commands.update(command_id, {$set : {command_block : new_val}});
		recompile(command_id, new_val);
	},
	'click #recompile_script' : function(event) {
		console.log("recompile clicked");
		var metrics = build_commands.find({user_id : Meteor.userId(), active : true}).fetch();
		for (metric in metrics)
		{
			if (metric)
			{
				recompile(metrics[metric]['_id'], metrics[metric]['command_block']);
			}
		}
	},
	'click #simple_form_select' : function(event) {
		$("#command_input").html(Meteor.render(Template.simple_form));
		console.log("simple form");
		Session.set("history_search_query", false);
	},
	'click #command_line' : function(event) {
		$("#command_input").html(Meteor.render(Template.command_line));
		console.log("command line");
		Session.set("history_search_query", false);
	},
	'click #command_history' : function(event) {
		$("#command_input").html(Meteor.render(Template.command_history));
		console.log("command history");
	}
}

////////////////////////////////////
//Template: command_history events:
////////////////////////////////////

Template.command_history.events = {
	'change #query_history' : function(event) {
		Session.set("history_search_query", event.target.value);
	},
	'click #history_submit' : function(event) {
		Session.set("history_search_query", $("#query_history").val());
	},
	'click .history_add' : function(event) {
		var build_constructor = build_commands.find({_id : event.target.id}).fetch()[0];
		Session.set("last_table", "add_"+build_constructor.metric_name);
		var today = new Date();
		var datetime = today.today()+" @ "+today.timeNow();
		build_constructor.command_time = datetime;
		build_constructor.active = true;
		delete build_constructor['_id'];
		//console.log(build_constructor);
		build_commands.insert(build_constructor);
	},
	'click .remove_history' : function(event) {
		var doc_id = $(event.target).attr("name");
		//console.log(doc_id);
		build_commands.remove(doc_id);
	},
	'click .edit_history' : function(event) {
		var new_html = '<input name="'+$(event.target).attr("name")+'"class="editing_history input-xlarge" type="text" value="'+$(event.target).html()+'">'; 
		console.log($(event.target).html());
		console.log(new_html);
		$(event.target).html(new_html);
	},
	'change .editing_history' : function(event) {
		var new_command = $(event.target).val();
		var doc_id = $(event.target).attr("name");
		recompile(doc_id, new_command);
		$(event.target).parent().html(new_command);
		//console.log(new_command);
		//console.log(doc_id);
	}
}

Template.command_history.rendered = function() {
	var commands = [];
	build_commands.find({user_id : Meteor.userId()}).forEach(function(command) {
		commands.push(command.command_block);
	})
	$('#query_history').typeahead({source: commands});
}

////////////////////////////////////
//Template.simple_form events
////////////////////////////////////

Template.simple_form.events = {
	'click #simple_create' : function(event) {
		$("#simple_form").html(Meteor.render(Template.create_simple));
		console.log("simple create");
	},
	'click #simple_select' : function(event) {
		$("#simple_form").html(Meteor.render(Template.select_simple));
		console.log("simple create");
	},
	'click #simple_add_metric' : function(event) {
		$("#simple_form").html(Meteor.render(Template.add_metric_simple));
		console.log("simple create");
	},
	'click #simple_chain' : function(event) {
		$("#simple_form").html(Meteor.render(Template.chain_simple));
		console.log("simple create");
	},
	'click #simple_comment' : function(event) {
		$("#simple_form").html(Meteor.render(Template.comment_simple));
		console.log("simple create");
	}
};

Template.create_simple.events = {
	'change .create-simple-input' : function(event) {
		simple_create_update();
	},
	'click #simple_create_submit' : function(event) {
		simple_create_update();
		Session.set("simple_id", false);
		$('#simple_create_form')[0].reset();
		return false;
	}
};

Template.select_simple.events = {
	'change .create-simple-input' : function(event) {
		simple_select_update();
	},
	'click #simple_create_submit' : function(event) {
		simple_select_update();
		Session.set("simple_id", false);
		$('#simple_select_form')[0].reset();
		return false;
	}
};

Template.add_metric_simple.events = {
	'change .add-simple-input' : function(event) {
		simple_add_metric_update();
	},
	'click #simple_add_metric_submit' : function(event) {
		simple_add_metric_update();
		Session.set("simple_id", false);
		$('#simple_add_metric_form')[0].reset();
		return false;
	}
};

Template.chain_simple.events = {
	/*
	'change .chain-simple-input' : function(event) {
		simple_chain_update();
	},
	'click #simple_chain_submit' : function(event) {
		simple_chain_update();
		Session.set("simple_id", false);
		$('#simple_chain_form')[0].reset();
		return false;
	}
	*/
};

Template.comment_simple.events = {
	'change .comment-simple-input' : function(event) {
		simple_comment_update();
	},
	'click #simple_comment_submit' : function(event) {
		simple_comment_update();
		Session.set("simple_id", false);
		$('#simple_comment_form')[0].reset();
		return false;
	}
};

function simple_create_update() {
	var table_name = $('#simple_create_name').val();
	Session.set("last_table", table_name);
	var cols_added = $('#simple_create_what').val();
	var data_src = $('#simple_create_from').val();
	var extra_sql = $('#simple_create_how').val();
	var indices = $('#simple_create_index').val();
	var create_command = 'create({'+table_name+'},{'+cols_added+'},{'+data_src+'},{'+extra_sql+'},{'+indices+'});';
	make_command(create_command);
}

function simple_select_update() {
	var what = $('#simple_select_what').val();
	var data_src = $('#simple_select_from').val();
	var extra_sql = $('#simple_select_how').val();
	var select_command = 'select({'+what+'},{'+data_src+'},{'+extra_sql+'});';
	make_command(select_command);
}

function simple_add_metric_update() {
	var metric_name = $('#simple_metric_name').val();
	var data_src = $('#simple_data_append').val();
	var extra_sql = $('#simple_join_cols').val();
	var add_metric_command = 'add_metric({'+metric_name+'},{'+data_src+'},{'+extra_sql+'});';
	make_command(add_metric_command);
}

function simple_comment_update() {
	var comment = $('#simple_comment_text').val();
	var comment_command = '//'+comment+';';
	make_command(comment_command);
}


function make_command(command) {
	var build_constructor = {};
	var today = new Date();
	var datetime = today.today()+" @ "+today.timeNow();
	build_constructor = {
						user_id : Meteor.userId(),
						command_time : datetime,
						success : true,
						//output_text : output_text,
						//sql_output : output_sql,
						//metric_name : metric_name_only,
						//command_block : Session.get("current_command"),
						active : true	
	};
	if (Session.get("simple_id"))
	{
		recompile(Session.get("simple_id"), command);
	}
	else
	{
		var new_id = build_commands.insert(build_constructor);
		console.log(new_id);
		Session.set("simple_id", new_id);
		recompile(Session.get("simple_id"), command);
	}
};
