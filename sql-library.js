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

Meteor.methods = ({
	'remove_docs' : function() {
		var doc_files = docs.find({}).fetch();
		for (file in doc_files) 
		{
			docs.remove(doc_files[file]["_id"]);
		}
	},
	'insert_docs' : function() {
		docs.insert({topic_name : 'Introduction ', order : 1});
		docs.insert({topic_name : '--What ', order : 2});
		docs.insert({topic_name : '--Why ', order : 3});
		docs.insert({topic_name : '--How ', order : 4});
		docs.insert({topic_name : '--Where ', order : 5});
		docs.insert({topic_name : 'Core Functions ', order : 6});
		docs.insert({topic_name : '--Script Builder ', order : 7});
		docs.insert({topic_name : '--Search Metrics ', order : 8});
		docs.insert({topic_name : '--Database Explorer ', order : 9});
		docs.insert({topic_name : '--Create Metric ', order : 10});
		docs.insert({topic_name : '--Modify Metric ', order : 11});
		docs.insert({topic_name : '--Settings ', order : 12});
		docs.insert({topic_name : '--Feedback ', order : 13});
		docs.insert({topic_name : '--Documentation ', order : 14});
		docs.insert({topic_name : '--Admin ', order : 15});
		docs.insert({topic_name : '--Stored Scripts ', order : 16});
		docs.insert({topic_name : 'Core Commands ', order : 17});
		docs.insert({topic_name : '--General syntax ', order : 18});
		docs.insert({topic_name : '--add_metric', order : 19});
		docs.insert({topic_name : '--create_metric', order : 20});
		docs.insert({topic_name : '--create', order : 21});
		docs.insert({topic_name : '--select', order : 22});
		docs.insert({topic_name : '--comment', order : 23});
		docs.insert({topic_name : '--help', order : 24});
		docs.insert({topic_name : '--chain', order : 25});
		docs.insert({topic_name : '--find', order : 26});
		docs.insert({topic_name : 'Theory ', order : 27});
		docs.insert({topic_name : '--Modularity ', order : 28});
		docs.insert({topic_name : '--Convention over Configuration ', order : 29});
		docs.insert({topic_name : '--Temporary Tables ', order : 30});
		docs.insert({topic_name : 'Settings ', order : 31});
		docs.insert({topic_name : '--Create vs. Update Mode ', order : 32});
		docs.insert({topic_name : '--Formatting Option Sets ', order : 33});
		docs.insert({topic_name : 'General SQL Resources ', order : 34});
		return 'docs inserted';
	}
});

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
		$('#main').html(Meteor.render(Template.script_builder));
		Session.set("current_command", false);
		Session.set("history_num", 0);
		},
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

