#!/usr/bin/env python3
"""
Script to update all references from map.js to global.js
This script will:
1. Find all JavaScript files that import from map.js
2. Update the import statements to use global.js instead
3. Provide a summary of changes made
"""

import os
import re
import sys
from pathlib import Path

def update_file(file_path):
    """
    Update imports from map.js to global.js in a single file
    
    Args:
        file_path: Path to the file to update
        
    Returns:
        tuple: (was_modified, original_content, new_content)
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        original_content = f.read()
    
    # Pattern to match import statements from map.js
    # This will match:
    # - import { ... } from "./map.js"
    # - import { ... } from '../map.js'
    # - import ... from './map.js'
    # etc.
    pattern = r"(import\s+(?:{[^}]+}|\*\s+as\s+\w+|\w+)\s+from\s+['\"])(\.\./)*map\.js(['\"])"
    
    # Replace with global.js, preserving the relative path structure
    new_content = re.sub(
        pattern,
        r'\1\2global.js\3',
        original_content
    )
    
    was_modified = original_content != new_content
    
    if was_modified:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
    
    return was_modified, original_content, new_content

def find_js_files(root_dir):
    """
    Find all JavaScript files in the given directory
    
    Args:
        root_dir: Root directory to search
        
    Returns:
        list: List of Path objects for .js files
    """
    js_files = []
    root_path = Path(root_dir)
    
    for file_path in root_path.rglob('*.js'):
        # Skip node_modules and other common excluded directories
        if any(part in file_path.parts for part in ['node_modules', '.git', 'dist', 'build']):
            continue
        js_files.append(file_path)
    
    return js_files

def main():
    """Main function to orchestrate the update process"""
    # Get the script's directory (should be the repo root)
    script_dir = Path(__file__).parent
    
    print("=" * 60)
    print("Map.js to Global.js Reference Updater")
    print("=" * 60)
    print()
    
    # Find all JavaScript files
    print(f"Searching for JavaScript files in: {script_dir}")
    js_files = find_js_files(script_dir)
    print(f"Found {len(js_files)} JavaScript files")
    print()
    
    # Track statistics
    files_modified = 0
    total_replacements = 0
    modified_files = []
    
    # Process each file
    for file_path in js_files:
        was_modified, original, new = update_file(file_path)
        
        if was_modified:
            files_modified += 1
            relative_path = file_path.relative_to(script_dir)
            modified_files.append(str(relative_path))
            
            # Count number of replacements
            import_count_before = original.count('from "./map.js"') + original.count("from './map.js'") + \
                                 original.count('from "../map.js"') + original.count("from '../map.js'")
            total_replacements += import_count_before
            
            print(f"✓ Updated: {relative_path}")
            print(f"  - Replaced {import_count_before} import statement(s)")
    
    # Print summary
    print()
    print("=" * 60)
    print("Summary")
    print("=" * 60)
    print(f"Files scanned: {len(js_files)}")
    print(f"Files modified: {files_modified}")
    print(f"Total import statements updated: {total_replacements}")
    print()
    
    if modified_files:
        print("Modified files:")
        for file_path in modified_files:
            print(f"  - {file_path}")
        print()
        print("✓ All references updated successfully!")
    else:
        print("No files needed updating.")
    
    return 0 if files_modified > 0 else 1

if __name__ == "__main__":
    sys.exit(main())
