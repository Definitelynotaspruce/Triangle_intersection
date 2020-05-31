function cross(v1, v2) {
    dest = [0.0, 0.0, 0.0];
    dest[0] = v1[1] * v2[2] - v1[2] * v2[1];
    dest[1] = v1[2] * v2[0] - v1[0] * v2[2];
    dest[2] = v1[0] * v2[1] - v1[1] * v2[0];

    return dest;
}
// dot product
function dot(v1, v2) {
    return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
}

// vector subtraction
function sub(v1, v2) {
    dest = [0.0, 0.0, 0.0];
    dest[0] = v1[0] - v2[0];
    dest[1] = v1[1] - v2[1];
    dest[2] = v1[2] - v2[2];

    return dest;
}
// vector addition
function add(v1, v2) {
    dest = [0.0, 0.0, 0.0];
    dest[0] = v1[0] + v2[0];
    dest[1] = v1[1] + v2[1];
    dest[2] = v1[2] + v2[2];

    return dest;
}
// vector product by scalar
function mult(v, factor) {
    dest = [0.0, 0.0, 0.0];
    dest[0] = factor * v[0];
    dest[1] = factor * v[1];
    dest[2] = factor * v[2];

    return dest;
}
// assignment
function set(src) {
    dest = [0.0, 0.0, 0.0];
    dest[0] = src[0];
    dest[1] = src[1];
    dest[2] = src[2];

    return dest;
}

function isect(VTX0, VTX1, VTX2, VV0, VV1, VV2, D0, D1, D2, isect0, isect1, isectpoint0, isectpoint1) {
    let tmp = D0 / (D0 - D1);
    let diff = [0, 0, 0];
    isect0 = VV0 + (VV1 - VV0) * tmp;
    diff = sub(VTX1, VTX0);
    diff = mult(diff, tmp);
    isectpoint0 = add(diff, VTX0);

    tmp = D0 / (D0 - D2);
    isect1 = VV0 + (VV2 - VV0) * tmp;
    diff = sub(VTX1, VTX0);
    diff = mult(diff, tmp);
    isectpoint0 = add(diff, VTX0);

    return [isect0, isect1, isectpoint0, isectpoint1];
}

function compute_intervals_isectline(VERT0, VERT1, VERT2, VV0, VV1, VV2, D0, D1, D2, D0D1, D0D2, isect0, isect1, isectpoint0, isectpoint1) {
    if (D0D1 > 0.0)
        return [isect(VERT2, VERT0, VERT1, VV2, VV0, VV1, D2, D0, D1, isect0, isect1, isectpoint0, isectpoint1), false];
    else if (D0D2 > 0.0)
        return [isect(VERT1, VERT0, VERT2, VV1, VV0, VV2, D1, D0, D2, isect0, isect1, isectpoint0, isectpoint1), false];
    else if (D1 * D2 > 0.0 || D0 != 0.0)
        return [isect(VERT0, VERT1, VERT2, VV0, VV1, VV2, D0, D1, D2, isect0, isect1, isectpoint0, isectpoint1), false];
    else if (D1 != 0.0)
        return [isect(VERT1, VERT0, VERT2, VV1, VV0, VV2, D1, D0, D2, isect0, isect1, isectpoint0, isectpoint1), false];
    else if (D2 != 0.0)
        return [isect(VERT2, VERT0, VERT1, VV2, VV0, VV1, D2, D0, D1, isect0, isect1, isectpoint0, isectpoint1), false];
    else
        return [
            [isect0, isect1, isectpoint0, isectpoint1], true
        ]; //triangles are coplanar
    return false;
}

