//Create
Template.create.helpers({
	sql_preview : function() { return add_metric_preview();}
	
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
	} 
};
/*

function cols_added(cols) {
	var separate_cols = cols.split(':');
	var col_string = '';
	for (col in separate_cols)
	{
		col_string += ', b.'+separate_cols[col].replace('{','').replace('}','');
	}
	return col_string;
}

function join_cols(cols) {
	var separate_cols = cols.split(':');
	var col_string = '';
	if (separate_cols)
	{
		var i = 1;
		for (col in separate_cols)
		{
			if (i == 1) 
			{
				col_string += 'ON a.<user_col'+i+'> = b.'+separate_cols[col].replace('{','').replace('}','');
				if (i != separate_cols.length)
				{
					col_string += '\n'
				}
			}
			else
			{
				col_string += 'AND a.<user_col'+i+'> = b.'+separate_cols[col].replace('{','').replace('}','');
				if (i != separate_cols.length)
				{
					col_string += '\n'
				}
			}	
			i++;	
		}
		return col_string;
	}
}

function indices(cols) {
	var separate_cols = cols.split(':');
	var col_string = '';
	var i = 1;
	for (col in separate_cols)
	{
		if (i != separate_cols.length)
		{
			col_string += separate_cols[col].replace('{','').replace('}','')+',';
		}
		else
		{
			col_string += separate_cols[col].replace('{','').replace('}','');
		}
		i++;	
	}
	return col_string;
}

function prep_sql(text) {
	var display_text = "--SQL Preview for "+Session.get("metric_name")+":";
	if (text) 
	{
		display_text +='\n'+text;
	}
	return display_text;
}
*/
