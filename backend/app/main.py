from fastapi import FastAPI
from .database import Base, engine
from .routers import (
    client_reference,
    client_config,
    column_mapping,
    required_columns,
    transformation_config,
    job_execution_log,
    file_audit_log,
    mapping_validation_log,
    row_validation_log,
    load_error_log,
    transformation_log
)
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:5173",
    # tambahkan origin lain jika perlu
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # bisa juga ["*"] tapi tidak direkomendasikan untuk production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(client_reference.router)
app.include_router(client_config.router)
app.include_router(column_mapping.router)
app.include_router(required_columns.router)
app.include_router(transformation_config.router)
app.include_router(file_audit_log.router)
app.include_router(mapping_validation_log.router)
app.include_router(row_validation_log.router)
app.include_router(load_error_log.router)
app.include_router(transformation_log.router)
app.include_router(job_execution_log.router)

@app.get("/")
def read_root():
    return {"message": "Backend metadata manager running!"}
