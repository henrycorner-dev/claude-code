extends KinematicBody

"""
Basic player controller for Godot 3.x with movement, jumping, and camera control.
Attach to KinematicBody node with CollisionShape and Camera as child.
"""

# Movement
export var move_speed: float = 5.0
export var sprint_speed: float = 8.0
export var acceleration: float = 10.0
export var deceleration: float = 10.0

# Jumping
export var jump_height: float = 5.0
export var gravity: float = 20.0

# Mouse look
export var mouse_sensitivity: float = 0.3
export var max_look_angle: float = 90.0

# Camera
onready var camera: Camera = $Camera

# State
var velocity: Vector3 = Vector3.ZERO
var rotation_x: float = 0.0

func _ready():
	# Capture mouse
	Input.set_mouse_mode(Input.MOUSE_MODE_CAPTURED)

func _physics_process(delta):
	handle_movement(delta)
	handle_jumping(delta)

func _input(event):
	if event is InputEventMouseMotion and Input.get_mouse_mode() == Input.MOUSE_MODE_CAPTURED:
		handle_camera_rotation(event)

func handle_movement(delta):
	# Get input direction
	var input_dir = Vector3.ZERO
	input_dir.x = Input.get_action_strength("move_right") - Input.get_action_strength("move_left")
	input_dir.z = Input.get_action_strength("move_back") - Input.get_action_strength("move_forward")
	input_dir = input_dir.normalized()

	# Transform to local direction
	input_dir = input_dir.rotated(Vector3.UP, rotation.y)

	# Sprint
	var current_speed = sprint_speed if Input.is_action_pressed("sprint") else move_speed

	# Target velocity
	var target_velocity = input_dir * current_speed

	# Interpolate horizontal velocity
	if input_dir.length() > 0:
		velocity.x = lerp(velocity.x, target_velocity.x, acceleration * delta)
		velocity.z = lerp(velocity.z, target_velocity.z, acceleration * delta)
	else:
		velocity.x = lerp(velocity.x, 0.0, deceleration * delta)
		velocity.z = lerp(velocity.z, 0.0, deceleration * delta)

	# Move
	velocity = move_and_slide(velocity, Vector3.UP)

func handle_jumping(delta):
	# Gravity
	if not is_on_floor():
		velocity.y -= gravity * delta
	else:
		velocity.y = -0.01  # Small downward force

	# Jump
	if Input.is_action_just_pressed("jump") and is_on_floor():
		velocity.y = jump_height

func handle_camera_rotation(event: InputEventMouseMotion):
	# Horizontal rotation (player)
	rotate_y(deg2rad(-event.relative.x * mouse_sensitivity))

	# Vertical rotation (camera)
	rotation_x -= event.relative.y * mouse_sensitivity
	rotation_x = clamp(rotation_x, -max_look_angle, max_look_angle)
	camera.rotation_degrees.x = rotation_x

func _unhandled_input(event):
	# Toggle mouse capture
	if event.is_action_pressed("ui_cancel"):
		if Input.get_mouse_mode() == Input.MOUSE_MODE_CAPTURED:
			Input.set_mouse_mode(Input.MOUSE_MODE_VISIBLE)
		else:
			Input.set_mouse_mode(Input.MOUSE_MODE_CAPTURED)
