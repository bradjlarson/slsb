//Documentation Helpers:
Template.docs.doc_file = function() {
	return docs.find({}, {$sort : {order : 1}});
}

//Documentation Events:
Template.docs.events = {
	'change .docs_edit' : function(event) {
		var doc_name = $(event.target).attr("name");
		var doc_id = doc_name.split('.')[1];
		var update_val = $(event.target).val();
		var doc_field = doc_name.split('.')[0];
		if (doc_field == "topic_header")
		{
			docs.update(doc_id, {$set : {topic_header : update_val}});
		}
		else if (doc_field == "topic_body")
		{
			docs.update(doc_id, {$set : {topic_body : update_val}});
		}
	}
}
//Documentation Structure:
/*
Session.set("current_doc_slide", 0);


docs = {chapter_name : String,
		sub_topics : {topic_name : String}
		};

doc_slides = {
	chapter_name : String, 
	topic_name : String,
	slide_num : String,
	slide_header : String,
	slide_body : String
}		
		
chapters = {
	chapter_name : String,
	chapter_header : String,
	chapter_body : String
}

sub_topics = {
	topic_name : String,
	topic_header : String,
	topic_body : String
}		
		
##Chapters:
- Introduction (1)
	- What (2)
	- Why (3)
	- How (4)
	- Where (5)
- Core Functions (6)
	- Script Builder (7)
	- Search Metrics (8)
	- Database Explorer (9)
	- Create Metric (10)
	- Modify Metric (11)
	- Settings (12)
	- Feedback (13)
	- Documentation (14)
	- Admin (15)
	- Stored Scripts (16)
- Core Commands (17)
	- General syntax (18)
 	- add_metric() (19)
	- create_metric() (20)
	- create() (21)
	- select() (22)
	- comment() (23)
	- help() (24)
	- chain() (25)
	- find() (26)
- Theory (27)
	- Modularity (28)
	- Convention over Configuration (29)
	- Temporary Tables (30)
- Settings (31)
	- Create vs. Update Mode (32)
	- Formatting Option Sets (33)
- General SQL Resources (34)

*/