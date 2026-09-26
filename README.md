# ResQverse

AI-assisted relocation site recommendation system for vulnerable habitations across Northeast India.

## Overview

ResQverse is a disaster-aware decision support system designed to help identify safer and more suitable relocation sites for vulnerable habitations.

The current implementation focuses on **Dibrugarh, Assam**, combining village-level geographic, infrastructure, environmental, and disaster-risk information to generate relocation scores and recommendations.

## Key Features

- ??? Village-level relocation suitability scoring
- ?? Flood risk assessment
- ?? Landslide and slope risk integration
- ??? Accessibility assessment
- ?? Relocation capacity assessment
- ?? Environmental suitability assessment
- ?? Geographic coordinates for village mapping
- ?? XGBoost-based flood and landslide prediction
- ?? Personalized relocation recommendations
- ??? Interactive relocation planning interface

## System Architecture

```text
Village & Geographic Data
          ?
          ?
   Data Processing
          ?
          ?
 Risk + Infrastructure Features
          ?
          ?????????????????
          ?               ?
 Relocation Scoring    ML Prediction
          ?               ?
          ?               ?
 Personalized        Flood / Landslide
 Recommendations          Risk
          ?               ?
          ?????????????????
                  ?
          FastAPI Backend
                  ?
                  ?
           React Frontend
## Team Contributions

### Backend

* Built the FastAPI backend and API endpoints.
* Developed the relocation scoring and personalized recommendation logic.
* Integrated village risk, safety, accessibility, capacity, environment, and location data.
* Added village coordinates to the relocation API.
* Developed and validated the prediction backend.
* Tested backend APIs and deployment.

### Frontend

* Built and integrated the React user interface.
* Developed the interactive Red Zone Map and village visualization.
* Integrated relocation recommendations with the backend APIs.
* Implemented village selection, recommendation cards, map markers, and user interactions.
* Tested and deployed the frontend.

### Shared

* Project planning and system integration.
* End-to-end testing and debugging.
* Documentation and final project validation.
