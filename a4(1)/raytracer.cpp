#include <cstdio>
#include <cstdlib>
#include <cfloat>
#include <cmath>
#include <algorithm>
#include <string>
#include <fstream>
#include <vector>
#include <iostream>
#include <sstream>
#include <map>
#include <vector>
#include "basic.hpp"

#include "raytracer.hpp"
#include "image.hpp"


void Raytracer::render(const char *filename, const char *depth_filename,
                       Scene const &scene)
{
    // Allocate the two images that will ultimately be saved.
    Image colorImage(scene.resolution[0], scene.resolution[1]);
    Image depthImage(scene.resolution[0], scene.resolution[1]);
    
    // Create the zBuffer.
    double *zBuffer = new double[scene.resolution[0] * scene.resolution[1]];
    for(int i = 0; i < scene.resolution[0] * scene.resolution[1]; i++) {
        zBuffer[i] = DBL_MAX;
    }
    
    // @@@@@@ YOUR CODE HERE
    // calculate camera parameters for rays, refer to the slides for details
    //!!! USEFUL NOTES: tan() takes rad rather than degree, use deg2rad() to transform
    //!!! USEFUL NOTES: view plane can be anywhere, but it will be implemented differently,
    //you can find references from the course slides 22_GlobalIllum.pdf
    
    double distance = scene.camera.zNear;
    scene.camera.zFar;
    Vector eyePoint = scene.camera.position;
    Vector lookatPoint = scene.camera.center;
    // view direction
    Vector w = (lookatPoint - eyePoint).normalized();
    Vector up = scene.camera.up;
    Vector u = w.cross(up).normalized();
    Vector v = u.cross(w).normalized();
    
    
    double rad = deg2rad(scene.camera.fovy);
    double viewPlaneHalfHeight=tan(rad/2)*distance;
    
    double viewPlaneHalfWidth = scene.camera.aspect*viewPlaneHalfHeight;
    
    Vector viewPlaneBottomLeftPoint = eyePoint+ w*distance- v*viewPlaneHalfHeight - u*viewPlaneHalfWidth;
    
    
    
    // Iterate over all the pixels in the image.
    for(int y = 0; y < scene.resolution[1]; y++) {
        for(int x = 0; x < scene.resolution[0]; x++) {
            
            // Generate the appropriate ray for this pixel
            Ray ray;
            if (scene.objects.empty())
            {
                //no objects in the scene, then we render the default scene:
                //in the default scene, we assume the view plane is at z = 640 with width and height both 640
                ray = Ray(scene.camera.position, (Vector(-320, -320, 640) + Vector(x + 0.5, y + 0.5, 0) - scene.camera.position).normalized());
            }
            else
            {
                // @@@@@@ YOUR CODE HERE
                // set primary ray using the camera parameters
                //!!! USEFUL NOTES: all world coordinate rays need to have a normalized direction
                
                Vector xIncVector = (u*2*viewPlaneHalfWidth)/scene.resolution[0];
                Vector yIncVector = (v*2*viewPlaneHalfHeight)/scene.resolution[1];
                Vector viewPlanePoint = viewPlaneBottomLeftPoint + x*xIncVector + y*yIncVector;
                Vector rayDirection = viewPlanePoint - eyePoint;
                ray = Ray(eyePoint, rayDirection.normalized());
            }
            
            // Initialize recursive ray depth.
            int rayDepth = 0;
            
            // Our recursive raytrace will compute the color and the z-depth
            Vector color;
            
            // This should be the maximum depth, corresponding to the far plane.
            // NOTE: This assumes the ray direction is unit-length and the
            // ray origin is at the camera position.
            double depth = scene.camera.zFar;
            
            // Calculate the pixel value by shooting the ray into the scene
            trace(ray, rayDepth, scene, color, depth);
            
            // Depth test
            if(depth >= scene.camera.zNear && depth <= scene.camera.zFar &&
               depth < zBuffer[x + y*scene.resolution[0]]) {
                zBuffer[x + y*scene.resolution[0]] = depth;
                
                // Set the image color (and depth)
                colorImage.setPixel(x, y, color);
                depthImage.setPixel(x, y, (depth-scene.camera.zNear) /
                                    (scene.camera.zFar-scene.camera.zNear));
            }
        }
        
        //output step information
        if (y % 100 == 0)
        {
            printf("Row %d pixels finished.\n", y);
        }
    }
    
    //save image
    colorImage.writeBMP(filename);
    depthImage.writeBMP(depth_filename);
    
    printf("Ray tracing finished with images saved.\n");
    
    delete[] zBuffer;
}


