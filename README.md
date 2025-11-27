# **SMART TASK ANALYZER**





###### **Name :** Bojja Naga Bhavya Charitha

###### **Date :** 27 Nov 2025





 A Django-based web application that intelligently scores and prioritizes tasks based on multiple factors including urgency, importance, effort, and     dependencies.

## **Features:**



**Intelligent Prioritization**: Algorithm-driven task scoring with multiple strategies



**Dependency Management:** Visual dependency graphs and circular dependency detection



**Real-time Updates:** Instant score recalculation and task management



**Multiple Strategies:** Smart Balance, Fastest Wins, High Impact, and Deadline Driven



**CRUD Operations:** Full Create, Read, Update, Delete functionality



**Progress Tracking**: Task completion monitoring and progress analytics



**JSON Support:** Bulk task import/export capabilities





### **1)Setup Instructions:**



* #### **Prerequisites**



\- Python 3.8+

\- Django 4.0+



* #### **Installation Steps**



###### **1.Clone and Setup Backend**

 

  ```bash

  cd backend

  pip install -r requirements.txt

  python manage.py migrate

  python manage.py runserver



###### Backend server runs on ***http://127.0.0.1:8000/***



###### **2.Launch Frontend:**



 - Open ***frontend/index.html*** in your web browser.

 - The frontend will automatically connect to the backend API.

#### 

#### **2) Algorithm Explanation:**

 

  The Smart Task Analyzer uses a weighted scoring system that evaluates tasks across four key dimensions. Each task receives a priority score between 0-100 calculated using configurable strategies.



##### **Formula:**



######   **Priority Score** = min(100,(Urgency × W\_urgency)+(Importance × W\_importance)+(Effort × W\_effort) × Dependency\_Multiplier)



* **Urgency Scoring uses time-based decay**: overdue tasks (100 points), today (100), tomorrow (90), 3 days (80), 1 week (60), future (40). This creates appropriate pressure for time-sensitive work.



* Importance linearly scales user ratings (1-10) to 8-80 points, ensuring user priorities directly influence outcomes.



* **Effort uses inverse scoring**: tasks under 2 hours (80-100 points), medium tasks (40-79), large tasks (10-39). This psychological approach boosts productivity through visible progress.



* **Dependencies use multipliers**: blocking one task (1.2x), multiple tasks (1.5x), with circular dependencies penalized (0.5x).



###### **The system offers four strategies:**



* **Smart Balance** (40% urgency, 30% importance, 20% effort, 10% dependencies) - balanced productivity



* **Fastest Wins** (50% effort, 20% urgency, 20% importance, 10% dependencies) - momentum building



* **High Impact** (70% importance, 10% urgency, 10% effort, 10% dependencies) - strategic focus



* **Deadline Driven** (60% urgency, 20% importance, 10% effort, 10% dependencies) - time-sensitive focus





#### **3)Design Decisions:**



* ###### **Weighted Scoring vs Rigid Hierarchies:**

Chosen to handle complex interplay between urgency and importance, preventing important strategic tasks from being overshadowed by less important urgent tasks.



* ###### **Configurable Strategy Profiles:**

 Algorithm allows users to adapt to changing priorities without code changes through different weighting profiles.





* ###### **SQLite Database**:

Used for simplicity and easy evaluation, focusing on core functionality rather than complex infrastructure.



* ###### **Real-time UI Updates:**

######  Despite added complexity, implemented immediate feedback for better user experience when modifying tasks.



* ###### **Edit/Delete Operations:**

Added full CRUD functionality beyond requirements to demonstrate comprehensive task management thinking.



* ###### **Circular Dependency Detection:**

Implemented with scoring penalties rather than rejection, helping users identify and resolve issues gracefully.





### **4) Time Breakdown:**





* ###### **Project Planning \& Algorithm Design:** 1 hours 45minutes



* ###### **Backend Development (Django)**: 3 hours



* ###### **Frontend Development:** 2 hours



* ######  **Testing \& Documentation:** 2 hour 15 minutes



### **5)Unit Tests for Scoring-Algorithm:**



* **Test for Urgency Scoring               :** Tests time-based scoring



* **Test for Circular Dependency Detection :** Tests cycle detection



* **Test for Priority Scoring and Sorting  :** Tests end-to-end workflow



* **Test for different Strategies          :** Tests strategy variations



* **Test for Edge cases                    :** Tests robustnes**s**



* **Test for Score Capping                 :** Ensures scores don't exceed 100.





### **6)Bonus Challenges Attempted:**



* ###### **Circular Dependency Detection:**

Fully implemented with depth-first search algorithm and visual dependency graphs.



* ###### **Comprehensive Testing:**

Implemented unit tests for scoring algorithms, edge cases, and different strategy configurations.

###### 

* ###### **Enhanced UI/UX:**

Added edit/delete operations, completion tracking, and real-time dependency visualization beyond core requirements.

###### 

* ###### **Dependency Visualization:**

Interactive task relationship graphs.



* ###### **Task Completion Tracking \& Progress Monitoring:**

Implemented completion rate tracking, progress visualization, and completion history with metrics showing total tasks, completed tasks, and completion percentage.

### 

### **7)FutureImprovements**:



* **User Authentication:** Personal accounts to save and manage multiple task lists persistently.



* **Export Functionality**: PDF/Excel export for sharing analyzed task lists with team members.



* **Recurring Tasks:** Support for periodic tasks with automated scheduling and prioritization.



* **Team Collaboration:** Multi-user support for shared projects with role-based permissions.



* **Calendar Integration:** Sync with popular calendar applications for better schedule management.



* **Advanced Analytics:** Time tracking and productivity analytics to refine the scoring algorithm based on actual completion patterns.



* **Mobile Application:** Native mobile app for on-the-go task management and prioritization.