function edge_edge_test(V0, U0, U1, i0, i1, Ax, Ay) {
    let Bx = By = Cx = Cy = f = d = e = 0.0;
    By = U0[i0] - U1[i0]; // B = U0 - U1 (projected onto the i0-i1 plane)
    Bx = U0[i1] - U1[i1];
    Cx = V0[i0] - U0[i0]; // C = V0 - U0 (projected onto the i0-i1 plane)
    Cy = V0[i1] - U0[i1];

    //if the edges intersect, |f| is half the area of the convex quadrilateral spanned by the vertices
    f = Ay * Bx - Ax * By;
    //if the edges intersect, |d| is half the area of the triangle U0, U1, V0
    d = By * Cx - Bx * Cy;
    if ((f > 0 && d >= 0 && d <= f) || (f < 0 && d <= 0 && d >= f)) {
        // if edges intersect, |e| is half the area of the triangle V0, V1, U0
        e = Ax * Cy - Ay * Cx;
        if (f > 0) {
            if (e >= 0 && e <= f)
                return true;

            else {
                if (e <= 0 && e >= f)
                    return true;
            }
        }
    }

    // all vertices are colinear if f == 0 and d == 0, but for some reason this is not tested here ???
    return false;
}


function edge_against_tri_edge(V0, V1, U0, U1, U2, i0, i1) {
    let Ax = Ay = 0.0; //coordinates of the edge relative to V0
    Ax = V1[i0] - V0[i0];
    Ay = V1[i1] - V0[i1];

    //test intersection of edge U0, U1 with edge V0, V1
    if (edge_edge_test(V0, U0, U1, i0, i1, Ax, Ay))
        return true;
    if (edge_edge_test(V0, U1, U2, i0, i1, Ax, Ay))
        return true;
    if (edge_edge_test(V0, U2, U0, i0, i1, Ax, Ay))
        return true;
    return false;
}

function point_in_tri(V0, U0, U1, U2, i0, i1) {
    let a = b = c = d0 = d1 = d2 = 0.0;
    // is T1 completely inside T2?
    // check if V0 is inside tri(U0, U1, U2)

    a = U1[i1] - U0[i1];
    b = -(U1[i0] - U0[i0]);
    c = -a * U0[i0] - b * U0[i1];
    d0 = a * V0[i0] + b * V0[i1] + c;

    a = U2[i1] - U1[i1];
    b = -(U2[i0] - U1[i0]);
    c = -a * U1[i0] - b * U1[i1];
    d1 = a * V0[i0] + b * V0[i1] + c;

    a = U0[i1] - U2[i1];
    b = -(U0[i0] - U2[i0]);
    c = -a * U2[i0] - b * U2[i1];
    d2 = a * V0[i0] + b * V0[i1] + c;

    if (d0 * d1 > 0.0)
        if (d0 * d2 > 0.0)
            return true;
    return false;
}

function coplanar_tri_tri(N, V0, V1, V2, U0, U1, U2) {
    let A = [0.0, 0.0, 0.0];
    let i0 = i1 = 0;
    // first project onto an axis-aligned plane that maximizes the area
    // of the triangles, compute indices: i0, i1.
    A[0] = Math.abs(N[0]);
    A[1] = Math.abs(N[1]);
    A[2] = Math.abs(N[2]);

    if (A[0] > A[1]) {
        if (A[0] > A[2]) {
            i0 = 1;
            i1 = 2;
        } else {
            i0 = 0;
            i1 = 1;
        }
    } else {
        if (A[2] > A[1]) {
            i0 = 0;
            i1 = 1;
        } else {
            i0 = 0;
            i1 = 2;
        }
    }

    if (edge_against_tri_edge(V0, V1, U0, U1, U2, i0, i1))
        return true;
    if (edge_against_tri_edge(V1, V2, U0, U1, U2, i0, i1))
        return true;
    if (edge_against_tri_edge(V2, V0, U0, U1, U2, i0, i1))
        return true;

    // finally, test if tri1 is totally contained in tri2 or vice versa

    if (point_in_tri(V0, U0, U1, U2, i0, i1))
        return true;
    if (point_in_tri(U0, V0, V1, V2, i0, i1))
        return true;
    return false;
}



