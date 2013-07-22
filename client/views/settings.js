Template.settings.rendered = function() {
	var current_profile = _.first(settings.find({user_id : Meteor.userId()}, {sort : {create_time : 1}}).fetch());
	$('#setting_user_name').val(current_profile['name']);
	$('#setting_user_email').val(current_profile['email']);
	$('#syntax-type').val(current_profile['syntax_type']);
	Meteor.subscribe("my_libs", Session.get("my_groups"));
	//Session.set("selected_org", false);
}

//Settings Events:
Template.settings.events = {
	'change .acct_setting' : function(event) {
		$('#settings_save').removeClass('btn-inverse').addClass('btn-warning').html('Update Settings');
	},
	'click #settings_save' : function(event) {
		$('#settings_save').removeClass('btn-warning').addClass('btn-inverse').html('Settings saved.');
		update_all();
		return false;
	},
	'change #syntax-type' : function(event) {
		Session.set("syntax-type", event.target.value);
		console.log(event.target.value);
	},
	'click #launch_join_org' : function(event) {
		var current_profile = _.first(settings.find({user_id : Meteor.userId()}, {sort : {create_time : 1}}).fetch());
		if(current_profile['name'] != "")
		{
			$('#join_org_modal').modal('show');
		}
		else
		{
			$('#settings-errors').html(Meteor.render(Template.join_org_error));
		}
		
	},
	'click #submit_org_request' : function(event) {
		//route request to org admin
		var current_profile = _.first(settings.find({user_id : Meteor.userId()}, {sort : {create_time : 1}}).fetch());
		var org_name = $('#select_org').val();
		var group_name = $('#select_group').val();
		var role = $('#role_type').val();
		if($('#select_org').val() != "None")
		{
			$('#join_org_modal_body').html('<p>Access request submitted</p>');
			access.insert({user_id : Meteor.userId(), user_name : current_profile['name'], organization_name : org_name, group_name : group_name, access_type : role, request_time : get_timestamp(), access : "pending"});
			//$('#submit_org_requeset').html("Access Requested.").removeClass("btn-inverse").addClass("btn-success");
		}
		return false;
	},
	'click #launch_join_group' : function(event) {
		$('#join_group_modal').modal('show');
	},
	'click #submit_group_request' : function(event) {
		//route request to org admin
		var current_profile = _.first(settings.find({user_id : Meteor.userId()}, {sort : {create_time : 1}}).fetch());
		var grp_name = $('#select_group').val();
		if($('#select_group').val() != "None")
		{
			$('#join_group_modal_body').html('<p>Group Access request submitted</p>');
			access.insert({user_id : Meteor.userId(), user_name : current_profile['name'], group_name : grp_name, request_time : get_timestamp(), access : "pending"});
			//$('#submit_org_requeset').html("Access Requested.").removeClass("btn-inverse").addClass("btn-success");
		}
	},
	'change #select_org' : function(event) {
		var org = $(event.target).val();
		if (org != "none")
		{
			Session.set("selected_org", org);
		}
		else
		{
			Session.set("selected_org", false);
		}
		Meteor.subscribe("groups", Session.get("selected_org"));
	},
	'click #launch_manage_groups' : function(event) {
		$('#manage_group_modal').modal('show');
		return false;
	}
}

Template.settings.orgs = function() {
	return organizations.find();
}

Template.settings.groups = function() {
	return groups.find();
}

Template.settings.num_orgs = function() {
	return access.find({user_id : Meteor.userId(), organization_name : {$exists : true}, access : {$in : ['granted', 'pending']}}).count();
}

Template.settings.org_access = function() {
	if(access.find({organization_name : {$exists : true}, access : 'granted'}).count() > 0)
	{
		return access.find({user_id : Meteor.userId(), organization_name : {$exists : true}, access : 'granted'});
	}
	else
	{
		return false;
	}
}

Template.settings.group_access = function() {
	if(access.find({group_name : {$exists : true}, access : 'granted'}).count() > 0)
	{
		return access.find({user_id : Meteor.userId(), group_name : {$exists : true}, access : 'granted'});
	}
	else
	{
		return false;
	}
}

Template.settings.group_pending = function() {
	if(access.find({group_name : {$exists : true}, access : 'pending'}).count() > 0)
	{
		return access.find({user_id : Meteor.userId(), group_name : {$exists : true}, access : 'pending'});
	}
	else
	{
		return false;
	}
}

Template.settings.org_pending = function() {
	return access.find({user_id : Meteor.userId(), organization_name : {$exists : true}, access : 'pending'});
}

Template.settings.selected_org = function() {
	return Session.get("selected_org");
}

//Settings

Template.settings.selected_settings = function() {
	return settings.find({setting_type : Session.get("settings_selected")}, {sort : {setting_name : 1}});
}

Template.settings.libraries = function() {
	 return Session.get("my_groups");
}

Template.settings.user_id = function() {
	return Meteor.userId();
}

function update_all() {
	update_setting("name", $('#setting_user_name').val());
	update_setting("email", $('#setting_user_email').val());
	update_setting("syntax_type", $('#syntax-type').val());
}
		
function update_setting(setting, value) {
	var current_profile = _.first(settings.find({user_id : Meteor.userId()}, {sort : {create_time : 1}}).fetch());
	var doc_id = current_profile['_id'];
	delete current_profile['_id'];
	current_profile[setting] = value;
	settings.update(doc_id, current_profile);
}

//Possible settings:
	//-Letting the user set their table type (related to syntax type)
	