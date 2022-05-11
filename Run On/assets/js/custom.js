/** index.html */
/** 로그인 */
function login() {
  var id = document.getElementById('userId').value;
  var pw = document.getElementById('password').value;

  if (id == "") {
    swal("", "아이디가 입력되지 않았습니다", "warning");
  }
  else if (pw == "") {
    swal("", "비밀번호가 입력되지 않았습니다", "warning");
  }
  else {
    location.href = './main.html';
  }
}


/** reserv_seat.html */
/** 예약 확인 alert */
function finishReserv(no) {
  swal({
    title: no + "번 좌석",
    text: "예약하시겠습니까?",
    icon: "warning",
    buttons: true,
    dangerMode: true,
  })
    .then((cancel) => {
      if (cancel) {
        swal("예약이 완료되었습니다.", {
          icon: "success",
        }).then(() => { location.href = './reserv_history.html'; })
      }
    });
}

/** reserv_room.html */
/** 시간 선택후 실행되는 함수 */
function chooseTime(no) {
  console.log(no);
}

/** reserv_detail.html */
/** 예약 상세 조회 페이지 alert */
// 예약 취소 alert
function cancelRev() {
  swal({
    title: "예약 취소",
    text: "예약을 취소하시겠습니까?",
    icon: "warning",
    buttons: true,
    dangerMode: true,
  })
    .then((cancel) => {
      if (cancel) {
        swal("예약이 취소되었습니다.", {
          icon: "success",
        }).then(() => { location.href = './reserv_history.html'; })
      }
    });
}

// 퇴실 alert
function checkOut() {
  swal({
    title: "이용 완료",
    text: "정말 퇴실하시겠습니까?",
    icon: "warning",
    buttons: true,
    dangerMode: true,
  })
    .then((cancel) => {
      if (cancel) {
        swal("퇴실 처리 완료되었습니다.", {
          icon: "success",
        }).then(() => { location.href = './main.html'; })
      }
    });
}

// 예약 연장 alert
function extendRev() {
  swal("예약 연장", "이용 시간이 2시간 연장되었습니다.", "success");
}



/** mypage.html */
/** 마이페이지 통계 */
// 일주일 통계
function statWeek() {
  document.getElementById("statW").className = "btn active";
  document.getElementById("statM").className = "btn btn-outline-primary";
  document.getElementById("statY").className = "btn btn-outline-primary";

  document.getElementById("useNo").innerText = "1회";
  document.getElementById("useNoPer").innerText = "1";
  document.getElementById("useNoDir").className = "fas fa-caret-up";

  document.getElementById("useTime").innerText = "50분";
  document.getElementById("useTimePer").innerText = "11";
  document.getElementById("useTimeDir").className = "fas fa-caret-down";
}

// 한달 통계
function statMonth() {
  document.getElementById("statW").className = "btn btn-outline-primary";
  document.getElementById("statM").className = "btn active";
  document.getElementById("statY").className = "btn btn-outline-primary";

  document.getElementById("useNo").innerText = "3회";
  document.getElementById("useNoPer").innerText = "2";
  document.getElementById("useNoDir").className = "fas fa-caret-down";

  document.getElementById("useTime").innerText = "1시간 10분";
  document.getElementById("useTimePer").innerText = "22";
  document.getElementById("useTimeDir").className = "fas fa-caret-down";
}

// 1년 통계
function statYear() {
  document.getElementById("statW").className = "btn btn-outline-primary";
  document.getElementById("statM").className = "btn btn-outline-primary";
  document.getElementById("statY").className = "btn active";

  document.getElementById("useNo").innerText = "5회";
  document.getElementById("useNoPer").innerText = "3";
  document.getElementById("useNoDir").className = "fas fa-caret-down";

  document.getElementById("useTime").innerText = "3시간 30분";
  document.getElementById("useTimePer").innerText = "33";
  document.getElementById("useTimeDir").className = "fas fa-caret-up";
}




