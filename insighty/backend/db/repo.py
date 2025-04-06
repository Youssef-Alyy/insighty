import typing
from sqlmodel import Session, select
from db import models
from db.conn import engine


def get_graphs() -> dict[str, list[models.Graph]]:
    """
    Returns:
        {
            "category": [
                {
                    "id": int,
                    "title": str,
                    "category": str,
                    "url": str,
                    "thumbnail": str,
                    "insight": str,
                    "summary": str,
                    "csv": str
                },
                ...
            ],
            ...
        }
    """
    res = {}
    with Session(engine) as session:
        statement = select(models.Graph.category)
        result = session.exec(statement)
        categories = result.all()
        for category in categories:
            statement = select(models.Graph).where(models.Graph.category == category)
            result = session.exec(statement)
            res[category] = result.all()
    return res

def get_graph(graph_id: str) -> models.Graph:
    with Session(engine) as session:
        statement = select(models.Graph).where(models.Graph.id == graph_id)
        result = session.exec(statement)
        return result.one()

def create_graph(graph: models.Graph) -> models.Graph:
    with Session(engine) as session:
        session.add(graph)
        session.commit()
        session.refresh(graph)
    return graph


def bulk_create_graphs(graphs: list[models.Graph]) -> list[models.Graph]:
    with Session(engine) as session:
        for graph in graphs:
            try:
                session.add(graph)
                session.commit()
                session.refresh(graph)
            except Exception:
                session.rollback()
                print(f"Failed to create graph: {graph.title}")
    return graphs
