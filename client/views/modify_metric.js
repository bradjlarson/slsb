//Modify Metric Events:
Template.modify.events = {
	'click .modify_results' : function(event) {
		$("#"+Session.get("current_metric_m")).removeClass("info");
		var selected = event.currentTarget;
		$(selected).addClass("info");
		$(event.target).addClass("info")
		var text = $(selected).attr('id');
		Session.set('current_metric_m', text);
	},
	'click #modify_search' : function(event) {
		var metric_name = $('#modify_query').val();
		Session.set('metric_searched_m', metric_name);
		return false;
	},
	'change #modify_query' : function(event) {
		var metric_name = $('#modify_query').val();
		console.log(metric_name);
		Session.set('metric_searched_m', metric_name);
	},
	'click #modify_save' : function(event) {
		modified_metric = {};
		$('.modify_text').each(function() {
			modified_metric[this.name] = this.value;
		});
		console.log(modified_metric);
		metric_library.update(Session.get("current_metric_m"), modified_metric);
	},
	'click #delete_metric' : function(event) {
		metric_library.remove(Session.get("current_metric_m"));
	}
}

//Modify Metric

Template.modify.metrics = function() {
	//Will add in user specific metrics clause later
	var modify_query = Session.get('metric_searched_m');
	if (modify_query)
	{
		var mongo_query = '.*'+modify_query+'.*';
		console.log(mongo_query);
		return metric_library.find({ metric_name : {$regex : mongo_query, $options : 'i'}}, {$sort : {metric_name : 1}});
	}
	else
	{
		return metric_library.find({}, {$sort : {metric_name : 1}});
	}	
}

Template.modify.show_save = function() {
//	return Session.get('current_metric_m') ? true : false;
}

Template.modify.metric_selected = function() {
	//return the metric document matching the selected metric
	return metric_library.find({_id : Session.get('current_metric_m')});
}

