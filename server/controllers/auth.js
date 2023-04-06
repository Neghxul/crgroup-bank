import { db } from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";



export const register = (req, res) => {

    // Check if a user already exists 
    const {username, email, password} = req.body;
    const q = "SELECT * FROM users WHERE email = ? OR username = ?";
    db.query(q,[email, username], (err, data) => {
        if (err) return res.json(err);
        if(data.length) return res.status(409).json("User already exists!");

        // Hash the password and create user
        const salt = bcrypt.genSaltSync(10);
        const hashPassword = bcrypt.hashSync(password, salt);
        const now = new Date();

        const q = "INSERT INTO users(`username`, `email`, `password`, `rdate`) VALUES (?)";
        const values = [
            username, 
            email,
            hashPassword,
            now
        ]

        db.query(q,[values], (err, data) => {
            if (err) return res.json(err);

            return res.status(200).json("User has been created");
        })

    });
};

export const login = (req, res) => {
    // Check user
    const q = "SELECT * FROM users WHERE username = ?";

    db.query(q, [req.body.username], (err, data) => {
        if (err) return res.json(err);

        if(data.length === 0) return res.status(400).json("User not found");


        // Check password
        const isPasswordCorrect = bcrypt.compareSync(req.body.password, data[0].password);
        
        if(!isPasswordCorrect) return res.status(400).json("Wrong username or password");

        const now = new Date();
        const qUpdate = "UPDATE users SET lastdate = ? WHERE id = ?";
        db.query(qUpdate, [now, data[0].id], (err) => {
            if (err) return res.json(err);
        });

        const token = jwt.sign({id:data[0].id}, "jwtkey");
        const {password, ...other} = data[0];

        res.cookie("access_token", token, {
            httpOnly: true,
            maxAge: 86400000,
        }).status(200).json(other);
    });
};