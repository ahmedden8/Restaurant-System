
const http = require('http');
const fs = require("fs");
const ejs = require("ejs");

let restaurant = [];
let restaurantnames = [];
let order = {};
let restauranttotals = {'Frodo\'s Flapjacks': {ordertotal:0,mpi:"N/A", mus:{}, mu:0}, 'Lembas by Legolas': {ordertotal:0,mpi:"N/A",mus:{},mu:0}, 'Aragorn\'s Orc BBQ': {ordertotal:0,mpi:"N/A", mus:{},mu:0} };
let selectedrestaurant = 0;
let mostunits;

//reading the files from the restaurants directory
    const path = require('path');
    const directoryPath = path.join(__dirname, 'restaurants');
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
        for(let x=0; x<3; x++){
            restaurantnames.push(restaurant[x].name);
        }
    });

//Creating the server
const server = http.createServer(function (request, response) {
    console.log(request.url);
    if(request.method === "GET"){ //get requests handling here
        if(request.url === "/" || request.url === "/homepage.html"){
            //read the todo.html file and send it back
            fs.readFile("homepage.html", function(err, data){
                if(err){
                    response.statusCode = 500;
                    response.write("Server error.");
                    response.end();
                    return;
                }
                response.statusCode = 200;
                response.setHeader("Content-Type", "text/html");
                response.write(data);
                response.end();
            });
        }else if(request.url === "/orderform.html") {
            //read the todo.html file and send it back
            fs.readFile("orderform.html", function (err, data) {
                if (err) {
                    response.statusCode = 500;
                    response.write("Server error.");
                    response.end();
                    return;
                }
                response.statusCode = 200;
                response.setHeader("Content-Type", "text/html");
                response.write(data);
                response.end();
            });
        }else if(request.url === "/statisticspage.html"){
            ejs.renderFile("statisticspage.html", {restauranttotals}, {}, function(err, data){
                if(err){
                    console.log(err);
                    return;
                }

                response.statusCode = 200;
                response.setHeader("Content-Type", "text/html");
                response.end(data);
                return;
            });
        }

        else if(request.url === "/client.js") {
            fs.readFile("client.js", function (err, data) {
                if (err) {
                    response.statusCode = 500;
                    response.write("Server error.");
                    response.end();
                    return;
                }
                response.statusCode = 200;
                response.setHeader("Content-Type", "text/html");
                response.write(data);
                response.end();
            });
        }
        else if(request.url === "/add.jpg") {
            fs.readFile("add.jpg", function (err, data) {
                if (err) {
                    response.statusCode = 500;
                    response.write("Server error.");
                    response.end();
                    return;
                }
                response.statusCode = 200;
                response.setHeader("Content-Type", "image/jpeg");
                response.write(data);
                response.end();
            });
        }
        else if(request.url === "/remove.jpg") {
            fs.readFile("remove.jpg", function (err, data) {
                if (err) {
                    response.statusCode = 500;
                    response.write("Server error.");
                    response.end();
                    return;
                }
                response.statusCode = 200;
                response.setHeader("Content-Type", "image/jpeg");
                response.write(data);
                response.end();
            });
        }
        else if(request.url === "/list"){
            response.statusCode = 200;
            response.setHeader("Content-Type", "text/html");
            response.write(JSON.stringify(restaurantnames));
            response.end();
        }
        else{
            response.statusCode = 404;
            response.write("Unknwn resource.");
            response.end();
        }
    }else if(request.method === "POST") {
        if (request.url === "/selected") {
            let body = "";
            request.on('data', (chunk) => {
                body += chunk;
            })
            request.on('end', () => {
                for(let y=0; y<3; y++) {
                    if (body === restaurant[y].name) {
                        selectedrestaurant = y;
                        response.write(JSON.stringify(restaurant[y]));
                        response.end();
                    }
                    else{
                    }
                }
            })
        }
        else if (request.url === "/order") {
            let body = "";
            let newitems = [];
            request.on('data', (chunk) => {
                body += chunk;
            })
            request.on('end', () => {
                let total=0;
                order = JSON.parse(body);
                    for(let y in restaurant[selectedrestaurant].menu) {
                        for (let o in Object.keys(restaurant[selectedrestaurant].menu[y])) {
                            if( !restauranttotals[restaurant[selectedrestaurant].name].mus[Object.keys(restaurant[selectedrestaurant].menu[y])[o]] ) {
                                restauranttotals[restaurant[selectedrestaurant].name].mus[Object.keys(restaurant[selectedrestaurant].menu[y])[o]] = 0;
                            }
                        }
                    }

                for(let l in restaurant[selectedrestaurant].menu) {
                    for (let keeys in Object.keys(restaurant[selectedrestaurant].menu[l])) {
                    }
                }
                for(let c in order) {
                    restauranttotals[restaurant[selectedrestaurant].name].mus[c] += order[c];
                    total += order[c];
                }

                for(let m in restauranttotals[restaurant[selectedrestaurant].name].mus){
                    if(restauranttotals[restaurant[selectedrestaurant].name].mus[m]> restauranttotals[restaurant[selectedrestaurant].name].mus[mostunits]){
                        restauranttotals[restaurant[selectedrestaurant].name].mu = m;
                    }
                }
                restauranttotals[restaurant[selectedrestaurant].name].ordertotal += total;
                for(let l in restaurant[selectedrestaurant].menu) {
                    if (restaurant[selectedrestaurant].menu[l][restauranttotals[restaurant[selectedrestaurant].name].mu]) {
                        restauranttotals[restaurant[selectedrestaurant].name].mpi = restaurant[selectedrestaurant].menu[l][restauranttotals[restaurant[selectedrestaurant].name].mu].name;
                    }
                }
                response.end();
            })
        }
        else if (request.url === "/remove") {
            let body = "";
            let newitems = [];
            request.on('data', (chunk) => {
                body += chunk;
            })
            request.on('end', () => {
                itemss = JSON.parse(body);
                response.write(body);
                response.end();
            })
        }
        else {
            response.statusCode = 404;
            response.write("Unknwn resource.");
            response.end();
        }
    }
});

//Server listens on port 3000
server.listen(3000);
console.log('Server running at http://127.0.0.1:3000/');
