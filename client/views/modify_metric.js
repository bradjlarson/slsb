default_metric = function() {
	return {
		metric_name : "metric_name",
		cols_added : "your:cols",
		join_src : "your.table",
		join_cols : "join:cols",
		extra_sql : "this = that:this/in+him+her+you",
		indices : "your:indices",
		prep_sql : "--sql to run first",
		collection : "Some Collection",
		description : "This metric returns x and joins on y. Make sure you do z"
	};
};

default_add_to = function() {
	return {
		table_name : "some.table",
		join_cols : "these:joins",
	};
}

get_metric_vals = function(selector) {
	var vals = [];
	$(selector).each(function() {
		vals.push($(this).val());
	});
	console.log(vals);
	return vals;
}

//Modify Metric Events:
Template.selected_metric.events = {
	'change .modify_text' : function(event) {
		Session.set("modify_changes", true);
	},
	'click #modify_create_predict' : function(event) {
		var command = predict("create", proxy_metric(get_metric_vals('.modify_text'), "array"));
		$('#modify-preview').html(command);
	},
	'click #modify_add_metric_predict' : function(event) {
		var command = predict("add_metric", proxy_metric(get_metric_vals('.modify_text'), "array"), default_add_to());
		$('#modify-preview').html(command);
	},
	'click #modify_select_predict' : function(event) {
		var command = predict("select", proxy_metric(get_metric_vals('.modify_text'), "array"));
		$('#modify-preview').html(command);
	},
	'click #modify_raw_predict' : function(event) {
		var command = predict("raw", proxy_metric(get_metric_vals('.modify_text'), "array"));
		$('#modify-preview').html(command);
	}
};

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
	'change .modify_text' : function(event) {
		Session.set("mod_saved", false);
		$('#modify_save').html('Save...');
	},
	'click #modify_save' : function(event) {
		modified_metric = {};
		$('.modify_text').each(function() {
			modified_metric[this.name] = this.value;
		});
		console.log(modified_metric);
		metric_library.update(Session.get("current_metric_m"), modified_metric);
		Session.set("mod_saved", true);
		$(event.target).html("Saved!");
	},
	'click #delete_metric' : function(event) {
		metric_library.remove(Session.get("current_metric_m"));
	}
};

Template.modify.rendered = function() {
	$('#modify_query').typeahead({source : _.pluck(metric_library.find().fetch(), 'metric_name')});
	if(Session.get('current_metric_m'))
	{
		$('#'+Session.get('current_metric_m')).addClass('info');
	}
	if(Session.get('mod_saved')) { $('#modify_save').html("Saved!"); }
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

Template.selected_metric.metric_selected = function() {
	//return the metric document matching the selected metric
	return metric_library.find({_id : Session.get('current_metric_m')});
}

