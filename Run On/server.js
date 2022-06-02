var http = require('http');	// 서버 만드는 모듈 불러오기
var fs = require('fs');
var app = http.createServer(function(request,response){
    var url = request.url;
    url = '/server.html';	// 실행할 url
    response.writeHead(200);
    response.end(fs.readFileSync(__dirname + url));
});
app.listen(8080);

/** file 업로드 */
const ftp = require('basic-ftp');
const { Readable } = require('stream');

/** DB 읽어오기 */
async function upload(CSV) {
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
