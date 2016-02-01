/**
 * UBC CPSC 314 (2015W1)
 * Assignment 2
 */


// ASSIGNMENT-SPECIFIC API EXTENSION
THREE.Object3D.prototype.setMatrix = function(a) {
  this.matrix=a;
  this.matrix.decompose(this.position,this.quaternion,this.scale);
}


// SETUP RENDERER AND SCENE
var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0xffffff); // white background colour
document.body.appendChild(renderer.domElement);


// SETUP CAMERA
var camera = new THREE.PerspectiveCamera(30, 1, 0.1, 1000); // view angle, aspect ratio, near, far
camera.position.set(50,20,35);
camera.lookAt(scene.position);
scene.add(camera);


// SETUP ORBIT CONTROL OF THE CAMERA
var controls = new THREE.OrbitControls(camera);
controls.damping = 0.2;


// ADAPT TO WINDOW RESIZE
function resize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

window.addEventListener('resize', resize);
resize();


// FLOOR WITH CHECKERBOARD 
var floorTexture = new THREE.ImageUtils.loadTexture('images/checkerboard.jpg');
floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
floorTexture.repeat.set(4, 4);

var floorMaterial = new THREE.MeshBasicMaterial({ map: floorTexture, side: THREE.DoubleSide });
var floorGeometry = new THREE.PlaneBufferGeometry(30, 30);
var floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.position.y = -1;
floor.rotation.x = Math.PI / 2;
scene.add(floor);


// MATERIALS
var normalMaterial = new THREE.MeshNormalMaterial();


// GEOMETRY
var torsoGeometry = new THREE.SphereGeometry(2.5, 64, 64); // centered on origin
for (var i = 0; i < torsoGeometry.vertices.length; i++)
{
  torsoGeometry.vertices[i].z *= 1.4;
}
var neckGeometry = new THREE.CylinderGeometry(.4, .4, 4.5, 32);
var headGeometry = new THREE.SphereGeometry(0.7, 32, 32);
for (var i = 0; i < headGeometry.vertices.length; i++)
{
  headGeometry.vertices[i].z *= 1.5;
}
var thighGeometry = new THREE.CylinderGeometry(.8, .3, 3, 32);
for (var i = 0; i < thighGeometry.vertices.length; i++)
{
  thighGeometry.vertices[i].y -= 1.5;
}
var lowerlegGeometry = new THREE.CylinderGeometry(.3, .25, 4, 32);
for (var i = 0; i < lowerlegGeometry.vertices.length; i++)
{
  lowerlegGeometry.vertices[i].y -= 2;
}

var wingGeometry = new THREE.SphereGeometry(2, 64, 64); // centered on origin
for (var i = 0; i < wingGeometry.vertices.length; i++)
{
  wingGeometry.vertices[i].z *= 1.4;
  wingGeometry.vertices[i].x *= 0.2;
  wingGeometry.vertices[i].y *= 1;
}


// MATRICES
var torsoMatrix = new THREE.Matrix4().set(1,0,0,-5, 0,1,0,7, 0,0,1,0, 0,0,0,1);
var neckMatrix = new THREE.Matrix4().set(1,0,0,0, 0,1,0,3.5, 0,0,1,2.5, 0,0,0,1);
var necktorsoMatrix = new THREE.Matrix4().multiplyMatrices(torsoMatrix, neckMatrix);
var headMatrix = new THREE.Matrix4().set(1,0,0,0, 0,1,0,2.5, 0,0,1,0.5, 0,0,0,1);
var headnecktorsoMatrix = new THREE.Matrix4().multiplyMatrices(necktorsoMatrix, headMatrix);
var winglMatrix = new THREE.Matrix4().set(1,0,0,2.5, 0,1,0,-1, 0,0,1,-1, 0,0,0,1);
var wingltorsoMatrix = new THREE.Matrix4().multiplyMatrices(torsoMatrix, winglMatrix);
var wingrMatrix = new THREE.Matrix4().set(1,0,0,-2.5, 0,1,0,-1, 0,0,1,-1, 0,0,0,1);
var wingrtorsoMatrix = new THREE.Matrix4().multiplyMatrices(torsoMatrix, wingrMatrix);

//initialize matrices for legs here:
var thighlMatrix = new THREE.Matrix4().set(1,0,0,1, 0,1,0,-1.5, 0,0,1,0, 0,0,0,1);
var thighltorsoMatrix = new THREE.Matrix4().multiplyMatrices(torsoMatrix, thighlMatrix);
var thighrMatrix = new THREE.Matrix4().set(1,0,0,-1, 0,1,0,-1.5, 0,0,1,0, 0,0,0,1);
var thighrtorsoMatrix = new THREE.Matrix4().multiplyMatrices(torsoMatrix, thighrMatrix);

