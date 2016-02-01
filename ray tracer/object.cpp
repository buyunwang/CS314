#include "object.hpp"

#include <cmath>
#include <cfloat>
#include <fstream>
#include <sstream>
#include <map>
#include <vector>
#include <iostream>


bool Object::intersect(Ray ray, Intersection &hit) const 
{
    // Assert the correct values of the W coords of the origin and direction.
    // You can comment this out if you take great care to construct the rays
    // properly.
    ray.origin[3] = 1;
    ray.direction[3] = 0;

    Ray local_ray(i_transform * ray.origin, i_transform * ray.direction);
	//!!! USEFUL NOTES: to calculate depth in localIntersect(), if the intersection happens at
	//ray.origin + ray.direction * t, then t is just the depth
	//!!! USEFUL NOTES: Here direction might be scaled, so you mustn't renormalize it in
	//localIntersect(), or you will get a depth in local coordinate system,
	//which can't be compared with intersections with other objects
    if (localIntersect(local_ray, hit)) 
	{
        // Assert correct values of W.
        hit.position[3] = 1;
        hit.normal[3] = 0;
        
		// Transform intersection coordinates into global coordinates.
        hit.position = transform * hit.position;
        hit.normal = (n_transform * hit.normal).normalized();
        
		return true;
    }

    return false;
}


bool Sphere::localIntersect(Ray const &ray, Intersection &hit) const 
{
    // @@@@@@ YOUR CODE HERE
	// You could also use pure geometry relations rather than 
	//analytical tools shown in the slides
	// Here in local coordinate system, the sphere is centered on (0, 0, 0)
	//with radius 1.0
	//
	// NOTE: hit.depth is the current closest intersection depth, so don't
	// accept any intersection that happens further away than that
    
    
    Vector L= Vector(0,0,0) - ray.origin;
    double projection =L.dot(ray.direction.normalized());
    double d2=L.dot(L)-projection*projection;
    
    //
    if (projection<0){
       return false;
    }
    
    if(d2>radius*radius){
        return false;
    }
    double thc =sqrt(radius*radius-d2);
    double t0= projection-thc;
    double t1= projection+thc;
    
    if (t0>t1) std::swap(t0, t1);
    if (t0 < 0) {
        t0 = t1;
        
        if (t0 < 0){
            
            return false;
            
        }
    }
    
    if (t0>0 && t1>0 && t1<hit.depth){
        hit.depth=t1;
        hit.normal=(ray.origin+t1*ray.direction).normalized();
        hit.position=ray.origin+t1*ray.direction;
        return true;

    }
    
    if(t0>0 && t1<0 && t0<hit.depth){
        hit.depth=t0;
        hit.normal=(ray.origin+t0*ray.direction).normalized();
        hit.position=ray.origin+t0*ray.direction;
        return false;
    }
    
    else return false;
    
    
    Vector L1 = ray.origin;
    double a = ray.direction.dot(ray.direction);
    double b = 2 * ray.direction.dot(L1);
    double c = L1.dot(L1) - radius*radius;
    double discr = b * b - 4 * a * c;
    
    
    if (discr < 0)
        return false;
    
    if(discr ==0){
        double t=-b/(2*a);
        hit.depth=t;
        hit.normal=(ray.origin+t*ray.direction).normalized();
        hit.position=ray.origin+t*ray.direction;
        return true;
    }
    
    else if (discr>0){
        double d1 = (-b+sqrt(discr))/(2*a);
        double d2 =(-b-sqrt(discr))/(2*a);
        if(d1>0 && d2>0 && d2<hit.depth){
            hit.depth=d2;
            hit.normal=(ray.origin+d2*ray.direction).normalized();
            hit.position=ray.origin+d2*ray.direction;
            return true;
        }
        else if (d1>0 && d2<0 && d1<hit.depth){
            hit.depth=d1;
            hit.normal=(ray.origin+d1*ray.direction).normalized();
            hit.position=ray.origin+d1*ray.direction;
            return false;
        }
        else return false;
        
    }
    
    
    
    double t=t0;
    
    Vector phit=ray.origin+ray.direction*t;
    Vector n=(phit-Vector(0,0,0)).normalized();
    
    
    if (t>=hit.depth){
        
        return false;
    }
    
    else
    {
        hit.normal=n;
        hit.depth=t;
        hit.position = ray.origin+ray.direction*t;
   
        
        return true;
        
    }
}