/** adminMember.html */
/** 회원 조회 */
function viewMember() {
  var no = 1;
  var searchId = (new URL(document.location)).searchParams.get('userId');

  if (searchId == null || searchId == '' || searchId == '#') { // 전체 조회
    var query = firebase.database().ref("userInfo").orderByKey();
    query.once("value").then(function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        // Table 추가 html 문자열 준비
        var htmlString = '<tr>'
          + '<td>' + (no++) + '</td>'
          + '<td>' + childSnapshot.val().id + '</td>'
          + '<td>' + childSnapshot.val().name + '</td>'
          + '<td>' + childSnapshot.val().phone + '</td>';

        // 블랙리스트에 존재하는지 체크
        var isBlack = firebase.database().ref("blacklist").orderByKey().equalTo(childSnapshot.key);
        isBlack.once("value").then(function (black) {
          if (black.val() == null) { // 블랙리스트 X
            var clickFunction = 'addBlacklistAdmin(this.parentNode.parentNode)';
            htmlString += '<td><button class="btn btn-sm" onclick=' + clickFunction + '>등록</button></td></tr>';
          } else { // 블랙리스트 존재
            black.forEach(function (b) {
              if (b.val().count < 3) { // 경고 횟수 3 미만
                htmlString += '<td><div class="badge badge-success">' + b.val().count + '/3</div></td></tr>';
              } else { // 경고 횟수 3
                htmlString += '<td><div class="badge badge-danger">' + b.val().count + '/3</div></td></tr>';
              }
            })
          }

          // Table 추가
          document.querySelector('#userList').innerHTML += htmlString;
        })
      });
    });
  } else { // 아이디 입력됨
    var query = firebase.database().ref("userInfo").orderByChild('id').equalTo(searchId);
    query.once("value").then(function (snapshot) {
      // 검색 결과 없음
      if(snapshot.val() == null){
        document.querySelector('#userList').innerHTML += '<tr><td colspan=5>검색 결과 없음</td></tr>';
      }

      // 검색 결과 존재
      snapshot.forEach(function (childSnapshot) {
        // Table 추가 html 문자열 준비
        var htmlString = '<tr>'
          + '<td>' + (no++) + '</td>'
          + '<td>' + childSnapshot.val().id + '</td>'
          + '<td>' + childSnapshot.val().name + '</td>'
          + '<td>' + childSnapshot.val().phone + '</td>';

        // 블랙리스트에 존재하는지 체크
        var isBlack = firebase.database().ref("blacklist").orderByKey().equalTo(childSnapshot.key);
        isBlack.once("value").then(function (black) {
          if (black.val() == null) { // 블랙리스트 X
            var clickFunction = 'addBlacklistAdmin(this.parentNode.parentNode)';
            htmlString += '<td><button class="btn btn-sm" onclick=' + clickFunction + '>등록</button></td></tr>';
          } else { // 블랙리스트 존재
            black.forEach(function (b) {
              if (b.val().count < 3) { // 경고 횟수 3 미만
                htmlString += '<td><div class="badge badge-success">' + b.val().count + '/3</div></td></tr>';
              } else { // 경고 횟수 3
                htmlString += '<td><div class="badge badge-danger">' + b.val().count + '/3</div></td></tr>';
              }
            })
          }

          // Table 추가
          document.querySelector('#userList').innerHTML += htmlString;
        });
      });
    });
  }
}


/** 블랙리스트 추가 alert */
function addBlacklistAdmin(userInfo, key) {
  swal({
    title: "블랙리스트",
    text: "등록하시겠습니까?",
    icon: "warning",
    buttons: true,
    dangerMode: true,
  })
    .then((cancel) => {
      if (cancel) {
        // 사용자 ID, 이름, 오늘 날짜
        var userId = userInfo.cells[1].innerText;
        var userName = userInfo.cells[2].innerText;
        var today = getToday();

        // firebase 연결
        const queryUser = firebase.database().ref('userInfo').orderByChild('id').equalTo(userId);
        const queryBlack = firebase.database().ref('blacklist');

        queryUser.once("value").then(function(user){
          user.forEach(function(getKey){
            var key = getKey.key;
            queryBlack.child(key).set({
              count: 1, // 새로 등록할 때 경고 횟수 1
              warnDate: today // 오늘 날짜 = 경고 받은 날짜 (경고 횟수 3일 때 endDate 구함)
            });
          });
        });

        swal("블랙리스트에 등록되었습니다.", {
          icon: "success",
        }).then(() => { location.href = './adminMember.html'; })
      }
    });
}


/** adminBlacklist.html */

