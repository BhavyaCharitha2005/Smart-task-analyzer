# SMART TASK ANALYZER

**Developer:** Bojja Naga Bhavya Charitha  
**Date     :** 27November  2025  


A Django-based web application that intelligently scores and prioritizes tasks based on multiple factors including urgency, importance, effort, and dependencies.

## FEATURES

- Intelligent Prioritization: Algorithm-driven task scoring with multiple strategies
- Dependency Management: Visual dependency graphs and circular dependency detection
- Real-time Updates: Instant score recalculation and task management
- Multiple Strategies: Smart Balance, Fastest Wins, High Impact, and Deadline Driven
- CRUD Operations: Full Create, Read, Update, Delete functionality
- Progress Tracking: Task completion monitoring and progress analytics
- JSON Support: Bulk task import/export capabilities.

https://github.com/user-attachments/assets/3c20e24d-4b15-4e21-b059-1e655ce15ebf

## SETUP INSTRUCTIONS

### Prerequisites
- Python 3.8+
- Django 4.0+

### Installation Steps

1. Setup Backend
Navigate to the backend directory and run:
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

The backend server will run on http://127.0.0.1:8000/

2. Launch Frontend
Open frontend/index.html in your web browser. The frontend will automatically connect to the backend API.

## ALGORITHM EXPLANATION

The Smart Task Analyzer uses a weighted scoring system that evaluates tasks across four key dimensions. Each task receives a priority score between 0-100 calculated using configurable strategies.

### Scoring Formula
Priority Score = min(100, (Urgency × W_urgency) + (Importance × W_importance) + (Effort × W_effort) × Dependency_Multiplier)

### Scoring Components
- Urgency Scoring: Time-based decay: overdue tasks (100 points), today (100), tomorrow (90), 3 days (80), 1 week (60), future (40)
- Importance: Linearly scales user ratings (1-10) to 8-80 points
- Effort: Inverse scoring: tasks under 2 hours (80-100 points), medium tasks (40-79), large tasks (10-39)
- Dependencies: Multipliers: blocking one task (1.2x), multiple tasks (1.5x), circular dependencies penalized (0.5x)

### Available Strategies
- Smart Balance(Default): 40% urgency, 30% importance, 20% effort, 10% dependencies
- Fastest Wins: 50% effort, 20% urgency, 20% importance, 10% dependencies
- High Impact: 70% importance, 10% urgency, 10% effort, 10% dependencies
- Deadline Driven: 60% urgency, 20% importance, 10% effort, 10% dependencies

## DESIGN DECISIONS

- Weighted Scoring vs Rigid Hierarchies: Handles complex interplay between urgency and importance
- Configurable Strategy Profiles: Allows users to adapt to changing priorities
- SQLite Database: Chosen for simplicity and easy evaluation
- Real-time UI Updates: Immediate feedback for better user experience
- Edit/Delete Operations: Full CRUD functionality beyond requirements
- Circular Dependency Detection: Scoring penalties rather than rejection

## TIME BREAKDOWN

- Project Planning & Algorithm Design: 1 hour 45 minutes
- Backend Development (Django): 3 hours
- Frontend Development: 2 hours
- Testing & Documentation: 2 hours 15 minutes

## UNIT TESTS

- Test for Urgency Scoring: Tests time-based scoring
- Test for Circular Dependency Detection: Tests cycle detection
- Test for Priority Scoring and Sorting: Tests end-to-end workflow
- Test for different Strategies: Tests strategy variations
- Test for Edge cases: Tests robustness
- Test for Score Capping: Ensures scores don't exceed 100

## BONUS CHALLENGES ATTEMPTED

- Circular Dependency Detection: Fully implemented with depth-first search algorithm
- Comprehensive Testing: Unit tests for scoring algorithms and edge cases
- Enhanced UI/UX: Edit/delete operations and completion tracking
- Dependency Visualization: Interactive task relationship graphs
- Task Completion Tracking: Progress monitoring with completion metrics

## FUTURE IMPROVEMENTS

- User Authentication: Personal accounts for persistent task management
- Export Functionality: PDF/Excel export for sharing task lists
- Recurring Tasks: Support for periodic tasks with automated scheduling
- Team Collaboration: Multi-user support for shared projects
- Calendar Integration: Sync with popular calendar applications
- Advanced Analytics: Time tracking and productivity analytics