var leglMatrix = new THREE.Matrix4().set(1,0,0,0, 0,1,0,-3, 0,0,1,0, 0,0,0,1);
var leglthighltorsoMatrix = new THREE.Matrix4().multiplyMatrices(thighltorsoMatrix, leglMatrix);
var legrMatrix = new THREE.Matrix4().set(1,0,0,0, 0,1,0,-3, 0,0,1,0, 0,0,0,1);
var legrthighrtorsoMatrix = new THREE.Matrix4().multiplyMatrices(thighrtorsoMatrix, legrMatrix);

var torso = new THREE.Mesh(torsoGeometry, normalMaterial);
torso.setMatrix(torsoMatrix);
scene.add(torso);

var neck = new THREE.Mesh(neckGeometry, normalMaterial);
neck.setMatrix(necktorsoMatrix);
scene.add(neck);

var head = new THREE.Mesh(headGeometry, normalMaterial);
head.setMatrix(headnecktorsoMatrix);
scene.add(head);

//create legs and add them to the scene here:
var thighl = new THREE.Mesh(thighGeometry, normalMaterial);
thighl.setMatrix(thighltorsoMatrix);
scene.add(thighl);

var thighr = new THREE.Mesh(thighGeometry, normalMaterial);
thighr.setMatrix(thighrtorsoMatrix);
scene.add(thighr);

var legl = new THREE.Mesh(lowerlegGeometry, normalMaterial);
legl.setMatrix(leglthighltorsoMatrix);
scene.add(legl);

var legr = new THREE.Mesh(lowerlegGeometry, normalMaterial);
legr.setMatrix(legrthighrtorsoMatrix);
scene.add(legr);


var wingl = new THREE.Mesh(wingGeometry, normalMaterial);
wingl.setMatrix(wingltorsoMatrix);
scene.add(wingl);

var wingr = new THREE.Mesh(wingGeometry, normalMaterial);
wingr.setMatrix(wingrtorsoMatrix);
scene.add(wingr);



// second ostrich
var torsoGeometry2 = new THREE.SphereGeometry(2, 64, 64); // centered on origin
       for (var i = 0; i < torsoGeometry2.vertices.length; i++)
      {
        torsoGeometry2.vertices[i].z *= 2;
        torsoGeometry2.vertices[i].x *= 2
        torsoGeometry2.vertices[i].y -= 2
      }
var neckGeometry2 = new THREE.CylinderGeometry(.4, .4, 4.5, 32);
 for (var i = 0; i < neckGeometry2.vertices.length; i++)
      {
        neckGeometry2.vertices[i].z *= 1;
        neckGeometry2.vertices[i].x *= 0.5
        neckGeometry2.vertices[i].y -= 2
      }

var headGeometry2 = new THREE.SphereGeometry(0.5, 32, 32);
for (var i = 0; i < headGeometry2.vertices.length; i++)
{
  headGeometry2.vertices[i].z *= 2;
  headGeometry2.vertices[i].x *= 2;
  headGeometry2.vertices[i].y -= 2;

}
var thighGeometry2 = new THREE.CylinderGeometry(.5, .1, 3, 32);
for (var i = 0; i < thighGeometry2.vertices.length; i++)
{
  thighGeometry2.vertices[i].y -= 3;
}
var lowerlegGeometry2 = new THREE.CylinderGeometry(.1, .1, 2, 32);
for (var i = 0; i < lowerlegGeometry2.vertices.length; i++)
{
  lowerlegGeometry2.vertices[i].y -= 2;
}


var torsoMatrix2 = new THREE.Matrix4().set(1,0,0,5, 0,1,0,7, 0,0,1,0, 0,0,0,1);
var neckMatrix2 = new THREE.Matrix4().set(1,0,0,0, 0,1,0,3.5, 0,0,1,2.5, 0,0,0,1);
var necktorsoMatrix2 = new THREE.Matrix4().multiplyMatrices(torsoMatrix2, neckMatrix2);
var headMatrix2 = new THREE.Matrix4().set(1,0,0,0, 0,1,0,2.5, 0,0,1,0.5, 0,0,0,1);
var headnecktorsoMatrix2 = new THREE.Matrix4().multiplyMatrices(necktorsoMatrix2, headMatrix2);

var thighlMatrix2 = new THREE.Matrix4().set(1,0,0,1, 0,1,0,-1.5, 0,0,1,-1, 0,0,0,1);
var thighltorsoMatrix2 = new THREE.Matrix4().multiplyMatrices(torsoMatrix2, thighlMatrix2);
var thighrMatrix2 = new THREE.Matrix4().set(1,0,0,-1, 0,1,0,-1.5, 0,0,1,-1, 0,0,0,1);
var thighrtorsoMatrix2 = new THREE.Matrix4().multiplyMatrices(torsoMatrix2, thighrMatrix2);

