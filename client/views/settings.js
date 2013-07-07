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
	}
}

//Settings

Template.settings.selected_settings = function() {
	return settings.find({setting_type : Session.get("settings_selected")}, {sort : {setting_name : 1}});
}

//Possible settings:
	//-Letting the user set their table type (related to syntax type)
	