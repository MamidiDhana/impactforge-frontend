from typing import List, Optional
from pydantic import BaseModel


class AnalyticsSummary(BaseModel):
    total_reports: int
    open_reports: int
    in_progress_reports: int
    resolved_reports: int
    rejected_reports: int
    resolution_rate_percent: float
    avg_resolution_hours: Optional[float] = None
    districts_covered: int


class StatusDistribution(BaseModel):
    status: str
    count: int
    percentage: float


class CategoryDistribution(BaseModel):
    category: str
    count: int
    percentage: float


class DistrictDistribution(BaseModel):
    district: str
    count: int
    resolved_count: int


class UrgencyDistribution(BaseModel):
    priority: str
    count: int


class TrendDataPoint(BaseModel):
    date: str
    count: int
    resolved_count: int


class ResolutionPerformance(BaseModel):
    total_resolved: int
    avg_days_to_resolve: float
    median_days_to_resolve: float
    target_compliance_percent: float
    overall_resolution_rate_percentage: Optional[float] = None
    by_category: Optional[List[dict]] = None
    by_district: Optional[List[dict]] = None
    insufficient_data: Optional[bool] = False

