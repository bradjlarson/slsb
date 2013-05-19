//Feedback Events:
Template.feedback.events = {
	'click #feedback_submit' : function(event) {
		new_feedback = {};
		new_feedback['user'] = Meteor.userId();
		var currentdate = new Date(); 
		var datetime = currentdate.getDate() + "/"
		                + (currentdate.getMonth()+1)  + "/" 
		                + currentdate.getFullYear() + " @ "  
		                + currentdate.getHours() + ":"  
		                + currentdate.getMinutes() + ":" 
		                + currentdate.getSeconds();
		new_feedback['feedback_time'] = datetime;
		new_feedback['feedback_text'] = $('#feedback_text').val();
		new_feedback['type'] = $('#feedback_type').val();
		console.log(new_feedback);
		feedback.insert(new_feedback);
		$('#site_feedback')[0].reset();
		return false;
	}
}