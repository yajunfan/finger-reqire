// window.onload=function(){
   define([
    "common",'moment',"util"
   ], function(Common ,moment,util) {
    var w = $(window).width();
    h = $(window).height();
var x = 0;
var y = 0;
var loadTime = moment().format("x");
var timeInfo={  //解决点击过快太多请求的问题，
    trueclickNum:0,
    activeclicknum:0,
    countdown:60,
    clickfonttime:null,
    clicknexttime:null,
    isScroll:false,
    keyCodeStay:[],
    keyStayTimeLists:[],
    mousePos:""
},
    staySecond=0,mousPosAry=[]
    //记录用户行为浏览记录和停留时间
    dataArr={},
    showObj={};
var stayInfo = localStorage.getItem("stayInfo") ? localStorage.getItem("stayInfo") : '[{}]';
var keyNum=0,keycodest=null,keycodeet=null;
$.cookie('tjRefer', getReferrer() ,{expires:1,path:'/'});
    //停留时间
window.setInterval(function () {
    staySecond ++;
}, 100);
// 点击的时候，如果时间间隔太小的不计入activeclicknum，在一分钟内点击
document.body.onmousedown=function(e){
    var e = e||window.event;
    //用户停留时间和header信息
    if($.cookie('tjRefer') == ''){
        var tjT = eval('(' + localStorage.getItem("stayInfo") + ')');
        if(tjT){
            tjT[tjT.length-1].time += staySecond;
            var jsArr= JSON.stringify(tjT);
            localStorage.setItem("stayInfo", jsArr);
        }
    } else {
        stayInfo = localStorage.getItem("stayInfo") ? localStorage.getItem("stayInfo") : '[{}]';
        dataArr = {
            'url' : location.href,
            'staytime' : moment().format("x")-loadTime,
            'refer' : getReferrer(),
            'timeIn' : loadTime,
            'timeOut' : moment().format("x")
        };
        stayInfo = eval('(' + stayInfo + ')');
        stayInfo=[dataArr];
    };
    //点击目标元素
    if($(e.target).hasClass("targetDom")){
        
        timeInfo.trueclickNum++;
        var diffnum = 0;
        if(timeInfo.clickfonttime){
            if(timeInfo.clicknexttime){
                timeInfo.clickfonttime =  timeInfo.clicknexttime; 
            };
            timeInfo.clicknexttime = new Date();
            diffnum =timeInfo.clicknexttime.getTime()-timeInfo.clickfonttime.getTime();
            if(diffnum<2000){
                console.log("手速太快啦~~~~");
            }else{
                timeInfo.activeclicknum++;
            };
        }else{
            timeInfo.clickfonttime =new Date(); 
            timeInfo.clicknexttime =new Date(); 
            timeInfo.activeclicknum++;   
        };
        
        var targetPos=mouse_pos(e);
        mousPosAry.push(targetPos);
        mousPosAry.shift();
        // timeInfo.mousePos+=" "+targetPos.posx+","+targetPos.posy;
        var posAry = timeInfo.mousePos+" "+targetPos.posx+","+targetPos.posy;
        var timeInfos =JSON.parse(JSON.stringify(timeInfo));
        timeInfos.clickfonttime = moment(timeInfos.clickfonttime).format("x");
        timeInfos.clicknexttime = moment(timeInfos.clicknexttime).format("x");
        showObj= {stayInfo:stayInfo,timeInfos:timeInfos};
        var url = Common.Constants.DATA_INTERFACE_URL
            + Common.Constants.MOUSE_TRACE;
        var json =  util.Secret_Key("2fffa207bef3a7dcca8d8e6fa1c08c07").c(posAry);
        var params = {
            "mouse_trajectory":json
        };
        var clickflag=false;
        if($("#username").val()){
            if($("#pwd").val()){
                clickflag = true;
                $(".loader").css("display","inline-block");
                $("#fingerprint-button").val("进入指纹获取中...");
                $("#test_canvases .content").remove();
                
            }else{
                alert("请输入密码!");
            };
        }else{
            alert("请输入用户名!");
        };
        if(clickflag){
            // Common.loadDataByAjax(url, params, function(result){
            //     if(result.code == 0){
            //         if(JSON.stringify(result.message) != "{}"){
            //             var data  = JSON.parse(result.message);
            //             Common.negative_number = data.negative_number;
            //             $(".robot").removeClass("hide");
            //             var robotstr = Common.negative_number == 0?"机器操作":"人为操作";
            //             $("#robot").val(robotstr);
            //             $('.login_submit').val("验证");
            //             $(".loader").css("display","none");
            //         }
            //     }
            // },"post");
        };
    };
};
// 页面是否滚动过
document.body.onscroll=function(e){
    timeInfo.isScroll = true;
    var timeout;
    // 每次触发 scroll handler 时先清除定时器
    clearTimeout(timeout);
    // 指定 xx ms 后触发真正想进行的操作 handler
    timeout = setTimeout(function(e){
        console.log(e)
    }, 500);
};
//每过0.1秒，就生成一个随机数，鼠标移动得事件就取该定时器
var nextPosObj=null,fontObj=null;
$(document).on("mousemove",function(e){
    var event = e||window.event;
    var posObj= mouse_pos(event);
    if(!fontObj){
        fontObj =mouse_pos(event);
        nextPosObj=mouse_pos(event);
    }else{
        fontObj = JSON.parse(JSON.stringify(nextPosObj));
        nextPosObj=mouse_pos(event);
    };
    clearTimeout(timer1);
    timer1 = null;
    var  timer1;
    timer1 = setTimeout(function () {
        GetXY();
    },Math.random()*30+30);
    function GetXY(ss) {
        posObj.t = moment().format("x")-loadTime;
        timeInfo.mousePos="";
        if(mousPosAry.length<100){
            mousPosAry.push(posObj);
        }else{
            mousPosAry.push(posObj); 
            mousPosAry.shift(); 
        };
        mousPosAry.forEach(function(item){
            timeInfo.mousePos+=item.posx+","+item.posy+","+item.t+";"
        });
    };
});
$(document).on("keydown",function(e){
    if(keycodest){
        if(keycodeet){
            keycodest =  keycodeet; 
        };
        keycodeet = new Date();
    }else{
        keycodest =new Date();
        keycodeet = new Date();
    };
    var obj={
        keycode:e.keyCode,
        starttime:moment(keycodest).format("x"),
        endtime:moment(keycodeet).format("x"),
    };
    timeInfo.keyCodeStay[keyNum] = obj;
    keyNum++;
    showObj.timeInfos = JSON.parse(JSON.stringify(timeInfo));
    // $(".stay").JSONView(showObj);
});
// }

function mouse_pos(e) { 
  if (!e) var e = window.event; 
  if (e.pageX || e.pageY)     { 
     posx = e.pageX; 
     posy = e.pageY; 
  } 
  else if (e.clientX || e.clientY)    { 
     posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft; 
     posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop; 
  } 
return {posx:posx,posy:posy};
};

// onbeforeunloadgf

//获取HTTP首部
function getReferrer() {
var referrer = '';
try {
    referrer = window.top.document.referrer;
} catch(e) {
    if(window.parent) {
        try {
            referrer = window.parent.document.referrer;
        } catch(e2) {
            referrer = '';
        }
    }
}
if(referrer === '') {
    referrer = document.referrer;
};
return referrer;
}
       
   }); 
   

