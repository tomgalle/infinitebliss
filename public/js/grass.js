function Grass(scene, checkLoading){

  var uniforms;

  this.init = function(){

    var grassW = 1600
        
    var planeGeometry = new THREE.PlaneGeometry(grassW, 8, 30, 1);

    for (var i = 0; i < planeGeometry.vertices.length; i++) {
      planeGeometry.vertices[i].z += Math.sin(planeGeometry.vertices[i].x*0.2)*10;
    }

    planeGeometry.applyMatrix( new THREE.Matrix4().setPosition( new THREE.Vector3( 0, 4, 0 ) ) );
    
    var map = THREE.ImageUtils.loadTexture( "/img/fins2.png", undefined, checkLoading );
    map.wrapS = THREE.RepeatWrapping;

    var shadow = THREE.ImageUtils.loadTexture( "/img/9128-ambientocclusion-small.jpg", undefined, checkLoading );
    shadow.wrapS = shadow.wrapT = THREE.RepeatWrapping;


    var heightMap = THREE.ImageUtils.loadTexture( "/img/heightmap.jpg", undefined, checkLoading)
    heightMap.wrapS = heightMap.wrapT = THREE.RepeatWrapping;

    var attributes = {

      customColor: { type: 'c', value: [] },
      time:    { type: 'f', value: [] },
      uvScale:   { type: 'v2', value: [] },
      
    };

    uniforms = {

      color:      { type: "c", value: new THREE.Color( .2, .6, .1 ) },
      sunColor:      { type: "c", value: new THREE.Color( .5, 1, .2 ) },
      texture:    { type: "t", value: map },

      tDisplacement:    { type: "t", value: heightMap },
      uDisplacementBias: {type: "f", value :  -100.428408 },
      uDisplacementScale: {type: "f", value: 200.0},

      shadow:    { type: "t", value: shadow },
      globalTime: { type: "f", value: 0.0 },
      walkTime: {type:"f",value:0.0},
      fogColor : { type: "c", value: scene.fog.color },
      fogNear : { type: "f", value: scene.fog.near },
      fogFar : { type: "f", value: scene.fog.far*0.75 },
      size: { type: "v2", value: new THREE.Vector2( 3200.0,3200.0 ) },

    };

    var material = new THREE.ShaderMaterial( {

      uniforms:     uniforms,
      attributes:     attributes,
      vertexShader:   document.getElementById( 'grass_vertexshader' ).textContent,
      fragmentShader: document.getElementById( 'grass_fragmentshader' ).textContent,

      transparent:  true,
      
    });


    var nReg = 700;
    var nLong = 200;


    var geometry = new THREE.Geometry();

    for (var i = 0; i < nReg; i++) {
      var mesh = new THREE.Mesh(planeGeometry);
      mesh.rotation.y = (Math.random()-0.5)/1.2;
      mesh.position.set(Math.random()*grassW-grassW/2, 0, -grassW);
      mesh.scale.y = 1 + Math.random()*1.75;

      mesh.updateMatrix()
      // THREE.GeometryUtils.merge(geometry, mesh);
      geometry.merge( mesh.geometry,mesh.matrix );
    };


    var planeGeometry2 = new THREE.PlaneGeometry(30, 30, 1, 1);
    planeGeometry2.applyMatrix( new THREE.Matrix4().setPosition( new THREE.Vector3( 0, 15, 0 ) ) );

    for (var i = 0; i < nLong; i++) {
      var mesh = new THREE.Mesh(planeGeometry2);
      mesh.rotation.y = (Math.random()-0.5)/2;
      mesh.position.set(Math.random()*grassW-grassW/2, 0, -grassW);
      mesh.scale.y = 1 + Math.random()*.05;
      
      mesh.updateMatrix()
      // THREE.GeometryUtils.merge(geometry, mesh);
      geometry.merge( mesh.geometry,mesh.matrix );

    };



    var vertices = geometry.vertices;
    var values_time = attributes.time.value;
    var values_uv = attributes.uvScale.value;
    var values_color = attributes.customColor.value;

    var l1 = planeGeometry.vertices.length*nReg;

    for( var v = 0; v < l1; v+=planeGeometry.vertices.length ) {

      var t = Math.random();

      for (var j = v; j < v+planeGeometry.vertices.length; j++) {
        values_time[j] = t;
        values_uv[j] = new THREE.Vector2(56,1);
        values_color[j] = new THREE.Color(0xffffff);
        values_color[j].setHSL(0.25,0.25-Math.random()*0.25,0.7);
      };

    }


    var l2 = planeGeometry2.vertices.length*nLong;

    for( var v = l1; v < l1+l2; v+=planeGeometry2.vertices.length ) {

      var t = Math.random();

      for (var j = v; j < v+planeGeometry2.vertices.length; j++) {
        values_time[j] = t;
        values_uv[j] = new THREE.Vector2(1.5,1);
        values_color[j] = new THREE.Color(0x4ea648);
        values_color[j].setHSL(0.25,0.5+Math.random()*0.25,0.5);
      };

    }



    var planes = new THREE.Mesh(geometry, material);
    scene.add(planes);
  }

  this.render = function(delta){
    uniforms.globalTime.value += delta * 0.0006;
  }

}