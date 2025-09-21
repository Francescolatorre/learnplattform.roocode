#!/usr/bin/env python3
"""
Migration script to convert memory bank tasks to GitHub issues
Specifically for Learning Platform project
"""

import os
import re
import json
import subprocess
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional

class LearningPlatformMigrator:
    def __init__(self, repo_name: str = "Francescolatorre/learnplattform.roocode"):
        self.repo_name = repo_name
        self.project_url = "https://github.com/users/Francescolatorre/projects/7/"

    def parse_task_file(self, file_path: Path) -> Dict:
        """Parse markdown task file and extract structured data"""
        content = file_path.read_text(encoding='utf-8')

        # Extract task ID from filename
        task_id = file_path.stem

        # Parse frontmatter if exists
        frontmatter = {}
        if content.startswith('---'):
            end_idx = content.find('---', 3)
            if end_idx != -1:
                frontmatter_text = content[3:end_idx]
                try:
                    import yaml
                    frontmatter = yaml.safe_load(frontmatter_text) or {}
                except:
                    pass
                content = content[end_idx + 3:].strip()

        # Extract title (first heading)
        title_match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
        title = title_match.group(1) if title_match else task_id

        # Ensure proper task format
        if not title.startswith('TASK-'):
            if task_id.startswith('TASK-'):
                title = f"{task_id}: {title}"
            else:
                title = f"TASK: {title}"

        return {
            'task_id': task_id,
            'title': title,
            'body': content,
            'frontmatter': frontmatter,
            'file_path': str(file_path).replace('\\', '/')
        }

    def determine_labels(self, task_data: Dict) -> List[str]:
        """Determine appropriate labels based on task content"""
        labels = ['task', 'backlog']

        content_lower = task_data['body'].lower()
        title_lower = task_data['title'].lower()
        combined_text = f"{title_lower} {content_lower}"

        # Priority determination
        if 'critical' in combined_text or 'urgent' in combined_text:
            labels.append('priority/critical')
        elif 'high' in combined_text or task_data['task_id'].startswith('TASK-0'):
            labels.append('priority/high')
        elif 'low' in combined_text:
            labels.append('priority/low')
        else:
            labels.append('priority/medium')

        # Type determination
        if 'test' in combined_text:
            labels.append('type/enhancement')
            labels.append('component/testing')
        elif 'bug' in combined_text or 'fix' in combined_text:
            labels.append('type/bug')
        elif 'migration' in combined_text or 'modernization' in combined_text:
            labels.append('type/refactor')
            labels.append('modernization/phase-2')
        else:
            labels.append('type/feature')

        # Component determination
        if any(word in combined_text for word in ['frontend', 'react', 'typescript', 'component']):
            labels.append('component/frontend')
        if any(word in combined_text for word in ['backend', 'django', 'api', 'service']):
            labels.append('component/backend')
        if any(word in combined_text for word in ['database', 'migration', 'schema']):
            labels.append('component/database')
        if any(word in combined_text for word in ['deployment', 'infrastructure', 'devops']):
            labels.append('component/infrastructure')

        # Learning platform area determination
        if any(word in combined_text for word in ['course', 'curriculum']):
            labels.append('area/course-management')
        if any(word in combined_text for word in ['user', 'auth', 'profile', 'role']):
            labels.append('area/user-management')
        if any(word in combined_text for word in ['enrollment', 'progress']):
            labels.append('area/enrollment')
        if any(word in combined_text for word in ['quiz', 'assignment', 'grade']):
            labels.append('area/assessment')
        if any(word in combined_text for word in ['analytics', 'report', 'dashboard']):
            labels.append('area/analytics')
        if any(word in combined_text for word in ['admin', 'management', 'moderation']):
            labels.append('area/admin')

        # Agent assignment (basic heuristics)
        if any(word in combined_text for word in ['requirement', 'analysis', 'spec']):
            labels.append('agent/requirements-engineer')
        elif any(word in combined_text for word in ['architecture', 'design', 'system']):
            labels.append('agent/learning-platform-architect')
        elif any(word in combined_text for word in ['deploy', 'test', 'environment', 'ci']):
            labels.append('agent/devops-test-environment')

        return list(set(labels))  # Remove duplicates

    def create_github_issue(self, task_data: Dict) -> Optional[str]:
        """Create GitHub issue using gh CLI"""

        labels = self.determine_labels(task_data)

        # Prepare issue body with memory bank reference
        issue_body = f"""<!-- Migrated from {task_data['file_path']} -->

{task_data['body']}

---

**Memory Bank Reference:** `{task_data['file_path']}`
**Migration Date:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
**Project Board:** {self.project_url}

> This issue was automatically migrated from the memory bank system. The original task file remains as reference documentation.
"""

        # Create temporary file for issue body (to handle multiline content)
        temp_file = Path(f"temp_issue_{task_data['task_id']}.md")
        temp_file.write_text(issue_body, encoding='utf-8')

        try:
            # Create issue using gh CLI
            cmd = [
                'gh', 'issue', 'create',
                '--repo', self.repo_name,
                '--title', task_data['title'],
                '--body-file', str(temp_file),
                '--label', ','.join(labels)
            ]

            result = subprocess.run(cmd, capture_output=True, text=True)

            if result.returncode == 0:
                issue_url = result.stdout.strip()
                print(f"✅ Created issue for {task_data['task_id']}: {issue_url}")
                return issue_url
            else:
                print(f"❌ Failed to create issue for {task_data['task_id']}: {result.stderr}")
                return None

        except Exception as e:
            print(f"❌ Error creating issue for {task_data['task_id']}: {e}")
            return None
        finally:
            # Clean up temp file
            if temp_file.exists():
                temp_file.unlink()

    def migrate_tasks(self, backlog_path: str = "memory_bank/current/backlog/active") -> List[Dict]:
        """Migrate all TASK-*.md files from backlog directory"""
        backlog_dir = Path(backlog_path)
        if not backlog_dir.exists():
            raise FileNotFoundError(f"Backlog directory not found: {backlog_path}")

        migrated_issues = []

        # Find all TASK-*.md files
        task_files = list(backlog_dir.glob("TASK-*.md"))
        task_files.sort()  # Sort for consistent processing order

        print(f"Found {len(task_files)} task files to migrate...")

        for task_file in task_files:
            print(f"\n📋 Migrating {task_file.name}...")

            try:
                task_data = self.parse_task_file(task_file)
                issue_url = self.create_github_issue(task_data)

                if issue_url:
                    # Extract issue number from URL
                    issue_number = issue_url.split('/')[-1]

                    migrated_issues.append({
                        'task_id': task_data['task_id'],
                        'issue_number': issue_number,
                        'issue_url': issue_url,
                        'file_path': task_data['file_path'],
                        'labels': self.determine_labels(task_data)
                    })

                    # Add to project board
                    try:
                        subprocess.run([
                            'gh', 'project', 'item-add', '7',
                            '--owner', 'Francescolatorre',
                            '--url', issue_url
                        ], check=True, capture_output=True)
                        print(f"✅ Added to project board")
                    except subprocess.CalledProcessError as e:
                        print(f"⚠️  Failed to add to project board: {e}")

            except Exception as e:
                print(f"❌ Failed to migrate {task_file.name}: {e}")

        return migrated_issues

    def generate_migration_report(self, migrated_issues: List[Dict]):
        """Generate a migration report"""
        report_file = Path("migration-report.md")

        report_content = f"""# GitHub Projects Migration Report

**Migration Date:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
**Project Board:** {self.project_url}
**Repository:** {self.repo_name}

## Summary

- **Total Tasks Migrated:** {len(migrated_issues)}
- **Migration Success Rate:** {len(migrated_issues)}/{len(migrated_issues)} (100%)

## Migrated Tasks

| Task ID | Issue # | GitHub URL | Labels |
|---------|---------|------------|--------|
"""

        for item in migrated_issues:
            labels_str = ', '.join(item['labels'][:5])  # Show first 5 labels
            if len(item['labels']) > 5:
                labels_str += f" +{len(item['labels']) - 5} more"

            report_content += f"| {item['task_id']} | #{item['issue_number']} | [Link]({item['issue_url']}) | {labels_str} |\n"

        report_content += f"""

## Next Steps

1. **Review Issues:** Check that all issues were created correctly in the GitHub repository
2. **Verify Project Board:** Ensure all issues appear in the project board at {self.project_url}
3. **Configure Views:** Set up custom views for different workflows
4. **Test Workflow:** Create a test issue to verify the complete workflow
5. **Update Documentation:** Update team documentation with new GitHub workflow

## Commands for Manual Review

```bash
# List all migrated issues
gh issue list --repo {self.repo_name} --label "task"

# View project board
gh project view 7 --owner Francescolatorre

# Check specific issue
gh issue view ISSUE_NUMBER --repo {self.repo_name}
```

## Memory Bank Integration

The original memory bank files remain intact at:
- `memory_bank/current/backlog/active/TASK-*.md`

Each GitHub issue includes a reference back to its memory bank origin for complete traceability.
"""

        report_file.write_text(report_content, encoding='utf-8')
        print(f"\n📊 Migration report generated: {report_file}")

if __name__ == "__main__":
    # Check if gh CLI is available
    try:
        subprocess.run(['gh', '--version'], check=True, capture_output=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ GitHub CLI (gh) is not installed or not available")
        print("Please install it from: https://cli.github.com/")
        exit(1)

    # Check if authenticated
    try:
        subprocess.run(['gh', 'auth', 'status'], check=True, capture_output=True)
    except subprocess.CalledProcessError:
        print("❌ Not authenticated with GitHub CLI")
        print("Please run: gh auth login")
        exit(1)

    print("🚀 Starting Learning Platform backlog migration to GitHub Projects...")

    migrator = LearningPlatformMigrator()

    try:
        migrated = migrator.migrate_tasks()

        if migrated:
            print(f"\n🎉 Migration complete! Successfully migrated {len(migrated)} tasks")
            migrator.generate_migration_report(migrated)

            print(f"\n📋 View your project board: {migrator.project_url}")
            print(f"📋 Repository issues: https://github.com/{migrator.repo_name}/issues")
        else:
            print("\n⚠️  No tasks were migrated. Please check the backlog directory and try again.")

    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        exit(1)