var leglMatrix2 = new THREE.Matrix4().set(1,0,0,0, 0,1,0,-3, 0,0,1,0, 0,0,0,1);
var leglthighltorsoMatrix2 = new THREE.Matrix4().multiplyMatrices(thighltorsoMatrix2, leglMatrix2);
var legrMatrix2 = new THREE.Matrix4().set(1,0,0,0, 0,1,0,-3, 0,0,1,0, 0,0,0,1);
var legrthighrtorsoMatrix2 = new THREE.Matrix4().multiplyMatrices(thighrtorsoMatrix2, legrMatrix2);


var torso2 = new THREE.Mesh(torsoGeometry2, normalMaterial);
torso2.setMatrix(torsoMatrix2);
scene.add(torso2);

var neck2 = new THREE.Mesh(neckGeometry2, normalMaterial);
neck2.setMatrix(necktorsoMatrix2);
scene.add(neck2);

var head2 = new THREE.Mesh(headGeometry2, normalMaterial);
head2.setMatrix(headnecktorsoMatrix2);
scene.add(head2);

//create legs and add them to the scene here:
var thighl2 = new THREE.Mesh(thighGeometry2, normalMaterial);
thighl2.setMatrix(thighltorsoMatrix2);
scene.add(thighl2);

var thighr2 = new THREE.Mesh(thighGeometry2, normalMaterial);
thighr2.setMatrix(thighrtorsoMatrix2);
scene.add(thighr2);

var legl2 = new THREE.Mesh(lowerlegGeometry2, normalMaterial);
legl2.setMatrix(leglthighltorsoMatrix2);
scene.add(legl2);

var legr2 = new THREE.Mesh(lowerlegGeometry2, normalMaterial);
legr2.setMatrix(legrthighrtorsoMatrix2);
scene.add(legr2);




