from pydantic import BaseModel, validator
from typing import Optional, Any, List
from datetime import datetime
import re


# client_reference
class ClientReferenceBase(BaseModel):
    client_schema: str
    client_name: str
    config_version: str
    mapping_version: str
    required_column_version: str
    transform_version: str
    last_batch_id: str

class ClientReferenceCreate(ClientReferenceBase):
    pass

class ClientReferenceUpdate(ClientReferenceBase):
    pass

class ClientReference(ClientReferenceBase):
    client_id: int

    class Config:
        orm_mode = True
        

# client_config
class ClientConfigBase(BaseModel):
    client_id: int
    source_type: str
    target_schema: str
    target_table: str
    source_config: Optional[Any] = None
    is_active: Optional[bool] = True
    config_version: Optional[str] = None
    logical_source_file: Optional[str] = None

class ClientConfigCreate(ClientConfigBase):
    pass

class ClientConfigUpdate(ClientConfigBase):
    pass

class ClientConfig(ClientConfigBase):
    config_id: int

    class Config:
        orm_mode = True

class BatchConfigClientSaveRequest(BaseModel):
    client_id: int
    config_version: str
    client_configs: List[ClientConfigCreate]

    @validator('config_version')
    def valid_version_format(cls, v):
        if not re.match(r'^v\d+$', v):
            raise ValueError('config_version must be in format v<number>, e.g. v1')
        return v

class ConfigClientVersionList(BaseModel):
    versions: List[str]


# column_mapping
class ColumnMappingBase(BaseModel):
    client_id: int
    source_column: str
    target_column: str
    mapping_version: str
    logical_source_file: str

class ColumnMappingCreate(ColumnMappingBase):
    pass

class ColumnMappingUpdate(ColumnMappingBase):
    pass

class ColumnMapping(ColumnMappingBase):
    mapping_id: int

    class Config:
        orm_mode = True

class MappingVersionList(BaseModel):
    versions: List[str]

class BatchMappingSaveRequest(BaseModel):
    client_id: int
    mapping_version: str
    mappings: List[ColumnMappingCreate]

    @validator('mapping_version')
    def valid_version_format(cls, v):
        if not re.match(r'^v\d+$', v):
            raise ValueError('mapping_version must be in format v<number>, e.g. v1')
        return v


# client_reference
class RequiredColumnBase(BaseModel):
    client_id: int
    column_name: str
    required_column_version: str
    logical_source_file: str

class RequiredColumnCreate(RequiredColumnBase):
    pass

class RequiredColumnUpdate(RequiredColumnBase):
    pass

class RequiredColumn(RequiredColumnBase):
    required_id: int  # misal primary key untuk required_column

    class Config:
        orm_mode = True
# NEW: Schema untuk batch save
class BatchRequiredColumnSaveRequest(BaseModel):
    client_id: int
    required_column_version: str
    required_columns: List[RequiredColumnCreate]

    @validator('required_column_version')
    def valid_version_format(cls, v):
        if not re.match(r'^v\d+$', v):
            raise ValueError('required_column_version must be in format v<number>, e.g. v1')
        return v

class RequiredColumnVersionList(BaseModel):  # untuk endpoint GET /versions
    versions: List[str]



# transformation config
class TransformationConfigBase(BaseModel):
    client_id: int
    proc_name: str
    transform_version: str
    is_active: Optional[bool] = True
    created_at: Optional[datetime] = None
    created_by: Optional[str] = "system"

class TransformationConfigCreate(TransformationConfigBase):
    pass

class TransformationConfigUpdate(TransformationConfigBase):
    pass

class TransformationConfig(TransformationConfigBase):
    transform_id: int

    class Config:
        orm_mode = True

class BatchTransformationConfigSaveRequest(BaseModel):
    client_id: int
    transform_version: str
    transformation_configs: List[TransformationConfigCreate]

    @validator('transform_version')
    def valid_version_format(cls, v):
        if not re.match(r'^v\d+$', v):
            raise ValueError('transform_version must be in format v<number>, e.g. v1')
        return v

class TransformationConfigVersionList(BaseModel):
    versions: List[str]


class FileAuditLogBase(BaseModel):
    client_id: int
    convert_status: Optional[str] = None
    mapping_validation_status: Optional[str] = None
    row_validation_status: Optional[str] = None
    load_status: Optional[str] = None
    total_rows: Optional[int] = None
    valid_rows: Optional[int] = None
    invalid_rows: Optional[int] = None
    processed_by: Optional[str] = None
    logical_source_file: Optional[str] = None
    physical_file_name: Optional[str] = None
    json_file_name: Optional[str] = None
    batch_id: Optional[str] = None
    file_received_time: Optional[datetime] = None
    json_converted_time: Optional[datetime] = None

class FileAuditLog(FileAuditLogBase):
    file_audit_id: int

    class Config:
        orm_mode = True

class MappingValidationLogBase(BaseModel):
    client_id: int
    missing_columns: Optional[str] = None
    extra_columns: Optional[str] = None
    expected_columns: Optional[str] = None
    received_columns: Optional[str] = None
    file_name: Optional[str] = None
    batch_id: Optional[str] = None
    timestamp: Optional[datetime] = None

class MappingValidationLog(MappingValidationLogBase):
    mapping_id: int

    class Config:
        orm_mode = True


class RowValidationLogBase(BaseModel):
    client_id: Optional[int] = None
    file_name: Optional[str] = None
    column_name: Optional[str] = None
    row_number: Optional[int] = None
    error_type: Optional[str] = None
    error_detail: Optional[str] = None
    batch_id: Optional[str] = None
    timestamp: Optional[datetime] = None

class RowValidationLog(RowValidationLogBase):
    error_id: int

    class Config:
        orm_mode = True

class LoadErrorLogBase(BaseModel):
    client_id: Optional[int] = None
    error_detail: Optional[str] = None
    stage: Optional[str] = None
    file_name: Optional[str] = None
    batch_id: Optional[str] = None
    timestamp: Optional[datetime] = None

class LoadErrorLog(LoadErrorLogBase):
    error_id: int

    class Config:
        orm_mode = True

class TransformationLogBase(BaseModel):
    client_id: Optional[int] = None
    status: Optional[str] = None
    record_count: Optional[int] = None
    source_table: Optional[str] = None
    target_table: Optional[str] = None
    batch_id: Optional[str] = None
    message: Optional[str] = None
    timestamp: Optional[datetime] = None

class TransformationLog(TransformationLogBase):
    transform_log_id: int

    class Config:
        orm_mode = True

class JobExecutionLogBase(BaseModel):
    client_id: int
    job_name: Optional[str] = None
    status: Optional[str] = None
    error_message: Optional[str] = None
    file_name: Optional[str] = None
    batch_id: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None

class JobExecutionLog(JobExecutionLogBase):
    job_id: int

    class Config:
        orm_mode = True

