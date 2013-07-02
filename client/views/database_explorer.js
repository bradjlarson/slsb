/*Javascript for Database Explorer view*/

//Database Explorer Events:
Template.explorer.events = {
	'click .db_results' : function(event) {
		$('.db_results').removeClass('info'); 
		var selected = event.currentTarget;
		$(selected).addClass('info');
		var text = $(selected).attr('name');
		Session.set('db_selected', text);
		Session.set('table_searched', false);},
	'click .table_results' : function(event) {
		$('.table_results').removeClass('info');
		var selected = event.currentTarget;
		$(selected).addClass('info');
		var text = $(selected).attr('name');
		Session.set('table_selected', text);},
	'click .db_columns' : function(event) {
		console.log("column clicked");
	},
	'change #db_search' : function(event) {
		var query_val = $('#db_search').val();
		Session.set("db_searched", query_val);
		Session.set("table_searched", false);
		Session.set("db_selected", false);
		console.log(query_val);
	},
	'click #db_query' : function(event) {
		var query_val = $('#db_search').val();
		Session.set("db_searched", query_val);
		Session.set("table_searched", false);
		console.log(query_val);
	},
	'change #table_search' : function(event) {
		var query_val = $('#table_search').val();
		Session.set("table_searched", query_val);
		console.log(query_val);
	},
	'click #table_query' : function(event) {
		var query_val = $('#table_search').val();
		Session.set("table_searched", query_val);
		console.log(query_val);
	},
	'change .table-editable' : function(event) {
		var doc_id = $(event.target).attr("name");
		var new_desc = $(event.target).val();
		console.log(new_desc);
		tables.update(doc_id,{$set : {table_desc : new_desc}});
	},
	'change .col-editable' : function(event) {
		var doc_id = $(event.target).attr("name");
		var new_desc = $(event.target).val();
		console.log(new_desc);
		columns.update(doc_id, {$set : {column_desc : new_desc}});
	},
	'click .db-explore-add' : function(event) {
		var selected = event.target;
		var col_id = $(selected).attr('name').split('.')[1];
		var metric_name = $(selected).attr('name').split('.')[0];
		var this_column = columns.find({_id : col_id}).fetch()[0];
		var this_table = tables.find({table_name : this_column.table_name}).fetch()[0];
		console.log(this_column);
		console.log(this_table);
		var data_src = this_column.database_name +'.'+this_column.table_name; 
		var extra_sql = this_table.extra_sql ? this_table.extra_sql : '--none';
		//$('#search-add-command').val('add_metric('+metric_name+',');
		//Need to construct the recommended create and add_metric commands
		var merged_pkgs = pkg_merge(this_table.join_cols, this_column.column_name);
		var create_command = 'create({get_'+metric_name+'},'+merged_pkgs;
		create_command += ',{'+data_src+'},{'+this_table.extra_sql+'},'+this_table.join_cols+');';
		var data_source = Session.get("last_table") ? Session.get("last_table") : "your_table";
		//console.log(data_source);
		var add_command = 'add_metric({'+metric_name+'},{'+data_source+'},'+this_table.join_cols+');';
		var select_command = 'select('+merged_pkgs+',{'+data_src+'},{'+this_table.extra_sql+'});';
		var defaults = [];
		defaults.push(add_command);
		defaults.push(create_command);
		defaults.push(select_command);
		//console.log(add_command);
		//console.log(defaults);
		$('#db-exp-add-command').val('');
		$('#db-exp-add-command').typeahead({source : defaults});
		$('#db_exp_add').modal('show');
		//console.log(this_metric);
		//console.log(this_metric.metric_name)
		//current_script.insert(this_metric);
	},
	'click .search-submit' : function(event) {
		var command = $('#db-exp-add-command').val();
		console.log('db exp add');
		console.log(command);
		if (command)
		{
			script_eval(command);			
		}
		$('#search_add').modal('hide');
	}		
}

//Database Explorer
Template.explorer.databases = function() {
	var search_query = Session.get("db_searched");
	var mongo_query = '.*'+search_query+'.*';
	if (search_query)
	{
		return databases.find({database_name : {$regex : mongo_query, $options : 'i'}}, {sort: {database_name: 1}});
	}
	else
	{
		return databases.find({}, {sort: {database_name: 1}});
	}	
}

Template.explorer.tables = function() {
	var search_query = Session.get("table_searched");
	var mongo_query = '.*'+search_query+'.*';
	if (search_query)
	{
		return tables.find({table_name : {$regex : mongo_query, $options : 'i'}, database_name : Session.get("db_selected")}, {sort: {table_name : 1}});
	}
	else
	{
		return tables.find({database_name : Session.get("db_selected")}, {sort: {table_name : 1}});
	}	
}

Template.explorer.columns = function() {
	return columns.find({database_name : Session.get("db_selected"), table_name : Session.get("table_selected")}, {sort : {column_name : 1}});
}

Template.explorer.selected_table = function() {
	return tables.find({database_name : Session.get("db_selected"), table_name : Session.get("table_selected")});	
}

Template.explorer.db_selected = function() {
	return Session.get("db_selected") ? true : false;
}

Template.explorer.table_selected = function() {
	return Session.get("table_selected") ? true : false;
}