function tri_tri_intersect_with_isectline(V0, V1, V2, U0, U1, U2) {
    // Variable declarations
    let E1 = [0.0, 0.0, 0.0],
        E2 = [0.0, 0.0, 0.0];
    let N1 = [0.0, 0.0, 0.0],
        N2 = [0.0, 0.0, 0.0],
        D = [0.0, 0.0, 0.0];
    let isect1 = [0.0, 0.0],
        isect2 = [0.0, 0.0];
    let isectpointA1 = [0.0, 0.0, 0.0],
        isectpointA2 = [0.0, 0.0, 0.0];
    let isectpointB1 = [0.0, 0.0, 0.0],
        isectpointB2 = [0.0, 0.0, 0.0];
    let du0du1 = du0du2 = dv0dv1 = dv0dv2 = 0.0;
    let d1 = d2 = du0 = du1 = du2 = dv0 = dv1 = dv2 = 0.0;
    let vp0 = vp1 = vp2 = up0 = up1 = up2 = 0.0;
    let b = c = maxVal = 0.0;
    let index = 0;

    // compute plane equation of triangle (V0, V1, V2)
    E1 = sub(V1, V0);
    E2 = sub(V2, V0);
    N1 = cross(E1, E2);
    //normalization?
    d1 = -dot(N1, V0);
    // plane equation 1: N1.X + d1 = 0

    // put U0, U1, U2 into plane equation 1 to compute signed distances to the plane
    du0 = dot(N1, U0) + d1;
    du1 = dot(N1, U1) + d1;
    du2 = dot(N1, U2) + d1;

    du0du1 = du0 * du1;
    du0du2 = du0 * du2;

    if (du0du1 > 0.0 && du0du2 > 0.0)
        return false;

    //compute plane of triangle U0, U2, U2
    E1 = sub(U1, U0);
    E2 = sub(U2, U0);
    N2 = cross(E1, E2);
    //normalization?
    d2 = -dot(N2, U0);

    // plane equation 2: N2.X+d2=0

    // put V0, V1, V2 into plane equation 2
    dv0 = dot(N2, V0) + d2;
    dv1 = dot(N2, V1) + d2;
    dv2 = dot(N2, V2) + d2;

    dv0dv1 = dv0 * dv1;
    dv0dv2 = dv0 * dv2;

    if (dv0dv1 > 0.0 && dv0dv2 > 0.0)
        return false;

    //compute direction of intersection line
    D = cross(N1, N2);
    //compute index into the largest component of D
    maxVal = Math.abs(D[0]);
    b = Math.abs(D[1]);
    c = Math.abs(D[2]);
    if (b > maxVal) {
        maxVal = b;
        index = 1;
    }
    if (c > maxVal) {
        maxVal = c;
        index = 2;
    }

    // Projection onto athe axis correspoding to index
    // This corresponds to projection onto x, y, or z, whichver is closer to the direction of isectline D
    vp0 = V0[index], vp1 = V0[index], vp2 = V2[index];
    up0 = U0[index], up1 = U1[index], up2 = U2[index];

    let isect_first, isect_second, resArr;
    [resArr, coplanar] = compute_intervals_isectline(V0, V1, V2, vp0, vp1, vp2, dv0, dv1, dv2, dv0dv1, dv0dv2, isect1[0], isect1[1], isectpointA1, isectpointA2);

    [isect_first, isect_second, isectpointA1, isectpointA2] = resArr;
    isect1[0] = isect_first, isect1[1] = isect_second;

    //if they are coplanar:
    if (coplanar)
        return coplanar_tri_tri(N1, V0, V1, V2, U0, U1, U2);

    // compute interval for triangle 2
    [resArr, coplanar] = compute_intervals_isectline(U0, U1, U2, up0, up1, up2, du0, du1, du2, du0du1, du0du2, isect2[0], isect2[1], isectpointB1, isectpointB2);

    [isect_first, isect_second, isectpointB1, isectpointB2] = resArr;
    isect2[0] = isect_first, isect2[1] = isect_second;

    smallest1 = isect1.sort();
    smallest2 = isect2.sort();

    if (isect1[1] < isect2[0] || isect2[1] < isect1[0])
        return false;

    // if they intersect:
    return true;
}

