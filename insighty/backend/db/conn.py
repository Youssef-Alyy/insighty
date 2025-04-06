from sqlmodel import SQLModel, create_engine

from settings import conf

engine = create_engine(f"sqlite:////{conf.db_path}")

SQLModel.metadata.create_all(engine)
