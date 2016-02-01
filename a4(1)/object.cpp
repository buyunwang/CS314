#ifndef OBJECT_H
#define OBJECT_H

#include "basic.hpp"

#include <fstream>
#include <sstream>
#include <map>
#include <vector>
#include <iostream>
#include <cmath>
#include <cfloat>

// The type of a "parameter list", e.g. mapping from strings to sets of numbers.
typedef std::map<std::string, std::vector<double> > ParamList;


// A class to encapsulate all parameters for a material.
class Material
{
public:
    // Constructors
    Material() {};
    Material(ParamList &params) { init(params); }
    
    void init(ParamList &params)
    {
#define SET_VECTOR(_name) _name = params[#_name];
        SET_VECTOR(ambient)
        SET_VECTOR(diffuse)
        SET_VECTOR(specular)
        SET_VECTOR(emission)
        
#define SET_FLOAT(_name) _name = params[#_name].size() ? params[#_name][0] : 0;
        SET_FLOAT(shininess)
        SET_FLOAT(shadow)
        SET_FLOAT(reflect)
    }
    
    // Ambient/diffuse/specular/emissive colors.
    Vector ambient;
    Vector diffuse;
    Vector specular;
    Vector emission;
    
    // "Shininess" factor (specular exponent).
    double shininess;
    
    // Shadow coefficient, [0 -> no shadow, 1 -> black shadow]
    // everything in between is blended by that factor with the surface color
    double shadow;
    
    // Reflection coefficient [0 -> no reflection, 1 -> total reflection]
    // everything in between is blended by that factor with the surface color
    double reflect;
};


// Abstract base object class
class Object
{
public:
    Matrix transform;   // Transformation from global to object space.
    Matrix i_transform; // Transformation from object to global space.
    Matrix n_transform; // Trasnformation to global space for normals.
    
    // Sets up the 3 transformations from the given global-to-object transform.
    void setup_transform(Matrix const &m)
    {
        transform = m;
        m.invert(i_transform);
        n_transform = i_transform.transpose();
    }
    
    // Intersect the object with the given ray in global space.
    // Returns true if there was an intersection, hit is updated with params.
    bool intersect(Ray ray, Intersection &hit) const;
    
    // Intersect the object with the given ray in object space.
    // This function is specific to each object subtype.
    // Returns true if there was an intersection, hit is updated with params.
    virtual bool localIntersect(Ray const &ray, Intersection &hit) const = 0;
    
    Material material; // This object's material.
};


// A sphere centred around the local origin with a certain radius.
class Sphere : public Object
{
public:
    double radius;
    
    bool localIntersect(Ray const &ray, Intersection &hit) const;
};


// A plane at the origin using Z+ as the normal in object space.
class Plane : public Object
{
public:
    virtual bool localIntersect(Ray const &ray, Intersection &hit) const;
};


// A conic about the Z+ axis, bounded along Z by zMin and zMax,
// with radii radius1 and radius2.
class Conic : public Object
{
public:
    double radius1, radius2;
    double zMin, zMax;
    
    bool localIntersect(Ray const &ray, Intersection &hit) const;
};


// A class to represent a single vertex of a polygon. The ints stored within
// are indices into the positions/texCoords/normals/colors vectors of the
// Object that it belongs to.
class Vertex {
public:
    // Indices into positions, texCoods, normals, and colors vectors.
    int pi, ti, ni, ci;
    
    Vertex() : pi(-1), ti(-1), ni(-1), ci(-1) {}
    
    Vertex(int pi, int ti, int ni, int ci) :
    pi(pi),
    ti(ti),
    ni(ni),
    ci(ci)
    {}
};


class Triangle
{
public:
    Vertex v[3];
    
    Triangle(Vertex const &v0, Vertex const &v1, Vertex const &v2)
    {
        v[0] = v0;
        v[1] = v1;
        v[2] = v2;
    }
    
    Vertex& operator[](int i) { return v[i]; }
    const Vertex& operator[](int i) const { return v[i]; }
};


class Mesh : public Object {
public:
    // Storage for positions/texCoords/normals/colors. Looked up by index.
    std::vector<Vector> positions;
    std::vector<Vector> texCoords;
    std::vector<Vector> normals;
    std::vector<Vector> colors;
    
    // Triangles are a triplet of vertices.
    std::vector<Triangle> triangles;
    
    // Bounding box
    Vector bboxMin, bboxMax;
    
