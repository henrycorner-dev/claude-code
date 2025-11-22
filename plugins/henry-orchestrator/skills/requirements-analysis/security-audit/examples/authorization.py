"""
Authorization Implementation Examples
Demonstrates secure authorization patterns (RBAC, ABAC)
"""

from enum import Enum
from typing import Set, Dict, Any, Optional, Callable
from dataclasses import dataclass
from functools import wraps


# Role-Based Access Control (RBAC)
class Role(Enum):
    """User roles"""
    GUEST = 'guest'
    USER = 'user'
    MODERATOR = 'moderator'
    ADMIN = 'admin'
    SUPER_ADMIN = 'super_admin'


class Permission(Enum):
    """System permissions"""
    # Content permissions
    READ_PUBLIC = 'read_public'
    READ_PRIVATE = 'read_private'
    CREATE_CONTENT = 'create_content'
    EDIT_OWN_CONTENT = 'edit_own_content'
    EDIT_ANY_CONTENT = 'edit_any_content'
    DELETE_OWN_CONTENT = 'delete_own_content'
    DELETE_ANY_CONTENT = 'delete_any_content'

    # User management
    VIEW_USERS = 'view_users'
    EDIT_USER_PROFILE = 'edit_user_profile'
    BAN_USER = 'ban_user'

    # System administration
    MANAGE_ROLES = 'manage_roles'
    VIEW_LOGS = 'view_logs'
    SYSTEM_CONFIG = 'system_config'


# Role-Permission mapping
ROLE_PERMISSIONS: Dict[Role, Set[Permission]] = {
    Role.GUEST: {
        Permission.READ_PUBLIC,
    },
    Role.USER: {
        Permission.READ_PUBLIC,
        Permission.READ_PRIVATE,
        Permission.CREATE_CONTENT,
        Permission.EDIT_OWN_CONTENT,
        Permission.DELETE_OWN_CONTENT,
    },
    Role.MODERATOR: {
        Permission.READ_PUBLIC,
        Permission.READ_PRIVATE,
        Permission.CREATE_CONTENT,
        Permission.EDIT_OWN_CONTENT,
        Permission.EDIT_ANY_CONTENT,
        Permission.DELETE_OWN_CONTENT,
        Permission.DELETE_ANY_CONTENT,
        Permission.VIEW_USERS,
        Permission.BAN_USER,
    },
    Role.ADMIN: {
        Permission.READ_PUBLIC,
        Permission.READ_PRIVATE,
        Permission.CREATE_CONTENT,
        Permission.EDIT_OWN_CONTENT,
        Permission.EDIT_ANY_CONTENT,
        Permission.DELETE_OWN_CONTENT,
        Permission.DELETE_ANY_CONTENT,
        Permission.VIEW_USERS,
        Permission.EDIT_USER_PROFILE,
        Permission.BAN_USER,
        Permission.MANAGE_ROLES,
        Permission.VIEW_LOGS,
    },
    Role.SUPER_ADMIN: set(Permission),  # All permissions
}


@dataclass
class User:
    """User model"""
    id: int
    username: str
    role: Role
    department: Optional[str] = None


@dataclass
class Resource:
    """Generic resource model"""
    id: int
    owner_id: int
    type: str
    department: Optional[str] = None
    is_public: bool = False


class RBACAuthorizer:
    """Role-Based Access Control implementation"""

    @staticmethod
    def has_permission(user: User, permission: Permission) -> bool:
        """Check if user has specific permission"""
        if not user:
            return False

        role_perms = ROLE_PERMISSIONS.get(user.role, set())
        return permission in role_perms

    @staticmethod
    def has_any_permission(user: User, permissions: Set[Permission]) -> bool:
        """Check if user has any of the specified permissions"""
        if not user:
            return False

        role_perms = ROLE_PERMISSIONS.get(user.role, set())
        return bool(role_perms & permissions)

    @staticmethod
    def has_all_permissions(user: User, permissions: Set[Permission]) -> bool:
        """Check if user has all specified permissions"""
        if not user:
            return False

        role_perms = ROLE_PERMISSIONS.get(user.role, set())
        return permissions.issubset(role_perms)

    @staticmethod
    def can_access_resource(user: User, resource: Resource, action: str) -> bool:
        """
        Check if user can perform action on resource
        Combines role permissions with ownership checks
        """
        # Public resources readable by all
        if action == 'read' and resource.is_public:
            return True

        # Check role-based permissions first
        permission_map = {
            'read': Permission.READ_PRIVATE,
            'create': Permission.CREATE_CONTENT,
            'edit': Permission.EDIT_ANY_CONTENT,
            'delete': Permission.DELETE_ANY_CONTENT,
        }

        required_permission = permission_map.get(action)
        if not required_permission:
            return False

        # Check if user has permission for any resource
        if RBACAuthorizer.has_permission(user, required_permission):
            return True

        # Check ownership for own resources
        if resource.owner_id == user.id:
            own_permission_map = {
                'edit': Permission.EDIT_OWN_CONTENT,
                'delete': Permission.DELETE_OWN_CONTENT,
            }
            own_permission = own_permission_map.get(action)
            if own_permission and RBACAuthorizer.has_permission(user, own_permission):
                return True

        return False


