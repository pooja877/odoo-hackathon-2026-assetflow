from dotenv import load_dotenv
import os

load_dotenv()

# These defaults keep the local demo runnable when a .env file has not yet
# been created.  Set SECRET_KEY in the deployment environment to a unique,
# securely generated value.
SECRET_KEY = os.getenv("SECRET_KEY", "change-this-development-secret-key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
