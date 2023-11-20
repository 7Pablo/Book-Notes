# Book Note Web App

Welcome to the Book Note web app! This application allows you to showcase your reads by managing a virtual bookshelf. You can search for books by ISBN, add reviews and ratings (on a scale of 1-10), and effortlessly navigate your collection on the homepage. Additionally, the app provides filtering options by entry date and sorting by ascending/descending ratings. Manage your bookshelf efficiently with features to delete or update entries.

## Getting Started

To use this project, follow these steps:

### Prerequisites

Make sure you have the following dependencies installed:

- [axios](https://www.npmjs.com/package/axios)
- [body-parser](https://www.npmjs.com/package/body-parser)
- [ejs](https://www.npmjs.com/package/ejs)
- [express](https://www.npmjs.com/package/express)
- [pg](https://www.npmjs.com/package/pg)

You can install them by running:

--bash
npm install

## Database Configuration

1. Inside the `backend/index.js` file, locate the PostgreSQL client configuration:

    --javascript
    const db = new pg.Client({
        user: "your_postgres_user",
        host: "localhost",
        database: "books",
        password: "your_postgres_password",
        port: 5432
    });

    Update the `user` and `password` fields with your PostgreSQL credentials from pgAdmin.

2. Create a database called `books`:

    --sql
    CREATE DATABASE books;

3. Run the queries in `backend/queries.sql` to create the necessary table:

    --sql
    Provided queries to create the books_read table

    Use a PostgreSQL tool like pgAdmin or run these queries through a command-line interface.

## Running the project

Return to the terminal and start the server:

    --bash
    npm node index.js

    or with nodemon:

    --bash
    nodemon index.js
    ```