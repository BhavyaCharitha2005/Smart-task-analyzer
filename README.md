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

&nbsp; The Smart Task Analyzer uses an advanced, weighted scoring system that evaluates each task against four critical dimensions. Each task has a computed     priority score via a carefully balanced formula considering both immediate needs and long-term impact.

##### **Formula:**

######     Priority Score =(Urgency × W\_urgency)+(Importance × W\_importance)+(Effort × W\_effort)+(Dependency × W\_dependency)  

###### &nbsp;                                                                                                      

* ###### **Urgency Scoring (0-150 points)**: 

This uses time-based decay with exponential penalties for tasks being overdue. Tasks due today get 100 points, and overdue tasks gain 15 points per day overdue, with a maximum of 150. Future-dated tasks lose 5 points per day to ensure imminent deadlines receive proper attention. Tasks with no due dates are given 10 points.



* ###### **Importance Scoring (10-100 points):** 

The rating of importance, as provided by users on a scale from 1 to 10, is multiplied by 10 to achieve a linear progression from low to high. This simple method allows the user's priorities to directly translate into scores.



* ###### **Effort Scoring (10-100 points):**

&nbsp;Using an inverse relationship, this prioritizes "quick wins." Tasks taking 1-2 hours score 80-100 points; medium tasks of 3-6 hours score 40-79 points, and large tasks of 7+ hours score 10-39 points. This rewards productivity by making small, completable tasks attractive.

###### 

* ###### **Dependency Multipliers (0.5× - 1.5×):**

&nbsp;This critical factor identifies blocking relationships. Tasks that are not dependent on any others have a 1.0× multiplier. Those tasks blocking for one task get 1.2×, while tasks blocking more than one task receive 1.5×. A special penalty for circular dependency involvement is given at 0.5× to prevent deadlocks.



\- Therefore, It includes four different strategies with pre-defined weight distribution, which allow the user to easily align prioritization with their current working style or project needs. 



#### **3)Design Decisions:**


* ###### **Algorithm Balance:** 

Instead of rigid hierarchies, I implemented weighted scoring to handle the complex interplay between urgency and importance. This prevents important long-term tasks from being perpetually overshadowed by less important urgent tasks.


* ###### **Overdue Handling:**

&nbsp;Exponential penalties for overdue tasks create appropriate urgency without allowing scores to become unreasonably high. The cap at 150 points maintains score balance across the system.


* ###### **Effort Curve:** 

The non-linear effort scoring strongly incentivizes quick wins while still acknowledging that some important tasks require significant time investment.


* ###### **Circular Dependency Resolution:**

&nbsp;Rather than rejecting circular dependencies entirely, the system detects them and applies penalties, allowing users to identify and resolve dependency issues.



* ###### **Technical Simplicity:** 

Using SQLite and no authentication aligned with assignment requirements while ensuring easy setup and evaluation.


### **4) Time Breakdown:**

* ###### **Project Planning \& Algorithm Design:** 45 minutes
* ###### **Backend Development (Django)**: 2 hours

&nbsp;- Project setup \& models: 30 minutes.

&nbsp;- Scoring algorithm: 60 minutes.

&nbsp;- API endpoints: 30 minutes.

* ###### **Frontend Development: 1.5 hours**

&nbsp;- HTML structure \& forms: 40 minutes.

&nbsp;- CSS styling \& responsiveness: 30 minutes.

&nbsp;- JavaScript functionality: 20 minutes.

* ###### **Testing \& Documentation: 1 hour**

&nbsp;- Unit tests: 30 minutes.

&nbsp;- README \& final touches: 30 minutes.

&nbsp;- Total Development Time: 4 hours 15 minutes.


### **5)Unit Tests for Scoring-Algorithm:**


* **Test for Urgency Scoring               :** Tests time-based scoring



* **Test for Circular Dependency Detection :** Tests bonus feature



* **Test for Priority Scoring and Sorting  :** Tests end-to-end workflow



* **Test for different Strategies          :** Tests strategy variations



* **Test for Edge cases                    :** Tests robustnes**s**




### **6)Bonus Challenges Attempted:**

* ###### **Circular Dependency Detection:**

&nbsp;Fully implemented with depth-first search algorithm that identifies dependency cycles and applies appropriate scoring penalties.



* ###### **Unit Tests:**

&nbsp;Exceeded requirements with 5 comprehensive tests covering urgency scoring, circular dependencies, priority sorting, strategy variations, and edge case handling.

### 

### 7)Future Improvements:


* **Visual Dependency Graphs**: Showing task relationships and highlighting circular dependencies.



* **Task Persistence**: With database storage for ongoing project management.



* **User Customization**: Allowing personalized algorithm weights and strategies.



* **Export Functionality :** For sharing analyzed task lists in various formats.



* **Collaborative Features :** Enabling team-based task prioritization.





&nbsp;                                                                                                                                 