bool Raytracer::trace(Ray const &ray,
                      int &rayDepth,
                      Scene const &scene,
                      Vector &outColor, double &depth)
{
    // Increment the ray depth.
    rayDepth++;
    
    // - iterate over all objects calling Object::intersect.
    // - don't accept intersections not closer than given depth.
    // - call Raytracer::shade with the closest intersection.
    // - return true iff the ray hits an object.
    if (scene.objects.empty())
    {
        // no objects in the scene, then we render the default scene:
        // For default, we assume there's a cube centered on (0, 0, 1280 + 160) with side length 320 facing right towards the camera
        // test intersection:
        double x = 1280 / ray.direction[2] * ray.direction[0] + ray.origin[0];
        double y = 1280 / ray.direction[2] * ray.direction[1] + ray.origin[1];
        if ((x <= 160) && (x >= -160) && (y <= 160) && (y >= -160))
        {
            //if intersected:
            Material m; m.emission = Vector(16.0, 0, 0); m.reflect = 0; //just for default material, you should use the intersected object's material
            Intersection intersection;	//just for default, you should pass the intersection found by calling Object::intersect()
            outColor = shade(ray, rayDepth, intersection, m, scene);
            depth = 1280;	//the depth should be set inside each Object::intersect()
        }
    }
    else
    {
        // @@@@@@ YOUR CODE HERE
        // Note that for Object::intersect(), the parameter hit is the current hit
        // your intersect() should be implemented to exclude intersection far away than hit.depth
        
        Intersection hit;
        hit.depth = depth;
        double minDepth = depth;
        int index;
        for (int x=0 ; x<scene.objects.size(); x++) {
            if (scene.objects[x]->intersect(ray,hit)){
                if(hit.depth <minDepth){
                    minDepth = hit.depth;
                    index=x;
                }
                outColor = shade(ray, rayDepth, hit, scene.objects[index]->material, scene);
            }
        }
        
        depth = minDepth;
        return true;
    }
    
    // Decrement the ray depth.
    rayDepth--;
    
    return false;
}


Vector Raytracer::shade(Ray const &ray,
                        int &rayDepth,
                        Intersection const &intersection,
                        Material const &material,
                        Scene const &scene)
{
    // - iterate over all lights, calculating ambient/diffuse/specular contribution
    // - use shadow rays to determine shadows
    // - integrate the contributions of each light
    // - include emission of the surface material
    // - call Raytracer::trace for reflection/refraction colors
    // Don't reflect/refract if maximum ray recursion depth has been reached!
    //!!! USEFUL NOTES: attenuate factor = 1.0 / (a0 + a1 * d + a2 * d * d)..., ambient light doesn't attenuate, nor does it affected by shadow
    //!!! USEFUL NOTES: don't accept shadow intersection far away than the light position
    //!!! USEFUL NOTES: for each kind of ray, i.e. shadow ray, reflected ray, and primary ray, the accepted furthest depth are different
    Vector diffuse(0);
    Vector ambient(0);
    Vector specular(0);
    
    Vector v = -ray.direction.normalized();
    Vector n = intersection.normal.normalized();
    Vector reflect = (-v + 2 * v.dot(n) * n).normalized();
    
    for (auto lightIter = scene.lights.begin(); lightIter != scene.lights.end(); lightIter++)
    {
        // @@@@@@ YOUR CODE HERE
        // calculate local illumination here, remember to add all the lights together
        // also test shadow here, if a point is in shadow, multiply its diffuse and specular color by (1 - material.shadow)
        Vector l = (lightIter->position - intersection.position).normalized();
        Vector r = (-l + 2 * n.dot(l)*n).normalized();
        Vector view = (scene.camera.position - intersection.position).normalized();
        
        double d = //(intersection.position - ray.origin).length()+
        (lightIter->position - intersection.position).length();
        double attenuation = 1.0 / (lightIter->ambient[0] + d*lightIter->attenuation[1]
                                    +d *d*lightIter->attenuation[2]);
        
        Ray shadowRay = Ray(intersection.position + (lightIter->position - intersection.position).normalized()* 1e-6,(lightIter->position - intersection.position).normalized());
        Intersection hit = intersection;
        bool isShadow = false;
        
        Vector delAmbient = material.ambient * lightIter->ambient;
        Vector delDiffuse = material.diffuse * lightIter->diffuse * max(0.0, n.dot(l))
        * attenuation;
        Vector delSpecular = material.specular * lightIter->specular *
        pow(max(0.0, r.dot(view)), material.shininess) * attenuation;
        
        
        
        for (int x = 0; x< scene.objects.size(); x++) {
            if (scene.objects[x]->intersect(shadowRay, hit)) {
                isShadow = true;
            }
        }
        
        
        if (isShadow) {
            ambient += delAmbient;
            diffuse += delDiffuse * (1 - material.shadow);
            specular += delSpecular * (1 - material.shadow);
        }
        else {
            ambient += delAmbient;
            diffuse += delDiffuse;
            specular += delSpecular;
        }
    }
    
    Vector reflectedLight(0);
    if ((!(ABS_FLOAT(material.reflect) < 1e-6)) && (rayDepth < MAX_RAY_RECURSION))
    {
        // @@@@@@ YOUR CODE HERE
        // calculate reflected color using trace() recursively
        Ray reflect_ray(intersection.position + reflect*1e-6, reflect);
        double depth = DBL_MAX;
        trace(reflect_ray, rayDepth, scene, reflectedLight, depth);
        
    }
    
    return material.emission + ambient + diffuse + specular + material.reflect * reflectedLight;
}