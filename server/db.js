import mysql from "mysql"
import dotenv from "dotenv"

dotenv.config();

export const db = mysql.createConnection({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDB
});

db.connect((err) => {
    if (err) {
        console.log(err);
        return console.log(`Error: ${err.message}`);
    } 
    
    console.log(`Connected to MySQL server`);  
})

