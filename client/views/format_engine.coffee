cols_added : (cols) ->
	separate_cols = cols.split(':')
	return format_col col for col in separate_cols
	
format_col : (col) -> return ', b.'+col	