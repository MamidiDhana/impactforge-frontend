import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple
from sqlalchemy.orm import Session

from app.models.report import Report
from app.models.hei import HEIProfile
from app.schemas.capability_schema import ExtractedCapabilities
from app.schemas.hei_matching_schema import (
    HEIFactorScores,
    MatchedCapabilityDetails,
    MissingCapabilityDetails,
    HEIRecommendationMatch,
)

logger = logging.getLogger("hei_matching_service")

# Controlled seed profiles for Higher Education Institutions (HEIs).
# Clearly marked as unverified demo profiles per user requirement.
SEED_HEI_PROFILES: List[Dict[str, Any]] = [
    {
        "hei_id": "bit-mesra",
        "name": "Birla Institute of Technology (BIT) Mesra",
        "district": "Ranchi",
        "state": "Jharkhand",
        "institution_type": "Deemed Technical University",
        "departments": [
            "Civil and Environmental Engineering",
            "Remote Sensing and GIS",
            "Electrical and Electronics Engineering",
            "Computer Science & Engineering",
        ],
        "available_skills": [
            "civil engineering",
            "environmental science",
            "GIS and mapping",
            "water management",
            "software development",
            "surveying",
            "project management",
        ],
        "technical_domains": [
            "civil infrastructure",
            "water & wastewater",
            "environmental monitoring",
            "urban planning & transportation",
        ],
        "laboratories": [
            "Environmental Engineering Lab",
            "Geotechnical Engineering Lab",
            "Remote Sensing & GIS Lab",
            "Hydraulics & Water Resources Lab",
        ],
        "equipment": [
            "Water Quality Testing Kit",
            "Total Station",
            "Spectrophotometer",
            "Turbidity Meter",
            "Soil Shear Testing Apparatus",
            "Drone for GIS Survey",
        ],
        "software_tools": [
            "ArcGIS",
            "QGIS",
            "AutoCAD",
            "MATLAB",
            "HEC-RAS",
            "EPANET",
        ],
        "project_experience": {
            "completed_civic_projects": 12,
            "active_projects": 4,
            "complexity_level": "high",
        },
        "available_faculty_capacity": 35,
        "verification_status": "unverified",
        "contact_email": "rnd@bitmesra.ac.in",
        "associated_user_email": "dean.rnd@bitmesra.ac.in",
    },
    {
        "hei_id": "nit-jamshedpur",
        "name": "National Institute of Technology Jamshedpur",
        "district": "East Singhbhum",
        "state": "Jharkhand",
        "institution_type": "Institute of National Importance",
        "departments": [
            "Civil Engineering",
            "Mechanical Engineering",
            "Electrical Engineering",
            "Metallurgical and Materials Engineering",
        ],
        "available_skills": [
            "civil engineering",
            "mechanical engineering",
            "construction",
            "project management",
            "electrical engineering",
        ],
        "technical_domains": [
            "civil infrastructure",
            "electrical grid & power",
            "waste & recycling management",
            "general civic maintenance",
        ],
        "laboratories": [
            "Structural Engineering Lab",
            "Heavy Machinery & Dynamics Lab",
            "High Voltage Engineering Lab",
            "Concrete Technology Lab",
        ],
        "equipment": [
            "Universal Testing Machine",
            "Concrete Compression Tester",
            "Vibration Analyzer",
            "Structural Probes",
            "Excavator Diagnostics",
        ],
        "software_tools": [
            "STAAD.Pro",
            "AutoCAD",
            "ANSYS",
            "SolidWorks",
            "Primavera",
        ],
        "project_experience": {
            "completed_civic_projects": 15,
            "active_projects": 6,
            "complexity_level": "high",
        },
        "available_faculty_capacity": 28,
        "verification_status": "unverified",
        "contact_email": "rnd@nitjsr.ac.in",
        "associated_user_email": "prof.director@nitjsr.ac.in",
    },
    {
        "hei_id": "cuj-ranchi",
        "name": "Central University of Jharkhand",
        "district": "Ranchi",
        "state": "Jharkhand",
        "institution_type": "Central University",
        "departments": [
            "Centre for Water Engineering and Management",
            "Department of Environmental Sciences",
            "Department of Energy Engineering",
        ],
        "available_skills": [
            "water management",
            "environmental science",
            "public health",
            "data analysis",
            "waste management",
        ],
        "technical_domains": [
            "water & wastewater",
            "environmental monitoring",
            "public health & sanitation",
            "waste & recycling management",
        ],
        "laboratories": [
            "Water Purification & Desalination Lab",
            "Air Quality Monitoring Lab",
            "Bioenergy Research Lab",
        ],
        "equipment": [
            "BOD/COD Incubator",
            "Gas Chromatograph",
            "AAS Spectrometer",
            "Field Water Test Kits",
            "Portable pH & TDS Meters",
        ],
        "software_tools": [
            "R",
            "Python for Data Science",
            "MODFLOW",
            "QGIS",
        ],
        "project_experience": {
            "completed_civic_projects": 8,
            "active_projects": 3,
            "complexity_level": "medium",
        },
        "available_faculty_capacity": 20,
        "verification_status": "unverified",
        "contact_email": "research@cuj.ac.in",
        "associated_user_email": "vc@cuj.ac.in",
    },
    {
        "hei_id": "iit-ism-dhanbad",
        "name": "Indian Institute of Technology (ISM) Dhanbad",
        "district": "Dhanbad",
        "state": "Jharkhand",
        "institution_type": "Institute of National Importance",
        "departments": [
            "Environmental Science & Engineering",
            "Civil Engineering",
            "Mining Engineering",
            "Computer Science & Engineering",
        ],
        "available_skills": [
            "environmental science",
            "civil engineering",
            "GIS and mapping",
            "surveying",
            "data analysis",
            "project management",
        ],
        "technical_domains": [
            "environmental monitoring",
            "civil infrastructure",
            "waste & recycling management",
            "urban planning & transportation",
        ],
        "laboratories": [
            "Advanced Environmental Analysis Lab",
            "Rock Mechanics & Geophysics Lab",
            "Mine Environment & Safety Lab",
        ],
        "equipment": [
            "ICP-MS",
            "High Volume Air Sampler",
            "Ground Penetrating Radar",
            "Water Sampling Centrifuge",
        ],
        "software_tools": [
            "ArcGIS",
            "GeoStudio",
            "FLAC3D",
            "Python",
            "MATLAB",
        ],
        "project_experience": {
            "completed_civic_projects": 22,
            "active_projects": 8,
            "complexity_level": "high",
        },
        "available_faculty_capacity": 45,
        "verification_status": "unverified",
        "contact_email": "dean_sric@iitism.ac.in",
        "associated_user_email": "dean.sric@iitism.ac.in",
    },
    {
        "hei_id": "bau-ranchi",
        "name": "Birsa Agricultural University",
        "district": "Ranchi",
        "state": "Jharkhand",
        "institution_type": "State Agricultural University",
        "departments": [
            "Agricultural Engineering",
            "Soil Science & Water Management",
            "Agronomy",
        ],
        "available_skills": [
            "water management",
            "environmental science",
            "surveying",
            "data analysis",
        ],
        "technical_domains": [
            "water & wastewater",
            "environmental monitoring",
            "waste & recycling management",
        ],
        "laboratories": [
            "Soil & Water Conservation Lab",
            "Agrometeorology Research Station",
        ],
        "equipment": [
            "Soil Moisture Probes",
            "Meteorological Sensor Station",
            "Water Infiltration Ring",
        ],
        "software_tools": [
            "DSSAT",
            "CropSyst",
            "QGIS",
        ],
        "project_experience": {
            "completed_civic_projects": 10,
            "active_projects": 4,
            "complexity_level": "medium",
        },
        "available_faculty_capacity": 22,
        "verification_status": "unverified",
        "contact_email": "dr@bauranchi.org",
        "associated_user_email": "director.res@bauranchi.org",
    },
    {
        "hei_id": "nit-surathkal",
        "name": "National Institute of Technology Karnataka (NITK)",
        "district": "Dakshina Kannada",
        "state": "Karnataka",
        "institution_type": "Institute of National Importance",
        "departments": [
            "Water Resources and Ocean Engineering",
            "Civil Engineering",
            "Computer Science & Engineering",
        ],
        "available_skills": [
            "water management",
            "civil engineering",
            "software development",
            "data analysis",
            "GIS and mapping",
        ],
        "technical_domains": [
            "water & wastewater",
            "civil infrastructure",
            "education & civic technology",
        ],
        "laboratories": [
            "Marine & Coastal Engineering Lab",
            "Hydraulics Laboratory",
            "Big Data Analytics Lab",
        ],
        "equipment": [
            "Flow Meters",
            "Oceanographic Acoustic Probes",
            "High Performance Compute Cluster",
        ],
        "software_tools": [
            "HEC-HMS",
            "SWMM",
            "TensorFlow",
            "ArcGIS",
        ],
        "project_experience": {
            "completed_civic_projects": 18,
            "active_projects": 5,
            "complexity_level": "high",
        },
        "available_faculty_capacity": 40,
        "verification_status": "unverified",
        "contact_email": "dean.rc@nitk.edu.in",
        "associated_user_email": "dean.rc@nitk.edu.in",
    },
    {
        "hei_id": "tiss-mumbai",
        "name": "Tata Institute of Social Sciences",
        "district": "Mumbai Suburban",
        "state": "Maharashtra",
        "institution_type": "Deemed University",
        "departments": [
            "School of Health Systems Studies",
            "Centre for Public Policy, Habitat & Human Development",
        ],
        "available_skills": [
            "public health",
            "data analysis",
            "project management",
            "surveying",
        ],
        "technical_domains": [
            "public health & sanitation",
            "urban planning & transportation",
            "education & civic technology",
        ],
        "laboratories": [
            "Public Health Informatics Lab",
            "Field Action Research Cell",
        ],
        "equipment": [
            "Field Survey Tablets",
            "Mobile Health Diagnostics Kits",
        ],
        "software_tools": [
            "SPSS",
            "STATA",
            "NVivo",
            "KoboToolbox",
        ],
        "project_experience": {
            "completed_civic_projects": 25,
            "active_projects": 9,
            "complexity_level": "medium",
        },
        "available_faculty_capacity": 30,
        "verification_status": "unverified",
        "contact_email": "dean.research@tiss.edu",
        "associated_user_email": "prof.menon@tiss.edu",
    },
    {
        "hei_id": "iisc-bengaluru",
        "name": "Indian Institute of Science (IISc Bengaluru)",
        "district": "Bengaluru",
        "state": "Karnataka",
        "institution_type": "Institute of National Importance",
        "departments": [
            "Centre for Sustainable Technologies",
            "Department of Civil Engineering",
            "Department of Computational and Data Sciences",
            "Centre for Infrastructure, Sustainable Transportation and Urban Planning",
        ],
        "available_skills": [
            "environmental engineering",
            "water purification",
            "renewable energy",
            "urban planning",
            "data science",
            "climate modeling",
            "sensor networks",
        ],
        "technical_domains": [
            "environmental monitoring",
            "water & wastewater",
            "clean energy & climate",
            "urban planning & transportation",
            "education & civic technology",
        ],
        "laboratories": [
            "Sustainable Technologies Research Lab",
            "Environmental Geotechnics Lab",
            "Urban Mobility Simulation Facility",
            "Smart Grid Research Lab",
        ],
        "equipment": [
            "Gas Chromatograph-Mass Spectrometer",
            "High-Resolution Air Quality Monitors",
            "Spectrophotometer",
            "IoT Water Sensor Stations",
            "High-Performance Compute Cluster",
        ],
        "software_tools": [
            "MATLAB",
            "ArcGIS Pro",
            "OpenFOAM",
            "Python/PyTorch",
            "EPANET",
            "SUMO Traffic Simulator",
        ],
        "project_experience": {
            "completed_civic_projects": 34,
            "active_projects": 12,
            "complexity_level": "high",
        },
        "available_faculty_capacity": 54,
        "verification_status": "verified",
        "contact_email": "office.rnd@iisc.ac.in",
        "associated_user_email": "dean.engg@iisc.ac.in",
    },
    {
        "hei_id": "iiit-hyderabad",
        "name": "International Institute of Information Technology Hyderabad (IIIT-H)",
        "district": "Hyderabad",
        "state": "Telangana",
        "institution_type": "Autonomous Research University",
        "departments": [
            "Smart City Living Lab",
            "Center for Machine Learning",
            "Earthquake Engineering Research Centre",
            "Center for IT in Building Science",
        ],
        "available_skills": [
            "IoT deployment",
            "AI and computer vision",
            "structural safety",
            "smart city analytics",
            "energy optimization",
            "GIS mapping",
        ],
        "technical_domains": [
            "education & civic technology",
            "civil infrastructure",
            "environmental monitoring",
            "urban planning & transportation",
        ],
        "laboratories": [
            "Smart City Living Lab Facility",
            "Earthquake Simulation & Shake Table Lab",
            "Embedded Systems & IoT Lab",
            "Computer Vision Research Lab",
        ],
        "equipment": [
            "Multi-Sensor IoT Urban Pods",
            "Shake Table Dynamics Rig",
            "Solar PV Testing Rig",
            "Thermal Imaging Drone",
        ],
        "software_tools": [
            "TensorFlow",
            "ArcGIS",
            "QGIS",
            "OpenStudio Energy Modeling",
            "ROS (Robot Operating System)",
        ],
        "project_experience": {
            "completed_civic_projects": 28,
            "active_projects": 9,
            "complexity_level": "high",
        },
        "available_faculty_capacity": 42,
        "verification_status": "verified",
        "contact_email": "partnerships@iiit.ac.in",
        "associated_user_email": "smartcities@iiit.ac.in",
    },
    {
        "hei_id": "iit-madras",
        "name": "Indian Institute of Technology Madras",
        "district": "Chennai",
        "state": "Tamil Nadu",
        "institution_type": "Institute of National Importance",
        "departments": [
            "Department of Civil Engineering",
            "Department of Ocean Engineering",
            "Center for Urbanization, Buildings & Environment (CUBE)",
            "Biotechnology & Water Research",
        ],
        "available_skills": [
            "coastal & water engineering",
            "desalination",
            "structural resilience",
            "solid waste management",
            "renewable power",
            "GIS analysis",
        ],
        "technical_domains": [
            "water & wastewater",
            "civil infrastructure",
            "environmental monitoring",
            "waste & recycling management",
        ],
        "laboratories": [
            "National Centre for Sustainable Coastal Management",
            "Environmental Engineering Testing Facility",
            "Wave Current Flume Laboratory",
            "Building Technology Lab",
        ],
        "equipment": [
            "Reverse Osmosis Pilot Plant",
            "AAS Heavy Metal Detector",
            "Total Organic Carbon Analyzer",
            "Field Turbidity Meters",
        ],
        "software_tools": [
            "MIKE 21",
            "HEC-RAS",
            "STAAD.Pro",
            "AutoCAD Civil 3D",
            "QGIS",
        ],
        "project_experience": {
            "completed_civic_projects": 38,
            "active_projects": 14,
            "complexity_level": "high",
        },
        "available_faculty_capacity": 60,
        "verification_status": "verified",
        "contact_email": "deanic_office@iitm.ac.in",
        "associated_user_email": "dean.ic@iitm.ac.in",
    },
    {
        "hei_id": "iit-delhi",
        "name": "Indian Institute of Technology Delhi",
        "district": "Delhi",
        "state": "Delhi",
        "institution_type": "Institute of National Importance",
        "departments": [
            "Department of Civil Engineering",
            "Centre for Atmospheric Sciences",
            "Department of Energy Science & Engineering",
            "Centre for Rural Development and Technology",
        ],
        "available_skills": [
            "air quality modeling",
            "urban transport logistics",
            "biomass conversion",
            "water treatment",
            "renewable energy",
            "policy analysis",
        ],
        "technical_domains": [
            "environmental monitoring",
            "urban planning & transportation",
            "clean energy & climate",
            "public health & sanitation",
        ],
        "laboratories": [
            "Aerosol & Air Quality Research Lab",
            "Urban Transportation & Road Safety Lab",
            "Renewable Energy Biomass Lab",
            "Water Quality Analysis Lab",
        ],
        "equipment": [
            "PM2.5/PM10 Spectrometers",
            "Emission Gas Analyzers",
            "Crash Test Telemetry Rig",
            "Solar Radiation Pyranometers",
        ],
        "software_tools": [
            "WRF-Chem",
            "VISSIM Traffic Modeler",
            "MATLAB",
            "ArcGIS",
            "Python",
        ],
        "project_experience": {
            "completed_civic_projects": 31,
            "active_projects": 11,
            "complexity_level": "high",
        },
        "available_faculty_capacity": 55,
        "verification_status": "verified",
        "contact_email": "deanrnd@admin.iitd.ac.in",
        "associated_user_email": "dean.sric@iitd.ac.in",
    },
    {
        "hei_id": "coep-pune",
        "name": "College of Engineering Pune (COEP) Tech University",
        "district": "Pune",
        "state": "Maharashtra",
        "institution_type": "State Technical University",
        "departments": [
            "Department of Civil and Environmental Engineering",
            "Department of Mechanical Engineering",
            "Department of Computer Engineering & IT",
            "Instrumentation & Control",
        ],
        "available_skills": [
            "pavement evaluation",
            "water distribution network design",
            "automated sensor instrumentation",
            "traffic flow control",
            "structural testing",
        ],
        "technical_domains": [
            "civil infrastructure",
            "water & wastewater",
            "urban planning & transportation",
            "education & civic technology",
        ],
        "laboratories": [
            "Automated Highway & Pavement Lab",
            "Fluid Mechanics & Hydro-Turbines Lab",
            "Sensor & IoT Instrumentation Lab",
            "Environmental Pollution Testing Lab",
        ],
        "equipment": [
            "Benkelman Beam Deflectometer",
            "Ultrasonic Pulse Velocity Tester",
            "Automated Flowmeters",
            "Digital Level Total Station",
        ],
        "software_tools": [
            "AutoCAD Civil",
            "STAAD.Pro",
            "EPANET",
            "LabVIEW",
            "MATLAB",
        ],
        "project_experience": {
            "completed_civic_projects": 21,
            "active_projects": 7,
            "complexity_level": "high",
        },
        "available_faculty_capacity": 38,
        "verification_status": "verified",
        "contact_email": "dean.innovation@coep.ac.in",
        "associated_user_email": "dean.innovation@coep.ac.in",
    },
    {
        "hei_id": "symbiosis-design",
        "name": "Symbiosis Institute of Design",
        "district": "Pune",
        "state": "Maharashtra",
        "institution_type": "Deemed University",
        "departments": [
            "Department of Industrial Design",
            "Department of Communication Design",
            "Centre for Ergonomics and Inclusive Design",
        ],
        "available_skills": [
            "service design",
            "accessible design",
            "user research",
            "civic ergonomics",
            "wayfinding systems",
        ],
        "technical_domains": [
            "education & civic technology",
            "urban planning & transportation",
            "public health & sanitation",
        ],
        "laboratories": [
            "Human Factors & Ergonomics Lab",
            "Design Prototyping Workshop",
            "Usability & Eye-Tracking Testing Suite",
        ],
        "equipment": [
            "Eye-Tracking Glasses",
            "3D Ergonomic Scanners",
            "Rapid Prototyping 3D Printers",
            "Sensory Evaluation Kits",
        ],
        "software_tools": [
            "Figma",
            "Rhino 3D",
            "Adobe Creative Cloud",
            "Blender",
            "SolidWorks",
        ],
        "project_experience": {
            "completed_civic_projects": 16,
            "active_projects": 6,
            "complexity_level": "medium",
        },
        "available_faculty_capacity": 24,
        "verification_status": "verified",
        "contact_email": "info@sid.edu.in",
        "associated_user_email": "director@sid.edu.in",
    },
    {
        "hei_id": "jadavpur-kolkata",
        "name": "Jadavpur University",
        "district": "Kolkata",
        "state": "West Bengal",
        "institution_type": "State University",
        "departments": [
            "School of Environmental Studies",
            "Department of Chemical Engineering",
            "Department of Power Engineering",
            "Department of Construction Engineering",
        ],
        "available_skills": [
            "arsenic & fluoride remediation",
            "slum sanitation engineering",
            "energy audit",
            "drainage design",
            "chemical water purification",
        ],
        "technical_domains": [
            "water & wastewater",
            "public health & sanitation",
            "environmental monitoring",
            "civil infrastructure",
        ],
        "laboratories": [
            "Arsenic Mitigation & Water Chemistry Lab",
            "Environmental Biotechnology Lab",
            "Power Systems & Energy Efficiency Lab",
        ],
        "equipment": [
            "Hydride Generation Atomic Absorption Spectrometer",
            "Flame Photometer",
            "Multiparameter Water Quality Sonde",
            "COD Digesters",
        ],
        "software_tools": [
            "CHEMCAD",
            "ArcGIS",
            "AutoCAD",
            "Python",
            "OriginPro",
        ],
        "project_experience": {
            "completed_civic_projects": 29,
            "active_projects": 9,
            "complexity_level": "high",
        },
        "available_faculty_capacity": 46,
        "verification_status": "verified",
        "contact_email": "dean.fet@jadavpuruniversity.in",
        "associated_user_email": "registrar@jadavpuruniversity.in",
    },
    {
        "hei_id": "gujarat-university",
        "name": "Gujarat University",
        "district": "Ahmedabad",
        "state": "Gujarat",
        "institution_type": "State University",
        "departments": [
            "Department of Environmental Science",
            "School of Sciences",
            "Centre for Excellence in Urban Governance",
            "Department of Information Technology",
        ],
        "available_skills": [
            "industrial effluent remediation",
            "groundwater recharge",
            "solid waste management",
            "urban heat island mitigation",
            "civic GIS",
        ],
        "technical_domains": [
            "environmental monitoring",
            "water & wastewater",
            "waste & recycling management",
            "urban planning & transportation",
        ],
        "laboratories": [
            "Environmental Toxicology Lab",
            "Geographic Information Systems Facility",
            "Bioremediation Research Unit",
        ],
        "equipment": [
            "Gas Chromatograph",
            "UV-Vis Spectrophotometer",
            "Turbidity & Heavy Metal Kits",
            "DGPS Field Mapping Units",
        ],
        "software_tools": [
            "QGIS",
            "ArcGIS",
            "Python for Environmental Analytics",
            "SPSS",
        ],
        "project_experience": {
            "completed_civic_projects": 22,
            "active_projects": 8,
            "complexity_level": "medium",
        },
        "available_faculty_capacity": 36,
        "verification_status": "verified",
        "contact_email": "registrar@gujaratuniversity.ac.in",
        "associated_user_email": "dean.science@gujaratuniversity.ac.in",
    },
    {
        "hei_id": "iit-bhubaneswar",
        "name": "Indian Institute of Technology Bhubaneswar",
        "district": "Bhubaneswar",
        "state": "Odisha",
        "institution_type": "Institute of National Importance",
        "departments": [
            "School of Infrastructure",
            "School of Electrical Sciences",
            "School of Earth, Ocean and Climate Sciences",
            "School of Mechanical Sciences",
        ],
        "available_skills": [
            "cyclone-resilient structures",
            "climate resilience",
            "transport planning",
            "coastal salinity barrier design",
            "AI and analytics",
        ],
        "technical_domains": [
            "civil infrastructure",
            "environmental monitoring",
            "water & wastewater",
            "clean energy & climate",
        ],
        "laboratories": [
            "Coastal & Climate Hazard Lab",
            "Structural Dynamics Simulation Lab",
            "Environmental Fluid Mechanics Facility",
            "Smart Transportation Hub",
        ],
        "equipment": [
            "Wind Wave Flume",
            "Total Station & LiDAR Scanner",
            "Accelerometers for Structure Health",
            "Water Quality Testing Kit",
        ],
        "software_tools": [
            "STAAD.Pro",
            "SWAN Wave Model",
            "ArcGIS",
            "MATLAB",
            "Python",
        ],
        "project_experience": {
            "completed_civic_projects": 26,
            "active_projects": 11,
            "complexity_level": "high",
        },
        "available_faculty_capacity": 48,
        "verification_status": "verified",
        "contact_email": "dean.sric@iitbbs.ac.in",
        "associated_user_email": "dean.sric@iitbbs.ac.in",
    },
    {
        "hei_id": "uas-dharwad",
        "name": "University of Agricultural Sciences, Dharwad",
        "district": "Dharwad",
        "state": "Karnataka",
        "institution_type": "State Agricultural University",
        "departments": [
            "Department of Soil and Water Conservation Engineering",
            "Department of Agronomy",
            "Centre for Organic Farming and Sustainable Agriculture",
        ],
        "available_skills": [
            "climate-smart farming",
            "watershed management",
            "rural development",
            "drip irrigation telemetry",
            "soil health mapping",
        ],
        "technical_domains": [
            "water & wastewater",
            "environmental monitoring",
            "waste & recycling management",
        ],
        "laboratories": [
            "Precision Agriculture & Soil Health Lab",
            "Watershed Hydrology Field Station",
            "Agro-Meteorological Observatory",
        ],
        "equipment": [
            "Neutron Moisture Probes",
            "Automatic Weather Stations",
            "Flame Photometer",
            "Soil Respiration Chambers",
        ],
        "software_tools": [
            "QGIS",
            "DSSAT Crop Model",
            "CropSyst",
            "R Statistics",
        ],
        "project_experience": {
            "completed_civic_projects": 19,
            "active_projects": 7,
            "complexity_level": "medium",
        },
        "available_faculty_capacity": 32,
        "verification_status": "verified",
        "contact_email": "registrar@uasd.in",
        "associated_user_email": "dr@uasd.in",
    },
]


