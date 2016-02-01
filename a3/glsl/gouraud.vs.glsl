varying vec4 V_Color;         // This will be passed into the fragment shader.
uniform vec3 lightColor;
uniform vec3 ambientColor;
uniform vec3 lightDirection;
uniform float kAmbient;
uniform float kDiffuse;
uniform float kSpecular;
uniform float shininess;

void main() {
	// COMPUTE COLOR ACCORDING TO GOURAUD HERE
    
    

    
	//V_Color = vec4(1.0, 0.0, 0.0, 1.0);
    
    vec3 lightVector = normalize(lightDirection);
    vec3 viewVector = normalize(vec3(projectionMatrix * modelViewMatrix * vec4(position,1.0)));
    vec3 normalVector = normalize(normalMatrix * normal);
    vec3 lightReflect = normalize(reflect(-lightVector,normalVector));
    
    float specular = pow(max(0.0, dot(lightReflect,viewVector)),shininess);
    float diffuse = max (0.0, dot(normalVector, lightVector));
    
    V_Color = vec4(kAmbient * ambientColor+ diffuse * lightColor * kDiffuse+ lightColor * specular * kSpecular, 1.0);

	// Position
	gl_Position = projectionMatrix *  modelViewMatrix * vec4(position, 1.0);
}