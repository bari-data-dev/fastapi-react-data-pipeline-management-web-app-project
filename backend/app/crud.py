from sqlalchemy.orm import Session
from . import models, schemas
from typing import Optional, List
from app.models import ColumnMapping
from app.models import RequiredColumn
from sqlalchemy.exc import SQLAlchemyError
import re


def get_client_reference(db: Session, client_id: int):
    return db.query(models.ClientReference).filter(models.ClientReference.client_id == client_id).first()

def get_client_reference_by_schema(db: Session, client_schema: str):
    return db.query(models.ClientReference).filter(models.ClientReference.client_schema == client_schema).first()

def get_client_references(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.ClientReference).offset(skip).limit(limit).all()

def create_client_reference(db: Session, client_ref: schemas.ClientReferenceCreate):
    db_client_ref = models.ClientReference(**client_ref.dict())
    db.add(db_client_ref)
    db.commit()
    db.refresh(db_client_ref)
    return db_client_ref

def update_client_reference(db: Session, client_id: int, client_ref: schemas.ClientReferenceUpdate):
    db_client_ref = get_client_reference(db, client_id)
    if not db_client_ref:
        return None
    for key, value in client_ref.dict().items():
        setattr(db_client_ref, key, value)
    db.commit()
    db.refresh(db_client_ref)
    return db_client_ref

def delete_client_reference(db: Session, client_id: int):
    db_client_ref = get_client_reference(db, client_id)
    if not db_client_ref:
        return None
    db.delete(db_client_ref)
    db.commit()
    return db_client_ref


##### CLIENT CONFIG #####

def get_client_config(db: Session, config_id: int):
    return db.query(models.ClientConfig).filter(models.ClientConfig.config_id == config_id).first()

def create_client_config(db: Session, client_config: schemas.ClientConfigCreate):
    db_client_config = models.ClientConfig(**client_config.dict())
    db.add(db_client_config)
    db.commit()
    db.refresh(db_client_config)
    return db_client_config

def update_client_config(db: Session, config_id: int, client_config: schemas.ClientConfigUpdate):
    db_client_config = get_client_config(db, config_id)
    if not db_client_config:
        return None
    for key, value in client_config.dict().items():
        setattr(db_client_config, key, value)
    db.commit()
    db.refresh(db_client_config)
    return db_client_config

def delete_client_config(db: Session, config_id: int):
    db_client_config = get_client_config(db, config_id)
    if not db_client_config:
        return None
    db.delete(db_client_config)
    db.commit()
    return db_client_config

def get_client_configs(
    db: Session,
    client_id: Optional[int] = None,
    config_version: Optional[str] = None,
    logical_source_file: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
) -> List[models.ClientConfig]:
    query = db.query(models.ClientConfig)
    if client_id is not None:
        query = query.filter(models.ClientConfig.client_id == client_id)
    if config_version is not None:
        query = query.filter(models.ClientConfig.config_version == config_version)
    if logical_source_file is not None:
        query = query.filter(models.ClientConfig.logical_source_file == logical_source_file)
    return query.offset(skip).limit(limit).all()

def get_distinct_config_versions(db: Session, client_id: int) -> List[str]:
    versions = (
        db.query(models.ClientConfig.config_version)
        .filter(models.ClientConfig.client_id == client_id)
        .distinct()
        .order_by(models.ClientConfig.config_version)
        .all()
    )
    return [v[0] for v in versions]

def get_max_config_version_number(db: Session, client_id: int) -> int:
    versions = get_distinct_config_versions(db, client_id)
    max_num = 0
    for ver in versions:
        m = re.match(r'^v(\d+)$', ver)
        if m:
            num = int(m.group(1))
            if num > max_num:
                max_num = num
    return max_num

def batch_save_client_config(
    db: Session,
    client_id: int,
    config_version: str,
    rows: List[dict]
):
    if not rows:
        raise ValueError("No rows provided for batch save")

    db_rows = []
    for row in rows:
        db_rows.append(
            models.ClientConfig(
                client_id=client_id,
                source_type=row["source_type"],
                target_schema=row["target_schema"],
                target_table=row["target_table"],
                source_config=row.get("source_config"),
                is_active=row.get("is_active", True),
                config_version=config_version,
                logical_source_file=row["logical_source_file"]
            )
        )

    db.add_all(db_rows)
    db.commit()




##### COLUMN MAPPING #####

def get_column_mapping(db: Session, mapping_id: int):
    return db.query(models.ColumnMapping).filter(models.ColumnMapping.mapping_id == mapping_id).first()