function triangle_intersection_test(vertices) {
    return tri_tri_intersect_with_isectline(vertices[0], vertices[1], vertices[2], vertices[3], vertices[4], vertices[5]);
}


function output_object_file(filename, vertices, RGB) {
    const fs = require('fs');
    let entryData = "OFF\n\n6 2 6\n";
    let triangleConnections = ["3 0 1 2", "3 3 4 5"];

    let logStream = fs.createWriteStream(filename, { flags: 'w' });
    logStream.write(entryData)
    vertices.forEach(element => {
        verticeInfo = element[0] + " " + element[1] + " " + element[2] + "\n";
        logStream.write(verticeInfo);
    });

    let triangleConnection = "\n";
    let i = 0;

    RGB.forEach(triangleColor => {
        triangleConnection += triangleConnections[i];
        triangleColor.forEach(RGBComponent => {
            triangleConnection = triangleConnection + " " + RGBComponent;
        });
        ++i;
        triangleConnection += "\n";
    });
    logStream.write(triangleConnection);
}

function read_vertices_from_file(filename, filename_output, RGB) {
    const readline = require('readline');
    const fs = require('fs');

    let rl = readline.createInterface({
        input: fs.createReadStream(filename)
    });

    let vertices = [];
    rl.on('line', (line) => {
        vertice = line.split(" ");
        vertices.push(vertice.map(Number));
    }).on('close', () => {
        if (vertices.length != 6)
            throw 'You have to specify 6 vertices!';
        console.log("Outputting to", filename_output, "\n");
        output_object_file(filename_output, vertices, RGB);
        console.log("Intersection", triangle_intersection_test(vertices) ? "occurs" : "does not occur");

        return vertices;
    });
}