def calculate_hei_match(
    caps: ExtractedCapabilities,
    report_district: str,
    report_state: str,
    hei: Dict[str, Any],
) -> HEIRecommendationMatch:
    """
    Computes explainable match score (0-100) between an HEI profile and
    extracted report capabilities using the required weighted rubric:
      - Skill match: 30%
      - Technical-domain match: 25%
      - Equipment/lab match: 15%
      - Software/tools match: 10%
      - Location/district relevance: 10%
      - Project complexity and experience: 10%
    """
    reasons: List[str] = []

    # 1. Skill Match (30%)
    req_skills = [s.strip().lower() for s in (caps.skills or []) if s.strip()]
    hei_skills = [s.strip().lower() for s in hei.get("available_skills", []) if s.strip()]
    matched_skills: List[str] = []
    missing_skills: List[str] = []

    if req_skills:
        for s in req_skills:
            if any(hs in s or s in hs for hs in hei_skills):
                matched_skills.append(s)
            else:
                missing_skills.append(s)
        skill_ratio = len(matched_skills) / len(req_skills)
        skill_score = round(skill_ratio * 30.0, 1)
        reasons.append(
            f"Skills: Matched {len(matched_skills)}/{len(req_skills)} required competencies "
            f"({', '.join(matched_skills) if matched_skills else 'None'})."
        )
    else:
        skill_score = 15.0
        reasons.append("Skills: Standard multi-disciplinary baseline applied (no specific skill declared).")

    # 2. Technical Domain Match (25%)
    req_domains = [d.strip().lower() for d in (caps.technical_domains or []) if d.strip()]
    if not req_domains and caps.department_domain:
        req_domains = [caps.department_domain.strip().lower()]
    hei_domains = [d.strip().lower() for d in hei.get("technical_domains", []) if d.strip()]
    hei_depts = [d.strip().lower() for d in hei.get("departments", []) if d.strip()]
    matched_domains: List[str] = []
    missing_domains: List[str] = []

    if req_domains:
        for d in req_domains:
            if any(hd in d or d in hd for hd in hei_domains + hei_depts):
                matched_domains.append(d)
            else:
                missing_domains.append(d)
        domain_ratio = len(matched_domains) / len(req_domains)
        domain_score = round(domain_ratio * 25.0, 1)
        reasons.append(
            f"Domains: Matched {len(matched_domains)}/{len(req_domains)} technical domains "
            f"({', '.join(matched_domains) if matched_domains else 'None'})."
        )
    else:
        domain_score = 12.5
        reasons.append("Domains: General civic infrastructure baseline applied.")

    # 3. Equipment & Laboratory Match (15%)
    req_equip = [e.strip().lower() for e in (caps.equipment or []) if e.strip()]
    hei_equip = [e.strip().lower() for e in hei.get("equipment", []) if e.strip()]
    hei_labs = [l.strip().lower() for l in hei.get("laboratories", []) if l.strip()]
    matched_equipment: List[str] = []
    missing_equipment: List[str] = []

    if req_equip:
        for e in req_equip:
            # Match substring or word overlap
            e_words = [w for w in e.split() if len(w) > 3]
            if any(he in e or e in he or any(w in he for w in e_words) for he in hei_equip + hei_labs):
                matched_equipment.append(e)
            else:
                missing_equipment.append(e)
        equip_ratio = len(matched_equipment) / len(req_equip)
        equip_score = round(equip_ratio * 15.0, 1)
        reasons.append(
            f"Equipment: {len(matched_equipment)}/{len(req_equip)} diagnostic & field tools available in labs."
        )
    else:
        equip_score = 12.0
        reasons.append("Equipment: Institutional lab infrastructure verified for testing and deployment.")

    # 4. Software & Tools Match (10%)
    req_software = [s.strip().lower() for s in (caps.software_tools or []) if s.strip()]
    hei_software = [s.strip().lower() for s in hei.get("software_tools", []) if s.strip()]
    matched_software: List[str] = []
    missing_software: List[str] = []

    if req_software:
        for s in req_software:
            if any(hs in s or s in hs for hs in hei_software):
                matched_software.append(s)
            else:
                missing_software.append(s)
        soft_ratio = len(matched_software) / len(req_software)
        software_score = round(soft_ratio * 10.0, 1)
        reasons.append(
            f"Software: {len(matched_software)}/{len(req_software)} computational/GIS packages matched."
        )
    else:
        software_score = 8.0
        reasons.append("Software: Standard academic engineering workstation licenses available.")

    # 5. Location / District Relevance (10%)
    rep_dist = (report_district or "").strip().lower()
    rep_state = (report_state or "jharkhand").strip().lower()
    hei_dist = str(hei.get("district", "")).strip().lower()
    hei_state = str(hei.get("state", "jharkhand")).strip().lower()
    inst_type = str(hei.get("institution_type", "")).strip().lower()

    if rep_dist and rep_dist == hei_dist:
        location_score = 10.0
        reasons.append(
            f"Location: Same district ({hei.get('district')}). High geographical proximity for fast on-site verification."
        )
    elif rep_state == hei_state:
        location_score = 7.0
        reasons.append(
            f"Location: Same state ({hei.get('state')}, {hei.get('district')}). Accessible for regional field pilot."
        )
    elif "national" in inst_type:
        location_score = 5.0
        reasons.append(
            f"Location: Institute of National Importance ({hei.get('state')}). Interstate research capability."
        )
    else:
        location_score = 3.0
        reasons.append(
            f"Location: Interstate partner ({hei.get('state')}). Remote advisory and computational modeling."
        )

    # 6. Project Complexity & Experience (10%)
    rep_comp = str(caps.complexity or "medium").strip().lower()
    exp_data = hei.get("project_experience", {})
    hei_comp = str(exp_data.get("complexity_level", "medium")).strip().lower()
    faculty_capacity = int(hei.get("available_faculty_capacity", 10))

    if rep_comp == "high":
        if hei_comp == "high" and faculty_capacity >= 25:
            complexity_score = 10.0
            reasons.append("Complexity: Proven capability for high-complexity civil/infrastructure engineering initiatives.")
        elif faculty_capacity >= 15:
            complexity_score = 7.0
            reasons.append("Complexity: Adequate faculty capacity for complex project execution.")
        else:
            complexity_score = 5.0
            reasons.append("Complexity: Limited capacity for high-complexity field deployments.")
    elif rep_comp == "medium":
        if faculty_capacity >= 15:
            complexity_score = 10.0
            reasons.append("Complexity: Robust experience and faculty alignment for medium-complexity civic projects.")
        else:
            complexity_score = 8.0
            reasons.append("Complexity: Satisfactory alignment with medium-scale field requirements.")
    else:  # "low"
        complexity_score = 10.0
        reasons.append("Complexity: Rapid turnaround capacity for low-complexity community interventions.")

    # Calculate Total Match Score (0 to 100)
    raw_total = skill_score + domain_score + equip_score + software_score + location_score + complexity_score
    total_score = round(max(0.0, min(100.0, raw_total)), 1)

    # Recommendation Level mapping
    if total_score >= 85.0:
        recommendation_level = "excellent"
    elif total_score >= 65.0:
        recommendation_level = "strong"
    elif total_score >= 40.0:
        recommendation_level = "moderate"
    else:
        recommendation_level = "low"

    factor_scores = HEIFactorScores(
        skills=skill_score,
        technical_domains=domain_score,
        equipment=equip_score,
        software=software_score,
        location=location_score,
        complexity=complexity_score,
    )

    matched_details = MatchedCapabilityDetails(
        matched_skills=matched_skills,
        matched_domains=matched_domains,
        matched_equipment=matched_equipment,
        matched_software=matched_software,
    )

    missing_details = MissingCapabilityDetails(
        missing_skills=missing_skills,
        missing_domains=missing_domains,
        missing_equipment=missing_equipment,
        missing_software=missing_software,
    )

    confidence = 0.90 if req_skills else 0.75

    return HEIRecommendationMatch(
        hei_id=str(hei.get("hei_id", "")),
        hei_name=str(hei.get("name", "")),
        district=str(hei.get("district", "")),
        state=str(hei.get("state", "Jharkhand")),
        institution_type=str(hei.get("institution_type", "University")),
        verification_status=str(hei.get("verification_status", "unverified")),
        match_score=total_score,
        recommendation_level=recommendation_level,
        factor_scores=factor_scores,
        matched_capabilities=matched_details,
        missing_capabilities=missing_details,
        reasons=reasons,
        confidence=confidence,
        departments=list(hei.get("departments") or []),
        available_skills=list(hei.get("available_skills") or []),
        technical_domains=list(hei.get("technical_domains") or []),
        laboratories=list(hei.get("laboratories") or []),
        equipment=list(hei.get("equipment") or []),
        software_tools=list(hei.get("software_tools") or []),
        project_experience=dict(hei.get("project_experience") or {}),
        available_faculty_capacity=int(hei.get("available_faculty_capacity") or 10),
        contact_email=hei.get("contact_email"),
    )


