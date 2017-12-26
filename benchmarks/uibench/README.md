# UI Benchmark: Inferno
The main purpose of this benchmark is to track performance regressions in Inferno's diffing algorithms.
This benchmark can also be used to understand how to optimize Inferno applications at application level.
In this benchmark we show how to use:
*   $NoNormalize ( When it's needed or not )
*   $HasKeyedChildren/$HasNonKeyedChildren ( Pre-defining children type )
*   linkEvent ( binding parameter to callback function )
*   onComponentShouldUpdate ( Functional component hook that behaves the same way as ES6 class equilevant )
*   Inferno.NO_OP ( Magic constant that can be returned from render to short circuit rendering process )
