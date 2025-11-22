# Build Pipelines for Game Engines

Complete guide to building game projects for multiple platforms (iOS, Android, Windows, Mac, Linux, consoles) and setting up CI/CD pipelines for Unity, Unreal Engine, and Godot.

## Platform Overview

### Target Platforms

**Mobile:**
- iOS (iPhone, iPad)
- Android (phones, tablets)

**Desktop:**
- Windows (DirectX, Vulkan)
- macOS (Metal)
- Linux (Vulkan, OpenGL)

**Console:**
- PlayStation 5
- Xbox Series X/S
- Nintendo Switch

**Web:**
- WebGL (Unity, Godot)
- HTML5

**VR/AR:**
- Meta Quest
- PlayStation VR2
- Apple Vision Pro

### Platform Requirements

**iOS:**
- Mac with Xcode
- Apple Developer account ($99/year)
- Provisioning profiles and certificates

**Android:**
- Android SDK and NDK
- Java JDK
- Keystore for signing

**Console:**
- Platform-specific SDK (requires approval and NDA)
- Development kit hardware
- Publisher/developer license

## Unity Build Configuration

### Player Settings

```
Edit → Project Settings → Player
```

**Cross-Platform Settings:**
```
Company Name: YourCompany
Product Name: GameName
Version: 1.0.0
Default Icon: (512x512 PNG)
Default Cursor: (optional)
```

### Windows Build

**Player Settings → PC, Mac & Linux Standalone:**
```
Architecture: x86_64 (64-bit)
Fullscreen Mode: Fullscreen Window
Default Screen Width: 1920
Default Screen Height: 1080
Resizable Window: True
```

**Build:**
```
File → Build Settings
Platform: Windows
Architecture: x86_64
Click "Build" or "Build And Run"
```

**Command-line build:**
```bash
Unity -quit -batchmode \
  -projectPath /path/to/project \
  -buildTarget Win64 \
  -buildWindows64Player /path/to/output/Game.exe
```

### macOS Build

**Player Settings → Mac:**
```
Bundle Identifier: com.yourcompany.gamename
Signing Team ID: (from Apple Developer)
```

**Build:**
```
Platform: Mac
Architecture: Intel 64-bit or Apple Silicon
Click "Build"
```

**Command-line:**
```bash
Unity -quit -batchmode \
  -projectPath /path/to/project \
  -buildTarget StandaloneOSX \
  -buildOSXUniversalPlayer /path/to/output/Game.app
```

### Linux Build

**Build:**
```
Platform: Linux
Architecture: x86_64
Click "Build"
```

**Command-line:**
```bash
Unity -quit -batchmode \
  -projectPath /path/to/project \
  -buildTarget StandaloneLinux64 \
  -buildLinux64Player /path/to/output/Game.x86_64
```

### iOS Build

**Player Settings → iOS:**
```
Bundle Identifier: com.yourcompany.gamename
Signing Team ID: (from Apple Developer)
Target SDK: Device SDK
Target minimum iOS Version: 12.0
Architecture: ARM64
```

**Build:**
```
Platform: iOS
Click "Build"
Opens Xcode project → Build and run from Xcode
```

**Automation with Fastlane:**
```ruby
# Fastfile
lane :build do
  gym(
    workspace: "Unity-iPhone.xcworkspace",
    scheme: "Unity-iPhone",
    export_method: "ad-hoc"
  )
end
```

### Android Build

**Player Settings → Android:**
```
Package Name: com.yourcompany.gamename
Version: 1.0.0
Bundle Version Code: 1
Minimum API Level: 21 (Android 5.0)
Target API Level: 33 (Android 13)
Scripting Backend: IL2CPP
Target Architectures: ARM64
```

**Keystore Setup:**
```
Publishing Settings → Keystore Manager
  → Create New Keystore
  Password: (secure password)
  Alias: (key alias)
  Password: (secure password)
```

**Build:**
```
Platform: Android
Build App Bundle (AAB): For Google Play
Build APK: For testing/sideloading
Click "Build"
```

**Command-line:**
```bash
Unity -quit -batchmode \
  -projectPath /path/to/project \
  -buildTarget Android \
  -executeMethod BuildScript.BuildAndroid
```