def get_column_mappings(
    db: Session,
    client_id: Optional[int] = None,
    mapping_version: Optional[str] = None,
    logical_source_file: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
) -> List[ColumnMapping]:
    query = db.query(ColumnMapping)
    if client_id is not None:
        query = query.filter(ColumnMapping.client_id == client_id)
    if mapping_version is not None:
        query = query.filter(ColumnMapping.mapping_version == mapping_version)
    if logical_source_file is not None:
        query = query.filter(ColumnMapping.logical_source_file == logical_source_file)
    return query.offset(skip).limit(limit).all()

def create_column_mapping(db: Session, column_mapping: schemas.ColumnMappingCreate):
    db_column_mapping = models.ColumnMapping(**column_mapping.dict())
    db.add(db_column_mapping)
    db.commit()
    db.refresh(db_column_mapping)
    return db_column_mapping

def update_column_mapping(db: Session, mapping_id: int, column_mapping: schemas.ColumnMappingUpdate):
    db_column_mapping = get_column_mapping(db, mapping_id)
    if not db_column_mapping:
        return None
    for key, value in column_mapping.dict().items():
        setattr(db_column_mapping, key, value)
    db.commit()
    db.refresh(db_column_mapping)
    return db_column_mapping

def delete_column_mapping(db: Session, mapping_id: int):
    db_column_mapping = get_column_mapping(db, mapping_id)
    if not db_column_mapping:
        return None
    db.delete(db_column_mapping)
    db.commit()
    return db_column_mapping

def get_distinct_mapping_versions(db: Session, client_id: int) -> List[str]:
    versions = (
        db.query(ColumnMapping.mapping_version)
        .filter(ColumnMapping.client_id == client_id)
        .distinct()
        .order_by(ColumnMapping.mapping_version)
        .all()
    )
    # hasil .all() berupa list of tuples, extract ke list string:
    return [v[0] for v in versions if v[0] is not None]

def get_max_mapping_version_number(db: Session, client_id: int) -> int:
    versions = (
        db.query(ColumnMapping.mapping_version)
        .filter(ColumnMapping.client_id == client_id)
        .all()
    )
    max_ver = 0
    import re
    for (ver,) in versions:
        if ver:
            m = re.match(r'v(\d+)', ver)
            if m:
                num = int(m.group(1))
                if num > max_ver:
                    max_ver = num
    return max_ver

def batch_save_column_mapping(db: Session,
    client_id: int,
    mapping_version: str,
    rows: List[dict]
    ):
    # Validate duplicate source_column in mappings list
    if not rows:
        raise ValueError("No rows provided for batch save")

    db_rows = []
    for row in rows:
        db_rows.append(
            models.ColumnMapping(
                client_id=client_id,
                source_column=row['source_column'],
                target_column=row['target_column'],
                mapping_version=mapping_version,
                logical_source_file=row["logical_source_file"]
            )
        )
        db.add_all(db_rows)
        db.commit()

    

##### REQUIRED COLUMN #####

def get_required_column(db: Session, required_id: int):
    return db.query(models.RequiredColumn).filter(models.RequiredColumn.required_id == required_id).first()

def get_required_columns(
    db: Session,
    client_id: Optional[int] = None,
    required_column_version: Optional[str] = None,
    logical_source_file: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
) -> List[models.RequiredColumn]:
    query = db.query(models.RequiredColumn)
    if client_id is not None:
        query = query.filter(models.RequiredColumn.client_id == client_id)
    if required_column_version is not None:
        query = query.filter(models.RequiredColumn.required_column_version == required_column_version)
    if logical_source_file is not None:
        query = query.filter(models.RequiredColumn.logical_source_file == logical_source_file)
    return query.offset(skip).limit(limit).all()

def create_required_column(db: Session, required_column: schemas.RequiredColumnCreate):
    db_required_column = models.RequiredColumn(**required_column.dict())
    db.add(db_required_column)
    db.commit()
    db.refresh(db_required_column)
    return db_required_column

def update_required_column(db: Session, required_id: int, required_column: schemas.RequiredColumnUpdate):
    db_required_column = get_required_column(db, required_id)
    if not db_required_column:
        return None
    for key, value in required_column.dict().items():
        setattr(db_required_column, key, value)
    db.commit()
    db.refresh(db_required_column)
    return db_required_column

def delete_required_column(db: Session, required_id: int):
    db_required_column = get_required_column(db, required_id)
    if not db_required_column:
        return None
    db.delete(db_required_column)
    db.commit()
    return db_required_column