bool Plane::localIntersect(Ray const &ray, Intersection &hit) const
{
	// @@@@@@ YOUR CODE HERE
	// Do not accept intersection while ray is inside the plane
	// Here in local coordinate system, the plane is at z = 0
	//
	// NOTE: hit.depth is the current closest intersection depth, so don't
	// accept any intersection that happens further away than that.

    ray.origin;
    ray.direction;
    
    Vector n(0,0,1);
    Vector p0(1,1,0);
    
    
    
    if (fabs(ray.direction[2]) <=0.001){
        return false;
    }
    
    double t=(p0-ray.origin).dot(n)/ray.direction.dot(n);
    if (t<0){
        return false;
    }
    else if (t>=hit.depth){
    
    return false;
    }
    
    else
    {
        hit.normal=n;
        hit.depth=t;
        hit.position = ray.origin+ray.direction*t;
        
    return true;};
}


bool Conic::localIntersect(Ray const &ray, Intersection &hit) const {
    // @@@@@@ YOUR CODE HERE (creative license)
    return false;
}


// Intersections!
bool Mesh::localIntersect(Ray const &ray, Intersection &hit) const
{
	// Bounding box check
	double tNear = -DBL_MAX, tFar = DBL_MAX;
	for (int i = 0; i < 3; i++) {
		if (ray.direction[i] == 0.0) {
			if (ray.origin[i] < bboxMin[i] || ray.origin[i] > bboxMax[i]) {
				// Ray parallel to bounding box plane and outside of box!
				return false;
			}
			// Ray parallel to bounding box plane and inside box: continue;
		}
		else {
			double t1 = (bboxMin[i] - ray.origin[i]) / ray.direction[i];
			double t2 = (bboxMax[i] - ray.origin[i]) / ray.direction[i];
			if (t1 > t2) std::swap(t1, t2); // Ensure t1 <= t2

			if (t1 > tNear) tNear = t1; // We want the furthest tNear
			if (t2 < tFar) tFar = t2; // We want the closest tFar

			if (tNear > tFar) return false; // Ray misses the bounding box.
			if (tFar < 0) return false; // Bounding box is behind the ray.
		}
	}
	// If we made it this far, the ray does intersect the bounding box.

	// The ray hits the bounding box, so check each triangle.
	bool isHit = false;
	for (size_t tri_i = 0; tri_i < triangles.size(); tri_i++) {
		Triangle const &tri = triangles[tri_i];

		if (intersectTriangle(ray, tri, hit)) {
			isHit = true;
		}
	}
	return isHit;
}

double Mesh::implicitLineEquation(double p_x, double p_y,
	double e1_x, double e1_y,
	double e2_x, double e2_y) const
{
	return (e2_y - e1_y)*(p_x - e1_x) - (e2_x - e1_x)*(p_y - e1_y);
}

bool Mesh::intersectTriangle(Ray const &ray,
	Triangle const &tri,
	Intersection &hit) const
{
	// Extract vertex positions from the mesh data.
	Vector const &p0 = positions[tri[0].pi];
	Vector const &p1 = positions[tri[1].pi];
	Vector const &p2 = positions[tri[2].pi];

	// @@@@@@ YOUR CODE HERE
	// Decide whether ray intersects the triangle (p0,p1,p2).
	// If so, fill in intersection information in hit and return true.
	// You may find it useful to use the routine implicitLineEquation()
	// to compute the result of the implicit line equation in 2D.
	//
	// NOTE: hit.depth is the current closest intersection depth, so don't
	// accept any intersection that happens further away than that.
	//!!! USEFUL NOTES: for the intersection point, its normal should satisfy hit.normal.dot(ray.direction) < 0
    
    Vector p0p1=p1-p0;
    Vector p0p2=p2-p0;
    Vector N=p0p1.cross(p0p2);
    
    if(fabs(N.dot(ray.direction))<=0.001){
        return false;
    }
    
    double d=N.dot(p0);
    double t=(N.dot(ray.origin)+d)/N.dot(ray.direction);
    
    if (t<0) {
        return false;
    }
    
    if (t>=hit.depth){
        
        return false;
    }
    
    Vector P=ray.origin+t*ray.direction;
    Vector C;
    
    Vector edge0 = p1 - p0;
    Vector vp0 = P - p0;
     C = edge0.cross(vp0);
    if (N.dot(C) < 0) {
        return false;
    }
    
    Vector edge1 = p2 - p1;
    Vector vp1 = P - p1;
    C = edge1.cross(vp1);
    if (N.dot(C) < 0) {
        return false;
    }
    
    Vector edge2 = p0 - p2;
    Vector vp2 = P - p2;
    C = edge2.cross(vp2);
    if (N.dot(C) < 0) {
        return false;
    }
    
    else{
    hit.normal=N;
    hit.depth=t;
    hit.position = P;

    return true;
    }
}