# Decorators for Flask/FastAPI
def require_permission(permission: Permission):
    """Decorator to require specific permission"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Get user from request context
            # user = get_current_user()
            user = kwargs.get('user')  # For demonstration

            if not user or not RBACAuthorizer.has_permission(user, permission):
                raise PermissionError("Insufficient permissions")

            return f(*args, **kwargs)
        return decorated_function
    return decorator


def require_role(role: Role):
    """Decorator to require specific role"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Get user from request context
            user = kwargs.get('user')  # For demonstration

            if not user or user.role != role:
                raise PermissionError("Insufficient permissions")

            return f(*args, **kwargs)
        return decorated_function
    return decorator


# Attribute-Based Access Control (ABAC)
@dataclass
class AccessContext:
    """Context for access control decision"""
    user: User
    resource: Resource
    action: str
    environment: Dict[str, Any]


class Policy:
    """Base policy class"""

    def evaluate(self, context: AccessContext) -> bool:
        """Evaluate if access should be granted"""
        raise NotImplementedError


class OwnershipPolicy(Policy):
    """Allow access to own resources"""

    def evaluate(self, context: AccessContext) -> bool:
        return context.resource.owner_id == context.user.id


class RolePolicy(Policy):
    """Allow access based on role"""

    def __init__(self, required_role: Role):
        self.required_role = required_role

    def evaluate(self, context: AccessContext) -> bool:
        return context.user.role == self.required_role


class AdminPolicy(Policy):
    """Allow access for admins"""

    def evaluate(self, context: AccessContext) -> bool:
        return context.user.role in {Role.ADMIN, Role.SUPER_ADMIN}


class DepartmentPolicy(Policy):
    """Allow access within same department"""

    def evaluate(self, context: AccessContext) -> bool:
        if not context.user.department or not context.resource.department:
            return False
        return context.user.department == context.resource.department


class TimeBasedPolicy(Policy):
    """Allow access during business hours"""

    def __init__(self, start_hour: int = 9, end_hour: int = 17):
        self.start_hour = start_hour
        self.end_hour = end_hour

    def evaluate(self, context: AccessContext) -> bool:
        from datetime import datetime
        hour = datetime.now().hour
        return self.start_hour <= hour < self.end_hour


class IPWhitelistPolicy(Policy):
    """Allow access from whitelisted IPs"""

    def __init__(self, allowed_ips: Set[str]):
        self.allowed_ips = allowed_ips

    def evaluate(self, context: AccessContext) -> bool:
        client_ip = context.environment.get('ip_address')
        return client_ip in self.allowed_ips


class PublicResourcePolicy(Policy):
    """Allow read access to public resources"""

    def evaluate(self, context: AccessContext) -> bool:
        return (
            context.resource.is_public and
            context.action == 'read'
        )


class PolicyCombinator:
    """Combine multiple policies with AND/OR logic"""

    @staticmethod
    def any_of(*policies: Policy) -> Policy:
        """OR combinator - any policy grants access"""
        class OrPolicy(Policy):
            def evaluate(self, context: AccessContext) -> bool:
                return any(policy.evaluate(context) for policy in policies)
        return OrPolicy()

    @staticmethod
    def all_of(*policies: Policy) -> Policy:
        """AND combinator - all policies must grant access"""
        class AndPolicy(Policy):
            def evaluate(self, context: AccessContext) -> bool:
                return all(policy.evaluate(context) for policy in policies)
        return AndPolicy()

    @staticmethod
    def not_(policy: Policy) -> Policy:
        """NOT combinator - inverse of policy"""
        class NotPolicy(Policy):
            def evaluate(self, context: AccessContext) -> bool:
                return not policy.evaluate(context)
        return NotPolicy()