def get_distinct_required_column_versions(db: Session, client_id: int) -> List[str]:
    versions = (
        db.query(models.RequiredColumn.required_column_version)
        .filter(models.RequiredColumn.client_id == client_id)
        .distinct()
        .order_by(models.RequiredColumn.required_column_version)
        .all()
    )
    return [v[0] for v in versions]

def get_max_required_column_version_number(db: Session, client_id: int) -> int:
    versions = get_distinct_required_column_versions(db, client_id)
    max_num = 0
    for ver in versions:
        m = re.match(r'^v(\d+)$', ver)
        if m:
            num = int(m.group(1))
            if num > max_num:
                max_num = num
    return max_num

def batch_save_required_columns(
    db: Session,
    client_id: int,
    required_column_version: str,
    rows: List[dict]
):
    if not rows:
        raise ValueError("No rows provided for batch save")

    db_rows = []
    for row in rows:
        db_rows.append(
            models.RequiredColumn(
                client_id=client_id,
                column_name=row["column_name"],
                required_column_version=required_column_version,
                logical_source_file=row["logical_source_file"]
            )
        )

    db.add_all(db_rows)
    db.commit()



##### TRANSFORMATION CONFIG #####

def get_transformation_config(db: Session, transform_id: int):
    return db.query(models.TransformationConfig).filter(models.TransformationConfig.transform_id == transform_id).first()

def get_transformation_configs(
    db: Session,
    client_id: Optional[int] = None,
    transform_version: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
) -> List[models.TransformationConfig]:
    query = db.query(models.TransformationConfig)
    if client_id is not None:
        query = query.filter(models.TransformationConfig.client_id == client_id)
    if transform_version is not None:
        query = query.filter(models.TransformationConfig.transform_version == transform_version)
    return query.offset(skip).limit(limit).all()

def create_transformation_config(db: Session, transformation_config: schemas.TransformationConfigCreate):
    db_transformation_config = models.TransformationConfig(**transformation_config.dict())
    db.add(db_transformation_config)
    db.commit()
    db.refresh(db_transformation_config)
    return db_transformation_config

def update_transformation_config(db: Session, transform_id: int, transformation_config: schemas.TransformationConfigUpdate):
    db_transformation_config = get_transformation_config(db, transform_id)
    if not db_transformation_config:
        return None
    for key, value in transformation_config.dict().items():
        setattr(db_transformation_config, key, value)
    db.commit()
    db.refresh(db_transformation_config)
    return db_transformation_config

def delete_transformation_config(db: Session, transform_id: int):
    db_transformation_config = get_transformation_config(db, transform_id)
    if not db_transformation_config:
        return None
    db.delete(db_transformation_config)
    db.commit()
    return db_transformation_config

def get_distinct_transform_versions(db: Session, client_id: int) -> List[str]:
    versions = (
        db.query(models.TransformationConfig.transform_version)
        .filter(models.TransformationConfig.client_id == client_id)
        .distinct()
        .order_by(models.TransformationConfig.transform_version)
        .all()
    )
    return [v[0] for v in versions]

def get_max_transform_version_number(db: Session, client_id: int) -> int:
    versions = get_distinct_transform_versions(db, client_id)
    max_num = 0
    for ver in versions:
        m = re.match(r'^v(\d+)$', ver)
        if m:
            num = int(m.group(1))
            if num > max_num:
                max_num = num
    return max_num

def batch_save_transformation_config(
    db: Session,
    client_id: int,
    transform_version: str,
    rows: List[dict]
):
    if not rows:
        raise ValueError("No rows provided for batch save")

    db_rows = []
    for row in rows:
        db_rows.append(
            models.TransformationConfig(
                client_id=client_id,
                proc_name=row["proc_name"],
                transform_version=transform_version,
                is_active=row.get("is_active", True),
                created_at=row.get("created_at"),
                created_by=row.get("created_by"),
            )
        )
    db.add_all(db_rows)
    db.commit()


