

Template.admin.is_admin = function() {
	if (admins.find({user_id: Meteor.userId()}).count() > 0) 
	{
		return true;
	}
	else
	{
		return false;
	}
};

Template.admin.access_request = function() {
	var admin_profile = _.first(admins.find().fetch());
	if(access.find({group_name : admin_profile.group_name, access : "pending"}).count() > 0)
	{
		return access.find({group_name : admin_profile.group_name, access : "pending"});
	}
	else
	{
		return false
	}
};

Template.admin.user_profile = function() {
	return settings.find({}, {sort : {name : 1}});
};

Template.admin.issue = function() {
	if(feedback.find({resolved : false, messages : {$exists:true}}, {sort : {last_response : 1}}).count() > 0)
	{
		return feedback.find({resolved : false, messages : {$exists:true}}, {sort : {last_response : 1}});
	}
	else
	{
		return false;
	}
};

Template.admin.rendered = function() {
	Meteor.users.find().forEach(function(a_user) {
		if (settings.find({user_id : a_user['_id'], email : ""}).count() > 0)
		{
			if ('services' in a_user) 
			{ 
				if ('google' in a_user['services']) 
				{ 
					var user_id = settings.find({user_id : a_user['_id']}).fetch()[0]; 
					settings.update(user_id['_id'], {$set : {email : a_user['services']['google']['email']}});
				} 
			}
			if (a_user.emails) 
			{
				var user_id = settings.find({user_id : a_user['_id']}).fetch()[0]; 
				settings.update(user_id['_id'], {$set : {email : a_user.emails[0].address}});
			}
		}
	});					
}  	

Template.admin.events = {
	'click .grant-access' : function(event) {
		var access_id = $(event.target).attr("name");
		access.update(access_id, {$set : {access : "granted"}});
	},
	'click .decline-access' : function(event) {
		var access_id = $(event.target).attr("name");
		access.update(access_id, {$set : {access : "declined"}});
	},
	'click .respond-submit' : function(event) {
		var doc_id = $(event.target).attr('name');
		var convo = feedback.find({_id: doc_id}).fetch()[0];
		convo['last_response'] = Session.get("today")+":"+Session.get("now");
		convo['messages'].push({date : Session.get("today"), time: Session.get("now"), user: Meteor.userId(), text: $('#'+doc_id+'_respond').val()});
		convo['resolved'] = true;
		delete convo['_id'];
		feedback.update(doc_id, convo);
	},
	'click .send-message' : function(event) {
		var user_id = $(event.target).attr('name');
		$('#message-user_id').html('User: '+user_id);
		$('#message-text').attr('name', user_id);
		$('#message-modal').modal('show');
	},
	'click #message-send' : function(event) {
		var date_time = Session.get("today")+":"+Session.get("now");
		var user_id = $('#message-text').attr('name');
		var message = $('#message-text').val();
		var build_doc = {};
		if (user_id == "all")
		{
			Meteor.users.find().forEach(function(this_user){
				build_doc = {
					create_date : Session.get("today"),
					create_time : Session.get("now"),
					feedback : "Message from Admins",
					last_response: date_time,
					messages : [
						{
							date : Session.get("today"),
							text : message,
							time : Session.get("now"),
							user : Meteor.userId()
						}
					],
					resolved : true,
					type : "Admin Message",
					user_id : this_user['_id']
				};
				feedback.insert(build_doc);	
			});
		}
		else
		{
			build_doc = {
				create_date : Session.get("today"),
				create_time : Session.get("now"),
				feedback : "Message from Admins",
				last_response: date_time,
				messages : [
					{
						date : Session.get("today"),
						text : message,
						time : Session.get("now"),
						user : Meteor.userId()
					}
				],
				resolved : true,
				type : "Admin Message",
				user_id : user_id
			};
			feedback.insert(build_doc);
		}	
	}
};


