#!/bin/bash

# Create exports directory if it doesn't exist
mkdir -p exports

# Create a list of files to include in the export
find . -type f -not -path "*/node_modules/*" -not -path "*/\.*" -not -path "*/drizzle/*" -not -path "*/exports/*" > ./exports/files_to_zip.txt

# Generate a clean list without attached assets for reference
cat ./exports/files_to_zip.txt | grep -v "^./attached_assets/" > ./exports/important_files.txt

# Create the export package
mkdir -p exports/smartcare_pro_export
cp -r client exports/smartcare_pro_export/
cp -r server exports/smartcare_pro_export/
cp -r shared exports/smartcare_pro_export/
cp -r docs exports/smartcare_pro_export/
cp package.json exports/smartcare_pro_export/
cp vite.config.ts exports/smartcare_pro_export/
cp tailwind.config.ts exports/smartcare_pro_export/
cp postcss.config.js exports/smartcare_pro_export/
cp drizzle.config.ts exports/smartcare_pro_export/
cp tsconfig.json exports/smartcare_pro_export/
cp theme.json exports/smartcare_pro_export/
cp CHANGELOG.md exports/smartcare_pro_export/

# Copy readme file
cp exports/ExportReadme.md exports/smartcare_pro_export/README.md

# Create a zip archive
cd exports
zip -r smartcare_pro_export.zip smartcare_pro_export
cd ..

echo "Export created at exports/smartcare_pro_export.zip"