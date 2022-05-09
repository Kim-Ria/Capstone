/** index.html */
/** 로그인 */
function login(){
  var id = document.getElementById('userId').value;
  var pw = document.getElementById('password').value;

  if(id==""){
    swal("", "아이디가 입력되지 않았습니다", "warning");
  }
  else if(pw==""){
    swal("", "비밀번호가 입력되지 않았습니다", "warning");
  }
  else{
    location.href = './main.html';
  }
}


/** reserv_seat.html */
/** 예약 확인 alert */
function finishReserv(no){
  swal({
    title: no+"번 좌석",
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
function chooseTime(no){
  console.log(no);
}

/** reserv_detail.html */
/** 예약 상세 조회 페이지 alert */
// 예약 취소 alert
function cancelRev(){
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
function checkOut(){
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
function extendRev(){
  swal("예약 연장", "이용 시간이 2시간 연장되었습니다.", "success");
}



/** mypage.html */
/** 마이페이지 통계 */
// 일주일 통계
function statWeek(){
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
function statMonth(){
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
function statYear(){
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
/** 블랙리스트 추가 alert */
function addBlacklistAdmin(){
  swal({
    title: "블랙리스트",
    text: "등록하시겠습니까?",
    icon: "warning",
    buttons: true,
    dangerMode: true,
  })
  .then((cancel) => {
    if (cancel) {
      swal("블랙리스트에 등록되었습니다.", {
        icon: "success",
      }).then(() => { location.href = './adminMember.html'; })
    }
  });
}

/** adminSeat.html */
/** 좌석 관리 */
function editSeat(no){
  swal("좌석관리", no+"번 좌석", "warning");
}
