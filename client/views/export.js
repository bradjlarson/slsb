Template.export_docs.export_item = function() {
	return export_docs.find();
};

//[tasks, summaries, grateful, done, surveys, counterfact, blocks, about, contact];
Template.export_main.events = {
	'click #generate_export' : function() {
		$('#export_container').html(Meteor.render(Template.export_docs));
	}
};

Template.export_docs.rendered = function() {
console.log("export rendered");
var collections = {};
var metric_library_rx = metric_library.find().fetch();
var build_commands_rx = build_commands.find().fetch();
var databases_rx = databases.find().fetch();
var tables_rx = tables.find().fetch();
var columns_rx = columns.find().fetch();
var scripts_rx = scripts.find().fetch();
//var about_records = about.find().fetch();
//var contact_records = contact.find().fetch();
collections['metric_library'] = {col_name : "metric_library", objs : metric_library_rx};
collections['build_commands'] = {col_name : "build_commands", objs : build_commands_rx};
//collections['databases'] = {col_name : "databases", objs : databases_rx};
//collections['tables'] = {col_name : "tables", objs : tables_rx};
//collections['columns'] = {col_name : "columns", objs : columns_rx};
collections['scripts'] = {col_name : "scripts", objs : scripts_rx};
//collections['contact'] = {col_name : "contact", objs : contact_records};
console.log(collections);
var all_data = collections; 
if (Session.get("export_flag"))
{
	clear_export();
	//add_to_export(all_data[col].col_name, all_data[col].objs);
}
for (col in all_data)
{
	if (Session.get("export_flag"))
	{
		//clear_export();
		add_to_export(all_data[col].col_name, all_data[col].objs);
	}
}
Session.set("export_flag", false);	
}

export_db = function(database) {
	var databases_rx = databases.find({database_name : database}).fetch();
	var tables_rx = tables.find({database_name : database}).fetch();
	var columns_rx = columns.find({database_name : database}).fetch();
	var collections = {};
	collections['databases'] = {col_name : "databases", objs : databases_rx};
	collections['tables'] = {col_name : "tables", objs : tables_rx};
	collections['columns'] = {col_name : "columns", objs : columns_rx};
	var all_data = collections; 
	if (Session.get("export_flag"))
	{
		clear_export();
		//add_to_export(all_data[col].col_name, all_data[col].objs);
	}
	for (col in all_data)
	{
		if (Session.get("export_flag"))
		{
			//clear_export();
			add_to_export(all_data[col].col_name, all_data[col].objs);
		}
	}
	Session.set("export_flag", false);	
}

add_to_export = function(col_name, objs) {
	for (obj in objs) 
	{
		delete objs[obj]['_id'];
		var insert_text = col_name+".insert("+JSON.stringify(objs[obj])+")";
		console.log(insert_text);
		export_docs.insert({item_type : col_name, item_text : insert_text, user_id : Meteor.userId()});
	}
	//Session.set("export_flag", false);
}

clear_export = function() {
	var docs = export_docs.find().forEach(function(doc) {
		export_docs.remove(doc['_id']);
	});
}