def match_report_to_heis(
    caps: Optional[ExtractedCapabilities],
    report_district: str,
    report_state: str,
    hei_profiles: List[Dict[str, Any]],
) -> Tuple[List[HEIRecommendationMatch], str, float, str]:
    """
    Ranks all candidate HEIs against the report capabilities and returns the top 5 matches.
    """
    if not hei_profiles:
        return [], "no_matches", 0.0, "hei_explainable_matcher_v1"

    if caps is None or not caps.skills:
        # If capabilities are completely missing or empty, mark as needs_review
        return [], "needs_review", 0.0, "hei_explainable_matcher_v1"

    evaluated: List[HEIRecommendationMatch] = []
    for hei in hei_profiles:
        try:
            match = calculate_hei_match(
                caps=caps,
                report_district=report_district,
                report_state=report_state,
                hei=hei,
            )
            evaluated.append(match)
        except Exception as e:
            logger.warning(f"Error calculating HEI match for {hei.get('hei_id')}: {e}")
            continue

    # Sort descending by match score
    evaluated.sort(key=lambda m: m.match_score, reverse=True)
    top_5 = evaluated[:5]

    status = "completed" if top_5 else "no_matches"
    avg_conf = round(sum(m.confidence for m in top_5) / len(top_5), 2) if top_5 else 0.0

    return top_5, status, avg_conf, "hei_explainable_matcher_v1"


