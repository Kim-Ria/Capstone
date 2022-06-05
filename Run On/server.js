// npm install express
var http = require("http");
var express = require("express");
var fs = require("fs");

var app = express();

// POST 파라미터 처리
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended : false }));

// GET: server.html 띄우기
app.get("/", function(req, res){
    fs.readFile("server.html", function(err, data){
        res.send(data.toString());
    })
})

// POST: 파일 업로드
app.post("/upload", function(req, res){
	console.log("file upload...");
	var csv = req.param("csv");

    var csvToken = csv.split(',');
    var csvString = "";

    for(var i in csvToken){
        csvString += csvToken[i];

        if((parseInt(i)+1)%8 == 0){
            csvString += "\r\n";
        }else{
            csvString += ",";
        }
    }

    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write(csv);
    res.write(csvString);
    res.end();
    console.log(csvString);

    upload(csvString);

    setTimeout(function(){
       fs.readFile("server.html", function(err, data){
           res.send(data.toString());
       })
    }, 1000*60*10); // 1000=1초 > 10분 뒤 다시 csv file 읽기
});

http.createServer(app).listen(8080, function(request, response) {
	console.log("Server Running...");
});

/** file 업로드 */
// npm install basic-ftp
const ftp = require('basic-ftp');
const { Readable } = require('stream');
const exp = require('constants');

/** CSV 업로드 실행 */
async function upload(CSV) {
    console.log("upload...");
    console.log(CSV);

    const client = new ftp.Client()
    //client.ftp.verbose = true;

    await client.access({ // 접속 정보
        host: "192.168.1.150",
        user: "cgESLUser",
        password: "cgESLPassword",
        port: 2121
    });

    const source = new Readable; // stream 객체에 저장
    source.push(CSV);
    source.push(null); //end file

    const fileName = "/Import/import_"+getCuurrentDate()+".csv" // 서버path + file명 + csv

    await client.uploadFrom(source, fileName)
        .then((result) => {
            console.log("Upload success");
        })
        .catch((e) => {
            console.error(e);
        });
    client.close();
}

/** 현재 시간 (CSV 파일명) */
function getCuurrentDate() {
    var date = new Date()
    var year = date.getFullYear().toString();

    var month = date.getMonth() + 1
    month = month < 10 ? '0' + month.toString() : month.toString()

    var day = date.getDate();
    day = day < 10 ? '0' + day.toString() : day.toString()

    var hour = date.getHours();
    hour = hour < 10 ? '0' + hour.toString() : hour.toString()

    var minites = date.getMinutes();
    minites = minites < 10 ? '0' + minites.toString() : minites.toString()

    var seconds = date.getSeconds();
    seconds = seconds < 10 ? '0' + seconds.toString() : seconds.toString()

    return year + month + day + hour + minites + seconds
}
