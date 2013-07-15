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
scripts = new Meteor.Collection("scripts");

if (Meteor.isServer) {
	
//help_docs.insert({topic_name : "add_metric", help_text : help_text});
Meteor.publish("metric_library", function() {
	return metric_library.find({creator : this.userId});
});
Meteor.publish("build_commands", function() {
	return build_commands.find({user_id : this.userId});
});
Meteor.publish("databases", function() {
	return databases.find({});
});
Meteor.publish("tables", function() {
	return tables.find({});
});
Meteor.publish("columns", function() {
	return columns.find({});
});
Meteor.publish("settings", function() {
	return settings.find({user_id : this.userId});
});
Meteor.publish("feedback", function() {
	return databases.find({user_id : this.userId});
});
Meteor.publish("docs", function() {
	return docs.find({});
});
Meteor.publish("help_docs", function() {
	return help_docs.find({});
});
Meteor.publish("export_docs", function() {
	return export_docs.find({user_id : this.userId});
});

Meteor.publish("scripts", function() {
	return scripts.find({user_id : this.userId});
});


}
	
if (Meteor.isClient) {		
/////////////////////////////////////////////////////
//Startup Code: Setting Session Variables,

Meteor.startup(function() {
	Session.setDefault("metric_name", false);
	Session.setDefault("cols_added", false);
	Session.setDefault("join_src", false);
	Session.setDefault("join_cols", false);
	Session.setDefault("extra_sql", false);
	Session.setDefault("indices", false);
	Session.setDefault("prep_sql", false);
	Session.setDefault("db_searched", false);
	Session.setDefault("table_searched", false);
	Session.setDefault("db_selected", false);	
	Session.setDefault("table_selected", false);
	Session.setDefault("settings_selected", "Preferences");		
	Session.setDefault("search_condition", null);
	Session.setDefault("current_metric_m", false);
	Session.setDefault("metric_searched_m", false);
	Session.setDefault("history_search_query", false);
	Session.setDefault("export_flag", true);
	Session.setDefault("syntax-type", "teradata");
	Session.setDefault("advanced_search", false);
	Session.setDefault("mod_saved", true);
	Session.setDefault("preview_type", "create");		
});
/////////////////////////////////////////////////////	
//Subscriptions
//Coming after autopublish is turned off

Meteor.subscribe("metric_library");
Meteor.subscribe("build_commands");
Meteor.subscribe("databases");
Meteor.subscribe("tables");
Meteor.subscribe("columns");
Meteor.subscribe("feedback");
Meteor.subscribe("docs");
Meteor.subscribe("help_docs");
Meteor.subscribe("export_docs");
Meteor.subscribe("settings");
Meteor.subscribe("scripts");


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
		//Session.set("search_condition", null);
		Session.set("advanced_search", false)},
	'click #launch_build' : function(event) {
		$('#main').html(Meteor.render(Template.script_builder));
		Session.set("current_command", false);
		Session.set("history_num", 0);},
	'click #launch_explore' : function(event) {
		$('#main').html(Meteor.render(Template.explorer));
		Session.set('db_searched', false);
		Session.set('table_searched', false);
		},
	'click #launch_modify' : function(event) {
		$('#main').html(Meteor.render(Template.modify));
		Session.set('metric_searched_m', false);},
	'click #launch_scripts' : function(event) {
		$('#main').html(Meteor.render(Template.my_scripts));
		Session.set('script_selected', false);},										
	'click #launch_settings' : function(event) {
		$('#main').html(Meteor.render(Template.settings));},
	'click #launch_feedback' : function(event) {
		$('#main').html(Meteor.render(Template.feedback));},
	'click #launch_docs' : function(event) {
		$('#main').html(Meteor.render(Template.docs));},
	'click #launch_export' : function(event) {
		$('#main').html(Meteor.render(Template.export_main));}												
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

