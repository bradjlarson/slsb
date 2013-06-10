Template.export_docs.export_item = function() {
	return export_docs.find();
};

Template.export_docs.rendered = function() {
	var metrics = metric_library.find().fetch();
	if (Session.get("export_flag"))
	{
		clear_export();
		add_to_export(metrics);
	}
}

function add_to_export(objs) {
	for (obj in objs) 
	{
		var insert_text = "metric_library.insert("+JSON.stringify(objs[obj])+")";
		console.log(insert_text);
		export_docs.insert({item_type : "metric_library", item_text : insert_text});
	}
	Session.set("export_flag", true);
}

function clear_export() {
	var docs = export_docs.find().forEach(function(doc) {
		export_doc.remove(doc['_id']);
	});
}

