//Search Events
Template.search.events = {
	'click #query_metrics' : function(event) {
		var selected = event.target;
		var query = $('#metric_querybox').val();
		var args = query.split(":");
		var field = args[0];
		var condition = args[1];
		if (args.length == 2)
		{
		Session.set("search_condition", condition);
		Session.set("search_field", field);
		}
		else
		{
		Session.set("search_field", "metric_name");
		Session.set("search_condition", field);
		}
		return false;
	},
	'click .add_explorer_metric' : function(event) {
		var selected = event.target;
		var metric_id = $(selected).attr('id');
		var metric_name = $(selected).attr('name');
		Session.set("search_metric_name", metric_name);
		$('#search_add').modal('show');
		/*
		$('#search-add').name('');
		$('#search-add-command').typeahead({source : defaults});
		
		*/
	},
	'click .search-submit' : function(event) {
		var command = $('#search-command-input').val();
		console.log('search add');
		console.log(command);
		if (command)
		{
			submit_command(command);			
		}
		$('#search_add').modal('hide');
	},
	'click #search_create_predict' : function(event) {
		var command = predict("create", fetch(Session.get("search_metric_name"), "metric_library"));
		$('#search-command-input').val(command);
	},
	'click #search_add_metric_predict' : function(event) {
		$('#search-command-input').val(predict("add_metric", fetch(Session.get("search_metric_name"), "metric_library"), fetch("", "build_commands")));
	},
	'click #search_select_predict' : function(event) {
		$('#search-command-input').val(predict("select", fetch(Session.get("search_metric_name"), "metric_library")));
	},
	'click #search_raw_predict' : function(event) {
		$('#search-command-input').val(predict("raw", fetch(Session.get("search_metric_name"), "metric_library")));
	},
}

//Search
Template.search.search_results = function() {
	var search_field = Session.get("search_field");
	var search_query = Session.get("search_condition");
	console.log(search_field+":"+search_query);
	var mongo_query = '.*'+search_query+'.*';
	console.log(mongo_query);
	var mongo_field = {};
	mongo_field[search_field] = {$regex : mongo_query, $options : 'i'};
	console.log(mongo_field);
	if (search_field) 
	{
		//: {$regex : mongo_query, $options : 'i'}}
		return metric_library.find({ metric_name : {$regex : mongo_query, $options : 'i'}}, {sort : {metric_name : 1}});
	}
	else
	{
		return metric_library.find({}, {sort : {metric_name : 1}});
	}
	
};
$('#metric_querybox').submit(function() {
	console.log('search submitted');
	return false;
});
$('#metric_search_form').submit(function() {
	console.log('search submitted');
	return false;
});





