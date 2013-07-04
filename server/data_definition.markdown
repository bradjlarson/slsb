Build Commands Structure:
{
user_id: Meteor.userId,
command: String,
command_time: time_stamp,
success: boolean,
output_text: String,
sql_output : String
metric_name : String,
}

Metric Library Structure:
{
metric_name: String,
cols_added: String,
join_src: String,
join_cols: String,
extra_sql: String,
prep_sql: String,
indices: String,
collection: String,
description: String,
creator: Meteor.userId,
create_time: time_stamp,
used: integer
}

Scripts Structure: 
{
script_name: String,
description: String,
user_id: Meteor.userId,
creator: Meteor.userId,
create_time: time_stamp,
build_commands : array of build_command objects
sql_output : Concatenated SQL from build_command objects	
}

Databases Structure: (Changing to one collection for dbs, one for tables, and one for columns. way easier. )
New Version:
databases:
{
database_name: String,
database_desc: String
}
tables:
{
table_name: String,
database_name: String,
table_desc: String
}
columns:
{
column_name: String,
table_name: String,
database_name: String,
column_desc: String 
}

Old Version: (really hard to get at columns in templating)
{
database_name: String,
tables: [
		table_1: {
				table_name: String,
				table_desc: String,
				columns: [
						column_1: {
								column_name: String,
								column_desc: String
						},
						...,

				]		
			},
			...,
		table_n: {}	
]
}

feedback:
{
	user : Meteor.userId(),
	feedback_time : timestamp,
	feedback_text : String,
	type : select_option
}

Session Variables: 
Create Metric:
	metric_name,
	cols_added,
	join_src,
	join_cols,
	extra_sql,
	indices,
	desc,
	collection,
	
DB Explorer:
	db_searched,
	table_searched,
	db_selected,
	table_selected
	
Script Builder:
	current_command,
	history_num
	
Settings:
	settings_selected
	
Documentation:
	current_topic
	
Modify Metric
	metric_searched_m,
	current_metric_m
	
Search Metrics:
	search_condition
	search_field
