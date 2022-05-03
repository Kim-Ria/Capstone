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
