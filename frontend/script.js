// Global variables
let tasks = [];
let editingIndex = -1; // -1 means not editing, otherwise index of task being edited
let completedTasks = [];

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize form submission
    document.getElementById('singleTaskForm').addEventListener('submit', addSingleTask);
    
    // Load sample tasks for demonstration
    loadSampleTasks();
    
    // Load completed tasks from storage
    loadCompletedTasks();
});

// Add single task from form
function addSingleTask(event) {
    event.preventDefault();
    
    const task = {
        title: document.getElementById('title').value,
        due_date: document.getElementById('due_date').value,
        estimated_hours: parseFloat(document.getElementById('estimated_hours').value),
        importance: parseInt(document.getElementById('importance').value),
        dependencies: parseDependencies(document.getElementById('dependencies').value)
    };
    
    // Validate task
    if (!validateTask(task)) {
        return;
    }
    
    if (editingIndex === -1) {
        // Add new task
        tasks.push(task);
        showNotification('Task added successfully!', 'success');
    } else {
        // Update existing task
        tasks[editingIndex] = task;
        editingIndex = -1;
        document.querySelector('#singleTaskForm button').textContent = 'Add Task';
        showNotification('Task updated successfully!', 'success');
    }
    
    updateTasksList();
    updateProgressStats();
    document.getElementById('singleTaskForm').reset();
}

// Parse dependencies from comma-separated string
function parseDependencies(depsString) {
    if (!depsString.trim()) return [];
    
    return depsString.split(',')
        .map(dep => dep.trim())
        .filter(dep => dep !== '')
        .map(dep => parseInt(dep));
}

// Validate task data
function validateTask(task) {
    const errors = [];
    
    if (!task.title || task.title.trim() === '') {
        errors.push('Title is required');
    }
    
    if (!task.due_date) {
        errors.push('Due date is required');
    }
    
    if (!task.estimated_hours || task.estimated_hours < 0.5) {
        errors.push('Estimated hours must be at least 0.5');
    }
    
    if (!task.importance || task.importance < 1 || task.importance > 10) {
        errors.push('Importance must be between 1 and 10');
    }
    
    if (errors.length > 0) {
        showNotification('Please fix the following errors: ' + errors.join(', '), 'error');
        return false;
    }
    
    return true;
}

// Edit task function
function editTask(index) {
    const task = tasks[index];
    
    // Fill the form with existing task data
    document.getElementById('title').value = task.title;
    document.getElementById('due_date').value = task.due_date;
    document.getElementById('estimated_hours').value = task.estimated_hours;
    document.getElementById('importance').value = task.importance;
    document.getElementById('dependencies').value = task.dependencies.join(', ');
    
    // Set editing mode
    editingIndex = index;
    
    // Change button text
    document.querySelector('#singleTaskForm button').textContent = 'Update Task';
    
    // Scroll to form
    document.getElementById('title').focus();
    
    showNotification('Editing task: ' + task.title, 'info');
}

// Delete task function WITH DEPENDENCY FIXING
function deleteTask(index) {
    if (confirm('Are you sure you want to delete "' + tasks[index].title + '"?')) {
        const deletedTask = tasks.splice(index, 1)[0];
        
        // FIX DEPENDENCIES: Update all other tasks' dependencies
        tasks.forEach(task => {
            // Remove dependencies pointing to the deleted task
            task.dependencies = task.dependencies.filter(dep => dep !== index + 1);
            
            // Update dependencies that point to tasks after the deleted one
            task.dependencies = task.dependencies.map(dep => {
                if (dep > index + 1) {
                    return dep - 1; // Decrease the dependency number
                }
                return dep; // Keep as is
            });
        });
        
        updateTasksList();
        updateProgressStats();
        showNotification('Task deleted: ' + deletedTask.title, 'success');
        
        // If we were editing this task, cancel edit mode
        if (editingIndex === index) {
            editingIndex = -1;
            document.querySelector('#singleTaskForm button').textContent = 'Add Task';
            document.getElementById('singleTaskForm').reset();
        }
    }
}

// Load tasks from JSON input
function loadJSONTasks() {
    const jsonInput = document.getElementById('jsonInput').value;
    
    if (!jsonInput.trim()) {
        showNotification('Please enter JSON data', 'error');
        return;
    }
    
    try {
        const parsedTasks = JSON.parse(jsonInput);
        
        if (!Array.isArray(parsedTasks)) {
            throw new Error('Input must be a JSON array');
        }
        
        // Validate each task
        const validTasks = [];
        for (const task of parsedTasks) {
            if (validateTask(task)) {
                validTasks.push(task);
            }
        }
        
        tasks = tasks.concat(validTasks);
        updateTasksList();
        updateProgressStats();
        showNotification(`Loaded ${validTasks.length} tasks from JSON`, 'success');
        
    } catch (error) {
        showNotification('Invalid JSON format: ' + error.message, 'error');
    }
}

