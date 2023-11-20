-- Create database books --
CREATE DATABASE books;

-- Create the table books_read for the application --

CREATE TABLE books_read (
	id SERIAL PRIMARY KEY,
	isbn INTEGER UNIQUE NOT NULL, 
	title VARCHAR(100) NOT NULL,
	author VARCHAR(100) NOT NULL,
	review TEXT,
	rating DECIMAL(3,1) NOT NULL,
	date DATE
    cover_url TEXT
);