//Create
Template.create.helpers({
	sql_preview : function() { return add_metric_preview();},
	libraries : function() {return Session.get("my_groups");}
	/*
	prep_sql: function() {return mod_prep_sql(default_to(Session.get("prep_sql"), "--prep sql"));},
	metric_name: function() {return table_name(default_to(Session.get("metric_name"), "metric_name"));},
	cols_added: function() {return selecting(default_to(Session.get("cols_added"),"your:cols"));},
	join_src: function() {return from(default_to(Session.get("join_src"), "your.table"));},	
	join_cols: function() {return join_on(stringify(prefix("user_", extract("sub_args", default_to(Session.get("join_cols"),"your:joins"))), ":"), default_to(Session.get("join_cols"),"your:joins"));},	
	extra_sql: function() {return conditions(default_to(Session.get("extra_sql"),"this=that"));},	
	indices: function() {return specify(default_to(Session.get("indices"), "your:indices"));},
	*/	
});

Template.create.rendered = function() {
	$('.create_input').each(function(index) {
		truthy(Session.get($(this).attr("id"))) ? $(this).val(Session.get($(this).attr("id"))) : $(this).val("");
	});
}

Template.selected_metric.libraries = function() {
	 return Session.get("my_groups");
}

add_metric_preview = function() {
	return run("add_metric", [get_args(), "some.table", "user_join:user_join", get_args().indices]).sql_output;
}

get_args = function() {
	var obj = {
		metric_name : default_to(Session.get("metric_name"), "metric_name"),
		cols_added : default_to(Session.get("cols_added"),"your:columns"),
		join_src : default_to(Session.get("join_src"), "your.table"),
		join_cols : default_to(Session.get("join_cols"),"your:joins"),
		extra_sql : default_to(Session.get("extra_sql"),"this=that"),
		indices : default_to(Session.get("indices"), "your:indices"),
		prep_sql : default_to(Session.get("prep_sql"), "--prep sql")
	};
	return obj;
}

reset_create_form = function() {
	Session.set("metric_name", false);
	Session.get("cols_added",false);
	Session.get("join_src", false);
	Session.get("join_cols",false);
	Session.get("extra_sql",false);
	Session.get("indices", false);
	Session.get("prep_sql", false);
}



//Create Metric Events:
Template.create.events = {
	'change .create_input' : function(event) {
		var input = event.currentTarget;
		var input_id = $(input).attr('id');
		var input_val = $(input).val();
		Session.set(input_id, input_val);
		return false;
	},
	'click #launch_quick_add' : function(event) {
		$('#quick_add_prompt').focus();
	},
	'click #submit_new_metric' : function(event) {
//		console.log('metric submitted');
		new_metric = {};
		$('.create_input').each(function() {
			new_metric[this.id] = this.value;
		});
		new_metric['description'] = $('#metric_desc').val();
		new_metric['collection'] = $('#metric_collection').val();
		new_metric['prep_sql'] = $('#prep_sql').val();
		new_metric['creator'] = Meteor.userId();
		var currentdate = new Date(); 
		var datetime = currentdate.getDate() + "/"
		                + (currentdate.getMonth()+1)  + "/" 
		                + currentdate.getFullYear() + " @ "  
		                + currentdate.getHours() + ":"  
		                + currentdate.getMinutes() + ":" 
		                + currentdate.getSeconds();
		new_metric['create_time'] = datetime;
		new_metric['used'] = 0;
//		console.log(new_metric);
		metric_library.insert(new_metric, function(err) {
			if (!err) {
				console.log('Metric Inserted');
				//$('#create_metric_form')[0].reset();
			}
			else
			{
				console.log(err);
			}
		}); 
	},
	'click #reset_create' : function() {
		reset_create_form();
		return false;
	} 
};

