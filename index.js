import express from "express";
import pg from "pg";
import axios from "axios";

const app = express();
const port = 3000;
const bookURL = "https://openlibrary.org";
const coversURL = "https://covers.openlibrary.org";

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

async function getBooks() {
    const result = await db.query("SELECT * from books_read");
    return result.rows;
}

app.get("/", async (req, res) => {
    const booksArray = await getBooks();
    res.render("index.ejs", { books: booksArray });
});

app.get("/add", (req, res) => {
    res.render("add.ejs");
});

app.get("/edit", (req, res) => {
    res.render("edit.ejs");
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

app.listen(port, () => {
    console.log("Server running on port " + port);
})
