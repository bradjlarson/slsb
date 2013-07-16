//Settings Events:
Template.settings.events = {
	'click .settings_options' : function(event) {
		var selected = event.target;
		var text = $(selected).attr('name');
		Session.set('settings_selected', text);
	},
	'change #syntax-type' : function(event) {
		Session.set("syntax-type", event.target.value);
		console.log(event.target.value);
	},
	'click #launch_join_org' : function(event) {
		$('#join_org_modal').modal('show');
	},
	'click #submit_org_request' : function(event) {
		//route request to org admin
		if($('#select_org').val() != "None")
		{
			$('#join_org_modal_body').html('<p>Access request submitted</p>');
			//$('#submit_org_requeset').html("Access Requested.").removeClass("btn-inverse").addClass("btn-success");
		}
	}
}

Template.settings.orgs = function() {
	return organizations.find();
}

//Settings

Template.settings.selected_settings = function() {
	return settings.find({setting_type : Session.get("settings_selected")}, {sort : {setting_name : 1}});
}

//Possible settings:
	//-Letting the user set their table type (related to syntax type)
	