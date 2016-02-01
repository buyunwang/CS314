// Create shared variable. The value is given as the interpolation between normals computed in the vertex shader
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

varying vec2 vUv;
varying mat3 tbn;
varying vec3 vLightVector;



void main() {

	// LOOK UP THE COLOR IN THE TEXTURE
 
    
    // Transform texture coordinate of normal map to a range (-1.0, 1.0)
    vec3 normalCoordinate = texture2D(normalMap, vUv).xyz * 2.0 - 1.0;
    
    // Transform the normal vector in the RGB channels to tangent space
    vec3 normal = normalize(tbn * normalCoordinate.rgb);
    
    // Intensity calculated as dot of normal and vertex-light vector
    float intensity = max(0.07, dot(normal, vLightVector));
    
    // Adjustments to alpha and intensity per color channel may be made
    vec4 lighting = vec4(intensity, intensity, intensity, 1.0);

     vec4 texColor = texture2D(textureMap, vUv);

  // Set final rendered color according to the surface normal
  gl_FragColor = texColor*lighting;
}
