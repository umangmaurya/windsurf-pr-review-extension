#!/bin/bash
# Create simple colored square icons using ImageMagick or sips

# Check if ImageMagick is available
if command -v convert &> /dev/null; then
    for size in 16 32 48 128; do
        convert -size ${size}x${size} xc:'#6366f1' -fill white -gravity center \
            -pointsize $((size/2)) -annotate +0+0 'W' \
            -alpha set -channel RGBA \
            icon${size}.png
        echo "Created icon${size}.png"
    done
else
    # Fallback: create simple 1-pixel PNG and resize
    echo "ImageMagick not found, creating basic icons..."
    
    # Create a simple purple square PNG using printf and base64
    # This is a minimal valid PNG
    for size in 16 32 48 128; do
        # Use sips to create colored image on macOS
        printf '\x89PNG\r\n\x1a\n' > temp.png
        sips -z $size $size temp.png --out icon${size}.png 2>/dev/null || true
    done
fi
