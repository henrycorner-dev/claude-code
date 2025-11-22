#!/usr/bin/env python3
"""
Generate .gitignore file for Unity, Unreal Engine, or Godot projects.

Usage:
    python generate-gitignore.py unity
    python generate-gitignore.py unreal
    python generate-gitignore.py godot
"""

import sys
import os

UNITY_GITIGNORE = """# Unity generated files
[Ll]ibrary/
[Tt]emp/
[Oo]bj/
[Bb]uild/
[Bb]uilds/
[Ll]ogs/
[Uu]ser[Ss]ettings/

# MemoryCaptures
/[Mm]emoryCaptures/

# Asset meta files
*.pidb.meta
*.pdb.meta
*.mdb.meta

# Unity3D generated files
*.pidb
*.booproj
*.svd
*.pdb
*.mdb
*.opendb
*.VC.db

# Crash reports
sysinfo.txt

# VS/MD/Consulo solution and project files
[Ee]xportedObj/
.consulo/
*.csproj
*.unityproj
*.sln
*.suo
*.tmp
*.user
*.userprefs
*.pidb
*.booproj
*.svd
*.pdb
*.mdb
*.opendb
*.VC.db

# Unity3D test files
/[Tt]est[Rr]unner/
*.userSettings

# JetBrains Rider
.idea/
*.sln.iml

# Visual Studio cache
.vs/

# Gradle files (Android)
.gradle/

# macOS
.DS_Store

# Builds
*.apk
*.aab
*.unitypackage
*.app

# Crashlytics
crashlytics-build.properties

# Addressables
[Aa]ssets/[Aa]ddressable[Aa]ssets[Dd]ata/*/*.bin*

# Temporary Android Assets
[Aa]ssets/[Ss]treamingAssets/aa.meta
[Aa]ssets/[Ss]treamingAssets/aa/*
"""

UNREAL_GITIGNORE = """# Unreal Engine generated files
Binaries/
Build/
Intermediate/
Saved/
DerivedDataCache/

# Compiled source files
*.obj
*.pdb
*.pch
*.ipch

# Visual Studio files
.vs/
*.sln
*.VC.db
*.VC.opendb
*.suo
*.user

# Rider files
.idea/
*.sln.DotSettings.user

# macOS
.DS_Store

# Starter Content (optional - uncomment if not using)
# Content/StarterContent/

# Binary builds
*.exe
*.dll
*.dylib
*.so
*.pak

# Android
.gradle/
app/build/

# iOS
*.ipa
*.dSYM.zip
*.dSYM

# Windows
*.exp
*.lib
*.idb
*.pdb
"""

GODOT_GITIGNORE = """# Godot-specific ignores
.import/
export.cfg
export_presets.cfg

# Imported translations (generated)
*.translation

# Mono-specific ignores (if using C#)
.mono/
data_*/
mono_crash.*.json

# System/tool-specific ignores
.directory
.DS_Store
*.swp
*.swo
*~

# Build outputs
builds/
*.exe
*.pck
*.apk
*.aab
*.ipa
*.dmg
*.zip

# Android
.gradle/

# iOS
*.dSYM.zip
*.dSYM
"""

UNITY_GITATTRIBUTES = """# Unity YAML files (text)
*.mat merge=unityyamlmerge eol=lf
*.anim merge=unityyamlmerge eol=lf
*.unity merge=unityyamlmerge eol=lf
*.prefab merge=unityyamlmerge eol=lf
*.physicsMaterial2D merge=unityyamlmerge eol=lf
*.physicsMaterial merge=unityyamlmerge eol=lf
*.asset merge=unityyamlmerge eol=lf
*.meta merge=unityyamlmerge eol=lf
*.controller merge=unityyamlmerge eol=lf

# Git LFS - Images
*.png filter=lfs diff=lfs merge=lfs -text
*.jpg filter=lfs diff=lfs merge=lfs -text
*.jpeg filter=lfs diff=lfs merge=lfs -text
*.gif filter=lfs diff=lfs merge=lfs -text
*.psd filter=lfs diff=lfs merge=lfs -text
*.tga filter=lfs diff=lfs merge=lfs -text
*.tif filter=lfs diff=lfs merge=lfs -text
*.exr filter=lfs diff=lfs merge=lfs -text

# Git LFS - 3D Models
*.fbx filter=lfs diff=lfs merge=lfs -text
*.obj filter=lfs diff=lfs merge=lfs -text
*.blend filter=lfs diff=lfs merge=lfs -text
*.dae filter=lfs diff=lfs merge=lfs -text

# Git LFS - Audio
*.mp3 filter=lfs diff=lfs merge=lfs -text
*.wav filter=lfs diff=lfs merge=lfs -text
*.ogg filter=lfs diff=lfs merge=lfs -text

# Git LFS - Video
*.mp4 filter=lfs diff=lfs merge=lfs -text
*.mov filter=lfs diff=lfs merge=lfs -text

# Git LFS - Fonts
*.ttf filter=lfs diff=lfs merge=lfs -text
*.otf filter=lfs diff=lfs merge=lfs -text
"""