// Tests
/* // Nesikerta
let V0 = [1.102, 7.440, 5.820];
let V1 = [8.507, 9.527, 6.819];
let V3 = [0.233, 3.748, 2.091];
let U1 = [8.503, 5.923, 5.588];
let U2 = [4.003, 7.255, 7.132];
let U3 = [6.163, 3.036, 9.676];

console.log("Intersection", tri_tri_intersect_with_isectline(V0, V1, V3, U1, U2, U3) ? "occurs" : "does not occur");

// Kertasi
V0 = [7.664, 8.061, 5.590];
V1 = [2.576, 7.697, 2.495];
V3 = [6.088, 2.811, 1.195];
U1 = [3.712, 5.526, 1.875];
U2 = [9.694, 8.396, 4.380];
U3 = [8.589, 0.860, 1.667];

console.log("Intersection", tri_tri_intersect_with_isectline(V0, V1, V3, U1, U2, U3) ? "occurs" : "does not occur");

// Komplanarus bet nesikerta
V0 = [1, 1, 0];
V1 = [1, 5, 0];
V3 = [4, 1, 0];
U1 = [11, 1, 0];
U2 = [11, 5, 0];
U3 = [14, 1, 0];

console.log("Intersection", tri_tri_intersect_with_isectline(V0, V1, V3, U1, U2, U3) ? "occurs" : "does not occur");

// Komplanarus ir kertasi
V0 = [1, 1, 0];
V1 = [1, 5, 0];
V3 = [4, 1, 0];
U1 = [2, 1, 0];
U2 = [2, 5, 0];
U3 = [5, 1, 0];

console.log("Intersection", tri_tri_intersect_with_isectline(V0, V1, V3, U1, U2, U3) ? "occurs" : "does not occur");

console.log("Test false")
V0 = [0.243, 0.393, 0.755];
V1 = [0.434, 0.757, 0.958];
V2 = [0.907, 0.029, 0.915];
U1 = [0.891, 0.769, 0.822];
U2 = [0.674, 0.832, 0.756];
U3 = [0.622, 0.525, 0.231];
console.log(tri_tri_intersect_with_isectline(V0, V1, V2, U1, U2, U3));
V0 = [0.198, 0.519, 0.325];
V1 = [0.054, 0.393, 0.767];
V2 = [0.749, 0.923, 0.525];
U1 = [0.291, 0.009, 0.916];
U2 = [0.962, 0.205, 0.598];
U3 = [0.957, 0.391, 0.148];
console.log(tri_tri_intersect_with_isectline(V0, V1, V2, U1, U2, U3));
V0 = [0.945, 0.860, 0.482];
V1 = [0.353, 0.244, 0.013];
V2 = [0.107, 0.780, 0.612];
U1 = [0.007, 0.239, 0.987];
U2 = [0.835, 0.034, 0.553];
U3 = [0.368, 0.422, 0.815];
console.log(tri_tri_intersect_with_isectline(V0, V1, V2, U1, U2, U3));
V0 = [0.910, 0.435, 0.392];
V1 = [0.877, 0.168, 0.177];
V2 = [0.582, 0.544, 0.749];
U1 = [0.783, 0.932, 0.038];
U2 = [0.093, 0.038, 0.898];
U3 = [0.347, 0.700, 0.944];
console.log(tri_tri_intersect_with_isectline(V0, V1, V2, U1, U2, U3));
V0 = [0.818, 0.430, 0.798];
V1 = [0.380, 0.387, 0.626];
V2 = [0.957, 0.793, 0.827];
U1 = [0.220, 0.035, 0.617];
U2 = [0.613, 0.523, 0.958];
U3 = [0.379, 0.257, 0.425];
console.log(tri_tri_intersect_with_isectline(V0, V1, V2, U1, U2, U3));
console.log("Test true")
V0 = [6.087, 4.020, 1.830];
V1 = [6.921, 3.012, 3.967];
V3 = [6.818, 9.713, 4.930];
U1 = [5.352, 4.033, 5.671];
U2 = [1.547, 8.536, 7.705];
U3 = [7.832, 3.273, 0.601];
console.log(tri_tri_intersect_with_isectline(V0, V1, V3, U1, U2, U3));
V0 = [5.790, 9.870, 2.628];
V1 = [6.572, 4.942, 1.053];
V3 = [7.939, 2.860, 1.922];
U1 = [5.892, 5.015, 4.031];
U2 = [8.874, 9.951, 2.820];
U3 = [0.054, 5.089, 0.300];
console.log(tri_tri_intersect_with_isectline(V0, V1, V3, U1, U2, U3));
V0 = [2.122, 6.273, 3.155];
V1 = [7.787, 0.959, 6.768];
V3 = [0.618, 6.558, 0.444];
U1 = [0.911, 1.869, 1.445];
U2 = [2.562, 6.024, 9.916];
U3 = [4.275, 3.684, 1.813];
console.log(tri_tri_intersect_with_isectline(V0, V1, V3, U1, U2, U3));
V0 = [2.567, 6.464, 9.242];
V1 = [3.936, 9.506, 1.128];
V3 = [7.740, 2.365, 2.224];
U1 = [8.336, 1.585, 2.203];
U2 = [2.689, 4.811, 1.084];
U3 = [6.166, 3.953, 4.912];
console.log(tri_tri_intersect_with_isectline(V0, V1, V3, U1, U2, U3));
V0 = [8.761, 9.205, 3.480];
V1 = [4.238, 5.150, 7.019];
V3 = [1.680, 4.242, 0.266];
U1 = [7.164, 8.976, 6.716];
U2 = [8.464, 1.031, 7.496];
U3 = [0.182, 4.119, 3.625];
console.log(tri_tri_intersect_with_isectline(V0, V1, V3, U1, U2, U3)); */

let RGB = [
    [0, 0, 0],
    [255, 255, 0]
];
const inputFileName = "input.txt",
    outputFileName = "output.off";

console.log("Reading vertices from input file");
try {
    read_vertices_from_file(inputFileName, outputFileName, RGB);
} catch (e) {
    console.error(e);
}