const http = require("node:http")

const server = http.createServer((req, res) => {
    if(req.url == "/"){
        res.writeHead(200, {"Content-Type" : "text/plain"});
        res.end("Home page")
    }

    if(req.url == "/no-cluster"){
        for(let i= 0; i< 6000000000; i++){}
        res.writeHead(200, {"Content-Type" : "text/plain"});
        res.end("Home page")
    }
});

server.listen(8000, ()=>{
    console.log("Server Listen on port 8000")
})