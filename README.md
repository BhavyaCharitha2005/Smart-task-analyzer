#                  **SMART TASK ANALYZER**

&nbsp;A Django-based web application that intelligently scores and prioritizes tasks based on multiple factors including urgency, importance, effort, and     dependencies.

### **1)Setup Instructions:**

* #### **Prerequisites**

\- Python 3.8+

\- Django 4.0+

* #### **Installation Steps**

###### **1.Clone and Setup Backend**

&nbsp;

&nbsp; ```bash

&nbsp; cd backend

&nbsp; pip install -r requirements.txt

&nbsp; python manage.py migrate

&nbsp; python manage.py runserver



######                          Backend server runs on ***http://127.0.0.1:8000/***


###### **2.Launch Frontend:**

&nbsp;- Open ***frontend/index.html*** in your web browser.

&nbsp;- The frontend will automatically connect to the backend API.

#### 

#### **2) Algorithm Explanation:**

&nbsp; 

&nbsp; The Smart Task Analyzer uses a weighted scoring system that evaluates tasks across four key dimensions: urgency, importance, effort, and dependencies. Each task receives a priority score between 0-100 calculated using a configurable formula that balances these competing factors..

##### **Formula:**

###### &nbsp; **Priority Score** = min(100,(Urgency × W\_urgency)+(Importance × W\_importance)+(Effort × W\_effort) × Dependency\_Multiplier)

* The core algorithm applies different weights based on the selected strategy. For the default "Smart Balance" strategy, urgency contributes 40%, importance 30%, effort 20%, and dependencies 10%. Urgency scoring uses time-based decay where overdue tasks receive maximum points (100), tasks due today get 100 points, tomorrow 90 points, within 3 days 80 points, within a week 60 points, and future tasks 40 points. This creates appropriate pressure for time-sensitive work.

* Importance scoring linearly scales user-provided ratings (1-10 scale) to 8-80 points, ensuring user priorities directly influence outcomes. Effort scoring uses an inverse relationship that rewards "quick wins" - tasks under 2 hours score 80-100 points, medium tasks 40-79 points, and large tasks 10-39 points. This psychological approach boosts productivity by making progress visible.

* Dependency analysis identifies blocking relationships. Tasks blocking others receive multipliers (1.2x for one dependency, 1.5x for multiple), while circular dependencies are penalized (0.5x). The system includes four strategies: "Fastest Wins" prioritizes low-effort tasks, "High Impact" focuses on importance, "Deadline Driven" emphasizes urgency, and "Smart Balance" provides optimal weighting across all factors.
  

#### **3)Design Decisions:**

* ###### **Weighted Scoring vs Rigid Hierarchies:** 
Chosen to handle complex interplay between urgency and importance, preventing important strategic tasks from being overshadowed by less important urgent tasks.

* ###### **Configurable Strategy Profiles:**
&nbsp;Algorithm allows users to adapt to changing priorities without code changes through different weighting profiles.

* ###### **Overdue Task Handling:**
  **&nbsp;**Implemented strong penalties (maximum urgency score) instead of exponential growth to maintain score balance across the system.
  
* ###### **Effort Curve Design:** 
Strongly incentivizes quick wins while acknowledging that critical tasks may require significant time investment.

* ###### **Circular Dependency Approach:** 
Detection using depth-first search with scoring penalties rather than outright rejection, helping users identify and resolve issues.

* ###### **Technology Choices:** 
Used SQLite and avoided authentication to simplify setup and evaluation, focusing on core functionality.

* ###### **Enhanced Frontend Features:** 
Added edit/delete operations despite not being required, demonstrating comprehensive task management thinking.

* ###### **Real-time Updates:**
&nbsp;Immediate score feedback when users modify tasks, enhancing interactive experience.


### **4) Time Breakdown:**

* ###### **Project Planning \& Algorithm Design:** 1 hours 45minutes
* ###### **Backend Development (Django)**: 3 hours 
* ###### **Frontend Development:** 2 hours
* ###### &nbsp;**Testing \& Documentation:** 1 hour 15 minutes


### **5)Unit Tests for Scoring-Algorithm:**

* **Test for Urgency Scoring               :** Tests time-based scoring

* **Test for Circular Dependency Detection :** Tests cycle detection

* **Test for Priority Scoring and Sorting  :** Tests end-to-end workflow

* **Test for different Strategies          :** Tests strategy variations

* **Test for Edge cases                    :** Tests robustnes**s**

* **Test for Score Capping                 :** Ensures scores don't exceed 100.

### **6)Bonus Challenges Attempted:**

* ###### **Circular Dependency Detection:** 
Fully implemented with depth-first search algorithm.
###### 
* ###### **Unit Tests:**
 **&nbsp;**Exceeded requirements with comprehensive test coverage.
###### 
* ###### **Enhanced UI/UX:** 
Added edit/delete operations and completion tracking.
###### 
* ###### **Dependency Visualization:** 
Interactive task relationship graphs.
###### 
* ###### **Real-time Updates:** 
Instant score recalculations on task modifications.
### 
### 7**)Future Improvements:**

* ###### **Task Persistence**:
&nbsp;With database storage for ongoing project management.

* ###### **Export Functionality :** 
For sharing analyzed task lists in various formats.

* ###### **Collaborative Features :** 
Enabling team-based task prioritization.

&nbsp;                                                                                                                                 