class ABACAuthorizer:
    """Attribute-Based Access Control implementation"""

    def __init__(self, policies: Dict[str, Policy]):
        """
        policies: Mapping of action to policy
        """
        self.policies = policies

    def authorize(self, context: AccessContext) -> bool:
        """Check if access should be granted"""
        policy = self.policies.get(context.action)

        if not policy:
            return False

        return policy.evaluate(context)


# Example: Complex authorization rules
def create_document_abac_authorizer() -> ABACAuthorizer:
    """
    Create ABAC authorizer for document access
    """
    policies = {
        # Read: Public OR (Owner OR Same department OR Admin)
        'read': PolicyCombinator.any_of(
            PublicResourcePolicy(),
            OwnershipPolicy(),
            DepartmentPolicy(),
            AdminPolicy()
        ),

        # Edit: (Owner OR Admin) AND Business hours
        'edit': PolicyCombinator.all_of(
            PolicyCombinator.any_of(
                OwnershipPolicy(),
                AdminPolicy()
            ),
            TimeBasedPolicy(start_hour=9, end_hour=17)
        ),

        # Delete: Owner OR Admin
        'delete': PolicyCombinator.any_of(
            OwnershipPolicy(),
            AdminPolicy()
        ),

        # Share: Owner OR (Admin AND Same department)
        'share': PolicyCombinator.any_of(
            OwnershipPolicy(),
            PolicyCombinator.all_of(
                AdminPolicy(),
                DepartmentPolicy()
            )
        ),
    }

    return ABACAuthorizer(policies)


# Example usage
def example_rbac():
    """Example: Role-Based Access Control"""
    print("=== RBAC Examples ===\n")

    # Create users
    guest = User(id=1, username='guest', role=Role.GUEST)
    user = User(id=2, username='john', role=Role.USER)
    moderator = User(id=3, username='jane', role=Role.MODERATOR)
    admin = User(id=4, username='admin', role=Role.ADMIN)

    # Create resource
    document = Resource(id=1, owner_id=2, type='document', is_public=False)

    # Test permissions
    print(f"Guest can read public: {RBACAuthorizer.has_permission(guest, Permission.READ_PUBLIC)}")
    print(f"Guest can create content: {RBACAuthorizer.has_permission(guest, Permission.CREATE_CONTENT)}")
    print(f"User can create content: {RBACAuthorizer.has_permission(user, Permission.CREATE_CONTENT)}")
    print(f"User can edit any content: {RBACAuthorizer.has_permission(user, Permission.EDIT_ANY_CONTENT)}")
    print(f"Moderator can edit any content: {RBACAuthorizer.has_permission(moderator, Permission.EDIT_ANY_CONTENT)}")
    print(f"Admin can manage roles: {RBACAuthorizer.has_permission(admin, Permission.MANAGE_ROLES)}")

    # Test resource access
    print(f"\nUser (owner) can edit document: {RBACAuthorizer.can_access_resource(user, document, 'edit')}")
    print(f"Moderator can edit document: {RBACAuthorizer.can_access_resource(moderator, document, 'edit')}")
    print(f"Guest can read document: {RBACAuthorizer.can_access_resource(guest, document, 'read')}")


def example_abac():
    """Example: Attribute-Based Access Control"""
    print("\n=== ABAC Examples ===\n")

    # Create users
    john = User(id=1, username='john', role=Role.USER, department='Engineering')
    jane = User(id=2, username='jane', role=Role.USER, department='Sales')
    admin = User(id=3, username='admin', role=Role.ADMIN, department='Engineering')

    # Create resources
    public_doc = Resource(id=1, owner_id=1, type='document', is_public=True)
    private_doc = Resource(id=2, owner_id=1, type='document', department='Engineering', is_public=False)

    # Create authorizer
    authorizer = create_document_abac_authorizer()

    # Test cases
    test_cases = [
        (john, public_doc, 'read', {'ip_address': '192.168.1.1'}),
        (jane, public_doc, 'read', {'ip_address': '192.168.1.2'}),
        (john, private_doc, 'read', {'ip_address': '192.168.1.1'}),
        (jane, private_doc, 'read', {'ip_address': '192.168.1.2'}),
        (john, private_doc, 'edit', {'ip_address': '192.168.1.1'}),
        (admin, private_doc, 'edit', {'ip_address': '192.168.1.1'}),
        (admin, private_doc, 'delete', {'ip_address': '192.168.1.1'}),
    ]

    for user, resource, action, env in test_cases:
        context = AccessContext(
            user=user,
            resource=resource,
            action=action,
            environment=env
        )

        result = authorizer.authorize(context)
        print(f"{user.username} can {action} resource {resource.id}: {result}")


if __name__ == '__main__':
    example_rbac()
    example_abac()
