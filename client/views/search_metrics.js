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
		var this_metric = metric_library.find({_id : metric_id}).fetch()[0];
		//$('#search-add-command').val('add_metric('+metric_name+',');
		//Need to construct the recommended create and add_metric commands
		var merged_pkgs = pkg_merge(this_metric.join_cols, this_metric.cols_added);
		var create_command = 'create(get_'+metric_name+','+merged_pkgs;
		create_command += ','+this_metric.join_src+','+this_metric.extra_sql+','+this_metric.indices+');';
		var data_source = Session.get("last_table") ? Session.get("last_table") : "your_table";
		//console.log(data_source);
		var add_command = 'add_metric('+metric_name+','+data_source+','+this_metric.join_cols+');';
		var select_command = 'select('+merged_pkgs+','+this_metric.join_src+','+this_metric.extra_sql+');';
		var defaults = [];
		defaults.push(add_command);
		defaults.push(create_command);
		defaults.push(select_command);
		//console.log(add_command);
		//console.log(defaults);
		$('#search-add-command').val('');
		$('#search-add-command').typeahead({source : defaults});
		$('#search_add').modal('show');
		//console.log(this_metric);
		//console.log(this_metric.metric_name)
		//current_script.insert(this_metric);
	},
	'click .search-submit' : function(event) {
		var command = $('#search-add-command').val();
		console.log('search add');
		console.log(command);
		if (command)
		{
			script_eval(command);			
		}
		$('#search_add').modal('hide');
	}
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





