Template.my_scripts.my_scripts = function() {
	return scripts.find();
}

Template.my_scripts.script_selected = function() {
	return scripts.find({_id : Session.get("selected_script")});
}

Template.script_sql.sql_output = function() {
	return _.first(scripts.find({_id : Session.get("selected_script")}).fetch()).sql_output;
}

Template.script_blocks.build_commands = function() {
	return _.first(scripts.find({_id : Session.get("selected_script")}).fetch()).build_commands;
}
Template.my_scripts.rendered = function() {
	truthy(Session.get("selected_script")) ? $('#'+Session.get("selected_script")).addClass("info") : console.log('no script selected');
	var user_names = [];
	Meteor.call("get_group_members", function(error, result) {console.log(result); user_names = result; $('#group_users').typeahead({source : result});});
}

Template.my_scripts.events = {
	'click #script_search' : function(event) {
		var script_name = $('#script_query').val();
		Session.set('script_searched', metric_name);
		return false;
	},
	'change #script_query' : function(event) {
		var metric_name = $('#script_query').val();
		console.log(metric_name);
		Session.set('script_searched', metric_name);
	},
	'click .script_results' : function(event) {
		var selected = event.currentTarget;
		$('#'+Session.get('selected_script')).removeClass('info');
		$(selected).addClass("info");
		var text = $(selected).attr('id');
		console.log(text);
		Session.set('selected_script', text);
	},
	'click #show_sql' : function(event) {
		$("#output-container").html(Meteor.render(Template.script_sql));
	},
	'click #show_blocks' : function(event) {
		$("#output-container").html(Meteor.render(Template.script_blocks));
	},
	'click .delete-script' : function(event) {
		scripts.remove($(event.target).attr('name'));
	},
	'click .share-script' : function(event) {
		$('#share-script-submit').attr('name', $(event.target).attr('name'));
		//$('#share-group-members')
		$('#share_script_modal').modal('show');
	},
	'click #share_script_submit' : function(event) {
		var user = extract("group_member_id", $('#group_users').val());
		share_script(Session.get("selected_script"), user);
		return false;
	},
	'click .edit-commands' : function(event) {
		$('#update_script').removeClass('btn-inverse').addClass('btn-warning').html('Save Changes');
	},
	'click #update_script' : function(event) {
		$(event.target).removeClass('btn-warning').addClass('btn-inverse').html('Saved!');
	},
	'click .load-script' : function(event) {
		$('#load_script_modal').modal('show');
	},
	'click #submit_load_script' : function(event) {
		load_script(Session.get("selected_script"));
	}	
}