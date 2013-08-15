Template.search.rendered = function() {
	var m_names = _.pluck(metric_library.find().fetch(), "metric_name");
	$('#metric_querybox').typeahead({source : m_names});
	if(Session.get("search_condition"))
	{
		$('#metric_querybox').val(Session.get("search_condition"));
	}
}

//Search Events
Template.search.events = {
	'click #query_metrics' : function(event) {
		var selected = event.target;
		var query = $('#metric_querybox').val();
		Session.set("advanced_search", false);
		Session.set("search_condition", query);
		return false;
	},
	'click #launch_adv_search' : function(event) {
		$('#advanced_search_modal').modal('show');
	},
	'click .adv-search-submit' : function(event) {
		console.log('advanced search');
		Session.set("advanced_search", true);
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
	'click .clone-metric' : function(event) {
		Session.set("current_metric_m", clone_metric($(event.target).attr("name")));
		Session.set('metric_searched_m', false);
		$('#main').html(Meteor.render(Template.modify));
		$('.side-nav').removeClass("active");
		$('#launch_modify').addClass("active");
	}
}

//Search
Template.search.search_results = function() {
	if (Session.get("advanced_search"))
	{
		var args = [];
		$('.adv-search-regex').each(function() {
			var reg = truthy($(this).val().length > 0) ? '.*'+$(this).val()+'*.' : '.';
			args.push(reg);
		});
		return splat(adv_search)(args);
	}
	else
	{
		var search_field = Session.get("search_field");
		var search_query = Session.get("search_condition");
		var mongo_query = truthy(search_query) ? '.*'+search_query+'.*' : '.';
		return metric_library.find({ metric_name : {$regex : mongo_query, $options : 'i'}}, {sort : {metric_name : 1}});
	}
};

adv_search = function(metric_name, cols_added, join_src, join_cols, extra_sql, indices, description) {
	var search_conditions = {
		metric_name : {$regex : metric_name, $options : 'i'},
		cols_added : {$regex : cols_added, $options : 'i'},
		join_src : {$regex : join_src, $options : 'i'},
		join_cols : {$regex : join_cols, $options : 'i'},
		extra_sql : {$regex : extra_sql, $options : 'i'},
		indices : {$regex : indices, $options : 'i'},
		description : {$regex : description, $options : 'i'}
	};
	return metric_library.find(search_conditions, {sort : {metric_name : 1}}).fetch();	
}



