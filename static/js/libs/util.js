// Load a text resource from a file over the network
define([
    "crypto-js"
], function(CryptoJS) {
    
var  getCanvas = function(canvasName) {
    var canvas = $('#' + canvasName);
    if(!canvas[0]){
        $('#test_canvas').append("<canvas id='" + canvasName + "' width='256' height='256'></canvas>");
    }
    return canvas = $('#' + canvasName)[0];
}

var getGLAA = function(canvas) {
  var gl = null;
  for (var i = 0; i < 4; ++i) {
    gl = canvas.getContext(
        [ "webgl", "experimental-webgl", "moz-webgl", "webkit-3d" ][i], {
          antialias : true,
          preserveDrawingBuffer : true,
          willReadFrequently : false,
          depth: true
        });
    if (gl)
      break;
  }

  if (!gl) {
    alert('Your browser does not support WebGL');
  }
  return gl;
}

var getGL = function(canvas) {
  var gl = null;
  for (var i = 0; i < 4; ++i) {
    //getContext方法返回一个用于在画布上绘图的环境
    gl = canvas.getContext(
        [ "webgl", "experimental-webgl", "moz-webgl", "webkit-3d" ][i], {
          antialias : false,
          preserveDrawingBuffer : true,
          willReadFrequently : false,
          depth: true
        });
    if (gl)
      break;
  }

  if (!gl) {
    //WebGL  3d绘图协议
    alert('Your browser does not support WebGL');
  }
  return gl;
}

var computeKernelWeight = function(kernel) {
  var weight = kernel.reduce(function(prev, curr) { return prev + curr; });
  return weight <= 0 ? 1 : weight;
}

var loadTextResource = function(url, callback, caller) {
  var request = new XMLHttpRequest();
  request.open('GET', url + '?please-dont-cache=' + Math.random(), true);
  request.onload = function() {
    if (request.status < 200 || request.status > 299) {
      callback('Error: HTTP Status ' + request.status + ' on resource ' + url);
    } else {
      callback(null, request.responseText, caller);
    }
  };
  request.send();
};

var loadImage = function(url, callback, caller) {
  var image = new Image();
  image.onload = function() { callback(null, image, caller); };
  image.src = url;
};
function Secret_Key(str){
    var o={
        str :str,
        ary:[],
        aol:[],
        reg:/[z]/g,
        rgo:/[y]/g,
        so:"",
        c:function(obj){
            console.log("0-------传入得原始参数------",obj)
            var this_=this,s="",sl=this.str.length;
            this.str =this.str.split("").reverse().join("") ;//先反转
            var posl =[Math.floor(sl / 5),Math.floor(sl / 3),Math.floor(sl / 6),Math.floor(sl / 2.4)] ;
            for(var i=0;i<posl.length;i++){
                var sPos = posl[i];
                var upstr="";
                if(isNaN(Number(this.str[sPos]))){
                    upstr = this.str[sPos].toUpperCase();
                }else{
                    upstr = Number(this.str[sPos])+5+""; 
                };
                var a2 = this.str.split("");
                a2[sPos] = upstr;
                this.str = a2.join("");
            };
            console.log("1-------反转了str，并且数字+5，字母转大写------",this.str)
            this.ary = this.str.split("");
            //奇书偶数的互换位置
            console.log("数组" ,this.ary)
            this.ary.forEach(function(item,index){
                    if(index%2!=0&&index+1 < this_.ary.length-1){
                        var centernum = this_.ary[index+1];
                        this_.ary[index+1]= this_.ary[index];
                        this_.ary[index] = centernum;
                    };
  
            });
           
            this.str = this.ary.join("");
            console.log("2-------奇偶位置互换------",this.str)
            console.log("2-------encodeURIComponent------",encodeURIComponent(this.str))
            this.str = btoa(encodeURIComponent(this.str)); //base64
            console.log("3-------base64------",this.str)
            this.str = this.str.replace(this.reg,function(){  //将z替换
                return "m!@"
            });
            console.log("3-------所有得z换成m!@------",this.str)
            this.str = btoa(encodeURIComponent(this.str));//再次base64
            console.log("4-------base64转换------",this.str)
  
  
            var k = CryptoJS.enc.Utf8.parse("1234567812345678");
            var iv  = CryptoJS.enc.Utf8.parse("0123456789ABCDEF");
            var encryptedData = CryptoJS.AES.encrypt(this.str, k, {
                mode: CryptoJS.mode.ECB,
                padding: CryptoJS.pad.Pkcs7
                //mode: CryptoJS.mode.CFB,
                // mode: CryptoJS.mode.CBC,
                // iv:iv,
                // padding: CryptoJS.pad.Pkcs7
            });
            this.str = ""+encryptedData;
            console.log("5-------AES加密------",this.str)
            this.aol = this.str.replace(this.rgo,"$o$").split("");
            console.log("6-------将所有得y换成$o$------",this.str.replace(this.rgo,"$o$"))
            var len = this.aol.length,
            middlenum=parseInt(len/2);
            // 前后的互换位置
            this.aol.forEach(function(item,index){
                if(len>6&&index<len-6&&index<middlenum){
                    var changeindex = len-index-6;
                    var middle = this_.aol[changeindex];
                    this_.aol[changeindex] = this_.aol[index];
                    this_.aol[index] = middle;
                }
            });
            this_.str=this.aol.reverse().join("")
            console.log("7-------前后互换位置------", this_.str)
  
           // this_.str = btoa(encodeURIComponent(this.aol.reverse().join("")));
  
            this_.str = btoa(this_.str);
            console.log("7-------base64------",this_.str )
            console.log("7-------base64------",this_.str )
            console.log("9999-------base64------",atob(this_.str) )
  
  
  
            var k2 = CryptoJS.enc.Utf8.parse("8765432187654321");
            var encryptedData2 = CryptoJS.AES.encrypt(this.str, k2, {
                mode: CryptoJS.mode.ECB,
                padding: CryptoJS.pad.Pkcs7
                // mode: CryptoJS.mode.CFB,
                // mode: CryptoJS.mode.CBC,
                // iv:iv,
                // padding: CryptoJS.pad.Pkcs7
            });
            this_.str = ""+encryptedData2;
            console.log("8-------再次aes加密------",this.str)
            this.str=this.str.substring(0,32);
            if(typeof obj == "string"){
              return this_.enFn(obj,this_.str);
            }else{
              return this_.enFn(JSON.stringify(obj),this_.str);
            }
            
        },
        enFn:function(params,k){
          console.log("9-------进入加密参数函数中，传入得key值------",k)
          console.log("9-------参数的值------",params)
            var this_ = this;
            var key = CryptoJS.enc.Utf8.parse(k);
            console.log("10-------key值得parse------",key)
            var iv  = CryptoJS.enc.Utf8.parse("0123456789ABCDEF");
            var encryptedData = CryptoJS.AES.encrypt(params, key, {
                // mode: CryptoJS.mode.CFB,
                mode: CryptoJS.mode.ECB,
                padding: CryptoJS.pad.Pkcs7
                // iv:iv,
                // mode: CryptoJS.mode.CBC,
               // iv:iv,
                // padding: CryptoJS.pad.Pkcs7
            });
            console.log("11-------加密之后得参数------",encryptedData)
            console.log("11-------加密之后得参数------", encryptedData.toString(CryptoJS.enc.Utf8).toString())
          //   var str = ""+encryptedData;
           //encryptedData = encryptedData.ciphertext.toString();
            encryptedData = encryptedData.toString();
            console.log("12-------加密之后得参数------",encryptedData)
          // var encryptedHexStr = CryptoJS.enc.Hex.parse(encryptedData);
          // var encryptedBase64Str = CryptoJS.enc.Base64.stringify(encryptedHexStr);
          // var decryptedData = CryptoJS.AES.decrypt(encryptedBase64Str, key, {
          // mode: CryptoJS.mode.CBC,
          // iv:iv,
          // // padding: CryptoJS.pad.Pkcs7
          // });
          // var decryptedStr = decryptedData.toString(CryptoJS.enc.Utf8);
          // console.log("解密后:"+decryptedStr);
            return   encryptedData
        },
    };
    return o;
}
function Base64EncodeUrlSafe(str) {
  return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=+$/, '');
};

function stringify(array) {
  var str = "";
  for (var i = 0, len = array.length; i < len; i += 4) {
      str += String.fromCharCode(array[i + 0]);
      str += String.fromCharCode(array[i + 1]);
      str += String.fromCharCode(array[i + 2]);
  }

  // NB: AJAX requires that base64 strings are in their URL safe
  // form and don't have any padding
  var b64 = window.btoa(str);
  return Base64EncodeUrlSafe(b64);
};
var loadJSONResource = function(url, callback, caller) {
  loadTextResource(url, function(err, result, caller) {
    if (err) {
      callback(err);
    } else {
      try {
        callback(null, JSON.parse(result), caller);
      } catch (e) {
        callback(e);
      }
    }
  }, caller);
};
function myBrowser() {
  var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
  var isOpera = userAgent.indexOf("Opera") > -1; //判断是否Opera浏览器
  var isIE = userAgent.indexOf("compatible") > -1
          && userAgent.indexOf("MSIE") > -1&& !isOpera; //判断是否IE浏览器
  var isEdge = userAgent.indexOf("Edge") > -1; //判断是否IE的Edge浏览器
  var isIEnewest = userAgent.indexOf("Trident") > -1; //判断是否IE的Edge浏览器
  var isFF = userAgent.indexOf("Firefox") > -1; //判断是否Firefox浏览器
  var isSafari = userAgent.indexOf("Safari") > -1
          && userAgent.indexOf("Chrome") == -1; //判断是否Safari浏览器
  var isChrome = userAgent.indexOf("Chrome") > -1
          && userAgent.indexOf("Safari") > -1; //判断Chrome浏览器
  if (isIE) {
      var reIE = new RegExp("MSIE (\\d+\\.\\d+);");
      reIE.test(userAgent);
      var fIEVersion = parseFloat(RegExp["$1"]);
      if (fIEVersion == 7) {
          return "IE7";
      } else if (fIEVersion == 8) {
          return "IE8";
      } else if (fIEVersion == 9) {
          return "IE9";
      } else if (fIEVersion == 10) {
          return "IE10";
      } else if (fIEVersion == 11) {
          return "IE11";
      } else {
          return "0";
      }//IE版本过低
      return "IE";
  }
  if (isOpera) {
      return "Opera";
  }
  if (isEdge) {
      return "Edge";
  }
  if (isFF) {
      return "Firefox";
  }
  if (isSafari) {
      return "Safari";
  }
  if (isChrome) {
      return "Chrome";
  }
  if(isIEnewest){
    return "IE";
  }
}
var util={
    getCanvas:getCanvas,
    getGLAA:getGLAA,
    getGL:getGL,
    computeKernelWeight:computeKernelWeight,
    loadTextResource:loadTextResource,
    loadImage:loadImage,
    Secret_Key:Secret_Key,
    Base64EncodeUrlSafe:Base64EncodeUrlSafe,
    stringify:stringify,
    loadJSONResource:loadJSONResource,
    myBrowser:myBrowser
}  ; 

return util;
});
