// Generated by CoffeeScript 1.10.0

/*
This test uses a depth texture to do shadow mapping
A depth texture uses the webgl float texture extension and the webgl
depth texture extensions.  This is testing whether those extensions exist
and how they are implemented on the GPU
 */
define(['gl-matrix','toServer',"util"], function(glM,toServer,util) {
(function() {
  var ShadowTest;

  window.ShadowTest = ShadowTest = (function() {
    function ShadowTest() {
      this.id = sender.getID();
    }

    ShadowTest.prototype.begin = function(canvas, cb) {
      var Filter, boxFilter, camDist, camPitch, camProj, camRot, camView, counter, cubeGeom, depth, displayShader, downsample256, downsample512, draw, drawCamera, drawLight, drawScene, error, error1, floatExt, gl, lightDepthTexture, lightFramebuffer, lightProj, lightRot, lightShader, lightView, model, offset, planeGeom, quad;
      this.cb = cb;
      try {
        gl = new WebGLFramework(canvas, {
          antialias: false,
          preserveDrawingBuffer: true,
          willReadFrequently: false,
          depth: true
        }).depthTest();
        floatExt = gl.getFloatExtension({
          require: ['renderable', 'filterable'],
          prefer: ['single', 'half']
        });
        gl.getExt('OES_standard_derivatives');
      } catch (error1) {
        error = error1;
        console.log(error);
        return;
      }
      cubeGeom = gl.drawable(meshes.cube);
      planeGeom = gl.drawable(meshes.plane(50));
      quad = gl.drawable(meshes.quad);
      displayShader = gl.shader({
        common: "//essl\nvarying vec3 vWorldNormal; varying vec4 vWorldPosition;\nuniform mat4 camProj, camView;\nuniform mat4 lightProj, lightView; uniform mat3 lightRot;\nuniform mat4 model;",
        vertex: "//essl\nattribute vec3 position, normal;\n\nvoid main(){\n    vWorldNormal = normal;\n    vWorldPosition = model * vec4(position, 1.0);\n    gl_Position = camProj * camView * vWorldPosition;\n}",
        fragment: "//essl\nuniform sampler2D sLightDepth;\n\nfloat linstep(float low, float high, float v){\n    return clamp((v-low)/(high-low), 0.0, 1.0);\n}\n\nfloat VSM(sampler2D depths, vec2 uv, float compare){\n    vec2 moments = texture2D(depths, uv).xy;\n    float p = smoothstep(compare-0.02, compare, moments.x);\n    float variance = max(moments.y - moments.x*moments.x, -0.001);\n    float d = compare - moments.x;\n    float p_max = linstep(0.2, 1.0, variance / (variance + d*d));\n    return clamp(max(p, p_max), 0.0, 1.0);\n}\n\nfloat attenuation(vec3 dir){\n    float dist = length(dir);\n    float radiance = 1.0/(1.0+pow(dist/10.0, 2.0));\n    return clamp(radiance*10.0, 0.0, 1.0);\n}\n\nfloat influence(vec3 normal, float coneAngle){\n    float minConeAngle = ((360.0-coneAngle-10.0)/360.0)*PI;\n    float maxConeAngle = ((360.0-coneAngle)/360.0)*PI;\n    return smoothstep(minConeAngle, maxConeAngle, acos(normal.z));\n}\n\nfloat lambert(vec3 surfaceNormal, vec3 lightDirNormal){\n    return max(0.0, dot(surfaceNormal, lightDirNormal));\n}\n\nvec3 skyLight(vec3 normal){\n    return vec3(smoothstep(0.0, PI, PI-acos(normal.y)))*0.4;\n}\n\nvec3 gamma(vec3 color){\n    return pow(color, vec3(2.2));\n}\n\nvoid main(){\n    vec3 worldNormal = normalize(vWorldNormal);\n\n    vec3 camPos = (camView * vWorldPosition).xyz;\n    vec3 lightPos = (lightView * vWorldPosition).xyz;\n    vec3 lightPosNormal = normalize(lightPos);\n    vec3 lightSurfaceNormal = lightRot * worldNormal;\n    vec4 lightDevice = lightProj * vec4(lightPos, 1.0);\n    vec2 lightDeviceNormal = lightDevice.xy/lightDevice.w;\n    vec2 lightUV = lightDeviceNormal*0.5+0.5;\n\n    // shadow calculation\n    float lightDepth2 = clamp(length(lightPos)/40.0, 0.0, 1.0);\n    float illuminated = VSM(sLightDepth, lightUV, lightDepth2);\n\n    vec3 excident = (\n        skyLight(worldNormal) +\n        lambert(lightSurfaceNormal, -lightPosNormal) *\n        influence(lightPosNormal, 55.0) *\n        attenuation(lightPos) *\n        illuminated\n    );\n    gl_FragColor = vec4(gamma(excident), 1.0);\n}"
      });
      lightShader = gl.shader({
        common: "//essl\nvarying vec3 vWorldNormal; varying vec4 vWorldPosition;\nuniform mat4 lightProj, lightView; uniform mat3 lightRot;\nuniform mat4 model;",
        vertex: "//essl\nattribute vec3 position, normal;\n\nvoid main(){\n    vWorldNormal = normal;\n    vWorldPosition = model * vec4(position, 1.0);\n    gl_Position = lightProj * lightView * vWorldPosition;\n}",
        fragment: "//essl\n#extension GL_OES_standard_derivatives : enable\nvoid main(){\n    vec3 worldNormal = normalize(vWorldNormal);\n    vec3 lightPos = (lightView * vWorldPosition).xyz;\n    float depth = clamp(length(lightPos)/40.0, 0.0, 1.0);\n    float dx = dFdx(depth);\n    float dy = dFdy(depth);\n    gl_FragColor = vec4(depth, pow(depth, 2.0) + 0.25*(dx*dx + dy*dy), 0.0, 1.0);\n}"
      });
      lightDepthTexture = gl.texture({
        type: floatExt.type,
        channels: 'rgba'
      }).bind().setSize(1024, 1024).linear().clampToEdge();
      lightFramebuffer = gl.framebuffer().bind().color(lightDepthTexture).depth().unbind();
      Filter = (function() {
        function Filter(size, filter) {
          this.size = size;
          this.output = gl.texture({
            type: floatExt.type,
            channels: 'rgba'
          }).bind().setSize(this.size, this.size).linear().clampToEdge();
          this.framebuffer = gl.framebuffer().bind().color(this.output).unbind();
          this.shader = gl.shader({
            common: "//essl\nvarying vec2 texcoord;",
            vertex: "//essl\nattribute vec2 position;\n\nvoid main(){\n    texcoord = position*0.5+0.5;\n    gl_Position = vec4(position, 0.0, 1.0);\n}",
            fragment: "//essl\nuniform vec2 viewport;\nuniform sampler2D source;\n\nvec3 get(float x, float y){\n    vec2 off = vec2(x, y);\n    return texture2D(source, texcoord+off/viewport).rgb;\n}\nvec3 get(int x, int y){\n    vec2 off = vec2(x, y);\n    return texture2D(source, texcoord+off/viewport).rgb;\n}\nvec3 filter(){\n    " + filter + "\n}\nvoid main(){\n    gl_FragColor = vec4(filter(), 1.0);\n}"
          });
        }

        Filter.prototype.bind = function(unit) {
          return this.output.bind(unit);
        };

        Filter.prototype.apply = function(source) {
          this.framebuffer.bind();
          gl.viewport(0, 0, this.size, this.size);
          this.shader.use().vec2('viewport', this.size, this.size).sampler('source', source).draw(quad);
          return this.framebuffer.unbind();
        };

        return Filter;

      })();
      downsample512 = new Filter(512, "//essl\nreturn get(0.0, 0.0);");
      downsample256 = new Filter(256, "//essl\nreturn get(0.0, 0.0);");
      boxFilter = new Filter(256, "//essl\nvec3 result = vec3(0.0);\nfor(int x=-1; x<=1; x++){\n    for(int y=-1; y<=1; y++){\n        result += get(x,y);\n    }\n}\nreturn result/9.0;");
      camProj = gl.mat4();
      camView = gl.mat4();
      lightProj = gl.mat4().perspective({
        fov: 60
      }, 1, {
        near: 0.01,
        far: 100
      });
      lightView = gl.mat4().trans(0, 0, -6).rotatex(30).rotatey(110);
      lightRot = gl.mat3().fromMat4Rot(lightView);
      model = gl.mat4();
      counter = -Math.PI * 0.1;
      offset = 0;
      camDist = 10;
      camRot = 55;
      camPitch = 41;
      depth = 0;
      drawScene = function(shader) {
        return shader.mat4('model', model.ident().trans(0, 0, 0)).draw(planeGeom).mat4('model', model.ident().trans(0, 1 + offset, 0)).draw(cubeGeom).mat4('model', model.ident().trans(5, 1, -1)).draw(cubeGeom);
      };
      drawLight = function() {
        lightFramebuffer.bind();
        gl.viewport(0, 0, lightDepthTexture.width, lightDepthTexture.height).clearColor(1, 1, 1, 1).clearDepth(1).cullFace('back');
        lightShader.use().mat4('lightView', lightView).mat4('lightProj', lightProj).mat3('lightRot', lightRot);
        drawScene(lightShader);
        lightFramebuffer.unbind();
        downsample512.apply(lightDepthTexture);
        downsample256.apply(downsample512);
        return boxFilter.apply(downsample256);
      };
      drawCamera = function() {
        gl.adjustSize().viewport().cullFace('back').clearColor(0, 0, 0, 0).clearDepth(1);
        camProj.perspective({
          fov: 60,
          aspect: gl.aspect,
          near: 0.01,
          far: 100
        });
        camView.ident().trans(0, -1, -camDist).rotatex(camPitch).rotatey(camRot);
        displayShader.use().mat4('camProj', camProj).mat4('camView', camView).mat4('lightView', lightView).mat4('lightProj', lightProj).mat3('lightRot', lightRot).sampler('sLightDepth', boxFilter);
        return drawScene(displayShader);
      };
      draw = function() {
        drawLight();
        return drawCamera();
      };
      draw();
      return gl.animationInterval((function(_this) {
        return function(frame) {
          offset = 1 + Math.sin(counter);
          counter += 1 / 10;
          draw();
          if (depth++ === 5) {
            caf(frame);
            sender.getData(gl.getContext(), _this.id);
            return _this.cb();
          }
        };
      })(this));
    };

    return ShadowTest;

  })();

  }).call(this);
  return ShadowTest;
})
