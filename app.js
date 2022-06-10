// demo file from drive :D
const path = require('path');
const express = require("express");
const session = require('express-session');
const request = require('request');
const cors = require('cors')
const bodyParser = require('body-parser');
const MySqlstore = require('express-mysql-session')(session);
const db = require(__dirname + '\\model\\db.js');

const app = express();
const port = 3000; 

// const staticPath = path.join(__dirname, '/client/src');
// app.use(express.static(staticPath));
app.use(bodyParser.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());

var sessionOption = {
    host : 'localhost',
    user : 'root',
    password : '',
    database : 'bal'
}

var sessionStore = new MySqlstore(sessionOption);
app.use(session({
    secret: 'this is secret key',
    store: sessionStore,
    resave: false,
    saveUninitialized: false
}));

app.get("/", (req, res)=>{
    res.redirect('http://127.0.0.1:4200');
});

// API for checking ticket number
app.post("/api/ticket", (req, res)=>{
    var ticket = req.body.ticket;
    if(req.body.type == "Non-L3+")
        var query = `SELECT * FROM nonl3 where Ticket_NO LIKE '${ticket}%'`;
    if(req.body.type == "L3+")
        var query = `SELECT * FROM l3 where Ticket_NO LIKE '${ticket}%'`;

    if(!(isNaN(ticket)))
    {
        db.query(query, (err, result, field)=>{
            if(err)
                console.log(err);
            else{
                if(result == 0)
                    res.json({msg:"wrong data"});
                else
                    res.json({msg:"right data"});
            }
        })
    }
});

// API for checking mobile number
app.post("/api/mobile", (req, res)=>{
    var mobile = req.body.mobile;
    if(req.body.type == "Non-L3+")
        var query = `SELECT * FROM nonl3 where Phone_No LIKE '${mobile}%'`;
    if(req.body.type == "L3+")
        var query = `SELECT * FROM l3 where Phone_No LIKE '${mobile}%'`;

    if(!(isNaN(mobile)))
    {
        db.query(query, (err, result, field)=>{
            if(err)
                console.log(err);
            else{
                if(result == 0)
                    res.json({msg:"wrong data"});
                else
                    res.json({msg:"right data"});
            }
        })
    }
});

// API for sending OTP
app.post("/api/sendcode", (req, res)=>{
    var ticket = req.body.ticket;
    var mobile = req.body.mobile;
    if(req.body.type == "Non-L3+")
    {
        var query1 = `SELECT * FROM nonl3 where Ticket_NO = '${ticket}' AND Phone_No = ${mobile}`;
        var query2 = `UPDATE nonl3 set OTP = ? where Ticket_NO = ? AND Phone_No = ?`;
    }
    if(req.body.type == "L3+")
    {
        var query1 = `SELECT * FROM l3 where Ticket_NO = '${ticket}' AND Phone_No = ${mobile}`;
        var query2 = `UPDATE l3 set OTP = ? where Ticket_NO = ? AND Phone_No = ?`;
    }

    if((!(isNaN(mobile)) && (!(isNaN(ticket)))))
    {
        db.query(query1, (err, result, field)=>{
            if(err)
                console.log(err);
            else{
                if(result != 0)
                {
                    console.log(result);
                    var code = Math.floor(100000 + Math.random() * 900000);
                    console.log(code);

                    async function db_update(){
                        db.query(query2,[code, ticket, mobile],(err, result)=>{
                            if(err){
                                console.log(err);
                            }
                            else
                                console.log(result);
                        } );
                    }
                    
                    async function message(){
                        var phone = '+91'+mobile;
                        request(`<YOUR SMS SERVICE PROVIDER / GATEWAY ADDRESS>`, { json: true }, (err, res, body)=>{
                            if(err)
                                console.log(err);
                            else{
                                console.log(body);
                                // if(body == 'SUCCESS')
                                //     res.json({msg : 'send done'});
                                // else
                                //     res.json({msg : 'send fail'});
                            }
                        });

                    }

                    db_update();
                    message();
                    res.json({msg : 'send done'});
                }
                else
                    res.json({msg:"send fail"});
            }
        })
    }
});

// API for checking OTP
app.post("/api/checkcode", (req, res)=>{
    var ticket = req.body.ticket;
    var mobile = req.body.mobile;
    var code = req.body.code;
    if(req.body.type == "Non-L3+")
        var query = `SELECT * FROM nonl3 where Ticket_No = '${ticket}' and Phone_No = '${mobile}' and OTP = '${code}'`;
    if(req.body.type == "L3+")
        var query =  `SELECT * FROM l3 where Ticket_No = '${ticket}' and Phone_No = '${mobile}' and OTP = '${code}'`;

    if((!(isNaN(mobile)) && (!(isNaN(ticket))) && (!(isNaN(code)))))
    {
        db.query(query, (err, result)=>{
            if(result != 0)
            {
                // if authenticated redirect to dashboard
                console.log('true');
                req.session.user = result[0].Ticket_No;
                console.log(req.session.user);
                res.json({msg: 'correct otp'});
            }
            else
            {
                console.log('false');
                res.json({msg : 'wrong otp'});
            }
        });
    }
});

// dashboard route
app.get("/dashboard", (req, res)=>{
    // if(req.session.user)
    //     res.render('dashboard');
    // else{
    //     res.redirect('/');
    // }
    res.render('dashboard');
});

// logout route
app.get('/logout', (req, res)=>{
    if(req.session.user)
    {
        req.session.destroy();
        return res.redirect('/auth')
    }
    else
        return res.redirect('/')
})


// hosting server
app.listen(port, ()=>{
    console.log(`* Listing on http://127.0.0.1:${port}`);
});
