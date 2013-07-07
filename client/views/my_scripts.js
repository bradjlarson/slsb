Template.my_scripts.my_scripts = function() {
	return scripts.find();
}

Template.my_scripts.script_selected = function() {
	return scripts.find({_id : Session.get("selected_script")});
}

Template.script_sql.sql_output = function() {
	return _.first(scripts.find({_id : Session.get("selected_script")}).fetch()).sql_output;
}

Template.script_blocks.commands_input = function() {
	return _.first(scripts.find({_id : Session.get("selected_script")}).fetch()).commands_input;
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
		$('#share-modal').modal('show');
	}	
}