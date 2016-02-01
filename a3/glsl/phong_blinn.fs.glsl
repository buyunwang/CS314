varying vec4 V_ViewPosition;
varying vec4 V_Normal_VCS;

uniform vec3 lightColor;
uniform vec3 ambientColor;
uniform vec3 lightDirection;
uniform float kAmbient;
uniform float kDiffuse;
uniform float kSpecular;
uniform float shininess;

varying vec3 viewVector;
varying vec3 normalVector;

void main() {

	// COMPUTE LIGHTING HERE
    vec3 lightVector = normalize(lightDirection);
    vec3 lightReflect = normalize(reflect(-lightVector,normalVector));
    vec3 halfVector = normalize(lightVector + viewVector);

    
    float diffuse = max (0.0, dot(normalVector, lightVector));
    float specular = pow(max(0.0, dot(halfVector,normalVector)),shininess);
    
    
    gl_FragColor = vec4(kAmbient * ambientColor+ diffuse * lightColor * kDiffuse+ lightColor * specular * kSpecular, 1.0);
}