UNREAL_GITATTRIBUTES = """# Unreal Engine file types

# Git LFS - Assets
*.uasset filter=lfs diff=lfs merge=lfs -text
*.umap filter=lfs diff=lfs merge=lfs -text

# Git LFS - 3D Models
*.fbx filter=lfs diff=lfs merge=lfs -text
*.obj filter=lfs diff=lfs merge=lfs -text

# Git LFS - Textures
*.png filter=lfs diff=lfs merge=lfs -text
*.jpg filter=lfs diff=lfs merge=lfs -text
*.tga filter=lfs diff=lfs merge=lfs -text
*.exr filter=lfs diff=lfs merge=lfs -text
*.dds filter=lfs diff=lfs merge=lfs -text

# Git LFS - Audio
*.wav filter=lfs diff=lfs merge=lfs -text
*.mp3 filter=lfs diff=lfs merge=lfs -text
*.ogg filter=lfs diff=lfs merge=lfs -text

# Git LFS - Video
*.mp4 filter=lfs diff=lfs merge=lfs -text
*.mov filter=lfs diff=lfs merge=lfs -text

# Git LFS - Binary files
*.dll filter=lfs diff=lfs merge=lfs -text
*.exe filter=lfs diff=lfs merge=lfs -text

# Text files (no LFS)
*.cpp text eol=lf
*.h text eol=lf
*.cs text eol=lf
*.ini text eol=lf
*.json text eol=lf
"""

GODOT_GITATTRIBUTES = """# Git LFS - Large Assets
*.png filter=lfs diff=lfs merge=lfs -text
*.jpg filter=lfs diff=lfs merge=lfs -text
*.wav filter=lfs diff=lfs merge=lfs -text
*.ogg filter=lfs diff=lfs merge=lfs -text
*.mp3 filter=lfs diff=lfs merge=lfs -text
*.fbx filter=lfs diff=lfs merge=lfs -text
*.obj filter=lfs diff=lfs merge=lfs -text
*.blend filter=lfs diff=lfs merge=lfs -text

# Text files (no LFS)
*.gd text eol=lf
*.tscn text eol=lf
*.tres text eol=lf
*.cfg text eol=lf
*.md text eol=lf
"""

def generate_gitignore(engine):
    """Generate .gitignore and .gitattributes for specified engine."""

    if engine == "unity":
        gitignore_content = UNITY_GITIGNORE
        gitattributes_content = UNITY_GITATTRIBUTES
    elif engine == "unreal":
        gitignore_content = UNREAL_GITIGNORE
        gitattributes_content = UNREAL_GITATTRIBUTES
    elif engine == "godot":
        gitignore_content = GODOT_GITIGNORE
        gitattributes_content = GODOT_GITATTRIBUTES
    else:
        print(f"Error: Unknown engine '{engine}'")
        print("Valid engines: unity, unreal, godot")
        return False

    # Write .gitignore
    with open(".gitignore", "w") as f:
        f.write(gitignore_content.strip() + "\n")
    print(f"✓ Created .gitignore for {engine.capitalize()}")

    # Write .gitattributes
    with open(".gitattributes", "w") as f:
        f.write(gitattributes_content.strip() + "\n")
    print(f"✓ Created .gitattributes for {engine.capitalize()}")

    # Additional instructions
    print("\nNext steps:")
    print("1. Initialize Git: git init")
    print("2. Install Git LFS: git lfs install")
    print("3. Add files: git add .")
    print("4. Commit: git commit -m 'Initial commit'")

    if engine == "unity":
        print("\nUnity-specific:")
        print("- Edit → Project Settings → Editor")
        print("  - Version Control Mode: Visible Meta Files")
        print("  - Asset Serialization: Force Text")

    return True

def main():
    if len(sys.argv) != 2:
        print("Usage: python generate-gitignore.py <engine>")
        print("Engines: unity, unreal, godot")
        sys.exit(1)

    engine = sys.argv[1].lower()
    generate_gitignore(engine)

if __name__ == "__main__":
    main()
