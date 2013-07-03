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
		var this_column = columns.find({_id : col_id}).fetch()[0];
		var this_table = tables.find({table_name : this_column.table_name}).fetch()[0];
		var proxy = {
			cols_added : pkg_merge(this_table.join_cols, existy(this_table.indices) ? this_table.indices : [], this_column.column_name),
			extra_sql : existy(this_table.extra_sql) ? this_table.extra_sql : "",
			indices : existy(this_table.indices) ? this_table.indices : this_table.join_cols,
			join_cols : this_table.join_cols,
			join_src : this_column.database_name +'.'+this_column.table_name,
			metric_name : $(selected).attr('name').split('.')[0]
		};
		Session.set("db_metric_proxy", proxy);
		$('#db_exp_add').modal('show');
		/*
		$('#search-add').name('');
		$('#search-add-command').typeahead({source : defaults});
		
		*/
	},
	'click .search-submit' : function(event) {
		var command = $('#db-command-input').val();
		console.log('search add');
		console.log(command);
		if (command)
		{
			submit_command(command);			
		}
		$('#db_exp_add').modal('hide');
	},
	'click #db_create_predict' : function(event) {
		var command = predict("create", Session.get("db_metric_proxy"));
		$('#db-command-input').val(command);
	},
	'click #db_add_metric_predict' : function(event) {
		$('#db-command-input').val(predict("add_metric", Session.get("db_metric_proxy"), fetch("", "build_commands")));
	},
	'click #db_select_predict' : function(event) {
		$('#db-command-input').val(predict("select", Session.get("db_metric_proxy")));
	},
	'click #db_raw_predict' : function(event) {
		$('#db-command-input').val(generate_command("raw", [generate_sql("", "", predict("create", Session.get("db_metric_proxy")))]));
	},		
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

