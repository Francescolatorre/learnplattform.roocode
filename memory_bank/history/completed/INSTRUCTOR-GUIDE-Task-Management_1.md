# Instructor Guide: Task Management & Deletion

**Last Updated**: 2025-09-09  
**Feature Version**: Task Deletion v1.0

---

## Overview

As an instructor, you have full control over the learning tasks in your courses. This guide covers how to manage and delete tasks safely while protecting student progress.

---

## Where to Manage Tasks

You can manage tasks in **two different locations**:

### 1. Course Details Page
**Path**: `/instructor/courses/{course-id}`
- **When to use**: Quick overview of course with inline task management
- **Features**: View course details + manage tasks in one place
- **Task Display**: List format with course information above

### 2. Dedicated Task Management Page  
**Path**: `/instructor/courses/{course-id}/tasks`
- **When to use**: Focused task management session
- **Features**: Full-screen table view optimized for task administration
- **Task Display**: Clean table format (Title, Description, Order, Actions)

> **💡 Pro Tip**: Both pages have identical functionality - choose based on your workflow preference.

---

## Task Deletion Feature

### ✅ When You Can Delete Tasks

You can delete a task when:
- **No students have started** the task
- You are the **course instructor or admin**
- The task exists in **your course**

**Visual Indicator**: 🗑️ Red delete button appears in the Actions column

### ❌ When You Cannot Delete Tasks

Tasks cannot be deleted when:
- **Students have started** working on the task
- **Students have completed** the task
- You don't have proper permissions

**Visual Indicator**: ℹ️ Gray info icon appears instead of delete button

---

## Step-by-Step: How to Delete a Task

### Method 1: From Course Details Page

1. **Navigate** to your course: `/instructor/courses/{course-id}`
2. **Scroll down** to the task list section
3. **Locate** the task you want to delete
4. **Look for** the 🗑️ delete button (red trash icon)
5. **Click** the delete button
6. **Confirm** deletion in the popup dialog
7. **Verify** the task is removed from the list

### Method 2: From Task Management Page

1. **Navigate** to your course tasks: `/instructor/courses/{course-id}/tasks`
2. **Find** the task in the table
3. **Look** in the "Actions" column for the 🗑️ delete button
4. **Click** the delete button
5. **Confirm** deletion in the popup dialog
6. **Verify** the task is removed from the table

---

## Understanding Task Status Indicators

| Icon | Meaning | Action Available |
|------|---------|------------------|
| 🗑️ **Red Delete Button** | No student progress | Can delete task |
| ℹ️ **Gray Info Icon** | Students have progress | Cannot delete - hover for details |
| ✏️ **Edit Button** | Always available | Can modify task |

---

## Student Progress Protection

### Why Some Tasks Cannot Be Deleted

The system protects student work by preventing deletion of tasks that students have started. This ensures:

- **No lost progress** - Students keep their work
- **Academic integrity** - Grades and submissions are preserved  
- **Consistent experience** - Students see tasks they've engaged with

### Detailed Progress Information

When you hover over the ℹ️ info icon, you'll see exactly why deletion is blocked:

- `"Cannot delete: 3 students in progress"`
- `"Cannot delete: 2 students completed"`  
- `"Cannot delete: 1 student in progress and 2 completed"`

---

## Deletion Confirmation Process

### What Happens When You Click Delete

1. **Confirmation Dialog** appears with:
   - Task title for verification
   - "Are you sure?" message
   - Warning that action cannot be undone
   
2. **Two Options**:
   - **Delete Task** (red button) - Confirms deletion
   - **Cancel** (gray button) - Aborts deletion

3. **After Confirmation**:
   - Task is immediately removed from your view
   - Success notification appears
   - Task becomes unavailable to new students
   - Students who started it can still see it (in their view only)

---

## Security & Audit Features

### Deletion Permissions
- ✅ **Course Instructors** - Can delete tasks in their courses
- ✅ **Admins** - Can delete any task
- ❌ **Students** - Cannot see or use delete buttons
- ❌ **Other Instructors** - Cannot delete tasks in courses they don't teach

### Audit Logging
Every deletion attempt is logged with:
- **Who** performed the action
- **When** it occurred  
- **Which task** was affected
- **Success or failure** status
- **Reason for failure** (if blocked)

> **Note**: Audit logs are available to administrators for compliance and troubleshooting.

---

## Best Practices

### Before Deleting Tasks
1. **Double-check** the task title in the confirmation dialog
2. **Consider editing** instead of deleting if content needs minor changes
3. **Communicate** with students if the task was visible to them
4. **Have a backup** of task content if you might need it later

### Task Management Workflow
1. **Create tasks** early in course planning
2. **Test tasks** before students access them
3. **Edit** tasks for minor corrections
4. **Delete** only tasks that are truly unnecessary
5. **Use both pages** based on your current workflow needs

### Student Communication
When deleting tasks that students may have seen:
- **Announce** the change in your course announcements
- **Explain** why the task is no longer needed
- **Provide alternatives** if the learning objective remains important

---

## Troubleshooting

### "I don't see a delete button"
**Possible causes**:
- Students have started the task (check for ℹ️ info icon)
- You don't have instructor permissions for this course
- The task is already deleted

**Solution**: Hover over any icons to see detailed status information.

### "Delete button doesn't work"
**Possible causes**:
- A student started the task between page load and your click
- Network connectivity issues
- Browser cache issues

**Solution**: Refresh the page and try again. If the ℹ️ icon now appears, a student has started the task.

### "Task still appears after deletion"
**Possible causes**:
- Browser cache hasn't refreshed
- Multiple browser tabs open

**Solution**: Refresh the page or close and reopen the tab.

---

## FAQ

**Q: Can I recover a deleted task?**  
A: No, deletion is permanent. Consider editing instead of deleting for minor changes.

**Q: What happens to student work on deleted tasks?**  
A: Students who started the task keep their progress and can still access it. New students cannot see the task.

**Q: Can I delete multiple tasks at once?**  
A: Currently, tasks must be deleted individually. Bulk deletion may be added in future versions.

**Q: Do deleted tasks affect course analytics?**  
A: Deleted tasks are excluded from new analytics but historical data remains for students who engaged with them.

**Q: Can students see when tasks are deleted?**  
A: Students only see tasks disappear from their available list. They are not notified of deletions.

---

## Support

If you encounter issues with task deletion:

1. **Check this guide** for common solutions
2. **Contact technical support** with:
   - Course ID
   - Task name/ID  
   - Screenshot of the issue
   - Your role (instructor/admin)
3. **Include error messages** if any appear

---

*This guide covers the task deletion feature implemented in September 2025. Features may be enhanced in future updates.*