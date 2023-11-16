import express from "express";
import pg from "pg";
import axios from "axios";

const app = express();
const port = 3000;
const bookURL = "https://covers.openlibrary.org/b/isbn/";

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "books",
    password: "sepillo1",
    port: 5432
})

db.connect();
 
app.use(express.urlencoded( { extended: true }));

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("index.ejs");
})

app.listen(port, () => {
    console.log("Server running on port " + port);
})
