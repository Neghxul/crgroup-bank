import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";
import authCards from "./routes/cards.js";
import multer from "multer";

const app = express();

app.use(express.json());
app.use(cookieParser());

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "../server/upload");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + file.originalname);
    }
});

const upload = multer({storage});

app.post("/api/upload", upload.single("file"), (req, res) => {
    const file = req.file;
    res.send(200).json(file.filename);
});


app.use("/api/auth", authRoutes);
app.use("/api/cards", authCards);
//app.use("/api/users");


app.listen(8800, () => {
    console.log("Connected");
})