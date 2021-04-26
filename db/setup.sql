DROP TABLE IF EXISTS todos;
CREATE TABLE IF NOT EXISTS todos (
	id	SERIAL PRIMARY KEY,
	title	varchar,
	completed	boolean,
	day	varchar,
	month	varchar,
	year	varchar,
	description	text
);
