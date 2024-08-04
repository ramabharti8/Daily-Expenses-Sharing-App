import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import multer from "multer"

const app = express();

const upload = multer();
app.use(cors(
    {
        origin: process.env.CORS_ORIGIN,
        credentials: true
    }
));

app.use(express.json({limit:"16kb"}));   // limit the size of the request body to 16kb
app.use(express.urlencoded({extended:true,limit:"16kb"})); // parse the url encoded data
app.use(express.static("public")); // serve static files from the public directory
app.use(cookieParser()); // parse the cookies from the request headers
// Middleware to handle form-data (multipart)
app.use(upload.none());

export default app;