    // Read OBJ data from a given file.
    bool readOBJ(std::string const &filename)
    {
        // Try to open the file.
        std::ifstream file(filename.c_str());
        if (!file.good()) {
            std::cerr << "Unable to open OBJ file \"" << filename << "\"" << std::endl;
            return false;
        }
        
        // Keep fetching op codes and processing them. We will assume that there
        // is one operation per line.
        while (file.good()) {
            
            std::string opString;
            std::getline(file, opString);
            
            std::stringstream opStream(opString);
            std::string opCode;
            opStream >> opCode;
            
            // Skip blank lines and comments
            if (!opCode.size() || opCode[0] == '#') {
                continue;
            }
            
            // Ignore groups.
            if (opCode[0] == 'g') {
                std::cerr << "ignored OBJ opCode '" << opCode << "'" << std::endl;
                
                // Vertex data.
            }
            else if (opCode[0] == 'v') {
                
                // Read in up to 4 doubles.
                Vector vec;
                for (int i = 0; opStream.good() && i < 4; i++) {
                    opStream >> vec[i];
                }
                
                // Store this data in the right location.
                switch (opCode.size() > 1 ? opCode[1] : 'v') {
                    case 'v':
                        positions.push_back(vec);
                        break;
                    case 't':
                        texCoords.push_back(vec);
                        break;
                    case 'n':
                        normals.push_back(vec);
                        break;
                    case 'c':
                        colors.push_back(vec);
                        break;
                    default:
                        std::cerr << "unknown vertex type '" << opCode << "'" << std::endl;
                        break;
                }
                
                // A polygon (or face).
            }
            else if (opCode == "f") {
                std::vector<Vertex> polygon;
                // Limit to 4 as we only can handle triangles and quads.
                for (int i = 0; opStream.good() && i < 4; i++) {
                    
                    // Retrieve a full vertex specification.
                    std::string vertexString;
                    opStream >> vertexString;
                    
                    if (!vertexString.size()) {
                        break;
                    }
                    
                    // Parse the vertex into a set of indices for position,
                    // texCoord, normal, and colour, respectively.
                    std::stringstream vertexStream(vertexString);
                    std::vector<int> indices;
                    for (int j = 0; vertexStream.good() && j < 4; j++) {
                        // Skip slashes.
                        if (vertexStream.peek() == '/') {
                            vertexStream.ignore(1);
                        }
                        int index;
                        if (vertexStream >> index)
                            indices.push_back(index);
                    }
                    
                    // Turn this into a real Vertex, and append it to the polygon.
                    if (indices.size()) {
                        indices.resize(4, 0);
                        polygon.push_back(Vertex(
                                                 indices[0] - 1,
                                                 indices[1] - 1,
                                                 indices[2] - 1,
                                                 indices[3] - 1
                                                 ));
                    }
                    
                }
                
                // Only accept triangles...
                if (polygon.size() == 3) {
                    triangles.push_back(Triangle(polygon[0],
                                                 polygon[1],
                                                 polygon[2]));
                    // ...and quads...
                }
                else if (polygon.size() == 4) {
                    // ...but break them into triangles.
                    triangles.push_back(Triangle(polygon[0],
                                                 polygon[1],
                                                 polygon[2]));
                    triangles.push_back(Triangle(polygon[0],
                                                 polygon[2],
                                                 polygon[3]));
                }
                
                // Any other opcodes get ignored.
            }
            else {
                std::cerr << "unknown opCode '" << opCode << "'" << std::endl;
            }
        }
        
        updateBBox();
        
        return true;
    }
    
    // Construct bounding box of vertex positions.
    // This must be called after mesh data has been initialized and before
    // raytracing begins.
    void updateBBox()
    {
        bboxMin = Vector(DBL_MAX, DBL_MAX, DBL_MAX);
        bboxMax = Vector(-DBL_MAX, -DBL_MAX, -DBL_MAX);
        for (std::vector<Vector>::iterator pItr = positions.begin();
             pItr != positions.end(); ++pItr) {
            Vector const& p = *pItr;
            if (p[0] < bboxMin[0]) bboxMin[0] = p[0];
            if (p[0] > bboxMax[0]) bboxMax[0] = p[0];
            if (p[1] < bboxMin[1]) bboxMin[1] = p[1];
            if (p[1] > bboxMax[1]) bboxMax[1] = p[1];
            if (p[2] < bboxMin[2]) bboxMin[2] = p[2];
            if (p[2] > bboxMax[2]) bboxMax[2] = p[2];
        }
    }
    
    // Intersections!
    bool localIntersect(Ray const &ray, Intersection &hit) const;
    
private:
    // Compute the result of the implicit line equation in 2D 
    // for a given point and a line with the given endpoints.
    double implicitLineEquation(double p_x, double p_y,
                                double e1_x, double e1_y,
                                double e2_x, double e2_y) const;
    
    // Find the intersection point between the given ray and mesh triangle.
    // Return true iff an intersection exists, and fill the hit data
    // structure with information about it.
    bool intersectTriangle(Ray const &ray,
                           Triangle const &tri,
                           Intersection &hit) const;
};


#endif
