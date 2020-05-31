# Triangle_intersection
## Triangle - triangle intersection test with OFF file output

### The program uses [Moller's](https://web.stanford.edu/class/cs277/resources/papers/Moller1997b.pdf) algorythm to detect the intersection of two triangles in 3D space.

Program reads coordinates of 6 vertices from input file, checks if the intersection occurs with the [Moller's](https://web.stanford.edu/class/cs277/resources/papers/Moller1997b.pdf) algorythm and generates *OFF* file. 

Input file *input.txt* example:
(The given numbers are the coordinates of triangle vertices)
```shell
0.818 0.430 0.798
0.380 0.387 0.626
0.957 0.793 0.827
0.220 0.035 0.617
0.613 0.523 0.958
0.379 0.257 0.425
```

Output file *output.off* example:
```shell
OFF

6 2 6
0.818 0.43 0.798
0.38 0.387 0.626
0.957 0.793 0.827
0.22 0.035 0.617
0.613 0.523 0.958
0.379 0.257 0.425

3 0 1 2 0 0 0
3 3 4 5 255 255 0
```
