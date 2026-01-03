import mysql from "mysql2";

const env = process.env;
const {log} = console;

const db = mysql.createConnection({
    host:env.DB_HOST,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database:env.DB_DATABASE
});


db.connect(err => {
    if(err){
        log('Not connected to database : ',err)
    }else{
        log('DB Connected successfully!');
    }
})

export default db;
