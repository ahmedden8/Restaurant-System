const express = require('express');
const fs = require("fs");
let app = express();
const ejs = require("ejs");
app.set('view engine', 'pug');
var bodyParser = require('body-parser');

const path = require('path');
const directoryPath = path.join(__dirname, 'restaurants');

let restaurant = [];
let restaurantids = [];

fs.readdir(directoryPath, function (err, files) {
    //handling error
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    }
    //listing all files using forEach
    files.forEach(function (file) {
        const filePath = path.join(directoryPath, file);
        console.log(file);
        let rawdata = fs.readFileSync(filePath);
        restaurant.push(JSON.parse(rawdata));
    });
    for(let x=0; x<restaurant.length; x++){
        restaurantids.push(restaurant[x].id);
    }
});

app.use(bodyParser.json({ type: 'application/*+json' }))

// parse some custom thing into a Buffer
app.use(bodyParser.raw({ type: 'application/vnd.custom-type' }))

// parse an HTML body into a string
app.use(bodyParser.text({ type: 'text/html' }))

app.use(bodyParser.urlencoded({
    extended: true
}));



app.use(function(req,res,next){
    console.log(req.method);
    console.log(req.url);
    console.log(req.path);
    console.log(req.get("Content-Type"));
    next();
});

app.get('/', getHomepage)
function getHomepage(req, res, next){
    res.status(200).sendFile("homepage.html", {root: __dirname});
}

app.get('/restaurants', (req, res) => {
    res.format({
        "application/json": function(){
            res.status(200).json(req.product);
        },
        "text/html": () => {res.render("restaurantnames", {restaurantids: restaurant}); }
    });

    next();
});

app.get('/client.js', getclient)
function getclient(req, res, next){
    res.status(200).sendFile("client.js", {root: __dirname});
}

app.get('/restaurants/client.js', getclient)
function getclient(req, res, next){
    res.status(200).sendFile("client.js", {root: __dirname});
}

app.get('/addrestaurant', addrestaurant)
function addrestaurant(req, res, next){
    res.status(200).sendFile("createrestaurant.html", {root: __dirname});
}

app.post('/restaurants', list)
function list(req, res, next){
    let bod = JSON.parse(req.body);
    let cond = "T";
    console.log(bod);
    for(let y in restaurant){
        if(bod.name === restaurant[y].name){
            cond = "F"
        }
    }
    if(cond === "T") {
        if (isNaN(bod.name)) {
            if (isNaN(bod.delivery_fee)) {

            } else {
                if (isNaN(bod.min_Order)) {

                } else {
                    let newid = 0;
                    for (let i = 0; i < 100; i++) {
                        for (let x in restaurantids) {
                            console.log(restaurantids[x]);
                            if (i == x) {
                                //console.log(restaurantids[x]);
                                continue;
                            }
                        }
                        newid = i;
                        break;
                    }
                    restaurant.push({
                        "id": restaurant.length,
                        "name": bod.name,
                        "min_order": Number(bod.min_Order),
                        "delivery_fee": Number(bod.delivery_fee),
                        "menu": {}
                    });
                    console.log(restaurant);
                }
            }
        }
    }
    res.send(req.body);
}
app.get('/restaurants/:id', resid)


function resid(req, res, next) {
    res.format({
        "application/json": function(){
            res.send(restaurant);
        },
        "text/html": () => {res.status(200).sendFile("orderform.html", {root: __dirname}); }
    });
}



app.listen(3000);
console.log("Server listening at http://localhost:3000");