function Clouds(fog,scene,checkLoading){

  var uniforms;

  this.init = function(){

    var geometry = new THREE.Geometry();
    var texture = THREE.ImageUtils.loadTexture( '/img/cloud10.png', null, checkLoading );
    texture.magFilter = THREE.LinearMipMapLinearFilter;
    texture.minFilter = THREE.LinearMipMapLinearFilter;

    uniforms = {
      "map": { type: "t", value: texture },
      "fogColor" : { type: "c", value: new THREE.Color(1,1,1) },
      "fogNear" : { type: "f", value: fog.near },
      "fogFar" : { type: "f", value: fog.far },
      "globalTime": { type: "f", value: 0.0 },
    }


    var attributes = {
      time:    { type: 'f', value: [] },      
    };

    material = new THREE.ShaderMaterial( {

      uniforms: uniforms ,
      attributes: attributes,
      vertexShader: document.getElementById( 'clouds-vs' ).textContent,
      fragmentShader: document.getElementById( 'clouds-fs' ).textContent,
      depthWrite: false,
      depthTest: false,
      transparent: true

    } );

    var plane = new THREE.Mesh( new THREE.PlaneGeometry( 64, 64 ) );

    var nClouds = 400

    for ( var i = 0; i < nClouds; i++ ) {
      plane.position.x = Math.random() * 6000 - 3000;
      plane.position.y = - Math.random() * Math.random() * 200 + 800;
      plane.position.z = -3000;
      plane.rotation.z = Math.random() * Math.PI;
      plane.scale.x = plane.scale.y = Math.random() * Math.random() * 8 + 2;
      
      plane.updateMatrix()
      geometry.merge( plane.geometry,plane.matrix );
      // THREE.GeometryUtils.merge( geometry, plane );
      
    }

    for( var v = 0; v < plane.geometry.vertices.length  * nClouds; v+=plane.geometry.vertices.length ) {

      var t = Math.random()
      for (var j = v; j < v+plane.geometry.vertices.length; j++) {
        attributes.time.value[j] = t
      }
    
    }

    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    // mesh = new THREE.Mesh( geometry, material );
    // mesh.position.z = - 800*10;
    // this.scene.add( mesh );
  }

  this.render = function(delta){
    uniforms.globalTime.value += delta * 0.0006;
  }

}