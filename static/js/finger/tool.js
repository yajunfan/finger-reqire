define([
    "require", "exports","crypto-js"
], function(require, exports,CryptoJS) {
   var tool={
        Secret_Key:function(str){
            console.log(str)
          var o={
              str :str,
              ary:[],
              aol:[],
              reg:/[z]/g,
              rgo:/[y]/g,
              so:"",
              c:function(obj){
                  console.log("0-------传入得原始参数------",obj);
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
                  console.log("1-------反转了str，并且数字+5，字母转大写------",this.str);
                  this.ary = this.str.split("");
                  //奇书偶数的互换位置
                  console.log("数组");
                  console.log(this.ary);
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
                  console.log("3-------所有得z换成m!@------",this.str);
                  this.str = btoa(encodeURIComponent(this.str));//再次base64
                  console.log("4-------base64转换------",this.str);
        
                console.log(CryptoJS)
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
                  console.log("5-------AES加密------",this.str);
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
                  console.log("7-------前后互换位置------", this_.str);
        
                 // this_.str = btoa(encodeURIComponent(this.aol.reverse().join("")));
        
                  this_.str = btoa(this_.str);
                  console.log("7-------base64------",this_.str );
                  console.log("7-------base64------",this_.str );
                  console.log("9999-------base64------",atob(this_.str) );
        
        
        
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
                  console.log("8-------再次aes加密------",this.str);
                  this.str=this.str.substring(0,32);
                  if(typeof obj == "string"){
                    return this_.enFn(obj,this_.str);
                  }else{
                    return this_.enFn(JSON.stringify(obj),this_.str);
                  };
                  
              },
              enFn:function(params,k){
                console.log("9-------进入加密参数函数中，传入得key值------",k);
                console.log("9-------参数的值------",params);
                  var this_ = this;
                  var key = CryptoJS.enc.Utf8.parse(k);
                  console.log("10-------key值得parse------",key);
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
                  console.log("11-------加密之后得参数------",encryptedData);
                  console.log("11-------加密之后得参数------", encryptedData.toString(CryptoJS.enc.Utf8).toString());
                 //encryptedData = encryptedData.ciphertext.toString();
                  encryptedData = encryptedData.toString();
                  console.log("12-------加密之后得参数------",encryptedData);
                  return   encryptedData;
              },
          };
          return o;
        }
   }
    return  tool;
    
});