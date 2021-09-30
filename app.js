!(async function () {
  console.log('rJOIEcMfsrGjZkwvw9oEQ');
  async function doTask(){
    if(!/manager\/views\/inner.html/.test(window.location.href)){
      console.log('0-0000000000000000000000000000');
      return;
    }

    const   NoonSleep2 =  2 * 3600;
    const   NoonSleep1 =  1 * 3600;
    const   keySleep = 'rJOIEc';
    var stime  =  localStorage.getItem(keySleep);
    stime = parseInt('' + stime)
    var resestTime =  NoonSleep2
    if (stime == NoonSleep1 ||  NoonSleep2 ==  stime) {
      resestTime = stime;
    }
  
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

    async function getCheckInData(){
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
            try {
              var jsonStr = httpRequest.responseText; //获取到服务端返回的数据
              var json = JSON.parse(jsonStr);
              r(json);
            } catch (error) {
              console.log(error);
              r(null);
            }
          }
        };
      });
    }

    async function getTipStr(json) {
      let ymd = new Date(Date.now() + 8 * 3600000).toISOString().substr(0,10);
      let today = "" + parseInt(ymd.substr(8, 2));

      try {
        var sum = 0;
        for (var i = 1; i < 32; i++) {
          const element = json.data["" + i];

          if (!element) {
            break;
          }

          if (element.startTime && element.endTime) {
            var s = getTimeValue(element.startTime);
            var e = getTimeValue(element.endTime );
            if (e && s) {
            
              var worktitme = e - s - resestTime;
              worktitme = worktitme > 0 ? worktitme : 0;
              sum += worktitme - 8 * 3600;
              console.log("t", (worktitme / 3600).toFixed(0), i);
            }
          }
          
        }

        let timeNotEnough = 0;
        if (sum < 0) {
          sum = -sum;
          timeNotEnough = 1;
        }

        var showStr = `累计: ${timeNotEnough ? "-" : "+"} ${timeValueToStr(
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

          showStr += ` 今天:${timeValueToStr(v2)}`;
        } catch (error) {}

        return showStr;
      } catch (error) {
      }
      return "error";
    }

    function updateTip(str) {
      /// 当前不在考勤页面,3s 后重试
      if(!/manager\/views\/inner.html#\/attenmanager\/listuseratten/.test(window.location.href)){
        setTimeout(() => {
          updateTip(str);
        }, 3000);
        return;
      }

      var d = document.evaluate(
        '//button[contains(@class,"fc-next-button")]/..',
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE
      );
      if (d && d.singleNodeValue) {
        var div = d.singleNodeValue;

        var node = document.getElementById("re0091");
        var nodeBtn = document.getElementById("re0092");
        if (!node) {
          node = document.createElement("div");
          node.setAttribute("id", "re0091");
          div.appendChild(node);

          nodeBtn = document.createElement("div");
          nodeBtn.setAttribute("id", "re0092");
          nodeBtn.onclick = async ()=>{
            resestTime = resestTime == NoonSleep2 ? NoonSleep1 :  NoonSleep2;
            localStorage.setItem(keySleep,'' + resestTime);
            let strNewTip = await getTipStr(g_data);
            updateTip(strNewTip);
          };
          div.appendChild(nodeBtn);
        }
        node.innerText = str;
        nodeBtn.innerText = `午休${resestTime / 3600}h,点击切换`;
      } else {
        setTimeout(() => {
          updateTip(str);
        }, 1000);
      }
    }
    let g_data = await getCheckInData();
    var str = await getTipStr(g_data);
    updateTip(str);
  }


  var pushState = history.pushState;
  history.pushState = function(data,unused,url){
    pushState(data,unused,url).bind(history);
    setTimeout(() => {
      doTask()
    }, 10);
  }  
  doTask();
})();
