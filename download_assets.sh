#!/bin/bash

# Create assets directory if it doesn't exist
mkdir -p assets

# Download placeholder images
curl -o assets/lettuce.png "https://placehold.co/64x64/90EE90/000000/png?text=Lettuce"
curl -o assets/tomato.png "https://placehold.co/64x64/FF0000/FFFFFF/png?text=Tomato"
curl -o assets/cucumber.png "https://placehold.co/64x64/32CD32/FFFFFF/png?text=Cucumber"
curl -o assets/dough.png "https://placehold.co/64x64/DEB887/000000/png?text=Dough"
curl -o assets/cheese.png "https://placehold.co/64x64/FFD700/000000/png?text=Cheese"
curl -o assets/bread.png "https://placehold.co/64x64/D2691E/FFFFFF/png?text=Bread"
curl -o assets/recipe-zone.png "https://placehold.co/200x200/CCCCCC/000000/png?text=Recipe+Zone"

# Make the script executable
chmod +x download_assets.sh 