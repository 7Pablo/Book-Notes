//Import express for handling requests, axios to handle API requests, and pg for PostgreSQL Queries and connections
import express from "express";
import pg from "pg";
import axios from "axios";

//Create an app with express, define a port, and fetch the APIs URL.
const app = express();
const port = 3000;
const bookURL = "https://openlibrary.org";
const coversURL = "https://covers.openlibrary.org";

//Variable that contains the current state of the filter
var currentFilter = "dateDesc";

//Create a PostgreSQL client (change the password and user depending on your pgAdmin)
const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "books",
    password: "sepillo1",
    port: 5432
});

//Connect to the database
db.connect();
 
//Middleware to parse incoming requests bodies
app.use(express.urlencoded( { extended: true }));

//Middleware that serves static files in the public directory
app.use(express.static("public"));

//Asynchronous function that returns the data from the books_read table in the database based on the current filter. 
async function getBooks(filter) {

    var result = {}

    if(filter === "dateAsc") {
        result = await db.query("SELECT * FROM books_read ORDER BY date ASC");
    } else if (filter === "dateDesc") {
        result = await db.query("SELECT * FROM books_read ORDER BY date DESC");
    } else if (filter === "rateAsc") {
        result = await db.query("SELECT * FROM books_read ORDER BY rating ASC");
    } else if (filter === "rateDesc") {
        result = await db.query("SELECT * FROM books_read ORDER BY rating DESC");
    }
    return result.rows;
}

//Asynchronous function that returns one row from the books_read table based on its ID
async function getBookById(id) {
    const result = await db.query("SELECT * from books_read WHERE id=$1",
        [id]
    );
    return result.rows;
}

//Get handler that renders the homepage passing an array of books as its parameter. 
app.get("/", async (req, res) => {
    const booksArray = await getBooks(currentFilter);
    res.render("index.ejs", { books: booksArray });
});

//Get handler that renders the add page.
app.get("/add", (req, res) => {
    res.render("add.ejs");
});

//Get handler that renders the edit page, passing an array with one book and its information based on its ID. 
app.get("/edit", async (req, res) => {
    const bookArray = await getBookById(req.query.editButton);
    res.render("edit.ejs", { book: bookArray });
});

//Get handler that changes the variable of the currentFilter based on the user input.
app.get("/filter", async(req, res) => {
    const filter = req.query.filter;
    currentFilter = filter;
    res.redirect("/");
});

//Post handler for the add book functionality of the page.
//It retrieves the information about a book based on its isbn, the information of the author, and the book's cover from the Open Library API.
//Inserts into the database the isbn, title, author, review, rating, date, and cover URL of the book. 
//The rating and the review is passed by the request body. 
app.post("/add", async (req, res) => {
    try {
        const response = await axios.get(bookURL + "/isbn/" + req.body.isbn);
        const authorsAPI = await axios.get(bookURL + response.data.authors[0].key);

        const isbn = response.data.isbn_13[0];
        const title = response.data.title;
        const author = authorsAPI.data.name;
        const review = req.body.review;
        const rating = parseFloat(req.body.rating);
        const date = new Date();

        const coverURL = await axios.get(coversURL + "/b/isbn/" + isbn + "-M.jpg");
        const cover = coverURL.config.url;

        db.query("INSERT INTO books_read (isbn, title, author, review, rating, date, cover_url) VALUES ($1, $2, $3, $4, $5, $6, $7)",
            [isbn, title, author, review, rating, date, cover]
        );

        res.redirect("/");

    } catch (error) {
        console.error("Failed to fetch book:", error.message);
        res.redirect("/add");
    }
});

//Post handler that updates the rating and review of one book in database based on the user's input. 
app.post("/edit", async(req, res) => {
    const bookId = req.body.editButton;
    const bookReview = req.body.review;
    const bookRating = req.body.rating;

    try{
        await db.query("UPDATE books_read SET review=$1, rating=$2 WHERE id=$3",
        [bookReview, bookRating, bookId]
        );

        res.redirect("/");
    } catch(error) {
        console.error("Failed to fetch edit book information:", error.message);
        res.redirect("/");
    }
});

//Post handler for deleting on book entry based on it's ID.
app.post("/delete", (req, res) => {
    try {
        db.query("DELETE FROM books_read WHERE id=$1",
        [req.body.deleteButton]
    );
    res.redirect("/");
    } catch (error) {
        console.error("Failed to delete entry:", error.message);
        res.redirect("/");
    }
});

//Method that starts the server and listens for requests on port 3000
app.listen(port, () => {
    console.log("Server running on port " + port);
});
