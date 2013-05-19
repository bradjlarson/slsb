//Collections
metric_library = new Meteor.Collection("metric_library");
build_commands = new Meteor.Collection("build_commands");
databases = new Meteor.Collection("databases");
tables = new Meteor.Collection("tables");
columns = new Meteor.Collection("columns");
settings = new Meteor.Collection("settings");
feedback = new Meteor.Collection("feedback");
docs = new Meteor.Collection("docs");
help_docs = new Meteor.Collection("help");

if (Meteor.isServer) {
	
var help_text = "\tThe add_metric command is used to add a metric to your current script. It has the following syntax: \nadd_metric(which_metric,append_to_which_table,{join:on});\n\t>which_metric is the name of the metric you\'d like to add \n\t>append_to_which_table is the name of the table you\'d like to add the information to \n\t>>The script structure assumes a driver table that you append additional data points onto \n\t>>Enter your driver table name for the first table, or last to add it to the last table in your script \n\t>{join:on} are your join conditions, surrounded by { and } and separated by : \n\t>>Join conditions are limited by first N in the add_metric argument\n";

//help_docs.insert({topic_name : "add_metric", help_text : help_text});

}
	
if (Meteor.isClient) {		
/////////////////////////////////////////////////////
//Startup Code: Setting Session Variables,

Meteor.startup(function() {
	Session.setDefault("metric_name", "metric_name");
	Session.setDefault("cols_added", "{cols:added}");
	Session.setDefault("join_src", "join.src");
	Session.setDefault("join_cols", "{join:cols}");
	Session.setDefault("extra_sql", "--Like where, group by, qualify");
	Session.setDefault("indices", "{primary:indices}");
	Session.setDefault("prep_sql", false);
	Session.setDefault("db_searched", false);
	Session.setDefault("table_searched", false);
	Session.setDefault("db_selected", false);	
	Session.setDefault("table_selected", false);
	Session.setDefault("settings_selected", "Preferences");		
	Session.setDefault("search_condition", null);
	Session.setDefault("search_field", null);
	Session.setDefault("current_metric_m", false);
	Session.setDefault("metric_searched_m", false);
});
/////////////////////////////////////////////////////	
//Subscriptions
//Coming after autopublish is turned off

/////////////////////////////////////////////////////
//Misc.
$('#quick_add').on('shown', function () {
	$('#quick_add_prompt').focus();
});
$('#prep_sql').on('shown', function () {
	$('#prep_sql_prompt').focus();
});

/////////////////////////////////////////////////////
//Events
//Sidebar Events:
Template.side_bar.events = {
	'click #launch_create' : function(event) {
		$('#main').html(Meteor.render(Template.create));},
	'click #launch_search' : function(event) {
		$('#main').html(Meteor.render(Template.search));
		Session.set("search_condition", null);
		Session.set("search_field", null);},
	'click #launch_build' : function(event) {
		$('#main').html(Meteor.render(Template.script_builder));},
	'click #launch_explore' : function(event) {
		$('#main').html(Meteor.render(Template.explorer));
		Session.set('db_searched', false);
		Session.set('table_searched', false);
		Session.set('db_selected', false);
		Session.set('table_selected', false);},
	'click #launch_modify' : function(event) {
		$('#main').html(Meteor.render(Template.modify));
		Session.set('metric_searched_m', false);},					
	'click #launch_settings' : function(event) {
		$('#main').html(Meteor.render(Template.settings));},
	'click #launch_feedback' : function(event) {
		$('#main').html(Meteor.render(Template.feedback));},
	'click #launch_docs' : function(event) {
		$('#main').html(Meteor.render(Template.docs));}												
};

/////////////////////////////////////////////////////
//Helpers
//Welcome Screen
Template.welcome_screen.current_user = function() {
	if (Meteor.user()) {
		return Meteor.user().profile.name;	
	}
	else 
	{
//		Meteor.loginWithGoogle();
		return "new user"
	}
};

Template.page_header.events= {
	'click #page_header' : function(event) {
		$('#main').html(Meteor.render(Template.welcome_screen));
	}
};

}

