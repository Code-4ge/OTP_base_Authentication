const mysql = require('mysql')

const database = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : '',
    database : 'bal'
});

database.connect((err)=>{
    if(err)
        console.log(err);
    else
        console.log("* Connected to MySQL!!");
});

module.exports = database;