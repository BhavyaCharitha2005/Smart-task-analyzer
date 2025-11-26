// Global variables
let tasks = [];

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize form submission
    document.getElementById('singleTaskForm').addEventListener('submit', addSingleTask);
    
    // Load sample tasks for demonstration
    loadSampleTasks();
});

// Add single task from form
function addSingleTask(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    const task = {
        title: formData.get('title') || document.getElementById('title').value,
        due_date: formData.get('due_date') || document.getElementById('due_date').value,
        estimated_hours: parseFloat(formData.get('estimated_hours') || document.getElementById('estimated_hours').value),
        importance: parseInt(formData.get('importance') || document.getElementById('importance').value),
        dependencies: parseDependencies(document.getElementById('dependencies').value)
    };
    
    // Validate task
    if (!validateTask(task)) {
        return;
    }
    
    tasks.push(task);
    updateTasksList();
    form.reset();
    
    showNotification('Task added successfully!', 'success');
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
            <strong>${index + 1}. ${task.title}</strong><br>
            Due: ${task.due_date} | Hours: ${task.estimated_hours} | Importance: ${task.importance}/10
            ${task.dependencies.length > 0 ? `| Dependencies: [${task.dependencies.join(', ')}]` : ''}
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

// Clear all tasks
function clearAllTasks() {
    if (tasks.length === 0) {
        showNotification('No tasks to clear', 'info');
        return;
    }
    
    if (confirm('Are you sure you want to clear all tasks?')) {
        tasks = [];
        updateTasksList();
        document.getElementById('results').innerHTML = '';
        showNotification('All tasks cleared', 'success');
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