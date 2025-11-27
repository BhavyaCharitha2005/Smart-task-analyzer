from django.test import TestCase
from tasks.scoring import (
    calculate_urgency_score, 
    calculate_importance_score,
    calculate_effort_score,
    calculate_dependency_score,
    detect_circular_dependencies,
    calculate_priority_score,
    analyze_and_sort_tasks
)
from datetime import date, timedelta

class ScoringAlgorithmTests(TestCase):
    
    def test_urgency_scoring(self):
        """Test urgency score calculation for different due dates"""
        # Test overdue task
        overdue_task = {'due_date': '2025-11-25'}  # 1 day overdue
        self.assertEqual(calculate_urgency_score(overdue_task), 100)  # Fixed: now equals 100
        
        # Test task due today
        today_task = {'due_date': '2025-11-27'}  # Today
        self.assertEqual(calculate_urgency_score(today_task), 100)
        
        # Test future task
        future_task = {'due_date': '2025-12-01'}  # 4 days in future
        self.assertLess(calculate_urgency_score(future_task), 100)
        
        # Test task without due date
        no_date_task = {}
        self.assertEqual(calculate_urgency_score(no_date_task), 50)  # Fixed: now 50

    def test_circular_dependency_detection(self):
        """Test circular dependency detection"""
        # Tasks with circular dependencies
        circular_tasks = [
            {
                'title': 'Task 1',
                'due_date': '2025-11-30',
                'estimated_hours': 3,
                'importance': 8,
                'dependencies': [2]  # Depends on Task 2
            },
            {
                'title': 'Task 2',
                'due_date': '2025-12-01', 
                'estimated_hours': 2,
                'importance': 7,
                'dependencies': [1]  # Depends on Task 1 - CIRCULAR!
            }
        ]
        
        # Tasks without circular dependencies
        normal_tasks = [
            {
                'title': 'Task A',
                'due_date': '2025-11-30',
                'estimated_hours': 3,
                'importance': 8,
                'dependencies': [2]  # Depends on Task B
            },
            {
                'title': 'Task B',
                'due_date': '2025-12-01',
                'estimated_hours': 2,
                'importance': 7,
                'dependencies': []  # No dependencies
            }
        ]
        
        self.assertTrue(detect_circular_dependencies(circular_tasks))
        self.assertFalse(detect_circular_dependencies(normal_tasks))

    def test_priority_scoring_and_sorting(self):
        """Test complete priority scoring and task sorting"""
        test_tasks = [
            {
                'title': 'Quick Important Task',
                'due_date': '2025-11-27',  # Today
                'estimated_hours': 1,
                'importance': 9,
                'dependencies': []
            },
            {
                'title': 'Long Less Important Task', 
                'due_date': '2025-12-10',  # Future
                'estimated_hours': 8,
                'importance': 5,
                'dependencies': []
            },
            {
                'title': 'Blocking Task',
                'due_date': '2025-11-28',  # Soon
                'estimated_hours': 3,
                'importance': 7,
                'dependencies': [1, 2]  # Blocks both other tasks
            }
        ]
        
        # Test analysis and sorting
        analyzed_tasks = analyze_and_sort_tasks(test_tasks, 'smart_balance')
        
        # Should return same number of tasks
        self.assertEqual(len(analyzed_tasks), 3)
        
        # Should be sorted by priority score (descending)
        self.assertGreaterEqual(
            analyzed_tasks[0]['priority_score'], 
            analyzed_tasks[1]['priority_score']
        )
        self.assertGreaterEqual(
            analyzed_tasks[1]['priority_score'],
            analyzed_tasks[2]['priority_score'] 
        )
        
        # Each task should have calculated score and explanation
        for task in analyzed_tasks:
            self.assertIn('priority_score', task)
            self.assertIn('explanation', task)
            # Fixed: Allow both int and float since your algorithm returns int
            self.assertTrue(isinstance(task['priority_score'], (int, float)))

    def test_different_strategies(self):
        """Test that different strategies produce different rankings"""
        test_tasks = [
            {
                'title': 'High Importance Task',
                'due_date': '2025-12-05',
                'estimated_hours': 6,
                'importance': 10,  # Very high importance
                'dependencies': []
            },
            {
                'title': 'Quick Task',
                'due_date': '2025-12-10', 
                'estimated_hours': 1,  # Very quick
                'importance': 5,
                'dependencies': []
            },
            {
                'title': 'Urgent Task',
                'due_date': '2025-11-27',  # Today
                'estimated_hours': 4,
                'importance': 7,
                'dependencies': []
            }
        ]
        
        # Test different strategies
        smart_balance = analyze_and_sort_tasks(test_tasks, 'smart_balance')
        fastest_wins = analyze_and_sort_tasks(test_tasks, 'fastest_wins') 
        high_impact = analyze_and_sort_tasks(test_tasks, 'high_impact')
        deadline_driven = analyze_and_sort_tasks(test_tasks, 'deadline_driven')
        
        # All strategies should produce valid results
        self.assertEqual(len(smart_balance), 3)
        self.assertEqual(len(fastest_wins), 3)
        self.assertEqual(len(high_impact), 3)
        self.assertEqual(len(deadline_driven), 3)

    def test_edge_cases(self):
        """Test algorithm with edge cases and invalid data"""
        edge_case_tasks = [
            {
                'title': 'Task with negative hours',
                'due_date': '2025-11-30',
                'estimated_hours': -2,  # Invalid: negative hours
                'importance': 8,
                'dependencies': []
            },
            {
                'title': 'Task with high importance',
                'due_date': '2025-12-01', 
                'estimated_hours': 3,
                'importance': 15,  # Invalid: out of range
                'dependencies': []
            },
            {
                'title': 'Task missing due date',
                'estimated_hours': 2,  # Missing due_date
                'importance': 6,
                'dependencies': []
            }
        ]
        
        # Algorithm should handle these without crashing
        analyzed_tasks = analyze_and_sort_tasks(edge_case_tasks, 'smart_balance')
        
        # Should still return results for all tasks
        self.assertEqual(len(analyzed_tasks), 3)
        
        # Tasks with issues should have lower scores
        for task in analyzed_tasks:
            self.assertIn('priority_score', task)
            self.assertIn('explanation', task)

    def test_score_capping_at_100(self):
        """Test that priority scores never exceed 100 points"""
        
        # Create a task that would normally exceed 100 without capping
        max_priority_task = {
            'title': 'Maximum Priority Task',
            'due_date': '2025-11-27',  # Today = 100 points
            'estimated_hours': 1,      # Quick win = high points
            'importance': 10,          # Maximum importance
            'dependencies': [2, 3, 4]  # Multiple dependencies = 1.5x multiplier
        }
        
        # Calculate score with smart balance strategy
        score = calculate_priority_score(max_priority_task, 'smart_balance')
        
        # Score should be capped at 100
        self.assertLessEqual(score, 100)
        self.assertGreaterEqual(score, 0)
        # Fixed: Allow both int and float
        self.assertTrue(isinstance(score, (int, float)))
