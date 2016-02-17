function Terrain(scene, camera){

      var terrain={};

      var cameraOrtho, sceneRenderTarget;

      var uniformsNoise, uniformsNormal,
        heightMap, normalMap,
        quadTarget;

      var spotLight, pointLight;
      var terrain;
      var textureCounter = 0;
      var animDelta = 0, animDeltaDir = -1;
      var lightVal = 0, lightDir = 1;
      var clock = new THREE.Clock();
      var morph, morphs = [];
      var updateNoise = true;
      var animateTerrain = false;
      var textMesh1;
      var mlib = {};
      var SCREEN_WIDTH
      var SCREEN_HEIGHT

      var renderer
      var scene
      var camera
      var DPR

      var SCREEN_WIDTH = window.innerWidth;
      var SCREEN_HEIGHT = window.innerHeight;


      $(document).ready(function(){
        SCREEN_WIDTH = window.innerWidth;
        SCREEN_HEIGHT = window.innerHeight;

      })


      this.init = function(_scene,_renderer,_camera) {

        // SCENE (RENDER TARGET)
        renderer = _renderer
        scene = _scene
        camera = _camera

        sceneRenderTarget = new THREE.Scene();

        cameraOrtho = new THREE.OrthographicCamera( SCREEN_WIDTH / - 2, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, SCREEN_HEIGHT / - 2, -10000, 10000 );
        cameraOrtho.position.z = 100;

        sceneRenderTarget.add( cameraOrtho );

        // SCENE (FINAL)


        // scene.fog = new THREE.Fog( 0x050505, 2000, 6000 );
        // scene.fog.color.setHSL( 0.102, 0.9, 0.825 );


        // LIGHTS

          scene.add( new THREE.AmbientLight( 0x111111 ) );

          directionalLight = new THREE.DirectionalLight( 0xffffff, 1.15 );
          directionalLight.position.set( 0, 0, 1 );
          scene.add( directionalLight );

          pointLight = new THREE.PointLight( 0xff4400, 1.5 );
          pointLight.position.set( 0, 0, 0 );
          scene.add( pointLight );


          // HEIGHT + NORMAL MAPS

          var normalShader = THREE.NormalMapShader;

          var rx = 256, ry = 256;
          var pars = { minFilter: THREE.LinearMipmapLinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat };


          heightMap  = new THREE.WebGLRenderTarget( rx, ry, pars );
          normalMap = new THREE.WebGLRenderTarget( rx, ry, pars );

          uniformsNoise = {

            time:   { type: "f", value: 1.0 },
            scale:  { type: "v2", value: new THREE.Vector2( 1.5, 1.5 ) },
            offset: { type: "v2", value: new THREE.Vector2( 0, 0 ) }

          };

          uniformsNormal = THREE.UniformsUtils.clone( normalShader.uniforms );

          uniformsNormal.height.value = 0.05;
          uniformsNormal.resolution.value.set( rx, ry );
          uniformsNormal.heightMap.value = heightMap;

          var vertexShader = document.getElementById( 'vertexShader' ).textContent;

          // TEXTURES

          var specularMap = new THREE.WebGLRenderTarget( 2048, 2048, pars );

          manager.itemStart("t1")
          manager.itemStart("t2")
          manager.itemStart("t3")

          var diffuseTexture1 = THREE.ImageUtils.loadTexture( "/lung/assets/grasslight-big.jpg", null, function () {

            loadTextures();
            applyShader( THREE.LuminosityShader, diffuseTexture1, specularMap );

          } );

          var diffuseTexture2 = THREE.ImageUtils.loadTexture( "/lung/assets/backgrounddetailed6.jpg", null, loadTextures );
          var detailTexture = THREE.ImageUtils.loadTexture( "/lung/assets/grasslight-big-nm.jpg", null, loadTextures );

          diffuseTexture1.wrapS = diffuseTexture1.wrapT = THREE.RepeatWrapping;
          diffuseTexture2.wrapS = diffuseTexture2.wrapT = THREE.RepeatWrapping;
          detailTexture.wrapS = detailTexture.wrapT = THREE.RepeatWrapping;
          specularMap.wrapS = specularMap.wrapT = THREE.RepeatWrapping;

          // TERRAIN SHADER

          var terrainShader = THREE.ShaderTerrain[ "terrain" ];

          uniformsTerrain = THREE.UniformsUtils.clone( terrainShader.uniforms );

          uniformsTerrain[ "tNormal" ].value = normalMap;
          uniformsTerrain[ "uNormalScale" ].value = 3.5;

          uniformsTerrain[ "tDisplacement" ].value = heightMap;

          uniformsTerrain[ "tDiffuse1" ].value = diffuseTexture1;
          uniformsTerrain[ "tDiffuse2" ].value = diffuseTexture2;
          uniformsTerrain[ "tSpecular" ].value = specularMap;
          uniformsTerrain[ "tDetail" ].value = detailTexture;

          uniformsTerrain[ "enableDiffuse1" ].value = true;
          uniformsTerrain[ "enableDiffuse2" ].value = true;
          uniformsTerrain[ "enableSpecular" ].value = true;

          uniformsTerrain[ "diffuse" ].value.setHex( 0xffffff );
          uniformsTerrain[ "specular" ].value.setHex( 0xffffff );
          uniformsTerrain[ "ambient" ].value.setHex( 0x111111 );

          uniformsTerrain[ "shininess" ].value = 30;

          uniformsTerrain[ "uDisplacementScale" ].value = 375;

          uniformsTerrain[ "uRepeatOverlay" ].value.set( 6, 6 );

          var params = [
            [ 'heightmap',  document.getElementById( 'fragmentShaderNoise' ).textContent,   vertexShader, uniformsNoise, false ],
            [ 'normal',   normalShader.fragmentShader,  normalShader.vertexShader, uniformsNormal, false ],
            [ 'terrain',  terrainShader.fragmentShader, terrainShader.vertexShader, uniformsTerrain, true ]
            ];

          for( var i = 0; i < params.length; i ++ ) {

            material = new THREE.ShaderMaterial( {

              uniforms:     params[ i ][ 3 ],
              vertexShader:   params[ i ][ 2 ],
              fragmentShader: params[ i ][ 1 ],
              lights:     params[ i ][ 4 ],
              fog:      true
              } );

            mlib[ params[ i ][ 0 ] ] = material;

          }


          var plane = new THREE.PlaneGeometry( SCREEN_WIDTH, SCREEN_HEIGHT );

          quadTarget = new THREE.Mesh( plane, new THREE.MeshBasicMaterial( { color: 0x000000 } ) );
          quadTarget.position.z = -500;
          sceneRenderTarget.add( quadTarget );

          // TERRAIN MESH

          var geometryTerrain = new THREE.PlaneGeometry( 8000, 8000, 256, 256 );
          geometryTerrain.computeTangents();

          terrain = new THREE.Mesh( geometryTerrain, mlib[ "terrain" ] );
          terrain.position.set( 0, -625, 0 );
          terrain.rotation.x = -Math.PI / 2;
          terrain.visible = false;

          scene.add( terrain );

          // RENDERER

          // renderer = new THREE.WebGLRenderer();
          // renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
          // renderer.setClearColor( scene.fog.color, 1 );
          // container.appendChild( renderer.domElement );

          //

          renderer.gammaInput = true;
          renderer.gammaOutput = true;


          // STATS

          // stats = new Stats();
          // container.appendChild( stats.domElement );

          // EVENTS

          onWindowResize();

          // window.addEventListener( 'resize', onWindowResize, false );
          // document.addEventListener( 'keydown', onKeyDown, false );

          // COMPOSER

          renderer.autoClear = false;

          DPR = (window.devicePixelRatio) ? window.devicePixelRatio : 1;


          renderTargetParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false };
          renderTarget = new THREE.WebGLRenderTarget( SCREEN_WIDTH, SCREEN_HEIGHT, renderTargetParameters );

          effectBloom = new THREE.BloomPass( .9 );
          var effectBleach = new THREE.ShaderPass( THREE.BleachBypassShader );

          hblur = new THREE.ShaderPass( THREE.HorizontalTiltShiftShader );
          vblur = new THREE.ShaderPass( THREE.VerticalTiltShiftShader );

          var bluriness = 7;

          hblur.uniforms[ 'h' ].value = bluriness / SCREEN_WIDTH;
          vblur.uniforms[ 'v' ].value = bluriness / SCREEN_HEIGHT;

          hblur.uniforms[ 'r' ].value = vblur.uniforms[ 'r' ].value = 0.5;

          effectBleach.uniforms[ 'opacity' ].value = 0.65;

          // composer = new THREE.EffectComposer( renderer, renderTarget );

          var renderModel = new THREE.RenderPass( scene, camera );

          vblur.renderToScreen = false;

          composer = new THREE.EffectComposer( renderer, renderTarget );

          composer.addPass( renderModel );

          composer.addPass( effectBloom );
          // composer.addPass( effectBleach );

          composer.addPass( hblur );
          composer.addPass( vblur );


          return composer;

      }

      this.render = function(scene, camera){
      

          var delta = clock.getDelta();


          if ( terrain.visible ) {

            var time = Date.now() * 0.001;

            var fLow = 0.1, fHigh = 0.8;

            lightVal = THREE.Math.clamp( lightVal + 0.5 * delta * lightDir, fLow, fHigh );

            var valNorm = ( lightVal - fLow ) / ( fHigh - fLow );

            scene.fog.color.setHSL( 0.1, 0.4, lightVal -.2 );

            directionalLight.intensity = THREE.Math.mapLinear( valNorm, -.5, .5, 0.5, 1.15 );
            pointLight.intensity = THREE.Math.mapLinear( valNorm, 0, 1, 0.9, 1.5 );

            uniformsTerrain[ "uNormalScale" ].value = THREE.Math.mapLinear( valNorm, 0, 1, 0.6, 3.5 );

            if ( updateNoise ) {

              animDelta = THREE.Math.clamp( animDelta + 0.00075 * animDeltaDir, 0, 0.05 );
              uniformsNoise[ "time" ].value += delta * animDelta;


              uniformsNoise[ "offset" ].value.y += delta * 0.05;
              uniformsTerrain[ "uOffset" ].value.y = 4 * uniformsNoise[ "offset" ].value.y;


              quadTarget.material = mlib[ "heightmap" ];
              renderer.render( sceneRenderTarget, cameraOrtho, heightMap, true );

              quadTarget.material = mlib[ "normal" ];
              renderer.render( sceneRenderTarget, cameraOrtho, normalMap, true );
            }
          composer.render( 0.1 );
          // renderer.render(scene, camera)

        }



      }

    function onWindowResize( event ) {

        SCREEN_WIDTH = window.innerWidth;
        SCREEN_HEIGHT = window.innerHeight;

        // composer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );

        camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
        camera.updateProjectionMatrix();

      }

      //

      function onKeyDown ( event ) {

        switch( event.keyCode ) {

          case 78: /*N*/  lightDir *= -1; break;
          case 77: /*M*/  animDeltaDir *= -1; break;
          case 66: /*B*/  soundDir *= -1; break;

        }

      };

      //

      function applyShader( shader, texture, target ) {

        var shaderMaterial = new THREE.ShaderMaterial( {

          fragmentShader: shader.fragmentShader,
          vertexShader: shader.vertexShader,
          uniforms: THREE.UniformsUtils.clone( shader.uniforms )

        } );

        shaderMaterial.uniforms[ "tDiffuse" ].texture = texture;

        var sceneTmp = new THREE.Scene();

        var meshTmp = new THREE.Mesh( new THREE.PlaneGeometry( SCREEN_WIDTH, SCREEN_HEIGHT ), shaderMaterial );
        meshTmp.position.z = -500;
        sceneTmp.add( meshTmp );

        renderer.render( sceneTmp, cameraOrtho, target, true );

      };

      //

      function loadTextures() {
        textureCounter += 1;
        manager.itemEnd("t"+textureCounter)
        if ( textureCounter == 3 )  {
          terrain.visible = true;
          // document.getElementById( "loading" ).style.display = "none";
        }
      }

}