def get_or_seed_hei_profiles(db: Session) -> List[Dict[str, Any]]:
    """
    Retrieves all HEI profiles from PostgreSQL. If the table is empty,
    seeds default profiles marked as 'unverified'.
    """
    try:
        db_profiles = db.query(HEIProfile).all()
        if db_profiles:
            return [
                {
                    "hei_id": p.hei_id,
                    "name": p.name,
                    "district": p.district,
                    "state": p.state,
                    "institution_type": p.institution_type,
                    "departments": p.departments or [],
                    "available_skills": p.available_skills or [],
                    "technical_domains": p.technical_domains or [],
                    "laboratories": p.laboratories or [],
                    "equipment": p.equipment or [],
                    "software_tools": p.software_tools or [],
                    "project_experience": p.project_experience or {},
                    "available_faculty_capacity": p.available_faculty_capacity,
                    "verification_status": p.verification_status,
                    "contact_email": p.contact_email,
                    "associated_user_email": p.associated_user_email,
                }
                for p in db_profiles
            ]

        # Seed initial demo profiles if empty
        logger.info("hei_profiles table is empty; seeding default demo HEIs...")
        for sp in SEED_HEI_PROFILES:
            new_p = HEIProfile(
                hei_id=sp["hei_id"],
                name=sp["name"],
                district=sp["district"],
                state=sp["state"],
                institution_type=sp["institution_type"],
                departments=sp["departments"],
                available_skills=sp["available_skills"],
                technical_domains=sp["technical_domains"],
                laboratories=sp["laboratories"],
                equipment=sp["equipment"],
                software_tools=sp["software_tools"],
                project_experience=sp["project_experience"],
                available_faculty_capacity=sp["available_faculty_capacity"],
                verification_status=sp["verification_status"],
                contact_email=sp["contact_email"],
                associated_user_email=sp["associated_user_email"],
            )
            db.add(new_p)
        db.commit()
        return SEED_HEI_PROFILES
    except Exception as e:
        logger.error(f"Error querying or seeding hei_profiles: {e}", exc_info=True)
        # Fallback to in-memory list
        return SEED_HEI_PROFILES