/** 블랙리스트 조회 */
function viewBlacklist() {
  var no = 1;
  var searchId = (new URL(document.location)).searchParams.get('userId');

  if (searchId == null || searchId == '' || searchId == '#') { // 전체 조회
    var queryBlack = firebase.database().ref("blacklist").orderByKey();
    queryBlack.once("value").then(function (snapshot) {
      snapshot.forEach(function (childSnapshot) {
        // userInfo에서 회원 아이디, 이름 정보 가져오기
        var queryUser = firebase.database().ref("userInfo").orderByKey().equalTo(childSnapshot.key);
        queryUser.once("value").then(function(userlist){
          userlist.forEach(function(user){
             // Table 추가 html 문자열 준비
             var htmlString = '<tr>'
             + '<td>' + (no++) + '</td>'
             + '<td>' + user.val().id + '</td>'
             + '<td>' + user.val().name + '</td>'
             + '<td>' + childSnapshot.val().warnDate + '</td>';

            // 경고 횟수 3회 미만 = 
            if(childSnapshot.val().endDate == undefined){
              htmlString += '<td>-</td>'
            }else{
              htmlString += '<td>' + childSnapshot.val().endDate + '</td>';
            }

            // Blacklist 경고 횟수 Check
            if (childSnapshot.val().count < 3) { // 경고횟수 3회 미만
              htmlString += '<td><div class="badge badge-success">' + childSnapshot.val().count + '/3</div></td>';
            } else { // 경고횟수 3회
              htmlString += '<td><div class="badge badge-danger">' + childSnapshot.val().count + '/3</div></td>';
            }

            // 관리 버튼 추가
            var clickFunction = 'location.href="./edit_blacklist.html?key='+childSnapshot.key+'"';
            htmlString += '<td><button class="btn btn-sm" onclick='+clickFunction+'>관리</button></td></tr>'

            // Table 추가
            document.querySelector('#blackList').innerHTML += htmlString;
          })
        });
      });
    });
  } else { // 아이디 입력됨
    var key;
    var htmlString;

    // 1. userInfo에서 입력된 아이디의 key값 가져오기
    var queryCheckId = firebase.database().ref("userInfo").orderByChild('id').equalTo(searchId);
    queryCheckId.once("value").then(function(userList){
      if(userList.val() != null){ // 검색한 아이디 회원 존재
        userList.forEach(function(user){
          // 2. blacklist에 해당 key값 있는지 확인
          var queryBlack = firebase.database().ref("blacklist").orderByKey().equalTo(user.key);
          queryBlack.once("value").then(function(blackList){
            if(blackList.val() != null){ // 검색한 아이디 블랙리스트에 존재 (검색 결과 존재)
              blackList.forEach(function(black){
                // Table 추가 html 문자열 준비
                var htmlString = '<tr>'
                + '<td>' + (no++) + '</td>'
                + '<td>' + user.val().id + '</td>'
                + '<td>' + user.val().name + '</td>'
                + '<td>' + black.val().warnDate + '</td>';

                // 경고 횟수 3회 미만 = 이용 정지 없음
                if(black.val().endDate == undefined){
                  htmlString += '<td>-</td>'
                }else{
                  htmlString += '<td>' + black.val().endDate + '</td>';
                }

                // Blacklist 경고 횟수 Check
                if (black.val().count < 3) { // 경고횟수 3회 미만
                  htmlString += '<td><div class="badge badge-success">' + black.val().count + '/3</div></td>';
                } else { // 경고횟수 3회
                  htmlString += '<td><div class="badge badge-danger">' + black.val().count + '/3</div></td>';
                }

                // 관리 버튼 추가
                var clickFunction = 'location.href="./edit_blacklist.html?key='+black.key+'"';
                htmlString += '<td><button class="btn btn-sm" onclick='+clickFunction+'>관리</button></td></tr>'

                // Table 추가
                document.querySelector('#blackList').innerHTML += htmlString;
              })
            }else{ // 블랙리스트 X
              console.log("블랙리스트 아님");
              htmlString = '<tr><td colspan=7>해당 아이디의 블랙리스트는 존재하지 않습니다.</td></tr>';
              document.querySelector('#blackList').innerHTML += htmlString;
            }
          })
        })
      } else { // 회원 X
        console.log("회원이 아님");
        htmlString = '<tr><td colspan=7>해당 아이디의 회원은 존재하지 않습니다.</td></tr>';
        document.querySelector('#blackList').innerHTML += htmlString;
      }
    })
  }
}

function setEditBlack() {
  var key = (new URL(document.location)).searchParams.get('key');

  // 해당 key 블랙리스트 정보 가져오기
  var queryBlack = firebase.database().ref("blacklist").orderByKey().equalTo(key);
  
  queryBlack.once("value").then(function(blackList){
    blackList.forEach(function(black){
      var warnDate = document.getElementById('warnDate');
      warnDate.value = black.val().warnDate;
      warnDate.setAttribute('max', getToday()); // 경고 날짜 수정 가능한 max 값 설정 (미래 경고 X)

      document.getElementById('count').value = black.val().count;
    });
  });

  // 해당 key 회원 정보 가져오기 (이름, 아이디)
  var queryUser = firebase.database().ref("userInfo").orderByKey().equalTo(key);
  queryUser.once("value").then(function(userList){
    userList.forEach(function(user){
      document.getElementById('userId').innerText = user.val().id;
      document.getElementById('userName').innerText = user.val().name;
    });
  });
}



/** adminSeat.html */
/** 좌석 관리 */
function editSeat(no) {
  swal("좌석관리", no + "번 좌석", "warning");
}


/** 오늘 날짜 구하는 함수 */
function getToday(){
  // 현재 시간 구하기
  var today = new Date();
  
  // yyyy-mm-dd 형식으로 변환
  var year = today.getFullYear();
  var month = ('0' + (today.getMonth() + 1)).slice(-2);
  var day = ('0' + today.getDate()).slice(-2);
  var dateString = year + '-' + month + '-' + day;

  return dateString;
}