function Ground(scene,checkLoading){

  var uniforms;

  this.init = function(){

    var plane = new THREE.PlaneGeometry(3200,3200, 40,40);
    plane.computeTangents();

    var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
    directionalLight.position.set( 0, -1, 1 );
    scene.add( directionalLight );


    var groundTexture = THREE.ImageUtils.loadTexture( "/img/9451-ambientocclusion.jpg", undefined, checkLoading )   
    groundTexture.wrapS = THREE.RepeatWrapping;
    groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set( 4, 4 );

    var heightMap = THREE.ImageUtils.loadTexture( "/img/heightmap.jpg", undefined, checkLoading)
    // var heightMap = THREE.ImageUtils.loadTexture( "/img/9128-ambientocclusion-small.jpg", undefined, checkLoading)


    var shader = THREE.NormalDisplacementShader;
    var uniforms = THREE.UniformsUtils.clone( shader.uniforms );
    
    uniforms[ "enableDisplacement" ].value = true;
    uniforms[ "tDisplacement" ].value = heightMap;
    uniforms[ "enableDiffuse" ].value = true;

    // uniforms["enableAO"].value = true;
    // uniforms["tAO"].value = heightMap;

    uniforms[ "tDiffuse" ].value = groundTexture;
    uniforms[ "uDisplacementBias" ].value =  -100.428408;
    uniforms[ "uDisplacementScale" ].value = 200.0;
    uniforms['diffuse'].value = new THREE.Color( 0.1, .3, .05 ); 
    // uniforms['specular'].value = new THREE.Color( 0.0, 1, 0.0 ); 
    uniforms['uRepeat'].value = new THREE.Vector2( 20, 20 );


    var parameters = { 
      fragmentShader: shader.fragmentShader, 
      vertexShader: shader.vertexShader, 
      uniforms: uniforms, 
      lights: true, 
      fog: true };
    var material = new THREE.ShaderMaterial( parameters );
    
    // var material = new THREE.MeshBasicMaterial( { 
    //   uniforms:uniforms,
    //   color: new THREE.Color( .1, .3, .05 ), 
    //   map: groundTexture           
    // });

    // material.map.wrapS = THREE.RepeatWrapping;
    // material.map.wrapT = THREE.RepeatWrapping;
    // material.map.repeat.x = 20;
    // material.map.repeat.y = 20;

    ground = new THREE.Mesh(plane, material);
    ground.rotation.x = -Math.PI*0.5;
    scene.add(ground);
  }

  this.render = function(delta){
    // uniforms.globalTime.value += delta * 0.0006;
  }
}