**BuildScript.cs:**
```csharp
using UnityEditor;

public class BuildScript
{
    public static void BuildAndroid()
    {
        string[] scenes = { "Assets/Scenes/MainMenu.unity", "Assets/Scenes/Game.unity" };
        string buildPath = "Builds/Android/game.apk";

        BuildPlayerOptions options = new BuildPlayerOptions
        {
            scenes = scenes,
            locationPathName = buildPath,
            target = BuildTarget.Android,
            options = BuildOptions.None
        };

        BuildPipeline.BuildPlayer(options);
    }
}
```

### WebGL Build

**Player Settings → WebGL:**
```
Compression Format: Gzip or Brotli
Memory Size: 512 MB (or more for complex games)
```

**Build:**
```
Platform: WebGL
Click "Build"
Upload generated folder to web server
```

**Hosting:**
- Upload to itch.io, Newgrounds, or own server
- Serve with correct MIME types (WASM, gzip)

## Unreal Engine Build Configuration

### Project Settings

```
Edit → Project Settings → Project → Description
  Project Name: GameName
  Company Name: YourCompany
  Homepage: yourwebsite.com
  Project Version: 1.0.0
```

### Windows Build

**Project Settings → Platforms → Windows:**
```
Target RHIs: DirectX 12, DirectX 11
Default RHI: DirectX 12
```

**Package:**
```
File → Package Project → Windows → Windows (64-bit)
Choose output directory
Wait for packaging (can take 10-60 minutes)
```

**Command-line (RunUAT):**
```bash
RunUAT BuildCookRun \
  -project="C:/Projects/MyGame/MyGame.uproject" \
  -platform=Win64 \
  -clientconfig=Shipping \
  -serverconfig=Shipping \
  -cook \
  -allmaps \
  -build \
  -stage \
  -pak \
  -archive \
  -archivedirectory="C:/Builds/Windows"
```

### macOS Build

**Requirements:**
- Mac for signing (can build on Windows with cross-compile)

**Package:**
```
File → Package Project → Mac
Choose output directory
```

**Command-line:**
```bash
RunUAT BuildCookRun \
  -project="MyGame.uproject" \
  -platform=Mac \
  -clientconfig=Shipping \
  -cook -allmaps -build -stage -pak -archive
```

### iOS Build

**Project Settings → Platforms → iOS:**
```
Bundle Identifier: com.yourcompany.gamename
Mobile Provision: (upload provision file)
Certificate: (upload certificate)
```

**Package:**
```
File → Package Project → iOS
Builds Xcode project
Open in Xcode and build to device
```

### Android Build

**Project Settings → Platforms → Android:**
```
Package Name: com.yourcompany.gamename
Store Version: 1
Store Version Name: 1.0.0
Minimum SDK Version: 21
Target SDK Version: 31
```

**Install Android SDK:**
```
Edit → Project Settings → Platforms → Android SDK
Set paths:
  Android SDK: /path/to/android-sdk
  Android NDK: /path/to/ndk
  Java: /path/to/jdk
```

**Keystore:**
```
Distribution Signing:
  Key Store: (path to keystore)
  Key Alias: (alias)
  Passwords: (enter passwords)
```

**Package:**
```
File → Package Project → Android → Android (ASTC)
Outputs APK or AAB
```

### Console Builds

**Requirements:**
- Platform-specific SDK (PlayStation, Xbox, Switch)
- Signed NDA with platform holder
- Development kit hardware

**General workflow:**
1. Install platform SDK
2. Configure Project Settings → Platforms → [Platform]
3. Package Project → [Platform]
4. Deploy to devkit hardware

## Godot Build Configuration

### Export Templates

**Install export templates:**
```
Editor → Manage Export Templates → Download and Install
```

### Windows Export

**Project → Export:**
1. Add → Windows Desktop
2. Configure:
   - Runnable: True
   - Export Path: builds/windows/game.exe
3. Click "Export Project"

**Command-line:**
```bash
godot --export "Windows Desktop" builds/windows/game.exe
```

### Linux Export

**Project → Export:**
1. Add → Linux/X11
2. Export Path: builds/linux/game.x86_64
3. Export Project

**Command-line:**
```bash
godot --export "Linux/X11" builds/linux/game.x86_64
```

### macOS Export

**Project → Export:**
1. Add → Mac OSX
2. Export Path: builds/mac/game.zip
3. Export Project

**Command-line:**
```bash
godot --export "Mac OSX" builds/mac/game.zip
```

### Android Export

