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
export_docs = new Meteor.Collection("export_docs");

if (Meteor.isServer) {
	
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
	Session.setDefault("history_search_query", false);
	Session.setDefault("export_flag", false);	
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
		$('#main').html(Meteor.render(Template.script_builder));
		Session.set("current_command", false);
		Session.set("history_num", 0);},
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
		$('#main').html(Meteor.render(Template.docs));},
	'click #launch_export' : function(event) {
		$('#main').html(Meteor.render(Template.export_docs));}												
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

