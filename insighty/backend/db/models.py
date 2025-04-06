from typing import Optional
from sqlmodel import Field, SQLModel


class Graph(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(unique=True)
    category: str
    thumbnail: str = Field(description="hex encoded PNG")
    url: str
    insight: str
    summary: str
    csv1: str = Field(default=None)
    csv2: Optional[str] = Field(default=None)
    json1path: str
    json2path: Optional[str]

    @property
    def csvs(self) -> list[str]:
        return [self.csv1, self.csv2] if self.csv2 else [self.csv1]

