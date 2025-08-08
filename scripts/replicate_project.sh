
#!/bin/bash

# SmartCare PRO Project Replication Script
# This script replicates the docs folder structure, content, and changelog

# Source and destination directories
SRC_PROJECT="./current_project"  # Replace with actual source path
DEST_PROJECT="./new_project"     # Replace with actual destination path

# Create base directories
echo "Creating base directory structure..."
mkdir -p "$DEST_PROJECT/docs"

# Copy docs folder with content
echo "Copying documentation files with content..."
cp -r "$SRC_PROJECT/docs"/* "$DEST_PROJECT/docs"/

# Copy changelog file
echo "Copying changelog file..."
cp "$SRC_PROJECT/CHANGELOG.md" "$DEST_PROJECT/CHANGELOG.md"

echo "Project structure replication complete!"
echo "Documentation and changelog have been copied successfully."
