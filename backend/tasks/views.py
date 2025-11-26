from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .scoring import analyze_and_sort_tasks

@csrf_exempt
def analyze_tasks(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            tasks = data.get('tasks', [])
            strategy = data.get('strategy', 'smart_balance')
            
            # Validate tasks data
            if not isinstance(tasks, list):
                return JsonResponse({"error": "Tasks must be a list"}, status=400)
            
            # Validate each task has required fields
            for task in tasks:
                if not task.get('title'):
                    return JsonResponse({"error": "Each task must have a title"}, status=400)
                if task.get('importance') and (task['importance'] < 1 or task['importance'] > 10):
                    return JsonResponse({"error": "Importance must be between 1-10"}, status=400)
                if task.get('estimated_hours') and task['estimated_hours'] < 0:
                    return JsonResponse({"error": "Estimated hours cannot be negative"}, status=400)
            
            # Analyze and sort tasks
            analyzed_tasks = analyze_and_sort_tasks(tasks, strategy)
            
            return JsonResponse({
                "strategy": strategy,
                "tasks": analyzed_tasks
            })
            
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    
    return JsonResponse({"error": "Method not allowed"}, status=405)

def suggest_tasks(request):
    if request.method == "GET":
        try:
            # Sample tasks for demonstration
            sample_tasks = [
                {
                    "title": "Complete urgent client request",
                    "due_date": "2025-11-26",
                    "estimated_hours": 2,
                    "importance": 9,
                    "dependencies": []
                },
                {
                    "title": "Fix critical bug in production", 
                    "due_date": "2025-11-26",
                    "estimated_hours": 3,
                    "importance": 10,
                    "dependencies": [1]
                },
                {
                    "title": "Prepare weekly team report",
                    "due_date": "2025-11-27", 
                    "estimated_hours": 1,
                    "importance": 7,
                    "dependencies": []
                },
                {
                    "title": "Research new technology",
                    "due_date": "2025-12-05",
                    "estimated_hours": 4,
                    "importance": 6,
                    "dependencies": []
                }
            ]
            
            # Analyze and get top 3 tasks
            analyzed_tasks = analyze_and_sort_tasks(sample_tasks, "smart_balance")
            top_3_tasks = analyzed_tasks[:3]
            
            return JsonResponse({
                "message": "Top 3 suggested tasks for today",
                "suggestions": top_3_tasks,
                "strategy": "smart_balance"
            })
            
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    
    return JsonResponse({"error": "Method not allowed"}, status=405)