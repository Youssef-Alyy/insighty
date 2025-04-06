from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import seed
from api import api
from db import repo


@asynccontextmanager
async def lifespan(app: FastAPI):
    graphs = seed.load()
    repo.bulk_create_graphs(graphs)
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api.router)
