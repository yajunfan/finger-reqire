define(["Fingerprint",'languageDetector',"audio","util","common"], function(Fingerprint2,languageDetector,audioFingerPrinting,util,Common) {
  var ip_address = "sec.uniquemachine.org/uniquemachine/";

  function populateFontList(fontArr) {
    fonts = [];
    for (var key in fontArr) {
      var fontName = fontArr[key];
      fontName = fontName.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
      fonts.push(fontName);
    }

    // sender.addFonts(fonts);
  }
  function getResolution() {
        var zoom_level = detectZoom.device();
        var fixed_width = window.screen.width * zoom_level;
        var fixed_height = window.screen.height * zoom_level;
        var res = Math.round(fixed_width) + '_' + Math.round(fixed_height) + '_' + zoom_level + '_' + window.screen.width+"_"+window.screen.height+"_"+window.screen.colorDepth+"_"+window.screen.availWidth + "_" + window.screen.availHeight + "_" + window.screen.left + '_' + window.screen.top + '_' + window.screen.availLeft + "_" + window.screen.availTop + "_" + window.innerWidth + "_" + window.outerWidth + "_" + detectZoom.zoom();
        return res;
  }
  var langsDetected,audio_hardware;
  setTimeout(function(){
    langsDetected = get_writing_scripts();
    audio_hardware = audioFingerPrinting();
  },300)

  var Sender = function() {
    this.finalized = false;
    this.postData = {
      fonts: "",
      gpu: "Undefined",
      timezone: "Undefined",
      plugins: "Undefined",
      gpuImgs: {},
      cpu_cores: "Undefined", 
      audio: "Undefined",
      audio_hardware:"Undefined",
      langsDetected: [],
      screenResolution:"",
      IP:""
    };

    sumRGB = function(img) {
      var sum = 0.0;
      for (var i = 0; i < img.length; i += 4) {
        sum += parseFloat(img[i + 0]);
        sum += parseFloat(img[i + 1]);
        sum += parseFloat(img[i + 2]);
      }
      return sum;
    };


    this.nextID = 0;
    this.getID = function() {
      if (this.finalized) {
        throw "Can no longer generate ID's";
        return -1;
      }
      return this.nextID++;
    };

    function hashRGB(array) {
      var hash = 0, i, chr, len, j;
      if (array.length === 0)
        return hash;
      for (i = 0, len = array.length; i < len; i += 4) {
        for (j = 0; j < 3; ++j) {
          chr = array[i] | 0;
          hash ^= (((hash << 5) - hash) + chr + 0x9e3779b9) | 0;
          hash |= 0; // Convert to 32bit integer
        }
      }
      return hash;
    };

    function sumRGB(array) {
      var sum = 0;
      for (var i = 0; i < array.length; i += 4) {
        sum += array[i + 0];
        sum += array[i + 1];
        sum += array[i + 2];
      }
      return sum;
    }

    this.addFonts = function(fonts) {
      this.postData['fontlist'] = fonts;
    };

    this.nextID = 0;
    this.getID = function() {
      if (this.finalized) {
        throw "Can no longer generate ID's";
        return -1;
      }
      return this.nextID++;
    };

    this.getIDs = function(numIDs) {
      var idList = [];
      for (var i = 0; i < numIDs; i++) {
        idList.push(this.getID());
      }
      return idList;
    };
  // video中需要
    this.postLangsDetected = function(data) {
      this.postData['langsDetected'] = data;
    };
  // video中需要
    this.getDataFromCanvas = function(ctx, id) {
      if (!this.finalized) {
        throw "Still generating ID's";
        return -1;
      }
      function hash(array) {
        var hash = 0, i, chr, len;
        if (array.length === 0)
          return hash;
        for (i = 0, len = array.length; i < len; i++) {
          chr = array[i] | 0;
          hash ^= (((hash << 5) - hash) + chr + 0x9e3779b9) | 0;
          hash |= 0; // Convert to 32bit integer
        }
        return hash;
      }
      var w = 256, h = 256;
      // Send pixels to server
      var pixels = ctx.getImageData(0, 0, w, h).data;
      var hashV = hash(pixels);
      console.log("CTX: " + hashV);

      this.toServer(false, "None", "None", id, pixels);
      if (sumRGB(pixels) > 1.0) {
        return hashRGB(pixels);
      } else {
        return 0;
      }
    };

    this.getData = function(gl, id) {
      if (!this.finalized) {
        throw "Still generating ID's";
        return -1;
      }
      var WebGL = true;
      //数组类型表示一个8位无符号整型数组，创建时内容被初始化为0
      // // 创建初始化为0的，包含length个元素的无符号整型数组
      var pixels = new Uint8Array(256 * 256 * 4);
      //读取2d纹理贴图额像素
      gl.readPixels(0, 0, 256, 256, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      var ven, ren;
      var debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      // debugInfo === >  WebGLDebugRendererInfo{}
      if (debugInfo) {
        ven = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);    //debugInfo.UNMASKED_VENDOR_WEBGL=37445
        ren = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);  //debugInfo.UNMASKED_RENDERER_WEBGL=37445
      } else {
        console.log("debugInfo is not accessable");
        ven = 'No debug Info';
        ren = 'No debug Info';
      }
      //hashCode  是jdk根据对象的地址或者字符串或者数字算出来的int类型的数值 
      // var hash = pixels.hashCode();

      this.toServer(WebGL, ven, ren, id, pixels);
      if (sumRGB(pixels) > 1.0) {
        return hashRGB(pixels);
      } else {
        return 0;
      }
    };

    this.urls = [];
    this.finished = 0;

    this.toServer = function(WebGL, inc, gpu, id,dataurl) { // send messages to server and receive messages from server
      this.postData['gpuImgs'][id] = dataurl.hashCode();

      if (WebGL) {
        this.postData['gpu'] = gpu;
      }
    };
  
    this.sendData =function() {
        this.postData['timezone'] = new Date().getTimezoneOffset();
        if(!navigator.hardwareConcurrency)
          this.postData['cpu_cores'] = "-1";
        else
          this.postData['cpu_cores'] = navigator.hardwareConcurrency;
        this.postData['audio_hardware'] = audio_hardware;
        this.postData['langsDetected'] = langsDetected;
        startSend(this.postData);
        function startSend(postData){
          postData.browserType =util.myBrowser();
          fingerprintReport(postData);
          // getIpFn(postData);
          // $.ajax({
          //   url : "http://" + ip_address + "/features",
          //   dataType : "json",
          //   contentType: 'application/json',
          //   type : 'POST',
          //   data : JSON.stringify(postData),
          //   success : function(data) {
          //     data['finished'] = true;
          //     parent.postMessage(data,"http://uniquemachine.org");
          //   },
          //   error: function (xhr, ajaxOptions, thrownError) {
          //     alert(thrownError);
          //   }
          // });

        }


      }
  };

  var options = {
    excludes: {pixelRatio:false,fonts:true,canvas:true,indexedDb:true,openDatabase:true,audio:false,enumerateDevices:true,timezone: true,sessionStorage: true,localStorage:true,plugins: false,hardwareConcurrency: true,webgl: true,userAgent: false,webglVendorAndRenderer: true,cpuClass: false,deviceMemory:true,touchSupport:false,platform:false,language:false,fonts:false,screenResolution:false}
  };
  // 获取CPU等
  var fingerprintReport = function (data) {
    Fingerprint2.get(options,function(components) {
      console.log(333,components)
      for (var index in components) {
        if(components[index].key == "touchSupport"||components[index].key == "userAgent"||components[index].key == "cpuClass"||components[index].key == "platform"
        ||components[index].key == "audio"||components[index].key == "pixelRatio"||components[index].key == "language"||components[index].key == "fonts"||components[index].key == "plugins"||components[index].key == "screenResolution"){
          data[components[index].key]= components[index].value;
        };
      };
      getIpFn(data);
    });
  };
  // 获取主机IP
  function getIpFn(postData){
    var noop = function() {};
    //compatibility for firefox and chrome
    var RTCPeerConnection = window.RTCPeerConnection
        || window.mozRTCPeerConnection
        || window.webkitRTCPeerConnection;
    var useWebKit = !!window.webkitRTCPeerConnection;
    //bypass naive webrtc blocking
    if(RTCPeerConnection){
      var ipreg =/([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/g;	 
      var rtc = new RTCPeerConnection({iceServers:[]});
      //listen for candidate events
      rtc.onicecandidate = function(ice){
          //skip non-candidate events
          if (!ice || !ice.candidate || !ice.candidate.candidate || !ice.candidate.candidate.match(ipreg)) return;
            ice.candidate.candidate.match(ipreg).forEach(ipIterate);
      };
      //create a bogus data channel
      rtc.createDataChannel("");
      //create an offer sdp
      rtc.createOffer().then(function (offerDesc) {
          grepSDP(offerDesc);
          rtc.setLocalDescription(offerDesc,function(){},function(){});
      }).then(noop);
      function grepSDP(sdp) {
            enterflag = true;
            var hosts = [];
            sdp.sdp.split('\n').forEach(function (line, index, arr) { 
              if (~line.indexOf("a=candidate")) {  
                  line.match(ipreg).forEach(ipIterate);
                } else if (~line.indexOf("c=")) { 
                  line.match(ipreg).forEach(ipIterate);
                };
            }); 
            rtc.setLocalDescription(sdp, noop, noop);
      };
      function ipIterate(ip) {
        postData.IP = ip;
        if(ip !== "0.0.0.0"){
          renderHtml(postData);
        };
      };
      
      setTimeout(function(){
        if(!enterflag){
          renderHtml(postData);
        };
      },1000)
    }else{
      postData.IP ="";
      renderHtml(postData);
    };
  };

  //请求指纹id
  function renderHtml(postData){
    var datacopy = JSON.parse(JSON.stringify(postData));
    var url = Common.Constants.DATA_INTERFACE_URL
      + Common.Constants.FINGER_INFO;
    var json =  util.Secret_Key("2fffa207bef3a7dcca8d8e6fa1c08c07").c(datacopy);
    var params = {
      "original_json":json
    };
    $("#test_canvases canvas").css("display","none");;
    // Common.loadDataByAjax(url, params, function(result){
    //   console.log(result)
    //   if(result.code == 0){
    //     // $('.login_submit').val("验证");
    //     // $(".loader").css("display","none");
    //     if(JSON.stringify(result.message) != "{}"){
    //         var data  = JSON.parse(result.message);
    //         Common.fingerprint = data.fingerprint;
    //         $("#finger_id").val(Common.fingerprint);
    //         $(".finger_li").removeClass("hide");
    //       //   var obj={
    //       //     name:$("#username").val(),
    //       //     pwd:btoa($("#pwd").val()),
    //       //     yzm:$("#yzm").val(),
    //       //     negative_number:Common.negative_number,
    //       //     fingerprint:Common.fingerprint
    //       // };
    //       // window.location.href = Common.Constants.SYSTEM_MAIN_PAGE;
    //     }
    //   };
    // },"post");
      

        // $('.login_submit').val("验证");
        // $(".loader").css("display","none");
  
    
  }
  /* Converts the charachters that aren't UrlSafe to ones that are and
    removes the padding so the base64 string can be sent
    */


  Uint8Array.prototype.hashCode = function() {
    var hash = 0, i, chr, len;
    if (this.length === 0)
      return hash;
    for (i = 0, len = this.length; i < len; i++) {
      chr = this[i];
      hash = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }
  return Sender;
  
});



