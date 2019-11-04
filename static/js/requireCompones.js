
require.config({
    baseUrl: "../../static/js/",
    paths:{
        "jquery":"libs/jquery-2.1.1",
        "common":"common",
        "Particleground":"finger/Particleground",
        "crypto-js":"finger/crypto-js",
        "tool":"finger/tool",
        "util":"util.min",
        "canvas":"finger/canvas/canvas",
        "jquery_cookie":"libs/jquery.cookie",
        "moment":"libs/moment.min",
        "Fingerprint":"finger/js/fingerprint",
        "utils":"finger/mousetrace/utils",

        "seedrandom":"finger/seedrandom.min",
        "framework":"finger/depthtexture/framework",
        "meshes":"finger/depthtexture/meshes",
        "webgl-nuke-vendor-prefix":"finger/depthtexture/webgl-nuke-vendor-prefix",
        "webgl-texture-float-extension-shims":"finger/depthtexture/webgl-texture-float-extension-shims",
        
        "three":"finger/three/three",
        "Detector":"finger/three/js/Detector",
        "FresnelShader":"finger/three/js/shaders/FresnelShader",
        "DDSLoader":"finger/three/js/loaders/DDSLoader",
        "PVRLoader":"finger/three/js/loaders/PVRLoader",
        "advert":"finger/js/advert",
        "gl-matrix":"finger/js/gl-matrix",
        "toServer":"finger/js/toServer",
        "loader":"finger/js/loader",
        "CubeTest":"finger/cube/notexture",
        "CameraTest":"finger/camera/camera",
        "LineTest":"finger/line/app",
        "TextureTest":"finger/texture/app",
        "SimpleLightTest":"finger/simpleLight/app",
        "MoreLightTest":"finger/moreLight/app",
        "TwoTexturesMoreLightTest":"finger/twoTexturesMoreLight/app",
        "TransparentTest":"finger/transparent/app",
        "LightingTest":"finger/three/lighting",
        "ClippingTest":"finger/three/clipping",
        "BubbleTest":"finger/three/bubbles",
        "CompressedTextureTest":"finger/three/compressedTexture",
        "ShadowTest":"finger/depthtexture/vsm-filtered-shadow",
        "languageDetector":"finger/js/languageDetector",

        "audio":"finger/js/audio",
        "video":"finger/video/video",
        "lighting":"finger/three/lighting",
        "clipping":"finger/three/clipping",
        "bubbles":"finger/three/bubbles",
        "compressedTexture":"finger/three/compressedTexture",
        "vsm-filtered-shadow":"finger/depthtexture/vsm-filtered-shadow",
        "process":"finger/js/index"

    },
    // shim:{
    //     "crypto-js":{ exports: 'CryptoJS' },
    // }

})
require(["jquery","Particleground","utils","jquery_cookie","util","seedrandom","framework",
       "meshes","webgl-nuke-vendor-prefix","webgl-texture-float-extension-shims","three","Detector","FresnelShader",
        "DDSLoader","PVRLoader","advert","loader"],
       function($,Particleground,utils,jquery_cookie,util,seedrandom,framework,meshes,webgl_nuke_vendor_prefix,
        webgl_texture_float_extension_shims,three,Detector,FresnelShader,DDSLoader,PVRLoader,advert,loader){
            // console.log(Loader)
        $(document).keypress(function (e) {
            // 回车键事件  
            if (e.which == 13) {
                $('.login_submit').trigger("click");
            }
        });
        // 触发
       
})