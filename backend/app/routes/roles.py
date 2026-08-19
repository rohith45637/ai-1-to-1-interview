from fastapi import APIRouter
from typing import List
from app.schemas.role import BUILT_IN_JOB_ROLES, JobRoleDefinition

router = APIRouter(prefix="/api/roles", tags=["Job Roles"])

@router.get("", response_model=List[JobRoleDefinition])
def list_job_roles():
    return BUILT_IN_JOB_ROLES

@router.get("/{role_id}", response_model=JobRoleDefinition)
def get_job_role(role_id: str):
    role = next((r for r in BUILT_IN_JOB_ROLES if r["id"] == role_id or r["title"].lower() == role_id.lower()), None)
    if not role:
        # Default fallback
        return BUILT_IN_JOB_ROLES[0]
    return role
