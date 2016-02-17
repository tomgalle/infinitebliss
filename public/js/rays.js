function Rays(scene,checkLoading) {
        
  // rays

  var uniformsRays;

  this.init = function(){

    var numRays = 20;

    var planeGeometry = new THREE.PlaneBufferGeometry( 40, 1000 );
    planeGeometry.applyMatrix( new THREE.Matrix4().makeRotationFromEuler( new THREE.Vector3( 0, 0, -Math.PI ) ) );

    var rayTexture = THREE.ImageUtils.loadTexture( "/img/ray2.png", undefined, checkLoading );
    rayTexture.wrapS = THREE.RepeatWrapping;
    rayTexture.wrapT = THREE.RepeatWrapping;
    rayTexture.repeat.x = 2;
    rayTexture.repeat.y = 1;

    var attributes = {

      time:    { type: 'f', value: [] },
      
    };

    uniformsRays = {

      color:      { type: "c", value: new THREE.Color( 0xdadc9f ) },
      texture:    { type: "t", value: rayTexture },
      globalTime: { type: "f", value: 0.0 },

    };

    var material = new THREE.ShaderMaterial( {

      uniforms:     uniformsRays,
      attributes:     attributes,
      vertexShader:   document.getElementById( 'rays_vertexshader' ).textContent,
      fragmentShader: document.getElementById( 'rays_fragmentshader' ).textContent,

      blending:     THREE.AdditiveBlending,
      depthWrite:   false,
      transparent:  true,
      
    });


    var geometry = new THREE.Geometry();

    for (var i = 0; i < numRays; i++) {

      var mesh = new THREE.Mesh(planeGeometry);

      mesh.scale.x = 2+Math.random()*2;

      mesh.position.x = Math.random()*1200-600;
      mesh.position.z = -800;
      mesh.position.y = 300;

      mesh.rotation.z = -0.5 + mesh.position.x*0.0006;

      THREE.GeometryUtils.merge(geometry, mesh);
    };

    var vertices = geometry.vertices;
    var values_time = attributes.time.value;

    for( var v = 0; v < vertices.length; v+=planeGeometry.vertices.length ) {

      var t = Math.random();

      for (var j = v; j < v+planeGeometry.vertices.length; j++) {
        values_time[j] = t;
      };

    }


    var planes = new THREE.Mesh(geometry, material);
    scene.add(planes); 
  } 

  this.render =function(delta){
    uniformsRays.globalTime.value += delta * 0.0006;
  }

}