**Setup Android SDK:**
```
Editor → Editor Settings → Export → Android
  Android SDK Path: /path/to/android-sdk
  Debug Keystore: (path)
```

**Project → Export:**
1. Add → Android
2. Configure:
   - Package → Unique Name: com.yourcompany.gamename
   - Version → Code: 1
   - Version → Name: 1.0.0
3. Export Project

**Command-line:**
```bash
godot --export "Android" builds/android/game.apk
```

### iOS Export

**Requirements:**
- Xcode installed
- Apple Developer account

**Project → Export:**
1. Add → iOS
2. Configure:
   - Application → Bundle Identifier: com.yourcompany.gamename
   - Application → Provisioning Profile: (select profile)
3. Export Project (creates Xcode project)
4. Open in Xcode and build

### Web (HTML5) Export

**Project → Export:**
1. Add → HTML5
2. Export Path: builds/web/index.html
3. Export Project

**Host on web server:**
```bash
cd builds/web
python3 -m http.server 8000
# Visit http://localhost:8000
```

## Build Optimization

### Reduce Build Size

**Unity:**
```
Player Settings → Other Settings
  Managed Stripping Level: High (IL2CPP)
  Strip Engine Code: True
  Optimization: Size

Player Settings → Publishing Settings
  Compression Method: LZ4 or LZ4HC

Use Addressables for on-demand asset loading
```

**Unreal:**
```
Project Settings → Packaging
  Create compressed cooked packages: True
  Use Pak File: True

Project Settings → Cooking
  Exclude editor content: True

Use LODs and HLOD
Remove unused assets
```

**Godot:**
```
Project → Export → Resources
  Filters to export non-resource files: (specify only needed files)

Export → Features
  Remove unused features
```

### Optimize Texture Compression

**Unity:**
- Android: ASTC
- iOS: ASTC
- Desktop: DXT (BC7)

**Unreal:**
- Use high-quality texture compression
- LOD Bias for distant textures

**Godot:**
- Import → Compress: VRAM Compressed
- Detect 3D: True (for 3D textures)

## CI/CD Pipelines

### GitHub Actions for Unity

**.github/workflows/build.yml:**
```yaml
name: Build Unity Project

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
        with:
          lfs: true

      - uses: actions/cache@v3
        with:
          path: Library
          key: Library-${{ hashFiles('Assets/**', 'Packages/**', 'ProjectSettings/**') }}
          restore-keys: Library-

      - uses: game-ci/unity-builder@v2
        env:
          UNITY_LICENSE: ${{ secrets.UNITY_LICENSE }}
        with:
          targetPlatform: StandaloneWindows64
          buildName: MyGame

      - uses: actions/upload-artifact@v3
        with:
          name: Build
          path: build
```

**Obtain Unity license:**
```bash
# Generate activation file
unity-editor -quit -batchmode -nographics -createManualActivationFile

# Upload .alf file to https://license.unity3d.com
# Download .ulf license file
# Add as UNITY_LICENSE secret in GitHub
```

### GitLab CI for Unreal

**.gitlab-ci.yml:**
```yaml
stages:
  - build

build-windows:
  stage: build
  tags:
    - windows
    - unreal
  script:
    - |
      RunUAT.bat BuildCookRun `
        -project="%CI_PROJECT_DIR%/MyGame.uproject" `
        -platform=Win64 `
        -clientconfig=Shipping `
        -cook -build -stage -pak -archive
  artifacts:
    paths:
      - Saved/StagedBuilds/WindowsNoEditor
```

### Jenkins for Multi-Platform

**Jenkinsfile:**
```groovy
pipeline {
    agent any

    stages {
        stage('Build Windows') {
            steps {
                bat 'Unity -quit -batchmode -buildTarget Win64 -executeMethod BuildScript.BuildWindows'
            }
        }

        stage('Build macOS') {
            agent { label 'macos' }
            steps {
                sh 'Unity -quit -batchmode -buildTarget StandaloneOSX -executeMethod BuildScript.BuildMac'
            }
        }

        stage('Build Android') {
            steps {
                bat 'Unity -quit -batchmode -buildTarget Android -executeMethod BuildScript.BuildAndroid'
            }
        }

        stage('Archive Builds') {
            steps {
                archiveArtifacts artifacts: 'Builds/**', fingerprint: true
            }
        }
    }
}
```

### Docker for Unity Builds

