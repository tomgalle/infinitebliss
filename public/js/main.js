
window.onload = function() {
  APP();
};


function APP() {

  var container;
  var camera, scene, renderer;
  var cameraTarget = new THREE.Vector3(0, 50, - 100);
  var cameraExtra = new THREE.Vector2(0, 0);

  var controls;

  // var scaleRatio = window.devicePixelRatio? window.devicePixelRatio : 1;

  // scaleRatio = 2;

  var mouse = new THREE.Vector2(0, 0);
  var uniforms;

  var delta;
  var time;
  var oldTime;

  var loadedItems = 0;

  var extraTime = {value: 0, noise: 0};
  var fog = new THREE.Fog(0x4584b4, - 100, 3000);

  var clouds;
  var grass;
  var ground;
  var rays;

  var stats = new Stats();
  stats.setMode(0); // 0: fps, 1: ms, 2: mb

  // align top-left
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';

  document.body.appendChild(stats.domElement);

  init();


  function checkLoading() {

    ++loadedItems;

    if (loadedItems >= 0) {
      // animate();

    //   var alphaTween = new TWEEN.Tween(bgSprite.material)
    //     .to({opacity: 0}, 3000)
    //     .easing(TWEEN.Easing.Cubic.In)
    //     .onComplete(function () {
    //       camera.remove( bgSprite );
    //     });
    //   alphaTween.start();
    }
  }


  function init() {

        container = document.createElement('div');
        document.body.appendChild(container);


        // Bg gradient

        var canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = window.innerHeight;

        var context = canvas.getContext('2d');

        var gradient = context.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#0065ef');
        gradient.addColorStop(0.5, '#91c0f1');

        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);

        container.style.background = 'url(' + canvas.toDataURL('image/png') + ')';
        container.style.backgroundSize = '32px 100%';


        //Scene

        scene = new THREE.Scene();
        // scene.fog = new THREE.Fog(0xabaf99, 0, 2000)
        scene.fog = fog;

        camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 5000);
        camera.position.z = 150;
        camera.position.y = 0;
        camera.lookAt(cameraTarget);
        scene.add(camera);


        controls = new THREE.OrbitControls(camera, container);
        controls.minDistance = 10;
        controls.minY = -200;
        controls.maxDistance = 3500;
        controls.noPan = true;
        controls.damping = 0.1;
        controls.position = camera.position.clone();
        controls.target = cameraTarget.clone();




        // tree
        loader = new THREE.JSONLoader();
        // loader.load( "tree.js", treeLoaded );
        // loader.load( "butterfly.js", butterflyLoaded );

        var aLight = new THREE.AmbientLight(0x151c0f);
        // scene.add(aLight);

        var pLight = new THREE.PointLight(0xe3fbdc, 0.9);
        pLight.position.set(1000, 600, 0);
        // scene.add(pLight);

        try {
          // renderer
          renderer = new THREE.WebGLRenderer({antialias: false, alpha: true });
          renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);

          renderer.setSize(window.innerWidth, window.innerHeight);

          // renderer.setClearColor(scene.fog.color);

          renderer.sortObjects = false;

          //THREEx.WindowResize(renderer, camera);

          container.appendChild(renderer.domElement);
          has_gl = true;

          document.addEventListener('mousemove', onMouseMove, false);
          document.addEventListener('touchmove', onTouchMove, false);
          window.addEventListener('resize', onWindowResize, false);


          // if (scaleRatio > 1) {
          //   renderer.domElement.style.webkitTransform = "scale3d("+1/scaleRatio+", "+1/scaleRatio+", 1)";
          //   renderer.domElement.style.webkitTransformOrigin = "0 0 0";
          //   renderer.domElement.style.transform = "scale3d("+1/scaleRatio+", "+1/scaleRatio+", 1)";
          //   renderer.domElement.style.transformOrigin = "0 0 0";

          //   renderer.domElement.style.position = "absolute";
          //   renderer.domElement.style.top = "0px";
          //   renderer.domElement.style.left = "0px";
          // }

        }
        catch (e) {
          // need webgl
          document.getElementById('info').innerHTML = "<P><BR><B>Note.</B> You need a modern browser that supports WebGL for this to run the way it is intended.<BR>For example. <a href='http://www.google.com/landing/chrome/beta/' target='_blank'>Google Chrome 9+</a> or <a href='http://www.mozilla.com/firefox/beta/' target='_blank'>Firefox 4+</a>.<BR><BR>If you are already using one of those browsers and still see this message, it's possible that you<BR>have old blacklisted GPU drivers. Try updating the drivers for your graphic card.<BR>Or try to set a '--ignore-gpu-blacklist' switch for the browser.</P><CENTER><BR><img src='../general/WebGL_logo.png' border='0'></CENTER>";
          document.getElementById('info').style.display = 'block';
          return;
        }

      }

      function onWindowResize(event) {

        var w = window.innerWidth;
        var h = window.innerHeight;

        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();

      }

      function onMouseMove(event) {

        event.preventDefault();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

      }

      function onTouchMove(event) {

        event.preventDefault();

        for (var i = 0; i < event.changedTouches.length; i++) {

          var tx = (event.changedTouches[i].clientX / window.innerWidth) * 2 - 1;
          var ty = - (event.changedTouches[i].clientY / window.innerHeight) * 2 + 1;

          mouse.x = tx;
          mouse.y = ty;

        }

      }

      ground = new Ground(scene, checkLoading);
      ground.init();
      grass = new Grass(scene, checkLoading);
      grass.init();

      clouds = new Clouds(fog, scene, checkLoading);
      clouds.init();

      // rays = new Rays(scene,checkLoading);
      // rays.init();
      animate();

      function animate() {

        stats.update();



        // delta = 30;

        render(delta);



        requestAnimationFrame(animate);
        // window.setTimeout(animate,60)

      }

      function render(delta) {


        time = Date.now();
        delta = time - oldTime;
        oldTime = time;


        if (isNaN(delta) || delta > 1000 || delta == 0) {
          delta = 1000 / 60;
        }

        controls.update();
        var optimalDivider = delta / 16;
        var smoothing = Math.max(5, (30 / optimalDivider));

        // cameraExtra.x += (mouse.x - cameraExtra.x)/smoothing;
        // cameraExtra.y += (mouse.y - cameraExtra.y)/smoothing;

        // camera.position.x = Math.sin(time*0.0004)*10;
        // camera.position.y = 0+Math.cos(time*0.0002)*10;

        // cameraTarget.x = Math.cos((time*0.0006)+extraTime.value)*10 + cameraExtra.x*20;
        // cameraTarget.y = 25+Math.sin((time*0.0003)+extraTime.value)*10 + cameraExtra.y*20;

        // cameraTarget.x += ((Math.random()-0.5)*extraTime.noise)*5;
        // cameraTarget.y += ((Math.random()-0.5)*extraTime.noise)*5;

        // camera.lookAt(cameraTarget);

        // camera.up.x = cameraExtra.x*0.2;



        var speed = delta * 0.030;

        if (grass) {
          grass.render(delta);
        }
        if (clouds) {
          clouds.render(delta);
        }
        // if(rays){
        //   rays.render(delta)
        // }
        // ground.material.map.offset.y += delta * 0.000133;

        if (has_gl) {
          renderer.render(scene, camera);
          //console.log(renderer.info.render);
        }

      }

}
