from datetime import datetime, date

def calculate_urgency_score(task):
    if not task.get('due_date'):
        return 50
    
    due_date = datetime.strptime(task['due_date'], '%Y-%m-%d').date()
    today = date.today()
    days_diff = (due_date - today).days
    
    if days_diff < 0:
        return 100  # Overdue = maximum urgency
    elif days_diff == 0:
        return 100  # Due today
    elif days_diff == 1:
        return 90   # Due tomorrow
    elif days_diff <= 3:
        return 80   # Due in 2-3 days
    elif days_diff <= 7:
        return 60   # Due in a week
    else:
        return 40   # Due later

def calculate_importance_score(task):
    importance = task.get('importance', 5)
    importance = max(1, min(10, importance))
    return importance * 8  # Reduced from *10 to *8

def calculate_effort_score(task):
    hours = task.get('estimated_hours', 0)
    hours = max(0.5, hours)
    if hours <= 2:
        return 100 - ((hours - 0.5) / 1.5 * 20)
    elif hours <= 6:
        return 80 - ((hours - 2) / 4 * 40)
    else:
        return max(10, 40 - ((hours - 6) / 6 * 30))

def detect_circular_dependencies(tasks):
    """Detect circular dependencies in tasks"""
    graph = {}

    # Build dependency graph
    for i, task in enumerate(tasks):
        task_id = i + 1  # Use index + 1 as task ID
        graph[task_id] = task.get('dependencies', [])

    # Check for cycles using DFS
    def has_cycle(node, visited, stack):
        visited[node] = True
        stack[node] = True

        for neighbor in graph.get(node, []):
            if not visited.get(neighbor, False):
                if has_cycle(neighbor, visited, stack):
                    return True
            elif stack.get(neighbor, False):
                return True

        stack[node] = False
        return False

    # Check each node for cycles
    visited = {}
    stack = {}

    for node in graph:
        if not visited.get(node, False):
            if has_cycle(node, visited, stack):
                return True

    return False

def calculate_dependency_score(task, all_tasks=None):
    """Calculate dependency multiplier based on blocking tasks"""
    dependencies = task.get('dependencies', [])

    if not dependencies:
        return 1.0

    # If we have all tasks, check for circular dependencies
    if all_tasks and detect_circular_dependencies(all_tasks):
        # Penalize tasks involved in circular dependencies
        task_index = None
        for i, t in enumerate(all_tasks):
            if t.get('title') == task.get('title'):
                task_index = i + 1
                break

        if task_index and any(dep == task_index for dep in dependencies):
            return 0.5  # Heavy penalty for circular dependencies

    # Count how many tasks this task blocks
    blocking_count = len(dependencies)

    if blocking_count == 1:
        return 1.2  # Blocks 1 task
    elif blocking_count >= 2:
        return 1.5  # Blocks multiple tasks
    else:
        return 1.0  # Fallback

def calculate_priority_score(task, strategy="smart_balance"):
    weights = {
        "fastest_wins": {"urgency": 0.2, "importance": 0.2, "effort": 0.5, "dependency": 0.1},
        "high_impact": {"urgency": 0.1, "importance": 0.7, "effort": 0.1, "dependency": 0.1},
        "deadline_driven": {"urgency": 0.6, "importance": 0.2, "effort": 0.1, "dependency": 0.1},
        "smart_balance": {"urgency": 0.4, "importance": 0.3, "effort": 0.2, "dependency": 0.1}
    }
    
    w = weights.get(strategy, weights["smart_balance"])
    
    urgency = calculate_urgency_score(task)
    importance = calculate_importance_score(task)
    effort = calculate_effort_score(task)
    dependency = calculate_dependency_score(task)
    
    # Simple calculation that won't exceed 100
    final_score = (urgency * w["urgency"] + 
                   importance * w["importance"] + 
                   effort * w["effort"]) * dependency
    
    return min(100, round(final_score, 2))  # Never above 100

def generate_score_explanation(task, score):
    explanations = []
    
    # Urgency
    if task.get('due_date'):
        due_date = datetime.strptime(task['due_date'], '%Y-%m-%d').date()
        today = date.today()
        days_diff = (due_date - today).days
        
        if days_diff < 0:
            explanations.append("OVERDUE - Critical")
        elif days_diff == 0:
            explanations.append("Due TODAY")
        elif days_diff <= 2:
            explanations.append("Due soon")
    
    # Importance
    imp = task.get('importance', 5)
    if imp >= 9:
        explanations.append("Very important")
    elif imp >= 7:
        explanations.append("Important")
    
    # Effort
    hours = task.get('estimated_hours', 0)
    if hours <= 1:
        explanations.append("Quick task")
    elif hours >= 4:
        explanations.append("Takes time")
    
    # Dependencies
    deps = task.get('dependencies', [])
    if deps:
        explanations.append(f"Blocks {len(deps)} tasks")
    
    return " + ".join(explanations) if explanations else "Balanced priority"

def analyze_and_sort_tasks(tasks, strategy="smart_balance"):
    analyzed_tasks = []
    for task in tasks:
        task_copy = task.copy()
        priority_score = calculate_priority_score(task_copy, strategy)
        task_copy['priority_score'] = priority_score
        task_copy['explanation'] = generate_score_explanation(task_copy, priority_score)
        analyzed_tasks.append(task_copy)
    analyzed_tasks.sort(key=lambda x: x['priority_score'], reverse=True)
    return analyzed_tasks