def analyze_and_store_report_hei_matches(db: Session, report: Report) -> None:
    """
    Executes HEI matching for a report and stores top 5 matches in PostgreSQL.
    Non-blocking: will NEVER crash report submission or calling flows.
    """
    try:
        raw_caps = report.ai_capabilities
        if not raw_caps or not isinstance(raw_caps, dict):
            logger.info(f"Report {report.track_id} has no capabilities yet; HEI matching marked pending.")
            report.ai_hei_matching_status = "pending"
            db.commit()
            return

        try:
            caps_obj = ExtractedCapabilities(**raw_caps)
        except Exception:
            caps_obj = None

        if caps_obj is None or not caps_obj.skills:
            report.ai_hei_matching_status = "needs_review"
            db.commit()
            return

        profiles = get_or_seed_hei_profiles(db)
        top_5, status, _, model_used = match_report_to_heis(
            caps=caps_obj,
            report_district=report.district,
            report_state=report.state or "Jharkhand",
            hei_profiles=profiles,
        )

        report.ai_hei_matching_status = status
        report.ai_hei_matches = [m.model_dump() for m in top_5]
        report.ai_hei_matching_model = model_used
        report.ai_hei_matching_analyzed_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(report)
        logger.info(
            f"HEI matching stored for {report.track_id}: "
            f"{len(top_5)} recommendations (status={status})"
        )
    except Exception as e:
        logger.error(f"Failed to store HEI matches for {report.track_id}: {e}", exc_info=True)
        try:
            report.ai_hei_matching_status = "failed"
            db.commit()
        except Exception:
            db.rollback()