// Update tasks list display
function updateTasksList() {
    const tasksList = document.getElementById('tasksList');
    
    if (tasks.length === 0) {
        tasksList.innerHTML = '<p style="color: #718096; text-align: center;">No tasks added yet</p>';
        return;
    }
    
    tasksList.innerHTML = tasks.map((task, index) => `
        <div class="task-item">
            <div class="task-header">
                <strong>${index + 1}. ${task.title}</strong>
                <div class="task-actions">
                    <button onclick="editTask(${index})" class="edit-btn">Edit</button>
                    <button onclick="deleteTask(${index})" class="delete-btn">Delete</button>
                </div>
            </div>
            <div class="task-details">
                Due: ${task.due_date} | Hours: ${task.estimated_hours} | Importance: ${task.importance}/10
                ${task.dependencies.length > 0 ? `| Dependencies: [${task.dependencies.join(', ')}]` : ''}
            </div>
        </div>
    `).join('');
}

// Analyze tasks using API
async function analyzeTasks() {
    if (tasks.length === 0) {
        showNotification('Please add at least one task to analyze', 'error');
        return;
    }
    
    const strategy = document.getElementById('strategy').value;
    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('error');
    const resultsElement = document.getElementById('results');
    
    // Show loading state
    loadingElement.classList.remove('hidden');
    errorElement.classList.add('hidden');
    resultsElement.innerHTML = '';
    
    try {
        const response = await fetch('http://127.0.0.1:8000/api/tasks/analyze/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                tasks: tasks,
                strategy: strategy
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        displayResults(data.tasks);
        showNotification('Tasks analyzed successfully!', 'success');
        
    } catch (error) {
        console.error('Error analyzing tasks:', error);
        errorElement.textContent = `Failed to analyze tasks: ${error.message}. Make sure the Django server is running on http://127.0.0.1:8000/`;
        errorElement.classList.remove('hidden');
    } finally {
        loadingElement.classList.add('hidden');
    }
}

// Display analysis results
function displayResults(analyzedTasks) {
    const resultsElement = document.getElementById('results');
    
    if (analyzedTasks.length === 0) {
        resultsElement.innerHTML = '<p>No tasks to display</p>';
        return;
    }
    
    resultsElement.innerHTML = analyzedTasks.map((task, index) => {
        const priorityClass = getPriorityClass(task.priority_score);
        const priorityBadge = getPriorityBadge(task.priority_score);
        
        return `
            <div class="task-card ${priorityClass}">
                <div class="task-header">
                    <div>
                        <div class="task-title">${index + 1}. ${task.title}</div>
                        <div class="priority-badge ${priorityBadge}">${priorityBadge.toUpperCase()} PRIORITY</div>
                    </div>
                    <div class="priority-score">Score: ${task.priority_score}</div>
                </div>
                
                <div class="task-details">
                    <div class="detail-item">
                        <span class="detail-label">Due Date</span>
                        <span class="detail-value">${task.due_date}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Effort</span>
                        <span class="detail-value">${task.estimated_hours} hours</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Importance</span>
                        <span class="detail-value">${task.importance}/10</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Dependencies</span>
                        <span class="detail-value">[${task.dependencies.join(', ') || 'None'}]</span>
                    </div>
                </div>
                
                <div class="explanation">
                    💡 ${task.explanation}
                </div>
            </div>
        `;
    }).join('');
}

// Get priority class based on score
function getPriorityClass(score) {
    if (score >= 70) return 'high-priority';
    if (score >= 40) return 'medium-priority';
    return 'low-priority';
}

// Get priority badge based on score
function getPriorityBadge(score) {
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
}

// Clear all tasks (BOTH ACTIVE AND COMPLETED)
function clearAllTasks() {
    const totalTasksCount = tasks.length + completedTasks.length;
    
    if (totalTasksCount === 0) {
        showNotification('No tasks to clear', 'info');
        return;
    }
    
    if (confirm('Are you sure you want to clear ALL tasks (including completed tasks)?')) {
        // Clear both active and completed tasks
        tasks = [];
        completedTasks = [];
        editingIndex = -1;
        
        // Update UI
        document.querySelector('#singleTaskForm button').textContent = 'Add Task';
        updateTasksList();
        updateProgressStats();
        document.getElementById('results').innerHTML = '';
        
        // Clear from storage
        saveCompletedTasks();
        
        // Hide completed tasks list if it's open
        document.getElementById('completedTasksList').classList.add('hidden');
        
        showNotification('All tasks cleared (including completed tasks)', 'success');
    }
}

// Circular dependency visualization
function visualizeDependencies() {
    if (tasks.length === 0) {
        showNotification('No tasks to analyze for dependencies', 'info');
        return;
    }
    
    const hasCircular = detectCircularDependencies(tasks);
    displayDependencyGraph(hasCircular);
}

// Simple circular dependency detection
function detectCircularDependencies(tasks) {
    const circularPairs = [];
    
    // Check for direct circular dependencies (A->B and B->A)
    for (let i = 0; i < tasks.length; i++) {
        for (let j = i + 1; j < tasks.length; j++) {
            const taskA = tasks[i];
            const taskB = tasks[j];
            
            // Check if A depends on B AND B depends on A
            const aDependsOnB = taskA.dependencies.includes(j + 1);
            const bDependsOnA = taskB.dependencies.includes(i + 1);
            
            if (aDependsOnB && bDependsOnA) {
                circularPairs.push([i, j]);
            }
        }
    }
    
    return circularPairs;
}

// Display dependency graph
function displayDependencyGraph(circularPairs) {
    const resultsElement = document.getElementById('results');
    
    let html = `
        <div class="dependency-section">
            <h3>🔗 Dependency Analysis</h3>
            <div class="dependency-graph">
    `;
    
    // Display each task with its dependencies
    tasks.forEach((task, index) => {
        const isCircular = circularPairs.some(pair => pair.includes(index));
        const circularClass = isCircular ? 'circular-task' : '';
        
        html += `
            <div class="task-node ${circularClass}">
                <div class="node-header">
                    <strong>${index + 1}. ${task.title}</strong>
                    ${isCircular ? '🔄' : ''}
                </div>
                <div class="node-dependencies">
                    ${task.dependencies.length > 0 ? 
                      `Depends on: ${task.dependencies.map(dep => `<span class="dep-link">${dep}</span>`).join(', ')}` : 
                      'No dependencies'}
                </div>
                ${isCircular ? '<div class="circular-warning">Circular dependency detected!</div>' : ''}
            </div>
        `;
    });
    
    html += `</div>`;
    
    // Show circular dependency warnings
    if (circularPairs.length > 0) {
        html += `
            <div class="circular-alert">
                <h4>🔄 Circular Dependencies Found!</h4>
                <p>The following tasks have circular dependencies (they block each other):</p>
                <ul>
                    ${circularPairs.map(pair => 
                        `<li>Task ${pair[0] + 1} "${tasks[pair[0]].title}" ↔ Task ${pair[1] + 1} "${tasks[pair[1]].title}"</li>`
                    ).join('')}
                </ul>
                <p><strong>Solution:</strong> Remove one of the dependencies to break the cycle.</p>
            </div>
        `;
    } else {
        html += `
            <div class="no-circular">
                ✅ No circular dependencies found! Your task dependencies are well-structured.
            </div>
        `;
    }
    
    html += `</div>`;
    
    resultsElement.innerHTML = html;
}

// Completion Tracking System

// Mark the top task as completed WITH AUTOMATIC RE-ANALYSIS
function markTopTaskCompleted() {
    if (tasks.length === 0) {
        showNotification('No tasks to mark as completed!', 'error');
        return;
    }

    // Get the top task from current analysis results
    const currentResults = document.querySelectorAll('.task-card');
    if (currentResults.length === 0) {
        showNotification('Please analyze tasks first to see which task is recommended!', 'error');
        return;
    }

    const topTaskElement = currentResults[0];
    const topTaskTitle = topTaskElement.querySelector('.task-title').textContent.replace(/^\d+\.\s/, '');
    
    // Find the actual task in our tasks array
    const taskIndex = tasks.findIndex(task => task.title === topTaskTitle);
    if (taskIndex === -1) {
        showNotification('Could not find the task to complete', 'error');
        return;
    }

    const completedTask = tasks[taskIndex];
    
    // FIX DEPENDENCIES before moving the task
    tasks.forEach(task => {
        // Remove dependencies pointing to the completed task
        task.dependencies = task.dependencies.filter(dep => dep !== taskIndex + 1);
        
        // Update dependencies that point to tasks after the completed one
        task.dependencies = task.dependencies.map(dep => {
            if (dep > taskIndex + 1) {
                return dep - 1; // Decrease the dependency number
            }
            return dep; // Keep as is
        });
    });
    
    // Add completion timestamp
    completedTask.completedAt = new Date().toLocaleString();
    completedTask.completedOrder = completedTasks.length + 1;
    
    // Move task from active to completed
    completedTasks.push(completedTask);
    tasks.splice(taskIndex, 1);
    
    // Save to storage
    saveCompletedTasks();
    
    // Update displays
    updateTasksList();
    updateProgressStats();
    
    // NEW: Automatically re-analyze remaining tasks
    if (tasks.length > 0) {
        analyzeTasks(); // This will automatically update the results
    } else {
        // If no tasks left, clear results
        document.getElementById('results').innerHTML = '<p>All tasks completed! 🎉</p>';
    }
    
    // Show celebration
    showNotification(`🎉 Task completed: "${completedTask.title}"`, 'success');
    
    // Add visual feedback
    topTaskElement.style.animation = 'taskComplete 0.6s ease-in-out';
}

// Show/hide completed tasks
function showCompletedTasks() {
    const completedList = document.getElementById('completedTasksList');
    const container = document.getElementById('completedTasksContainer');
    
    if (completedTasks.length === 0) {
        showNotification('No completed tasks yet!', 'info');
        return;
    }
    
    // Toggle visibility
    if (completedList.classList.contains('hidden')) {
        // Show completed tasks
        container.innerHTML = completedTasks.map((task, index) => `
            <div class="completed-task-item">
                <div class="completed-task-info">
                    <div class="completed-task-title">${task.title}</div>
                    <div class="completed-task-meta">
                        Completed: ${task.completedAt} | 
                        Importance: ${task.importance}/10 | 
                        Effort: ${task.estimated_hours}h
                    </div>
                </div>
                <div class="completed-task-actions">
                    <button onclick="restoreTask(${index})" class="restore-btn">↶ Restore</button>
                    <button onclick="removeCompletedTask(${index})" class="remove-btn">× Remove</button>
                </div>
            </div>
        `).join('');
        
        completedList.classList.remove('hidden');
    } else {
        // Hide completed tasks
        completedList.classList.add('hidden');
    }
}

// Restore a completed task back to active
function restoreTask(completedIndex) {
    const task = completedTasks[completedIndex];
    tasks.push(task);
    completedTasks.splice(completedIndex, 1);
    
    saveCompletedTasks();
    updateTasksList();
    updateProgressStats();
    showCompletedTasks(); // Refresh the display
    
    showNotification(`↶ Task restored: "${task.title}"`, 'success');
}

// Remove a completed task permanently
function removeCompletedTask(completedIndex) {
    const taskTitle = completedTasks[completedIndex].title;
    if (confirm(`Permanently remove "${taskTitle}" from completed tasks?`)) {
        completedTasks.splice(completedIndex, 1);
        saveCompletedTasks();
        updateProgressStats();
        showCompletedTasks(); // Refresh the display
        showNotification(`🗑️ Task removed: "${taskTitle}"`, 'success');
    }
}

// Clear all completed tasks
function clearCompletedTasks() {
    if (completedTasks.length === 0) {
        showNotification('No completed tasks to clear!', 'info');
        return;
    }
    
    if (confirm(`Clear all ${completedTasks.length} completed tasks? This cannot be undone.`)) {
        completedTasks = [];
        saveCompletedTasks();
        updateProgressStats();
        document.getElementById('completedTasksList').classList.add('hidden');
        showNotification('All completed tasks cleared!', 'success');
    }
}

// Update progress statistics
function updateProgressStats() {
    const totalTasks = tasks.length + completedTasks.length;
    const completedCount = completedTasks.length;
    const completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
    
    document.getElementById('totalTasks').textContent = totalTasks;
    document.getElementById('completedTasks').textContent = completedCount;
    document.getElementById('completionRate').textContent = completionRate + '%';
}

// Save completed tasks to browser storage
function saveCompletedTasks() {
    localStorage.setItem('taskAnalyzerCompleted', JSON.stringify(completedTasks));
}

// Load completed tasks from browser storage
function loadCompletedTasks() {
    const saved = localStorage.getItem('taskAnalyzerCompleted');
    if (saved) {
        completedTasks = JSON.parse(saved);
        updateProgressStats();
    }
}

// Load sample tasks for demonstration
function loadSampleTasks() {
    const sampleTasks = [
        {
            "title": "Fix critical login bug",
            "due_date": "2025-11-26",
            "estimated_hours": 3,
            "importance": 9,
            "dependencies": []
        },
        {
            "title": "Write API documentation",
            "due_date": "2025-11-28",
            "estimated_hours": 4,
            "importance": 6,
            "dependencies": [1]
        },
        {
            "title": "Optimize database queries",
            "due_date": "2025-12-05",
            "estimated_hours": 6,
            "importance": 7,
            "dependencies": []
        },
        {
            "title": "Setup monitoring dashboard",
            "due_date": "2025-12-10",
            "estimated_hours": 8,
            "importance": 5,
            "dependencies": [2, 3]
        }
    ];
    
    // Pre-fill JSON input with sample
    document.getElementById('jsonInput').value = JSON.stringify(sampleTasks, null, 2);
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: bold;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        max-width: 300px;
    `;
    
    // Set background color based on type
    const colors = {
        success: '#48bb78',
        error: '#f56565',
        info: '#667eea'
    };
    
    notification.style.background = colors[type] || colors.info;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Export tasks for external use (bonus feature)
function exportTasks() {
    const dataStr = JSON.stringify(tasks, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'tasks.json';
    link.click();
}
