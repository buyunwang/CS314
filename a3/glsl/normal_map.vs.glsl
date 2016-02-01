varying vec2 texCoord;
uniform sampler2D textureMap;
uniform sampler2D normalMap;

uniform vec3 lightColor;
uniform vec3 ambientColor;
uniform vec3 lightDirection;
uniform float kAmbient;
uniform float kDiffuse;
uniform float kSpecular;
uniform float shininess;

uniform vec2 uvScale;
uniform vec3 lightPosition;

varying vec2 vUv;
varying mat3 tbn;
varying vec3 vLightVector;

void main() {
	
	//ADJUST THIS FILE TO SEND PROPER DATA TO THE FRAGMENT SHADER
    vUv = vec2(1,1)* uv;
    
    vec4 tangent= vec4(1,1,1,1);
    
    vec3 vNormal = normalize(normalMatrix * normal);
    vec3 vTangent = normalize( normalMatrix * tangent.xyz );
    vec3 vBinormal = normalize(cross( vNormal, vTangent ) * tangent.w);
    tbn = mat3(vTangent, vBinormal, vNormal);
   
    // Calculate the Vertex-to-Light Vector
    vec4 lightVector = viewMatrix * vec4(lightDirection, 1.0);
    vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
    vLightVector = normalize(lightVector.xyz - modelViewPosition.xyz);
    
    
    // Multiply each vertex by the model-view matrix and the projection matrix to get final vertex position
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