//APPLY DIFFERENT EFFECTS TO DIFFERNET CHANNELS
var clock = new THREE.Clock(true);
function updateBody() {

  switch(channel)
  {
    //animation
    case 0: 
      {
        var t = clock.getElapsedTime();


        //set meshes back to original position
        torso.setMatrix(torsoMatrix);
        neck.setMatrix(necktorsoMatrix);
        head.setMatrix(headnecktorsoMatrix);
        thighl.setMatrix(thighltorsoMatrix);
        thighr.setMatrix(thighrtorsoMatrix);
        legl.setMatrix(leglthighltorsoMatrix);
        legr.setMatrix(legrthighrtorsoMatrix);



        //animate legs here:

        
        //rotate left thigh
        var thighlRotateAngle = Math.cos(10*t)*Math.PI/5;
        var thighlRotateMatrix = new THREE.Matrix4().set(1,0,0,0, 
                                                         0,Math.cos(thighlRotateAngle),-Math.sin(thighlRotateAngle),0, 
                                                         0,Math.sin(thighlRotateAngle),Math.cos(thighlRotateAngle),0, 
                                                         0,0,0,1);

        var thighltorsoRotateMatrix = new THREE.Matrix4().multiplyMatrices(thighltorsoMatrix, thighlRotateMatrix);
        thighl.setMatrix(thighltorsoRotateMatrix);

        //rotate right thigh
        var thighrRotateAngle = -Math.cos(10*t)*Math.PI/5;
        var thighrRotateMatrix = new THREE.Matrix4().set(1,0,0,0, 
                                                         0,Math.cos(thighrRotateAngle),-Math.sin(thighrRotateAngle),0, 
                                                         0,Math.sin(thighrRotateAngle),Math.cos(thighrRotateAngle),0, 
                                                         0,0,0,1);

        var thighrtorsoRotateMatrix = new THREE.Matrix4().multiplyMatrices(thighrtorsoMatrix, thighrRotateMatrix);
        thighr.setMatrix(thighrtorsoRotateMatrix);


        //rotate left leg
        var leglRotateAngle = Math.cos(10*t)*Math.PI/4*0.5;
        var rotateAngle = Math.cos(5*t)*Math.PI/3*(-0.5);
        var rotateMatrix = new THREE.Matrix4().set(1,0,0,0, 
                                                         0,Math.cos(rotateAngle),-Math.sin(rotateAngle),0, 
                                                         0,Math.sin(rotateAngle),Math.cos(rotateAngle),0, 
                                                         0,0,0,1);
        var leglthighltorsoRotateMatrix = new THREE.Matrix4().multiplyMatrices(thighltorsoRotateMatrix,leglMatrix);
        var leglRotateMatrix = new THREE.Matrix4().set(1,0,0,0, 
                                                         0,Math.cos(leglRotateAngle),-Math.sin(leglRotateAngle),0, 
                                                         0,Math.sin(leglRotateAngle),Math.cos(leglRotateAngle),0, 
                                                         0,0,0,1);

            leglthighltorsoRotateMatrix = new THREE.Matrix4().multiplyMatrices(leglthighltorsoRotateMatrix,leglRotateMatrix);
            leglthighltorsoRotateMatrix.multiply(rotateMatrix);
        legl.setMatrix(leglthighltorsoRotateMatrix);

        //rotate right leg
        var legrRotateAngle = Math.cos(10*t)*Math.PI/4*0.5;
        var legrthighrtorsoRotateMatrix = new THREE.Matrix4().multiplyMatrices(thighrtorsoRotateMatrix,legrMatrix);
        var legrRotateMatrix = new THREE.Matrix4().set(1,0,0,0, 
                                                         0,Math.cos(legrRotateAngle),-Math.sin(legrRotateAngle),0, 
                                                         0,Math.sin(legrRotateAngle),Math.cos(legrRotateAngle),0, 
                                                         0,0,0,1);

            legrthighrtorsoRotateMatrix = new THREE.Matrix4().multiplyMatrices(legrthighrtorsoRotateMatrix,legrRotateMatrix);
            legrthighrtorsoRotateMatrix.multiply(rotateMatrix);
        legr.setMatrix(legrthighrtorsoRotateMatrix);






        // second ostrich

        //rotate left thigh
        var thighlRotateAngle2 = Math.cos(8*t)*Math.PI/16;
        var thighlRotateMatrix2 = new THREE.Matrix4().set(Math.cos(thighlRotateAngle2),-Math.sin(thighlRotateAngle2),0,0, 
                                                         Math.sin(thighlRotateAngle2),Math.cos(thighlRotateAngle2),0,0, 
                                                         0,0,1,0, 
                                                         0,0,0,1);

        var thighltorsoRotateMatrix2 = new THREE.Matrix4().multiplyMatrices(thighltorsoMatrix2, thighlRotateMatrix2);
        thighl2.setMatrix(thighltorsoRotateMatrix2);

        //rotate right thigh
        var thighrRotateAngle2 = -Math.cos(8*t)*Math.PI/16;
        var thighrRotateMatrix2 = new THREE.Matrix4().set(Math.cos(thighrRotateAngle2),-Math.sin(thighrRotateAngle2),0,0, 
                                                         Math.sin(thighrRotateAngle2),Math.cos(thighrRotateAngle2),0,0, 
                                                         0,0,1,0, 
                                                         0,0,0,1);

        var thighrtorsoRotateMatrix2 = new THREE.Matrix4().multiplyMatrices(thighrtorsoMatrix2, thighrRotateMatrix2);
        thighr2.setMatrix(thighrtorsoRotateMatrix2);


        //rotate left leg
        var leglRotateAngle2 = 0;
        
        var leglthighltorsoRotateMatrix2 = new THREE.Matrix4().multiplyMatrices(thighltorsoRotateMatrix2,leglMatrix2);
        var leglRotateMatrix2 = new THREE.Matrix4().set(Math.cos(leglRotateAngle2),-Math.sin(leglRotateAngle2),0,0, 
                                                         Math.sin(leglRotateAngle2),Math.cos(leglRotateAngle2),0,0, 
                                                         0,0,1,0, 
                                                         0,0,0,1);

            leglthighltorsoRotateMatrix2 = new THREE.Matrix4().multiplyMatrices(leglthighltorsoRotateMatrix2,leglRotateMatrix2);
            
        legl2.setMatrix(leglthighltorsoRotateMatrix2);

        //rotate right leg
        var legrRotateAngle2 = 0;
        var legrthighrtorsoRotateMatrix2 = new THREE.Matrix4().multiplyMatrices(thighrtorsoRotateMatrix2,legrMatrix2);
        var legrRotateMatrix2 = new THREE.Matrix4().set(Math.cos(legrRotateAngle2),-Math.sin(legrRotateAngle2),0,0, 
                                                         Math.sin(legrRotateAngle2),Math.cos(legrRotateAngle2),0,0, 
                                                         0,0,1,0, 
                                                         0,0,0,1);

            legrthighrtorsoRotateMatrix2 = new THREE.Matrix4().multiplyMatrices(legrthighrtorsoRotateMatrix2,legrRotateMatrix2);
        legr2.setMatrix(legrthighrtorsoRotateMatrix2);
        

        

        //rotate neck
        var neckRotateAngle2 =0; 
        var neckRotateMatrix2 = new THREE.Matrix4().set(Math.cos(neckRotateAngle2),-Math.sin(neckRotateAngle2),0,0, 
                                                       Math.sin(neckRotateAngle2),Math.cos(neckRotateAngle2),0,0, 
                                                       0,0,1,0, 
                                                       0,0,0,1);

        var necktorsoRotateMatrix2 = new THREE.Matrix4().multiplyMatrices(necktorsoMatrix2, neckRotateMatrix2);
            
        neck2.setMatrix(necktorsoRotateMatrix2);
        
        //rotate head 
        var headRotateAngle2 = Math.cos(8*t)*Math.PI/16;
        var headRotateMatrix2 = new THREE.Matrix4().set(Math.cos(headRotateAngle2),-Math.sin(headRotateAngle2),0,0, 
                                                       Math.sin(headRotateAngle2),Math.cos(headRotateAngle2),0,0, 
                                                       0,0,1,0, 
                                                       0,0,0,1);
        var headnecktorsoRotateMatrix2 = new THREE.Matrix4().multiplyMatrices(necktorsoRotateMatrix2,headMatrix2);
            headnecktorsoRotateMatrix2 = new THREE.Matrix4().multiplyMatrices(headnecktorsoRotateMatrix2,headRotateMatrix2);
      
        head2.setMatrix(headnecktorsoRotateMatrix2);
        
      }
      break;

    //add poses here:
    case 1:

        torso.setMatrix(torsoMatrix);
        neck.setMatrix(necktorsoMatrix);
        head.setMatrix(headnecktorsoMatrix);
        thighl.setMatrix(thighltorsoMatrix);
        thighr.setMatrix(thighrtorsoMatrix);
        legl.setMatrix(leglthighltorsoMatrix);
        legr.setMatrix(legrthighrtorsoMatrix);

        //rotate head
        var headRotateAngle = Math.PI/4*(-3);
        var headRotateMatrix = new THREE.Matrix4().set(1,0,0,0, 
                                                         0,Math.cos(headRotateAngle),-Math.sin(headRotateAngle),0, 
                                                         0,Math.sin(headRotateAngle),Math.cos(headRotateAngle),0, 
                                                         0,0,0,1);

        var headtorsoRotateMatrix = new THREE.Matrix4().multiplyMatrices(headnecktorsoMatrix, headRotateMatrix);

        head.setMatrix(headtorsoRotateMatrix);
      
      break;

    case 2:

        torso.setMatrix(torsoMatrix);
        neck.setMatrix(necktorsoMatrix);
        head.setMatrix(headnecktorsoMatrix);
        thighl.setMatrix(thighltorsoMatrix);
        thighr.setMatrix(thighrtorsoMatrix);
        legl.setMatrix(leglthighltorsoMatrix);
        legr.setMatrix(legrthighrtorsoMatrix);

        var translationMatrix = new THREE.Matrix4().set(1,0,0,0, 0,1,0,5, 0,0,1,2, 0,0,0,1);

        //rotate neck
        var neckRotateAngle = Math.PI/4*3; 
        var neckRotateMatrix = new THREE.Matrix4().set(1,0,0,0, 
                                                       0,Math.cos(neckRotateAngle),-Math.sin(neckRotateAngle),0, 
                                                       0,Math.sin(neckRotateAngle),Math.cos(neckRotateAngle),0, 
                                                       0,0,0,1);

        var necktorsoRotateMatrix = new THREE.Matrix4().multiplyMatrices(necktorsoMatrix, neckRotateMatrix);
            necktorsoRotateMatrix.multiply(translationMatrix);

        neck.setMatrix(necktorsoRotateMatrix);
        
        //rotate head 
        var headRotateAngle = Math.PI/4*3;
        var headRotateMatrix = new THREE.Matrix4().set(1,0,0,0, 
                                                         0,Math.cos(headRotateAngle),-Math.sin(headRotateAngle),0, 
                                                         0,Math.sin(headRotateAngle),Math.cos(headRotateAngle),0, 
                                                         0,0,0,1);
        var headnecktorsoRotateMatrix = new THREE.Matrix4().multiplyMatrices(necktorsoRotateMatrix,headMatrix);
            headnecktorsoRotateMatrix = new THREE.Matrix4().multiplyMatrices(headnecktorsoRotateMatrix,headRotateMatrix);
      
        head.setMatrix(headnecktorsoRotateMatrix);  


      break;

    case 3:

        torso.setMatrix(torsoMatrix);
        neck.setMatrix(necktorsoMatrix);
        head.setMatrix(headnecktorsoMatrix);
        thighl.setMatrix(thighltorsoMatrix);
        thighr.setMatrix(thighrtorsoMatrix);
        legl.setMatrix(leglthighltorsoMatrix);
        legr.setMatrix(legrthighrtorsoMatrix);

        //rotate left thigh
        var thighlRotateAngle = Math.PI/5;
        var thighlRotateMatrix = new THREE.Matrix4().set(1,0,0,0, 
                                                         0,Math.cos(thighlRotateAngle),-Math.sin(thighlRotateAngle),0, 
                                                         0,Math.sin(thighlRotateAngle),Math.cos(thighlRotateAngle),0, 
                                                         0,0,0,1);

        var thighltorsoRotateMatrix = new THREE.Matrix4().multiplyMatrices(thighltorsoMatrix, thighlRotateMatrix);
        thighl.setMatrix(thighltorsoRotateMatrix);

        //rotate right thigh
        var thighrRotateAngle = -Math.PI/5;
        var thighrRotateMatrix = new THREE.Matrix4().set(1,0,0,0, 
                                                         0,Math.cos(thighrRotateAngle),-Math.sin(thighrRotateAngle),0, 
                                                         0,Math.sin(thighrRotateAngle),Math.cos(thighrRotateAngle),0, 
                                                         0,0,0,1);

        var thighrtorsoRotateMatrix = new THREE.Matrix4().multiplyMatrices(thighrtorsoMatrix, thighrRotateMatrix);
        thighr.setMatrix(thighrtorsoRotateMatrix);


        //rotate left leg
        var leglRotateAngle = Math.PI/4*0.5;
        var rotateAngle = Math.PI/3*(-0.5);
        var rotateMatrix = new THREE.Matrix4().set(1,0,0,0, 
                                                         0,Math.cos(rotateAngle),-Math.sin(rotateAngle),0, 
                                                         0,Math.sin(rotateAngle),Math.cos(rotateAngle),0, 
                                                         0,0,0,1);
        var leglthighltorsoRotateMatrix = new THREE.Matrix4().multiplyMatrices(thighltorsoRotateMatrix,leglMatrix);
        var leglRotateMatrix = new THREE.Matrix4().set(1,0,0,0, 
                                                         0,Math.cos(leglRotateAngle),-Math.sin(leglRotateAngle),0, 
                                                         0,Math.sin(leglRotateAngle),Math.cos(leglRotateAngle),0, 
                                                         0,0,0,1);

            leglthighltorsoRotateMatrix = new THREE.Matrix4().multiplyMatrices(leglthighltorsoRotateMatrix,leglRotateMatrix);
            leglthighltorsoRotateMatrix.multiply(rotateMatrix);
        legl.setMatrix(leglthighltorsoRotateMatrix);

        //rotate right leg
        var legrRotateAngle = Math.PI/4*0.5;
        var legrthighrtorsoRotateMatrix = new THREE.Matrix4().multiplyMatrices(thighrtorsoRotateMatrix,legrMatrix);
        var legrRotateMatrix = new THREE.Matrix4().set(1,0,0,0, 
                                                         0,Math.cos(legrRotateAngle),-Math.sin(legrRotateAngle),0, 
                                                         0,Math.sin(legrRotateAngle),Math.cos(legrRotateAngle),0, 
                                                         0,0,0,1);

            legrthighrtorsoRotateMatrix = new THREE.Matrix4().multiplyMatrices(legrthighrtorsoRotateMatrix,legrRotateMatrix);
            legrthighrtorsoRotateMatrix.multiply(rotateMatrix);
        legr.setMatrix(legrthighrtorsoRotateMatrix);



      break;

    case 4:

      torso.setMatrix(torsoMatrix);
        neck.setMatrix(necktorsoMatrix);
        head.setMatrix(headnecktorsoMatrix);
        thighl.setMatrix(thighltorsoMatrix);
        thighr.setMatrix(thighrtorsoMatrix);
        legl.setMatrix(leglthighltorsoMatrix);
        legr.setMatrix(legrthighrtorsoMatrix);

        //rotate left thigh
        var thighlRotateAngle = Math.PI/5;
        var thighlRotateMatrix = new THREE.Matrix4().set(Math.cos(thighlRotateAngle),0,Math.sin(thighlRotateAngle),0, 
                                                         0,1,0,0, 
                                                         -Math.sin(thighlRotateAngle),0,Math.cos(thighlRotateAngle),0, 
                                                         0,0,0,1);

        var thighltorsoRotateMatrix = new THREE.Matrix4().multiplyMatrices(thighltorsoMatrix, thighlRotateMatrix);
        thighl.setMatrix(thighltorsoRotateMatrix);

        //rotate right thigh
        var thighrRotateAngle = -Math.PI/5;
        var thighrRotateMatrix = new THREE.Matrix4().set(1,0,0,0, 
                                                         0,Math.cos(thighrRotateAngle),-Math.sin(thighrRotateAngle),0, 
                                                         0,Math.sin(thighrRotateAngle),Math.cos(thighrRotateAngle),0, 
                                                         0,0,0,1);

        var thighrtorsoRotateMatrix = new THREE.Matrix4().multiplyMatrices(thighrtorsoMatrix, thighrRotateMatrix);
        thighr.setMatrix(thighrtorsoRotateMatrix);


        //rotate left leg
        var leglRotateAngle = Math.PI/4*0.5;
        var rotateAngle = Math.PI/3*(-0.5);
        var rotateMatrix = new THREE.Matrix4().set(1,0,0,0, 
                                                         0,Math.cos(rotateAngle),-Math.sin(rotateAngle),0, 
                                                         0,Math.sin(rotateAngle),Math.cos(rotateAngle),0, 
                                                         0,0,0,1);
        var leglthighltorsoRotateMatrix = new THREE.Matrix4().multiplyMatrices(thighltorsoRotateMatrix,leglMatrix);
        var leglRotateMatrix = new THREE.Matrix4().set(1,0,0,0, 
                                                         0,Math.cos(leglRotateAngle),-Math.sin(leglRotateAngle),0, 
                                                         0,Math.sin(leglRotateAngle),Math.cos(leglRotateAngle),0, 
                                                         0,0,0,1);

            leglthighltorsoRotateMatrix = new THREE.Matrix4().multiplyMatrices(leglthighltorsoRotateMatrix,leglRotateMatrix);
            leglthighltorsoRotateMatrix.multiply(rotateMatrix);
        legl.setMatrix(leglthighltorsoRotateMatrix);

        //rotate right leg
        var legrRotateAngle = Math.PI/4*0.5;
        var legrthighrtorsoRotateMatrix = new THREE.Matrix4().multiplyMatrices(thighrtorsoRotateMatrix,legrMatrix);
        var legrRotateMatrix = new THREE.Matrix4().set(1,0,0,0, 
                                                         0,Math.cos(legrRotateAngle),-Math.sin(legrRotateAngle),0, 
                                                         0,Math.sin(legrRotateAngle),Math.cos(legrRotateAngle),0, 
                                                         0,0,0,1);

            legrthighrtorsoRotateMatrix = new THREE.Matrix4().multiplyMatrices(legrthighrtorsoRotateMatrix,legrRotateMatrix);
            legrthighrtorsoRotateMatrix.multiply(rotateMatrix);
        legr.setMatrix(legrthighrtorsoRotateMatrix);

        var translationMatrix = new THREE.Matrix4().set(1,0,0,0, 0,1,0,1, 0,0,1,2, 0,0,0,1);

        //rotate neck
        var neckRotateAngle = Math.PI/4; 
        var neckRotateMatrix = new THREE.Matrix4().set(1,0,0,0, 
                                                       0,Math.cos(neckRotateAngle),-Math.sin(neckRotateAngle),0, 
                                                       0,Math.sin(neckRotateAngle),Math.cos(neckRotateAngle),0, 
                                                       0,0,0,1);

        var necktorsoRotateMatrix = new THREE.Matrix4().multiplyMatrices(necktorsoMatrix, neckRotateMatrix);
            necktorsoRotateMatrix.multiply(translationMatrix);

        neck.setMatrix(necktorsoRotateMatrix);
        
        //rotate head 
        var headRotateAngle = Math.PI/4*3;
        var headRotateMatrix = new THREE.Matrix4().set(1,0,0,0, 
                                                         0,Math.cos(headRotateAngle),-Math.sin(headRotateAngle),0, 
                                                         0,Math.sin(headRotateAngle),Math.cos(headRotateAngle),0, 
                                                         0,0,0,1);
        var headnecktorsoRotateMatrix = new THREE.Matrix4().multiplyMatrices(necktorsoRotateMatrix,headMatrix);
            headnecktorsoRotateMatrix = new THREE.Matrix4().multiplyMatrices(headnecktorsoRotateMatrix,headRotateMatrix);
      
        head.setMatrix(headnecktorsoRotateMatrix);  



      break;

    case 5:

        torso.setMatrix(torsoMatrix);
        neck.setMatrix(necktorsoMatrix);
        head.setMatrix(headnecktorsoMatrix);
        thighl.setMatrix(thighltorsoMatrix);
        thighr.setMatrix(thighrtorsoMatrix);
        legl.setMatrix(leglthighltorsoMatrix);
        legr.setMatrix(legrthighrtorsoMatrix);

        //rotate left thigh
        var thighlRotateAngle = Math.PI/5;
        var thighlRotateMatrix = new THREE.Matrix4().set(Math.cos(thighlRotateAngle),-Math.sin(thighlRotateAngle),0,0, 
                                                         Math.sin(thighlRotateAngle),Math.cos(thighlRotateAngle),0,0, 
                                                         0,0,1,0, 
                                                         0,0,0,1);

        var thighltorsoRotateMatrix = new THREE.Matrix4().multiplyMatrices(thighltorsoMatrix, thighlRotateMatrix);
        thighl.setMatrix(thighltorsoRotateMatrix);

        //rotate right thigh
        var thighrRotateAngle = -Math.PI/5;
        var thighrRotateMatrix = new THREE.Matrix4().set(Math.cos(thighrRotateAngle),-Math.sin(thighrRotateAngle),0,0, 
                                                         Math.sin(thighrRotateAngle),Math.cos(thighrRotateAngle),0,0, 
                                                         0,0,1,0, 
                                                         0,0,0,1);

        var thighrtorsoRotateMatrix = new THREE.Matrix4().multiplyMatrices(thighrtorsoMatrix, thighrRotateMatrix);
        thighr.setMatrix(thighrtorsoRotateMatrix);


        //rotate left leg
        var leglRotateAngle = Math.PI/4*0.5;
        var rotateAngle = Math.PI/3*(-0.5);
        var rotateMatrix = new THREE.Matrix4().set(1,0,0,0, 
                                                         0,Math.cos(rotateAngle),-Math.sin(rotateAngle),0, 
                                                         0,Math.sin(rotateAngle),Math.cos(rotateAngle),0, 
                                                         0,0,0,1);
        var leglthighltorsoRotateMatrix = new THREE.Matrix4().multiplyMatrices(thighltorsoRotateMatrix,leglMatrix);
        var leglRotateMatrix = new THREE.Matrix4().set(1,0,0,0, 
                                                         0,Math.cos(leglRotateAngle),-Math.sin(leglRotateAngle),0, 
                                                         0,Math.sin(leglRotateAngle),Math.cos(leglRotateAngle),0, 
                                                         0,0,0,1);

            leglthighltorsoRotateMatrix = new THREE.Matrix4().multiplyMatrices(leglthighltorsoRotateMatrix,leglRotateMatrix);
            leglthighltorsoRotateMatrix.multiply(rotateMatrix);
        legl.setMatrix(leglthighltorsoRotateMatrix);

        //rotate right leg
        var legrRotateAngle = Math.PI/4*0.5;
        var legrthighrtorsoRotateMatrix = new THREE.Matrix4().multiplyMatrices(thighrtorsoRotateMatrix,legrMatrix);
        var legrRotateMatrix = new THREE.Matrix4().set(1,0,0,0, 
                                                         0,Math.cos(legrRotateAngle),-Math.sin(legrRotateAngle),0, 
                                                         0,Math.sin(legrRotateAngle),Math.cos(legrRotateAngle),0, 
                                                         0,0,0,1);

            legrthighrtorsoRotateMatrix = new THREE.Matrix4().multiplyMatrices(legrthighrtorsoRotateMatrix,legrRotateMatrix);
            legrthighrtorsoRotateMatrix.multiply(rotateMatrix);
        legr.setMatrix(legrthighrtorsoRotateMatrix);

        var translationMatrix = new THREE.Matrix4().set(1,0,0,0, 0,1,0,0.5, 0,0,1,-1, 0,0,0,1);

        //rotate neck
        var neckRotateAngle = -Math.PI/8; 
        var neckRotateMatrix = new THREE.Matrix4().set(1,0,0,0, 
                                                       0,Math.cos(neckRotateAngle),-Math.sin(neckRotateAngle),0, 
                                                       0,Math.sin(neckRotateAngle),Math.cos(neckRotateAngle),0, 
                                                       0,0,0,1);

        var necktorsoRotateMatrix = new THREE.Matrix4().multiplyMatrices(necktorsoMatrix, neckRotateMatrix);
            necktorsoRotateMatrix.multiply(translationMatrix);

        neck.setMatrix(necktorsoRotateMatrix);
        
        //rotate head 
        var headRotateAngle = Math.PI/4*3;
        var headRotateMatrix = new THREE.Matrix4().set(1,0,0,0, 
                                                         0,Math.cos(headRotateAngle),-Math.sin(headRotateAngle),0, 
                                                         0,Math.sin(headRotateAngle),Math.cos(headRotateAngle),0, 
                                                         0,0,0,1);
        var headnecktorsoRotateMatrix = new THREE.Matrix4().multiplyMatrices(necktorsoRotateMatrix,headMatrix);
            headnecktorsoRotateMatrix = new THREE.Matrix4().multiplyMatrices(headnecktorsoRotateMatrix,headRotateMatrix);
      
        head.setMatrix(headnecktorsoRotateMatrix);


        

      break;

      case 6:

      var normalMaterial = new THREE.MeshNormalMaterial();

      var torsoGeometry2 = new THREE.SphereGeometry(2.5, 64, 64); // centered on origin
       for (var i = 0; i < torsoGeometry2.vertices.length; i++)
      {
        torsoGeometry2.vertices[i].z *= 1.4;
      }

      var torsoMatrix2 = new THREE.Matrix4().set(1,0,0,4, 0,1,0,7, 0,0,1,0, 0,0,0,1);


var torso2 = new THREE.Mesh(torsoGeometry, normalMaterial);
torso2.setMatrix(torsoMatrix2);
scene.add(torso2);

      break;

    default:
      break;
  }
}


// LISTEN TO KEYBOARD
var keyboard = new THREEx.KeyboardState();
var channel = 0;
function checkKeyboard() {
  for (var i=0; i<6; i++)
  {
    if (keyboard.pressed(i.toString()))
    {
      channel = i;
      break;
    }
  }
}


// SETUP UPDATE CALL-BACK
function update() {
  checkKeyboard();
  updateBody();

  requestAnimationFrame(update);
  renderer.render(scene, camera);
}

update();