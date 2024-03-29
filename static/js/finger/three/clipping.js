/***
* This file uses clipping planes to manipulate a scene and makes it appear
* like movement is happening, however, all the objects are stationary while
* it is the clipping planes that are infact moving.  This is also where we
* calculate FPS as this test is the most taking one that we have
***/
define(['gl-matrix','toServer',"util"], function(glM,toServer,util) {
  var ClippingTest = function() {

    function planesFromMesh(vertices, indices) {
      // creates a clipping volume from a convex triangular mesh
      // specified by the arrays 'vertices' and 'indices'

      var n = indices.length / 3, result = new Array(n);

      for (var i = 0, j = 0; i < n; ++i, j += 3) {

        var a = vertices[indices[j]], b = vertices[indices[j + 1]],
            c = vertices[indices[j + 2]];

        result[i] = new THREE.Plane().setFromCoplanarPoints(a, b, c);
      }

      return result;
    }

    function createPlanes(n) {
      // creates an array of n uninitialized plane objects

      var result = new Array(n);

      for (var i = 0; i !== n; ++i)
        result[i] = new THREE.Plane();

      return result;
    }

    function assignTransformedPlanes(planesOut, planesIn, matrix) {
      // sets an array of existing planes to transformed 'planesIn'

      for (var i = 0, n = planesIn.length; i !== n; ++i)
        planesOut[i].copy(planesIn[i]).applyMatrix4(matrix);
    }

    function cylindricalPlanes(n, innerRadius) {

      var result = createPlanes(n);

      for (var i = 0; i !== n; ++i) {

        var plane = result[i], angle = i * Math.PI * 2 / n;

        plane.normal.set(Math.cos(angle), 0, Math.sin(angle));

        plane.constant = innerRadius;
      }

      return result;
    }

    var planeToMatrix = (function() {
      // creates a matrix that aligns X/Y to a given plane

      // temporaries:
      var xAxis = new THREE.Vector3(), yAxis = new THREE.Vector3(),
          trans = new THREE.Vector3();

      return function planeToMatrix(plane) {

        var zAxis = plane.normal, matrix = new THREE.Matrix4();

        // Hughes & Moeller '99
        // "Building an Orthonormal Basis from a Unit Vector."

        if (Math.abs(zAxis.x) > Math.abs(zAxis.z)) {

          yAxis.set(-zAxis.y, zAxis.x, 0);

        } else {

          yAxis.set(0, -zAxis.z, zAxis.y);
        }

        xAxis.crossVectors(yAxis.normalize(), zAxis);

        plane.coplanarPoint(trans);
        return matrix.set(xAxis.x, yAxis.x, zAxis.x, trans.x, xAxis.y, yAxis.y,
                          zAxis.y, trans.y, xAxis.z, yAxis.z, zAxis.z, trans.z, 0,
                          0, 0, 1);

      };

    })();

    // A regular tetrahedron for the clipping volume:

    var Vertices =
            [
              new THREE.Vector3(+1, 0, +Math.SQRT1_2),
              new THREE.Vector3(-1, 0, +Math.SQRT1_2),
              new THREE.Vector3(0, +1, -Math.SQRT1_2),
              new THREE.Vector3(0, -1, -Math.SQRT1_2)
            ],

        Indices = [ 0, 1, 2, 0, 2, 3, 0, 3, 1, 1, 3, 2 ],

        Planes = planesFromMesh(Vertices, Indices),
        PlaneMatrices = Planes.map(planeToMatrix);

    GlobalClippingPlanes = cylindricalPlanes(5, 3.5),

    Empty = Object.freeze([]);

    var camera, scene, renderer,

        object, clipMaterial, volumeVisualization, globalClippingPlanes;

    function init() {

      camera = new THREE.PerspectiveCamera(36, 256 / 256, 0.25, 16);

      camera.position.set(0, 1.5, 5);

      scene = new THREE.Scene();

      // Lights

      scene.add(new THREE.AmbientLight(0x505050));

      var spotLight = new THREE.SpotLight(0xffffff);
      spotLight.angle = Math.PI / 5;
      spotLight.penumbra = 0.2;
      spotLight.position.set(2, 3, 3);
      spotLight.castShadow = true;
      spotLight.shadow.camera.near = 3;
      spotLight.shadow.camera.far = 10;
      spotLight.shadow.mapSize.width = 1024;
      spotLight.shadow.mapSize.height = 1024;
      scene.add(spotLight);

      var dirLight = new THREE.DirectionalLight(0x55505a, 1);
      dirLight.position.set(0, 2, 0);
      dirLight.castShadow = true;
      dirLight.shadow.camera.near = 1;
      dirLight.shadow.camera.far = 10;

      dirLight.shadow.camera.right = 1;
      dirLight.shadow.camera.left = -1;
      dirLight.shadow.camera.top = 1;
      dirLight.shadow.camera.bottom = -1;

      dirLight.shadow.mapSize.width = 1024;
      dirLight.shadow.mapSize.height = 1024;
      scene.add(dirLight);

      // Geometry

      clipMaterial = new THREE.MeshPhongMaterial({
        color : 0xee0a10,
        shininess : 100,
        side : THREE.DoubleSide,
        // Clipping setup:
        clippingPlanes : createPlanes(Planes.length),
        clipShadows : true
      });

      object = new THREE.Group();

      var geometry = new THREE.BoxBufferGeometry(0.18, 0.18, 0.18);

      for (var z = -2; z <= 2; ++z)
        for (var y = -2; y <= 2; ++y)
          for (var x = -2; x <= 2; ++x) {

            var mesh = new THREE.Mesh(geometry, clipMaterial);
            mesh.position.set(x / 5, y / 5, z / 5);
            mesh.castShadow = true;
            object.add(mesh);
          }

      scene.add(object);

      var planeGeometry = new THREE.PlaneBufferGeometry(3, 3, 1, 1),

          color = new THREE.Color();

      volumeVisualization = new THREE.Group();
      volumeVisualization.visible = true;

      for (var i = 0, n = Planes.length; i !== n; ++i) {

        var material = new THREE.MeshBasicMaterial({
          color : color.setHSL(i / n, 0.5, 0.5).getHex(),
          side : THREE.DoubleSide,

          opacity : 0.2,
          transparent : true,

          // clip to the others to show the volume (wildly
          // intersecting transparent planes look bad)
          clippingPlanes : clipMaterial.clippingPlanes.filter(function(_, j) {
            return j !== i;
          })

          // no need to enable shadow clipping - the plane
          // visualization does not cast shadows

        });

        volumeVisualization.add(new THREE.Mesh(planeGeometry, material));
      }

      scene.add(volumeVisualization);

      var ground = new THREE.Mesh(
          planeGeometry,
          new THREE.MeshPhongMaterial({color : 0xa0adaf, shininess : 150}));
      ground.rotation.x = -Math.PI / 2;
      ground.scale.multiplyScalar(3);
      ground.receiveShadow = true;
      scene.add(ground);
    }

    function setObjectWorldMatrix(object, matrix) {
      // set the orientation of an object based on a world matrix

      var parent = object.parent;
      scene.updateMatrixWorld();
      object.matrix.getInverse(parent.matrixWorld);
      object.applyMatrix(matrix);
    }

    init();

    var ID = sender.getID();
    this.begin = function(canvas, cb) {
      // Renderer

      renderer = new THREE.WebGLRenderer({
        context: util.getGL(canvas),
        canvas: canvas
      }, false);

      renderer.shadowMap.enabled = true;
      renderer.shadowMap.renderSingleSided = false;
      renderer.setPixelRatio(1);
      renderer.setSize(canvas.width, canvas.height);
      // Clipping setup:
      globalClippingPlanes = createPlanes(GlobalClippingPlanes.length);
      renderer.clippingPlanes = globalClippingPlanes;
      renderer.localClippingEnabled = true;

      var level = 49;
      var transform = new THREE.Matrix4(), tmpMatrix = new THREE.Matrix4();

      function animate() {

        var time = level++ * 0.05;

        var frame = requestAnimationFrame(animate);

        object.position.y = 1;
        object.rotation.x = time * 0.5;
        object.rotation.y = time * 0.2;

        object.updateMatrix();
        transform.copy(object.matrix);

        var bouncy = Math.cos(time * .5) * 0.5 + 0.7;
        transform.multiply(tmpMatrix.makeScale(bouncy, bouncy, bouncy));

        assignTransformedPlanes(clipMaterial.clippingPlanes, Planes, transform);

        var planeMeshes = volumeVisualization.children;

        for (var i = 0, n = planeMeshes.length; i !== n; ++i) {

          tmpMatrix.multiplyMatrices(transform, PlaneMatrices[i]);
          setObjectWorldMatrix(planeMeshes[i], tmpMatrix);
        }

        transform.makeRotationY(time * 0.1);

        assignTransformedPlanes(globalClippingPlanes, GlobalClippingPlanes,
                                transform);

        renderer.render(scene, camera);
        if (level == 50) {
          cancelAnimationFrame(frame);

          sender.getData(renderer.getContext(), ID);
          cb();
        }
      }
      requestAnimationFrame(animate);
    };
  };
  return ClippingTest;
})
