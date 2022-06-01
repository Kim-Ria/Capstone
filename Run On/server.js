const ftp = require('basic-ftp');
const { Readable } = require('stream');

/** file 업로드 */
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

/** JSON 생성 */
const json = [
    { "tag_id": "1", "room_no": "2", "seat_no": "01", "state": "이용 가능", "user_name": "",
        "usable_time": "", "extension_time": "", "extension_cnt": "" },
    { "tag_id": "2", "room_no": "2", "seat_no": "02", "state": "이용 가능", "user_name": "",
        "usable_time": "", "extension_time": "", "extension_cnt": "" },
    { "tag_id": "3", "room_no": "2", "seat_no": "03", "state": "이용 가능", "user_name": "",
        "usable_time": "", "extension_time": "", "extension_cnt": "" },
    { "tag_id": "4", "room_no": "2", "seat_no": "04", "state": "이용 가능", "user_name": "",
        "usable_time": "", "extension_time": "", "extension_cnt": "" },]

/** CSV 생성 */
const objectToCsv = function (data) {
    const csvRows = [];

    // get the headers -> 컬럼값 띄우기
    const headers = Object.keys(data[0]);
    csvRows.push(headers.join(','));

    // loop over the rows -> 속성값
    for (const row of data) {
        const values = headers.map(header => {
            // form escaped comma separated values
            const escaped = ('' + row[header]).replace(/"/g, '\\"') // ??
            return `"${escaped}"`;  // "","".. 이런식으로 출력
        });
        csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
};

// node.js: json -> csv
function jsonToCSV(json_data) {
    // DB 가져오기
    var query = firebase.database().ref("reserveData");
    query.once("value", function (resList) {
        resList.forEach(function (reserve) {
            reserve.forEach(function (r) {
            var idx = parseInt(r.val().seat) - 1;

            if (r.val().room == '2' && r.val().state == 0) {
                json[idx].state = "이용 전"
            }else if(r.val().room == '2' && r.val().state == 1){
                json[idx].state = "이용 중"
            }

            var name = r.val().name;
            json[idx].user_name = name[0]+"*"+name[2];
            json[idx].usable_time = numberPad(r.val().startTime, 2) + ':00~' + numberPad(r.val().endTime, 2) + ':00';
            json[idx].extension_time = numberPad(String(parseInt(r.val().endTime) - 1), 2) + ':30~' + numberPad(String(parseInt(r.val().endTime) - 1), 2) + ':59';
            json[idx].extension_cnt = r.val().extension;
            })
        })
    }).then(function(){
        const json_array = json;
        let csv_string = ''; // json을 csv로 변환한 문자열이 담길 변수
        const titles = Object.keys(json_array[0]); // 제목: json_array 첫번째 요소

        titles.forEach((title, index) => { // CSV문자열에 제목 삽입
            // 각 제목은 ,구분 / 마지막 제목은 줄바꿈 추가
            csv_string += (index !== titles.length - 1 ? `${title},` : `${title}\r\n`);
        });

        json_array.forEach((content, index) => { // 내용 추출
            let row = '';
            for (let title in content) { // 객체의 키값 추출
                // 행에 '내용' 할당: 각 내용 앞에 컴마를 삽입하여 구분, 첫번째 내용은 앞에 컴마X
                row += (row === '' ? `${content[title]}` : `,${content[title]}`);
            }
            // CSV 문자열에 '내용' 행 삽입: 뒤에 줄바꿈(\r\n) 추가, 마지막 행은 줄바꿈X
            csv_string += (index !== json_array.length - 1 ? `${row}\r\n` : `${row}`);
        })
        
        return csv_string;
    })
}

const CSV = jsonToCSV(json) // json -> csv
upload(CSV); // csv 업로드

function checkNoShow(){ // 노쇼 : 예약 시간 10분 초과 & state=0 인 경우
    console.log("실행");
    var query = firebase.database().ref('reserveData'); 
    query.once('value', function(resList){
        resList.forEach(function(res){ // res.key = userKey
            var query2 = firebase.database().ref('reserveData').child(res.key).orderByChild('state').equalTo(0); // 이용 전 data만 가져옴
            query2.once('value', function(resData){ 
                resData.forEach(function(r){
                    var now = new Date(); // 현재 시간
                    var nowH = now.getHours();
                    var nowM = now.getMinutes();
            
                    var res10 = new Date(); // 예약 시간 + 10분

                    res10.setHours(r.val().startTime.substr(0,2));
                    res10.setMinutes(r.val().startTime.substr(3,2));
                    res10.setSeconds(0);
            
                    var diff = res10;
                    res10.setMinutes(diff.getMinutes()+10); // 10분 추가됨
            
                    if(now > res10){ // 예약 시간 +10분 지남
                        var queryCancel = firebase.database().ref('reserveData').child(res.key).child(r.key); // 해당 예약
                        queryCancel.update({
                            state: 3 // 자동 취소
                        })
            
                        var queryB = firebase.database().ref('blacklist').child(res.key); // 해당 사용자
                        queryB.once('value', function(black){
                            if(black.val() == null){ // 블랙리스트에 존재하지 않는 경우 count=1 set
                                queryB.set({
                                    count: 1, // 새로 등록할 때 경고 횟수 1
                                    warnDate: getToday() // 오늘 날짜 = 경고 받은 날짜 (경고 횟수 3일 때 endDate 구함)
                                });
                            } else { // 블랙리스트에 존재하는 경우 count+1 update
                                if(black.val().count == 2){ // 추가하면 3 (최대)
                                    // 이용 정지 기간 계산 (현재 + 30일)
                                    var date = new Date();
                                    var after30days = (new Date(Date.parse(date) + 30*1000*60*60*24)) // 30일 후
                                    
                                    // yyyy-mm-dd 형식으로 변환
                                    var year = after30days.getFullYear();
                                    var month = ('0' + (after30days.getMonth() + 1)).slice(-2);
                                    var day = ('0' + after30days.getDate()).slice(-2);
                                    var endDate = year + '-' + month + '-' + day;                                
            
                                    queryB.update({
                                        count: black.val().count + 1,
                                        warnDate: getToday(),
                                        endDate: endDate
                                    });
                                } else {
                                    queryB.update({
                                        count: black.val().count + 1,
                                        warnDate: getToday()
                                    });
                                }
                            }
                        })
                    }
                })
            })
        })
    })
}

function autoCheckOut(){
    var query = firebase.database().ref('reserveData');
    query.once('value', function(resList){ // userKey
        resList.forEach(function(resData){
            var query2 = firebase.database().ref('reserveData').child(resData.key).orderByChild('state').equalTo(1); // 이용 중인 data만 가져옴
            query2.once('value', function(res){
                res.forEach(function(r){
                    // 이용 중인 예약 endTime 체크
                    var now = new Date(); // 현재 시간
                    var nowH = now.getHours();
                    var nowM = now.getMinutes();
            
                    var end = new Date(); // 예약 시간 + 10분

                    end.setHours(r.val().endTime.substr(0,2));
                    end.setMinutes(r.val().endTime.substr(3,2));
                    end.setSeconds(0);

                    if(end < now) { // 이용 시간 지난 경우
                        var cancel = firebase.database().ref('reserveData').child(resData.key).child(r.key);
                        cancel.update({
                            state: 2 // 퇴실
                        });
                    }
                })
            })
        })
    })
}

/** 시간 관련 함수 */
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

function numberPad(n, width) {
    if (n < 10) {
        n = n + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
    }
    else return n;
}
