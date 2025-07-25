import pytest
import asyncio
from httpx import AsyncClient
from sqlmodel import SQLModel, create_engine, Session
from fastapi.testclient import TestClient
from main import app
from database import get_session
from utils.security import get_password_hash, create_access_token


# Test database URL
TEST_DATABASE_URL = "sqlite:///./test.db"

# Create test engine
test_engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database session for each test."""
    # Clear metadata to avoid conflicts
    SQLModel.metadata.clear()
    
    # Import models to register them
    from ..models.user import User
    from ..models.workspace import Workspace, WorkspaceMember
    from ..tools.trend_agent.models import TrendSuggestion
    
    # Create tables
    SQLModel.metadata.create_all(test_engine)
    
    with Session(test_engine) as session:
        yield session
    
    # Clean up
    SQLModel.metadata.drop_all(test_engine)


@pytest.fixture
def client(db_session):
    """Create a test client with database session."""
    def override_get_session():
        yield db_session
    
    app.dependency_overrides[get_session] = override_get_session
    
    test_client = TestClient(app)
    yield test_client
    
    app.dependency_overrides.clear()


@pytest.fixture
async def async_client(db_session):
    """Create an async test client."""
    def override_get_session():
        yield db_session
    
    app.dependency_overrides[get_session] = override_get_session
    
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac
    
    app.dependency_overrides.clear()


@pytest.fixture
def test_user(db_session):
    """Create a test user."""
    # Import models to ensure they are registered
    from ..models.user import User
    from ..models.workspace import Workspace, WorkspaceMember
    from ..tools.trend_agent.models import TrendSuggestion
    
    user = User(
        email="test@example.com",
        password=get_password_hash("testpassword"),
        full_name="Test User"
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def test_workspace(db_session, test_user):
    """Create a test workspace."""
    # Import models to ensure they are registered
    from ..models.user import User
    from ..models.workspace import Workspace, WorkspaceMember
    from ..tools.trend_agent.models import TrendSuggestion
    
    workspace = Workspace(
        name="Test Workspace",
        slug="test-workspace-123",
        owner_id=test_user.id
    )
    db_session.add(workspace)
    db_session.commit()
    db_session.refresh(workspace)
    
    # Create membership
    membership = WorkspaceMember(
        workspace_id=workspace.id,
        user_id=test_user.id,
        role="owner"
    )
    db_session.add(membership)
    db_session.commit()
    
    return workspace


@pytest.fixture
def auth_headers(test_user):
    """Get authentication headers for test user."""
    # Manually create token to avoid rate limiting
    token = create_access_token(data={"sub": test_user.email})
    return {"Authorization": f"Bearer {token}"} 