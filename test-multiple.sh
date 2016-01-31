#!/bin/bash

# exit on error or if a variable is not defined
set -o errexit
set -o nounset

echo Generating cats
node 'test-multiple.js'

echo Arranging cats
convert +append output-grid-{1..4}.png output-grid-row1.png
convert +append output-grid-{5..8}.png output-grid-row2.png
convert +append output-grid-{9..12}.png output-grid-row3.png
convert +append output-grid-{13..16}.png output-grid-row4.png
convert -append output-grid-row{1..4}.png output-grid.png

echo Tidying up
rm output-grid-*.png
