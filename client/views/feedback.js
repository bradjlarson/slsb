//Feedback Events:
Template.feedback.events = {
	'click #feedback_submit' : function(event) {
		new_feedback = {};
		new_feedback['user_id'] = Meteor.userId();
		new_feedback['create_time'] = get_timestamp();
		new_feedback['last_response'] = get_timestamp();
		new_feedback['feedback'] = $('#feedback_text').val();
		new_feedback['messages'] = [];
		new_feedback['messages'].push({time: get_timestamp(), user: Meteor.userId(), text: $('#feedback_text').val()});
		new_feedback['type'] = $('#feedback_type').val();
		new_feedback['resolved'] = false;
		feedback.insert(new_feedback);
		$('#site_feedback')[0].reset();
		$('#feedback_submit').removeClass("btn-inverse").addClass("btn-success").html("Submitted!");
		return false;
	},
	'click #message_submit' : function(event) {
		var msg_txt = $('#msg_text').val();
		var current_profile = _.first(settings.find({user_id : Meteor.userId()}, {sort : {create_time : 1}}).fetch());
		var user_info = $('#group_users').val();
		var user_name = user_info.slice(0,position(user_info,"(")-1);
		var user_id = user_info.slice(position(user_info, "(")+1, position(user_info, ")"));
		msgs.insert({from_user : Meteor.userId(), to_user : user_id, from_user_name : current_profile['name'], to_user_name : user_name, msgs : [{user_name : current_profile['name'], msg_time : get_timestamp(), message : msg_txt}], last_msg_time : get_timestamp(), status : "active"});
	},
	'click .archive-submit' : function(event) {
		var doc_id = $(event.target).attr('name');
		msgs.update(doc_id, {$set : {status : 'archived'}});
	}
}

Template.feedback.rendered = function() {
	var user_names = [];
	Meteor.call("get_group_members", function(error, result) {console.log(result); user_names = result; $('#group_users').typeahead({source : result});});
}

Template.feedback.convo = function() {
	if(msgs.find({status : "active"}).count() > 0)
	{
		return msgs.find({}, {sort : {last_msg_time : 1}});
	}
	else
	{
		return false;
	}
}