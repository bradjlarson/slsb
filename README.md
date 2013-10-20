# _SQL EXTENSIONS:_

## _COMMANDS:_

### _ADD METRIC_

	ADD METRIC //name 
	TO //table
	JOINS //conditions
	INDEX(//indices);

*This command appends a predefined set of columns to another set of rows (existing or derived), and stores the result to a table add_*metric_name*_. *

### _CREATE METRIC_

	CREATE METRIC //name AS 
	COLUMNS //col1, col2 , col3
	FROM //data source, can be either explicit or derived table
	JOINS //suggested joins
	INDICES(//indices)
	ADD TO //collection
	DESC: "//desc";

*This command creates a new metric for later use. It stores columns, a data source, suggested joins and indices, and storing it a collection of the user's designation (user's personal library by default, with an optional description).*

### _FOR EACH_

	FOR EACH (//thing1, thing2, thing3)
	DO //sql where <each> represents the object;

*This command performs some SQL code for a number of different values.*

### _CHAIN_

	CHAIN //metric1 a, metric2 b, metric3, c, etc... e
	TO //table
	JOINS //conditions
	INDEX(//(indices));

*This command chains several metrics together, appending the resulting columns from all metrics to another set of rows (existing or derived), using a set of specified joins. If aliases are not provided, the metric_name is the default alias. Any indices specified will be used as the indices in the final table, otherwise the distinct indices from all the metrics will be used.*

## _OTHER MODIFICATIONS:_

### _Shorter functions_

arg/f, such that f is the abbreviation for one of the following transformations:

	/c = count(arg)
	/m = multiset
	/v = volatile
	/t = temp
	/s = sum(arg)
	/a = avg(arg)
	/min = min(arg)
	/max = max(arg)
	/left(n) = left(arg, n)
	/d = distinct
	/in(n1, n2, n3...) = IN(n1, n2, n3)
	/nin(n1, n2, n3) = NOT IN (n1, n2, n3)
	/lk('thing') = LIKE 'thing'
	/lk_any('thing1', 'thing2') = LIKE ANY ('thing1', 'thing2')
	/nlk('thing') = NOT LIKE ('thing')
	/nlk_any('thing1', 'thing2') = NOT LIKE ANY ('thing1', 'thing2')
	/bt(start, end) = BETWEEN START AND END
	/as(name) = AS NAME
	/cast(spec) = CAST(arg as spec)

Additionally, transformations can be combined, such that:

	/m+v = MULTISET VOLATILE
	/d+c = COUNT(DISTINCT arg) 

Where the args are processed in order, with each transformation being applied to the result of the transformation before it. 

### _DEFAULT CODE_

You can also set up default code to be placed before/after specific types of commands. For example, you could choose to place the SQL:

*Before*
	--drop table %table;
	--help table %table;

*After*
	collect statistics on %table column(%indices);

Before and after all of your CREATE TABLE (and ADD METRIC, CHAIN) commands, to allow for easier debugging, modification, and better efficiency. 

Or you could add some comments, making it easier for others to follow your work. 

To reference clauses in your SQL stmts, you can use the following:

	%table = the table name
	%indices = the table indices
	%columns = the column names in the table
	%from = the aliases/table names of the sets referenced





