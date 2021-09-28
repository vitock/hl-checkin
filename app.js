!(async function () {
  if(!/manager\/views\/inner.html#\/attenmanager\/listuseratten/.test(window.location.href)){
    console.log('0-0000000000000000000000000000,非考勤 skip');
  }

  const resestTime = 2 * 3600;
  function getTimeValue(t) {
    if (t) {
      var timeComponets = t.split(":");
      if (timeComponets.length == 3) {
        return (
          parseInt(timeComponets[0]) * 3600 +
          parseInt(timeComponets[1]) * 60 +
          parseInt(timeComponets[2])
        );
      }
    }
  }

  function timeValueToStr(sum) {
    let h = Math.floor(sum / 3600);
    let m = Math.floor((sum - h * 3600) / 60);
    let s = sum % 60;

    return `${h}:${m}:${s}`;
  }

  async function getTipStr() {
    var host = location.host;
    return new Promise((r) => {
      var httpRequest = new XMLHttpRequest();
      httpRequest.open(
        "POST",
        `https://${host}/manager/attendance/querylistByUser`,
        true
      );
      httpRequest.setRequestHeader(
        "Content-type",
        "application/x-www-form-urlencoded"
      );
      let ymd = new Date(Date.now() + 8 * 3600000).toISOString().substr(0,10);
      let date = ymd.substr(0, 7);
      let today = "" + parseInt(ymd.substr(8, 2));

      date = date.replace("-0", "-");
      httpRequest.send("recordDateStr=" + date + "&userName=");
      httpRequest.onreadystatechange = function () {
        //请求后的回调接口，可将请求成功后要执行的程序写在其中
        if (httpRequest.readyState == 4 && httpRequest.status == 200) {
          //验证请求是否发送成功
          var jsonStr = httpRequest.responseText; //获取到服务端返回的数据
          var json = JSON.parse(jsonStr);

          try {
            var sum = 0;
            for (var i = 1; i < 32; i++) {
              const element = json.data["" + i];

              if (!element) {
                break;
              }

              var s = getTimeValue(element.startTime);
              var e = getTimeValue(element.endTime || element.startTime);

              if (e && s) {
                var worktitme = e - s - resestTime;
                worktitme = worktitme > 0 ? worktitme : 0;
                sum += worktitme - 8 * 3600;
                console.log("t", (worktitme / 3600).toFixed(0), i);
              }
            }

            let timeNotEnough = 0;
            if (sum < 0) {
              sum = -sum;
              timeNotEnough = 1;
            }

            var showStr = `累计:${timeNotEnough ? "-1" : ""} ${timeValueToStr(
              sum
            )} ,`;

            try {
              let todayData = json.data[today];
              let todayStart = todayData.startTime;
              let v1 = getTimeValue(todayStart);
              console.log('today,',todayStart,resestTime);
              /// + 60 按分钟
              let v2 = v1 + 8 * 3600 + resestTime + 60;
              if (v2 < getTimeValue("18:00:00")) {
                v2 = getTimeValue("18:00:00");
              }

              showStr += ` 今天:${timeValueToStr(v2)} (午休${
                resestTime / 3600
              }h)`;
            } catch (error) {}

            r(showStr);
          } catch (error) {
            r("");
          }
        }
      };
    });
  }

  function updateTip(str) {
    var d = document.evaluate(
      '//button[contains(@class,"fc-next-button")]/..',
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE
    );
    if (d && d.singleNodeValue) {
      var div = d.singleNodeValue;

      var node = document.getElementById("re0091");
      if (!node) {
        var node = document.createElement("div");
        node.setAttribute("id", "re0091");
        node.setAttribute(
          "style",
          "color:red;font-size:20px;margin-left:10px;"
        );
        div.appendChild(node);
      }

      node.innerText = str;
    } else {
      setTimeout(() => {
        updateTip(str);
      }, 1000);
    }
  }

  var str = await getTipStr();
  updateTip(str);
})();
