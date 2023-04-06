import { db }  from "../db.js";
import jwt from "jsonwebtoken";
import { encrypt, decrypt, key, iv } from "../encrypt.js";


export const addCard = (req, res) => {
    const token = req.cookies.access_token;
    if(!token) return res.status(401).json("Not Authenticated");

    jwt.verify(token, "jwtkey", (err, userInfo) => {
        if(err) return res.status(403).json("Token is not valid");

        const { name, number, expmonth, 
                expyear, cvc, bank, type, img } = req.body;

        const q = "INSERT INTO cards(`name`, `number`, `expmonth`, `expyear`, `cvc`, `bank`, `type`, `img`, `uid`) VALUES (?)";

        const values = [
            name, 
            encrypt(number.toString()),
            encrypt(expmonth.toString()),
            encrypt(expyear.toString()),
            encrypt(cvc.toString()),
            bank,
            type,
            img,
            userInfo.id,
        ];

        db.query(q, [values], (err, data) => {
            if(err) return res.status(500).json(err);

            const keys = [
                key.toString("hex"),
                iv.toString("hex"),
                data.insertId
            ]
            const qkeys = "INSERT INTO keystring(`keystr`, `ivstr`, `ckid`) VALUES (?)"

            db.query(qkeys, [keys], (err, data) => {
                if (err) return res.status(500).json(err);
                return res.status(200).json("Keys and post has been created");
            })            
        })
    });
};

export const getCards = (req, res) => {
    const token = req.cookies.access_token;
    if(!token) return res.status(401).json("Not Authenticated");

    jwt.verify(token, "jwtkey", (err, userInfo) => {
        if(err) return res.status(403).json("Token is not valid");  

        const q = "SELECT c.*, k.`keystr`, k.`ivstr` FROM cards c JOIN keystring k ON c.id = k.ckid WHERE uid=?";

        db.query(q, [userInfo.id], (err, data) => {
            console.log(data);
            if(err) return res.status(500).json(err);

            const decryptedData = data.map(card => {
                const key = Buffer.from(card.keystr, "hex");
                const iv = Buffer.from(card.ivstr, "hex");
                return {
                    name: card.name,
                    number: "**** **** **** " + decrypt(card.number, key, iv).slice(-4),
                    expmonth: decrypt(card.expmonth, key, iv),
                    expyear: decrypt(card.expyear, key, iv),
                }
            })
            return res.status(200).json(decryptedData);
        })
    });  
};

export const getCard = (req, res) => {
    const token = req.cookies.access_token;
    if(!token) return res.status(401).json("Not Authenticated");

    jwt.verify(token, "jwtkey", (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid");

        const q = "SELECT c.*, k.`keystr`, k.`ivstr` FROM cards c JOIN keystring k ON c.id = k.ckid WHERE c.id=?";
    
        db.query(q, [req.params.id], (err, data) => {
            if(err) return res.status(500).json(err);

            const decryptedData = data.map(card => {
                const key = Buffer.from(card.keystr, "hex");
                const iv = Buffer.from(card.ivstr, "hex");
                return {
                    name: card.name,
                    number: "**** **** **** " + decrypt(card.number, key, iv).slice(-4),
                    expmonth: decrypt(card.expmonth, key, iv),
                    expyear: decrypt(card.expyear, key, iv),
                }
            })

            return res.status(200).json(decryptedData);
        });
    });

};

export const deleteCard = (req, res) => {
    const token = req.cookies.access_token;
    if(!token) return res.status(401).json("Not Authenticated");

    jwt.verify(token, "jwtkey", (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid");
        
        const cardId = req.params.id;
        const q = "DELETE FROM cards WHERE `id` = ? AND `uid` = ?";
        db.query(q, [cardId, userInfo.id], (err, data) => {
            if (err) return res.status(403).json("You can delete only your cards");

            return res.json("Card has been deleted");
        });
    });
};

export const updateCard = (req, res) => {
    const token = req.cookies.access_token;
    if(!token) return res.status(401).json("Not authenticated!");

    jwt.verify(token, "jwtkey", (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

        const cardId = req.params.id;
        const q = "UPDATE cards SET `name`=?, `number`=?, `expmonth`=?, `expyear`=?, `cvc`=? WHERE `id`=? AND `uid` = ?";
        const { name, number, expmonth, 
            expyear, cvc } = req.body;
        const values = [
            name, 
            encrypt(number.toString()),
            encrypt(expmonth.toString()),
            encrypt(expyear.toString()),
            encrypt(cvc.toString()),
            ];

        db.query(q, [...values, cardId, userInfo.id], (err, data) => {
            if (err) return res.status(500).json(err);

            const keys = [
                key.toString("hex"),
                iv.toString("hex"),
            ]
            const qkeys = "UPDATE keystring SET `keystr`=?, `ivstr`=? WHERE `ckid`=?"

            db.query(qkeys, [...keys, cardId], (err, data) => {
                if (err) return res.status(500).json(err);
                return res.json("Card has been update");
            })      

            
        });
    });
};