##### FILE AUDIT LOG #####
def get_file_audit_logs(
    db: Session,
    client_id: Optional[int] = None,
    convert_status: Optional[str] = None,
    mapping_validation_status: Optional[str] = None,
    row_validation_status: Optional[str] = None,
    load_status: Optional[str] = None,
    json_file_name: Optional[str] = None,
    batch_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
):
    query = db.query(models.FileAuditLog)
    if client_id is not None:
        query = query.filter(models.FileAuditLog.client_id == client_id)
    if convert_status is not None:
        query = query.filter(models.FileAuditLog.convert_status == convert_status)
    if mapping_validation_status is not None:
        query = query.filter(models.FileAuditLog.mapping_validation_status == mapping_validation_status)
    if row_validation_status is not None:
        query = query.filter(models.FileAuditLog.row_validation_status == row_validation_status)
    if load_status is not None:
        query = query.filter(models.FileAuditLog.load_status == load_status)
    if json_file_name is not None:
        query = query.filter(models.FileAuditLog.json_file_name.ilike(f"%{json_file_name}%"))
    if batch_id is not None:
        query = query.filter(models.FileAuditLog.batch_id == batch_id)

    query = query.order_by(models.FileAuditLog.file_received_time.desc())
    return query.offset(skip).limit(limit).all()


##### MAPPING VALIDATION LOG #####
def get_mapping_validation_logs(
    db: Session,
    client_id: Optional[int] = None,
    file_name: Optional[str] = None,
    batch_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
):
    query = db.query(models.MappingValidationLog)
    if client_id is not None:
        query = query.filter(models.MappingValidationLog.client_id == client_id)
    if file_name is not None:
        query = query.filter(models.MappingValidationLog.file_name.ilike(f"%{file_name}%"))
    if batch_id is not None:
        query = query.filter(models.MappingValidationLog.batch_id == batch_id)

    query = query.order_by(models.MappingValidationLog.timestamp.desc())
    return query.offset(skip).limit(limit).all()

##### ROW VALIDATION LOG #####
def get_row_validation_logs(
    db: Session,
    client_id: Optional[int] = None,
    file_name: Optional[str] = None,
    batch_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
):
    query = db.query(models.RowValidationLog)
    if client_id is not None:
        query = query.filter(models.RowValidationLog.client_id == client_id)
    if file_name is not None:
        query = query.filter(models.RowValidationLog.file_name.ilike(f"%{file_name}%"))
    if batch_id is not None:
        query = query.filter(models.RowValidationLog.batch_id == batch_id)

    query = query.order_by(models.RowValidationLog.timestamp.desc())
    return query.offset(skip).limit(limit).all()


##### LOAD ERROR LOG #####
def get_load_error_logs(
    db: Session,
    client_id: Optional[int] = None,
    file_name: Optional[str] = None,
    batch_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
):
    query = db.query(models.LoadErrorLog)
    if client_id is not None:
        query = query.filter(models.LoadErrorLog.client_id == client_id)
    if file_name is not None:
        query = query.filter(models.LoadErrorLog.file_name.ilike(f"%{file_name}%"))
    if batch_id is not None:
        query = query.filter(models.LoadErrorLog.batch_id == batch_id)

    query = query.order_by(models.LoadErrorLog.timestamp.desc())
    return query.offset(skip).limit(limit).all()

##### TRANSFORMATION LOG #####
def get_transformation_logs(
    db: Session,
    client_id: Optional[int] = None,
    source_table: Optional[str] = None,
    target_table: Optional[str] = None,
    batch_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
):
    query = db.query(models.TransformationLog)
    if client_id is not None:
        query = query.filter(models.TransformationLog.client_id == client_id)
    if source_table is not None:
        query = query.filter(models.TransformationLog.source_table.ilike(f"%{source_table}%"))
    if target_table is not None:
        query = query.filter(models.TransformationLog.target_table.ilike(f"%{target_table}%"))
    if batch_id is not None:
        query = query.filter(models.TransformationLog.batch_id == batch_id)

    query = query.order_by(models.TransformationLog.timestamp.desc())
    return query.offset(skip).limit(limit).all()

##### JOB EXECUTION LOG #####
def get_job_execution_logs(
    db: Session,
    client_id: Optional[int] = None,
    file_name: Optional[str] = None,
    batch_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
):
    query = db.query(models.JobExecutionLog)

    # Filter client_id kalau diberikan
    if client_id is not None:
        query = query.filter(models.JobExecutionLog.client_id == client_id)

    # Filter file_name pakai LIKE kalau diberikan (partial match)
    if file_name is not None:
        query = query.filter(models.JobExecutionLog.file_name.ilike(f"%{file_name}%"))

    # Filter batch_id kalau diberikan
    if batch_id is not None:
        query = query.filter(models.JobExecutionLog.batch_id == batch_id)

    # Sorting by start_time descending
    query = query.order_by(models.JobExecutionLog.start_time.desc())

    return query.offset(skip).limit(limit).all()
