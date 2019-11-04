
define(function(){
    var isDebug = window.location.href.indexOf('http') < 0;

    var Common = {};
    Common.Constants = {
        COLORLISTS:["#c12e34","#ae8c0a","#0098d9","#2b821d","#005eaa","#339ca8","#796e46","#32a487","#68080d","#27727b","#7f8514d6","#bf4e68","#105039"],
    DATA_INTERFACE_URL: isDebug ? "../request/" : "http://10.11.11.11:92",
    SYSTEM_MAIN_PAGE: "/templates/html/main.html",
        FINGER_INFO:"/auth/devicefingerprint/devicefingerprint!addfingerprint",
        MOUSE_TRACE:"/auth/humanidentification/humanidentification!judgeisperson"
        
    };
     // 统一AJAX调用方法
    Common.loadDataByAjax = function(url, params, sfuction, type, toJson, async) {
        if (!type){
            type = "post"
        };
        if (toJson && toJson != '') {
            if (toJson == 'toData') {
                params = {data: $.toJSON(params)};
            } else if(toJson == 'file'){
                params = {file: $.toJSON(params)};
            }else{
                params = {dt_json: $.toJSON(params)};
            }

        }else{
            if(type == "postlabel"){
                params = {dt_json: $.toJSON(params)};
                type="post";
            };
            // if(type == "getpost"){
            //     type = "post";
            // }
            
        };
        if (!async) {
            async = true;
        };
        $.ajax({
            url: url,
            type: type,
            dataType: isDebug ? "json" : "jsonp",
            jsonp: "callback",
            data: params,
            async: async,
            timeout : 120000, 
            // processData:false,
            success: function (data) {
                if (data && data.status && data.status != 'success') {
                    swal('', data.status, 'warning');
                } else {
                    sfuction && sfuction(data);
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                console.log(errorThrown);
                
                $(".loading_dom").addClass("hideflag");
                //alert(XMLHttpRequest.status);
                //alert(XMLHttpRequest.readyState);
                //alert(errorThrown);
                //alert(textstatus);
            }
        });
    };
    return Common;
})