**Dockerfile:**
```dockerfile
FROM unityci/editor:ubuntu-2022.3.10f1-windows-mono-1.0.1

WORKDIR /project

COPY . .

RUN unity-editor \
    -quit \
    -batchmode \
    -nographics \
    -projectPath /project \
    -buildTarget StandaloneWindows64 \
    -buildWindows64Player /project/Builds/game.exe
```

**Build:**
```bash
docker build -t unity-build .
docker run -v $(pwd):/project unity-build
```

## Build Automation Scripts

### Unity Build Script

**Assets/Editor/BuildScript.cs:**
```csharp
using UnityEditor;
using UnityEngine;

public class BuildScript
{
    static string[] GetScenes()
    {
        return new string[]
        {
            "Assets/Scenes/MainMenu.unity",
            "Assets/Scenes/Game.unity"
        };
    }

    [MenuItem("Build/Build All Platforms")]
    public static void BuildAll()
    {
        BuildWindows();
        BuildMac();
        BuildLinux();
        BuildAndroid();
    }

    public static void BuildWindows()
    {
        BuildPlayerOptions options = new BuildPlayerOptions
        {
            scenes = GetScenes(),
            locationPathName = "Builds/Windows/Game.exe",
            target = BuildTarget.StandaloneWindows64,
            options = BuildOptions.None
        };

        BuildPipeline.BuildPlayer(options);
    }

    public static void BuildMac()
    {
        BuildPlayerOptions options = new BuildPlayerOptions
        {
            scenes = GetScenes(),
            locationPathName = "Builds/Mac/Game.app",
            target = BuildTarget.StandaloneOSX,
            options = BuildOptions.None
        };

        BuildPipeline.BuildPlayer(options);
    }

    public static void BuildLinux()
    {
        BuildPlayerOptions options = new BuildPlayerOptions
        {
            scenes = GetScenes(),
            locationPathName = "Builds/Linux/Game.x86_64",
            target = BuildTarget.StandaloneLinux64,
            options = BuildOptions.None
        };

        BuildPipeline.BuildPlayer(options);
    }

    public static void BuildAndroid()
    {
        BuildPlayerOptions options = new BuildPlayerOptions
        {
            scenes = GetScenes(),
            locationPathName = "Builds/Android/Game.apk",
            target = BuildTarget.Android,
            options = BuildOptions.None
        };

        BuildPipeline.BuildPlayer(options);
    }
}
```

### Godot Build Script

**build.sh:**
```bash
#!/bin/bash

GODOT="/path/to/godot"
PROJECT="project.godot"

echo "Building Windows..."
$GODOT --export "Windows Desktop" builds/windows/game.exe

echo "Building Linux..."
$GODOT --export "Linux/X11" builds/linux/game.x86_64

echo "Building Mac..."
$GODOT --export "Mac OSX" builds/mac/game.zip

echo "Building Android..."
$GODOT --export "Android" builds/android/game.apk

echo "All builds complete!"
```

## Troubleshooting

**Unity - Build fails:**
- Check Console for errors
- Ensure all scenes added to Build Settings
- Verify platform module installed (Unity Hub → Installs → Add Modules)

**Unreal - Packaging fails:**
- Check Output Log (Window → Developer Tools → Output Log)
- Clear Intermediate and Saved folders
- Regenerate project files
- Ensure all assets have valid references

**Godot - Export fails:**
- Check Output tab for errors
- Ensure export templates installed for engine version
- Verify Android SDK/NDK paths correct

**Android - Keystore issues:**
- Use consistent keystore for updates (can't change)
- Keep keystore password secure
- Backup keystore (losing it means can't update app)

**iOS - Provisioning errors:**
- Ensure Bundle ID matches provisioning profile
- Certificates not expired
- Device UDID registered for ad-hoc builds

## Further Reading

- **Unity Build Pipeline**: Scriptable Build Pipeline, Addressables
- **Unreal Automation Tool (UAT)**: Advanced build automation
- **Steam Partner Documentation**: Publishing to Steam
- **App Store Connect Guide**: Publishing to iOS App Store
- **Google Play Console Guide**: Publishing to Android Play Store

## See Also

- `unity-setup.md` - Unity project configuration
- `unreal-setup.md` - Unreal project configuration
- `version-control.md` - Git setup for game projects
- `performance.md` - Build optimization techniques
