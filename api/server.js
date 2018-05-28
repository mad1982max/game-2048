const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//-------------------------------------------
const url = "mongodb://maks.bezrodnyi:Basilur7612304@ds117590.mlab.com:17590/users2048";

MongoClient.connect(url, function(err, client) {
    if (err) throw err;
    let col = client.db("users2048").collection("users");

    app.listen(8080, () => {
        console.log('Server is up and running on port 8080');
    });

    app.post('/users/:_id', (req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        console.log(req.params._id);
        console.log(req.body);
        col.findOne({_id: req.params._id}, (err, result) => {
            if (err) throw err;
            if (result == null) {
                res.send("There is no user with such login/password");
            }
            else if (result !== null) {
                if (result.password == req.body.password) {
                    res.send(result);
                } else {
                    res.send(`Did you forget password?`);
                }
            };
        });
    });

    app.post('/users/', (req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        col.findOne({_id: req.body._id}, (err, result) => {
            if (err) throw err;
            else if (result == null) {
                console.log('new user');

                col.insertOne({
                    _id: req.body._id,
                    password: req.body.password,
                    highestScore: 0,
                    regDate: new Date()
                }, (err, result) => {
                    if (err) throw err;
                    console.log(result.ops);
                    res.send(result.ops);
                });
            } else {
                res.send('The user with such name is already exist')
            };
        });
    });

    app.post('/users/:_id/edit', (req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        let myQuery = {_id: req.params._id};
        let newvalue = {$set: {highestScore: +req.body.record}};
        col.updateOne(myQuery, newvalue, (err, result) => {
            res.send(result);
        })
    });

    app.get('/users/', (req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        col.find({}, {'highestScore':1}).sort({highestScore: -1}).limit(5).toArray((err,result) => {
            console.log(result);
            res.send(result);
        });
    })
});