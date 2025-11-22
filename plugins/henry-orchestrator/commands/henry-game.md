---
description: Initializes game project (Unity/Godot/Unreal); sets up core loop.
allowed-tools: ['Write', 'Read', 'Bash', 'AskUserQuestion']
---

You are tasked with initializing a new game development project. Follow these steps:

## 1. Determine Game Engine

First, ask the user which game engine they want to use:

- Unity
- Godot
- Unreal Engine

## 2. Project Setup

Based on the selected engine, initialize the project:

### For Unity:

- Create the project directory structure
- Set up `.gitignore` for Unity projects (Library/, Temp/, Obj/, Build/, Builds/, Logs/, UserSettings/)
- Create basic project structure with Assets/, ProjectSettings/, Packages/
- Set up a README.md with project information

### For Godot:

- Create the project directory structure
- Set up `.gitignore` for Godot projects (.import/, export/, _.translation, .mono/, data\__/)
- Create `project.godot` configuration file
- Set up basic scene structure
- Create a README.md with project information

### For Unreal Engine:

- Create the project directory structure
- Set up `.gitignore` for Unreal projects (Binaries/, DerivedDataCache/, Intermediate/, Saved/, _.sln, _.suo, etc.)
- Create basic .uproject file structure
- Set up Source/ and Content/ directories
- Create a README.md with project information

## 3. Core Game Loop Setup

After initializing the project, create a basic core game loop structure:

### For Unity (C#):

- Create a GameManager script with basic game states (MainMenu, Playing, Paused, GameOver)
- Set up a simple Update loop structure
- Add comments for initialization, input handling, update logic, and rendering phases

### For Godot (GDScript):

- Create a GameManager node script with basic game states
- Set up `_ready()`, `_process()`, and `_physics_process()` functions
- Add structure for input handling, game logic, and scene management

### For Unreal Engine (C++ or Blueprints):

- Create a GameMode class
- Set up basic game states
- Create Tick function structure for the core loop
- Add comments for BeginPlay, input handling, and game logic phases

## 4. Additional Setup

- Create a basic project structure for assets (sprites/models, audio, scripts/code, scenes/levels)
- Add a basic .gitattributes file if needed for LFS (Large File Storage) for binary assets
- Initialize git repository if not already done
- Create initial commit with the project structure

## Output

After setup is complete:

1. Show the created directory structure
2. List the files that were created
3. Provide next steps for the developer (how to open the project in their chosen engine, where to add game logic, etc.)
4. Suggest best practices for the chosen engine
