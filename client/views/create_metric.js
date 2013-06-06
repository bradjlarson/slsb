//Create
Template.create.helpers({
	prep_sql: function() {return prep_sql(Session.get("prep_sql"));},
	metric_name: function() {return Session.get("metric_name");},
	cols_added: function() {return cols_added(Session.get("cols_added"));},
	join_src: function() {return Session.get("join_src");},	
	join_cols: function() {return join_cols(Session.get("join_cols"));},	
	extra_sql: function() {return Session.get("extra_sql");},	
	indices: function() {return indices(Session.get("indices"));},	
	});

//Create Metric Events:
Template.create.events = {
	'change .create_input' : function(event) {
		/*
		var current_id = create_metric.find().fetch();
		var doc_selector = current_id[0]['_id'];
		var input = event.currentTarget;
		var doc_name = $(input).attr('id');
		var update_val = $(input).val();
		create_metric.update({_id: doc_selector}, { $set: {doc_name: update_val}}, function(error) {
			console.log("error");
		});	
		*/
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
