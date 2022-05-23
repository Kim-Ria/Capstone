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

/** 로그아웃 */
function logout(){
  localStorage.removeItem('uid');
  localStorage.removeItem('userName');
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



/** main.html */
/** 마이페이지 통계 */
// 블랙리스트 경고 횟수 체크
function getBlacklistCnt(){
  var key = localStorage.getItem('uid');

  var query = firebase.database().ref('blacklist').child(key);
  query.once('value', function(blackList){
    if(blackList.val()==null){ // 블랙리스트에 존재하지 않는 회원
      document.querySelector('#blackCount').innerHTML = '0 / 3회';
    }else{
      var endDate = new Date(blackList.val().endDate);
      var today = new Date(getToday());

      if(endDate < today) { // 이용 정지 기간 지난 경우
        query.set({}); // 블랙리스트에서 제거
        document.querySelector('#blackCount').innerHTML = '0 / 3회';
      } else { // 이용 정지 기간 지나지 않은 경우
        var count = blackList.val().count;
        
        if(count == 3){ // 경고 3회
          document.querySelector('#blackCount').innerHTML = '이용 정지';
          document.querySelector('#blackDate').innerHTML = blackList.val().endDate + ' 까지';
        }else{
          document.querySelector('#blackCount').innerHTML = count + ' / 3회';
        }
      }
    }
  })
}

// 통계 Text로 찍어보기
function getStatistics(){
  var uid = localStorage.getItem('uid');
  var query = firebase.database().ref('reserveData').orderByKey().equalTo(uid);
}


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
  // 1. 조회할 ID 가져오기
  var searchId = (new URL(document.location)).searchParams.get('userId');

  // 2. 조회할 page 번호 가져오기
  var curPage = (new URL(document.location)).searchParams.get('page'); // 현재 page 번호
  if(curPage == null || curPage=='' || curPage=='#') curPage = 1; // 지정 없는 경우 첫 번째 page

  // 전체 조회인 경우
  if (searchId == null || searchId == '' || searchId == '#'){
    // 2-1. page index 저장하기
    var index = []; // 10개씩 page 만들기
    var maxPage, userNum; // 페이지 수, 회원 수

    var pageQuery = firebase.database().ref('userInfo').orderByKey();
    pageQuery.once('value').then(function (pageList){
      userNum = pageList.numChildren(); // 회원 수 체크
      maxPage = Math.ceil(userNum/10); // 페이지 수 (전체 회원 수 / 10) -> 소수점 올림

      // 10명 마다 index 저장 (key)
      var no = 0;
      pageList.forEach(function(page){
        if(!(no%10)) // 10배수인 경우
          index.push(page.key); // page 시작점 key 저장
        no++;
      })

      // 2-2. page 버튼 표시하기 (5개)
      var start = parseInt(curPage)-2;
      var end = parseInt(curPage)+2; // 현재 페이지 앞 뒤로 2

      if(curPage < 3 && maxPage > 5) end = 5;
      if(curPage < 3) start = 1;
      if(maxPage < 5) end = maxPage;
      if(curPage > 5 && curPage+3 > maxPage){
        start = maxPage-4;
        end = maxPage;
      }

      var pageHtml = '';
      var pageLink = './adminMember.html?page='

      // 이전 페이지 (5페이지 이내 필요없음)
      if(maxPage > 5 && curPage > 3)
        pageHtml += '<li class="page-item">'
          + '<a class="page-link" href="'+ pageLink + (curPage-1) +'" tabindex="-1"><i class="fas fa-chevron-left"></i></a></li>';

      var i;
      for(i=start; i<=end; i++){
        pageHtml += '<li class="page-item"><a class="page-link" href="' + pageLink + i + '">'+ i;
        if(i == curPage) pageHtml += '<span class="sr-only">(current)</span>'; // 현재 페이지
        pageHtml += '</a></li>';
      }

      // 다음 페이지 (5페이지 이내 필요없음)
      if(maxPage > 5 && end != maxPage)
        pageHtml += '<li class="page-item">'
          + '<a class="page-link" href="' + pageLink + (end+1) + '"><i class="fas fa-chevron-right"></i></a></li>'

      document.querySelector('.pagination').innerHTML = pageHtml; // html 추가
    }).then(function(){
      // 3. 현재 page 첫 번째 key부터 10개 가져오기
      var queryUser = firebase.database().ref('userInfo').orderByKey().startAt(index[curPage-1]);

      if(curPage < maxPage) // 마지막 page 아닌 경우 => 조회 끝 지점 정해주기
        queryUser = queryUser.endBefore(index[curPage]);

      queryUser.once('value').then(function(userList){
        var no = ((curPage-1)*10)+1;
        
        userList.forEach(function(user){
          // Table 추가 html 문자열 준비
          var htmlString = '<tr>'
            + '<td>' + (no++) + '</td>'
            + '<td>' + user.val().id + '</td>'
            + '<td>' + user.val().name + '</td>'
            + '<td>' + user.val().phone + '</td>';

          // 블랙리스트에 존재하는지 체크
          var queryIsBlack = firebase.database().ref('blacklist').orderByKey().equalTo(user.key);
          queryIsBlack.once('value').then(function(black){
            if(black.val()==null){ // 블랙리스트 X
              var clickFunction = 'addBlacklistAdmin(this.parentNode.parentNode)';
              htmlString += '<td><button class="btn btn-sm" onclick=' + clickFunction + '>등록</button></td></tr>';
            } else { // 블랙리스트 등록되어 있음
              black.forEach(function (b) {
                if (b.val().count < 3) // 경고 횟수 3 미만
                  htmlString += '<td><div class="badge badge-success">' + b.val().count + '/3</div></td></tr>';
                else // 경고 횟수 3
                  htmlString += '<td><div class="badge badge-danger">' + b.val().count + '/3</div></td></tr>';
              })
            }
            // Table 추가
            document.querySelector('#userList').innerHTML += htmlString;
          })
        })
      })
    })
  } else { // 아이디 입력됨
    var query = firebase.database().ref("userInfo").orderByChild('id').equalTo(searchId);
    query.once("value").then(function (snapshot) {
      // 검색 결과 없음
      if(snapshot.val() == null){
        document.querySelector('#userList').innerHTML += '<tr><td colspan=5><h6>검색 결과 없음</h6>회원이 아닙니다.</td></tr>';
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
  // 1. 조회할 ID 가져오기
  var searchId = (new URL(document.location)).searchParams.get('userId');
  
  // 2. 조회할 page 번호 가져오기
  var curPage = (new URL(document.location)).searchParams.get('page'); // 현재 page 번호
  if(curPage == null || curPage=='' || curPage=='#') curPage = 1; // 지정 없는 경우 첫 번째 page

  // 전제 조회인 경우
  if (searchId == null || searchId == '' || searchId == '#') {
    // 2-1. page index 저장하기
    var index = []; // 10개씩 page 만들기
    var maxPage, userNum; // 페이지 수, 회원 수

    var pageQuery = firebase.database().ref('blacklist').orderByKey();
    pageQuery.once('value').then(function (pageList){
      userNum = pageList.numChildren(); // 회원 수 체크
      maxPage = Math.ceil(userNum/10); // 페이지 수 (전체 회원 수 / 10) -> 소수점 올림

      // 10명 마다 index 저장 (key)
      var no = 0;
      pageList.forEach(function(page){
        if(!(no%10)) // 10배수인 경우
          index.push(page.key); // page 시작점 key 저장
        no++;
      })

      // 2-2. page 버튼 표시하기 (5개)
      var start = parseInt(curPage)-2;
      var end = parseInt(curPage)+2; // 현재 페이지 앞 뒤로 2

      if(curPage < 3 && maxPage > 5) end = 5;
      if(curPage < 3) start = 1;
      if(maxPage < 5) end = maxPage;
      if(curPage > 5 && curPage+3 > maxPage){
        start = maxPage-4;
        end = maxPage;
      }

      var pageHtml = '';
      var pageLink = './adminBlacklist.html?page='

      // 이전 페이지 (5페이지 이내 필요없음)
      if(maxPage > 5 && curPage > 3)
        pageHtml += '<li class="page-item">'
          + '<a class="page-link" href="'+ pageLink + (curPage-1) +'" tabindex="-1"><i class="fas fa-chevron-left"></i></a></li>';

      var i;
      for(i=start; i<=end; i++){
        pageHtml += '<li class="page-item"><a class="page-link" href="' + pageLink + i + '">'+ i;
        if(i == curPage) pageHtml += '<span class="sr-only">(current)</span>'; // 현재 페이지
        pageHtml += '</a></li>';
      }

      // 다음 페이지 (5페이지 이내 필요없음)
      if(maxPage > 5 && end != maxPage)
        pageHtml += '<li class="page-item">'
          + '<a class="page-link" href="' + pageLink + (end+1) + '"><i class="fas fa-chevron-right"></i></a></li>'

      document.querySelector('.pagination').innerHTML = pageHtml; // html 추가
    }).then(function(){
      // 3. 현재 page 첫 번째 key부터 10개 가져오기
      var queryBlack = firebase.database().ref('blacklist').orderByKey().startAt(index[curPage-1]);

      if(curPage < maxPage) // 마지막 page 아닌 경우 => 조회 끝 지점 정해주기
        queryBlack = queryBlack.endBefore(index[curPage]);

      queryBlack.once('value').then(function(blackList){
        var no = ((curPage-1)*10)+1;
        var htmlString = ''; // table 새로운 행 추가 문자열

        blackList.forEach(function(black){
          // userInfo 테이블에서 해당 회원 아이디, 이름 가져오기
          var queryUser = firebase.database().ref('userInfo').orderByKey().equalTo(black.key);
          queryUser.once('value').then(function(userList){
            userList.forEach(function(user){
              htmlString = '<tr>'
                + '<td>' + (no++) + '</td>'
                + '<td>' + user.val().id + '</td>'
                + '<td>' + user.val().name + '</td>'
                + '<td>' + black.val().warnDate + '</td>';

              // blacklist 정보 출력
              if(black.val().count < 3) // 경고 횟수 3회 미만인 경우 => 이용 정지 기간 없음, 횟수 초록색 표시
                htmlString += '<td>-</td><td><div class="badge badge-success">' + black.val().count + '/3</div></td>';
              else
                htmlString += '<td>' + black.val().endDate + '</td><td><div class="badge badge-danger">' + black.val().count + '/3</div></td>';

              // 관리 버튼 추가
              var clickFunction = 'location.href="./edit_blacklist.html?key='+black.key+'"';
              htmlString += '<td><button class="btn btn-sm" onclick='+clickFunction+'>관리</button></td></tr>'

              // Table에 추가
              document.querySelector('#blackList').innerHTML += htmlString;
            })
          })
        })
      })
    })
  }else{ // 아이디 입력된 경우
    // 1. userInfo에서 입력된 아이디의 key값 가져오기
    var idQuery = firebase.database().ref('userInfo').orderByChild('id').equalTo(searchId);
    idQuery.once('value').then(function(userList){
      if(userList.val() == null) { // 회원 존재 X
        htmlString = '<tr><td colspan=7><h6>검색 결과 없음</h6>회원이 아닙니다.</td></tr>';
        document.querySelector('#blackList').innerHTML += htmlString;
      }else{ // 회원 존재
        userList.forEach(function(user){
          // 2. 검색한 아이디가 블랙리스트에 존재하는지 확인
          var queryBlack = firebase.database().ref('blacklist').orderByKey().equalTo(user.key);
          queryBlack.once('value').then(function(blackList){
            if(blackList.val() == null){ // 블랙리스트 존재 X
              htmlString = '<tr><td colspan=7><h6>검색 결과 없음</h6>블랙리스트가 아닙니다.</td></tr>';
              document.querySelector('#blackList').innerHTML += htmlString;
            } else { // 블랙리스트 존재
              var no = 1;

              blackList.forEach(function(black){
                // Table 추가 html 문자열 준비
                var htmlString = '<tr>'
                  + '<td>' + (no++) + '</td>'
                  + '<td>' + user.val().id + '</td>'
                  + '<td>' + user.val().name + '</td>'
                  + '<td>' + black.val().warnDate + '</td>';

                 // blacklist 정보 출력
                if(black.val().count < 3) // 경고 횟수 3회 미만인 경우 => 이용 정지 기간 없음, 횟수 초록색 표시
                  htmlString += '<td>-</td><td><div class="badge badge-success">' + black.val().count + '/3</div></td>';
                else
                  htmlString += '<td>' + black.val().endDate + '</td><td><div class="badge badge-danger">' + black.val().count + '/3</div></td>';

                // 관리 버튼 추가
                var clickFunction = 'location.href="./edit_blacklist.html?key='+black.key+'"';
                htmlString += '<td><button class="btn btn-sm" onclick='+clickFunction+'>관리</button></td></tr>'

                // Table에 추가
                document.querySelector('#blackList').innerHTML += htmlString;
              })
            }
          })
        })
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
