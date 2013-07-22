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
organizations = new Meteor.Collection("organizations");
groups = new Meteor.Collection("groups");
admins = new Meteor.Collection("admins");
access = new Meteor.Collection("access");
msgs = new Meteor.Collection("msgs");

if (Meteor.isServer) {
	
Accounts.onCreateUser(function(options, user) {
	console.log(user);
	settings.insert({user_id : user['_id'], name : "", email : "", syntax_type : ""});
	if (options.profile) {user.profile = options.profile;}
	return user;
});

Meteor.methods({
	get_group_members : function() {
		var groups = _.pluck(access.find({user_id : this.userId, group_name : {$exists : true}}).fetch(), "group_name");
		var user_names = [];
		_.each(access.find({group_name : {$in : groups}, access : "granted"}).fetch(), function(access) {
			user_names.push(access.user_name+" ("+access.user_id+")");
		});
		return user_names;
	},
	share_script : function(script) {
		console.log(script);
		return scripts.insert(script);
	},
	get_my_groups : function() {
		var group_names = [];
		group_names.push("My Library ("+this.userId+")");
		var groups = access.find({user_id : this.userId, access : "granted"}).fetch();
		_.each(groups, function(x) {
			group_names.push(x.organization_name+"-"+x.group_name);
		});
		return group_names;
	}
})

truthy = function(x) { return (x !== false) && existy(x); };
existy = function(x) { return x != null };
	
//help_docs.insert({topic_name : "add_metric", help_text : help_text});
Meteor.publish("my_libs", function() {
	var group_names = [];
	group_names.push("My Library ("+this.userId+")");
	var groups = access.find({user_id : this.userId, access : "granted"}).fetch();
	_.each(groups, function(x) {
		group_names.push(x.organization_name+"-"+x.group_name);
	});
	return metric_library.find({collection : {$in : group_names}});
});

Meteor.publish("my_metrics", function(libs) {
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
	this.ready();
	return settings.find({user_id : this.userId});
});
Meteor.publish("feedback", function() {
	if (admins.find({user_id : this.userId}).count() > 0)
	{
		return feedback.find();
	}
	else
	{
		return feedback.find({user_id : this.userId});
	}
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

Meteor.publish("organizations", function() {
	return organizations.find();
});

Meteor.publish("groups", function(org) {
	//var my_orgs = _.pluck(access.find({user_id : this.userId, organization_name : {$exists : true}}).fetch(), "organization_name");
	return groups.find({organization_name : org});
});

Meteor.publish("access", function() {
	//return access.find();
	if (admins.find({user_id : this.userId}).count() > 0)
	{
		var admin_groups = _.pluck(admins.find({user_id : this.userId}).fetch(), "group_name");
		console.log(admin_groups);
		return access.find({group_name : {$in : admin_groups}});
	}
	else
	{
		return access.find({user_id : this.userId});
	}
});

Meteor.publish("admins", function() {
	return admins.find({user_id : this.userId});
});

Meteor.publish("msgs", function() {
	return msgs.find({$or: [{from_user : this.userId}, {to_user : this.userId}]});
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
	Session.setDefault("selected_org", false);
	Session.setDefault("my_groups", Meteor.userId());
	Meteor.call("get_my_groups", function(error, result) {Session.set("my_groups", result)});		
});
/////////////////////////////////////////////////////	
//Subscriptions
//Coming after autopublish is turned off

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
Meteor.subscribe("organizations");
Meteor.subscribe("groups", Session.get("selected_org"));
Meteor.subscribe("access");
Meteor.subscribe("admins");
Meteor.subscribe("msgs");
Meteor.subscribe("my_metrics");
Meteor.subscribe("my_libs", Session.get("my_groups"));

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
		$('#main').html(Meteor.render(Template.export_main));},
	'click #launch_admin' : function(event) {
		var check = admins.find({user_id : Meteor.userId()});
		if(check.count() > 0)
		{
			$('#main').html(Meteor.render(Template.admin));
		}
	}													
};

Template.side_bar.admin_check = function() {
	var check = admins.find({user_id : Meteor.userId()});
	if(check.count() > 0)
	{
		return true;
	}
	else
	{
		return false;
	}
};

Template.side_bar.convos = function() {
	return msgs.find({user_id : Meteor.userId(), status : 'active'}, {sort : {last_msg_time : -1}}).count();
};

Template.side_bar.adminsations = function() {
	var admin_profile = _.first(admins.find().fetch());
	return feedback.find({resolved : false}, {sort : {create_date : -1}}).count()  
	+ access.find({group_name : admin_profile.group_name, access : "pending"}).count();
};

Template.side_bar.num_commands = function() {
	return build_commands.find({user_id : Meteor.userId(), active : true}, {sort : {command_time: 1}}).count();
}

/////////////////////////////////////////////////////
//Helpers
//Welcome Screen
Template.welcome_screen.current_user = function() {
	if (Meteor.user()) {
		var current_profile = _.first(settings.find({user_id : Meteor.userId()}, {sort : {create_time : 1}}).fetch());
		return is_empty(current_profile) ? "new user" : current_profile['name'];
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

