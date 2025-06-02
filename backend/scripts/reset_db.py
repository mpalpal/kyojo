from database import Base, engine
from models import *  # Make sure this imports all models


def reset_database():
    print("Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    print("Creating all tables...")
    # Base.metadata.create_all(bind=engine)
    # print("Database has been reset.")

# Optional direct run
if __name__ == "__main__":
    reset_database()