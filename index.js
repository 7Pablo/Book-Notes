import express from "express";
import pg from "pg";
import axios from "axios";

const app = express();
const port = 3000;
const bookURL = "https://openlibrary.org";
const coversURL = "https://covers.openlibrary.org";

var currentFilter = "dateDesc";

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "books",
    password: "sepillo1",
    port: 5432
});

db.connect();
 
app.use(express.urlencoded( { extended: true }));

app.use(express.static("public"));

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

async function getBookById(id) {
    const result = await db.query("SELECT * from books_read WHERE id=$1",
        [id]
    );
    return result.rows;
}

app.get("/", async (req, res) => {
    const booksArray = await getBooks(currentFilter);
    res.render("index.ejs", { books: booksArray });
});

app.get("/add", (req, res) => {
    res.render("add.ejs");
});

app.get("/edit", async (req, res) => {
    const bookArray = await getBookById(req.query.editButton);
    res.render("edit.ejs", { book: bookArray });
});

app.get("/filter", async(req, res) => {
    const filter = req.query.filter;
    currentFilter = filter;
    res.redirect("/");
});

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

app.listen(port, () => {
    console.log("Server running on port " + port);
});
