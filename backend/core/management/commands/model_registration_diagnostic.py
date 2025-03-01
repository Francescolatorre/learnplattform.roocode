import json
import os
import sys
import traceback

from django.apps import apps
from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import models


class Command(BaseCommand):
    help = 'Diagnostic tool to verify Django model registration'

    def handle(self, *args, **options):
        try:
            # Use the project's base directory
            base_dir = settings.BASE_DIR

            # Ensure the output directory exists
            output_dir = os.path.join(base_dir, 'backend')
            os.makedirs(output_dir, exist_ok=True)

            # Collect all registered models
            all_models = {}
            model_registration_details = {
                'total_models': 0,
                'models_by_app': {},
                'potential_conflicts': []
            }

            # Iterate through all registered apps and their models
            for app_config in apps.get_app_configs():
                app_models = []
                for model in app_config.get_models():
                    model_name = model.__name__
                    app_name = app_config.label

                    # Collect model details
                    model_info = {
                        'name': model_name,
                        'app': app_name,
                        'module': model.__module__,
                        'fields': [f.name for f in model._meta.fields]
                    }

                    app_models.append(model_info)

                    # Check for potential conflicts (models with same name in different apps)
                    if model_name in all_models:
                        conflict = {
                            'model_name': model_name,
                            'conflicting_apps': [all_models[model_name]['app'], app_name],
                            'details': [all_models[model_name], model_info]
                        }
                        model_registration_details['potential_conflicts'].append(conflict)
                    
                    all_models[model_name] = model_info

                # Store models for each app
                if app_models:
                    model_registration_details['models_by_app'][app_name] = app_models

            # Update total models count
            model_registration_details['total_models'] = len(all_models)

            # Write detailed report to JSON
            json_path = os.path.join(output_dir, 'model_registration_diagnostic.json')
            with open(json_path, 'w') as f:
                json.dump(model_registration_details, f, indent=2)
            
            # Write markdown report for human readability
            md_path = os.path.join(output_dir, 'model_registration_diagnostic.md')
            with open(md_path, 'w') as f:
                f.write("# Django Model Registration Diagnostic Report\n\n")
                
                f.write(f"## Total Models: {model_registration_details['total_models']}\n\n")
                
                f.write("## Models by App\n")
                for app, models in model_registration_details['models_by_app'].items():
                    f.write(f"### {app}\n")
                    for model in models:
                        f.write(f"- {model['name']}\n")
                        f.write(f"  - Module: {model['module']}\n")
                        f.write(f"  - Fields: {', '.join(model['fields'])}\n")
                    f.write("\n")
                
                if model_registration_details['potential_conflicts']:
                    f.write("## Potential Model Registration Conflicts\n")
                    for conflict in model_registration_details['potential_conflicts']:
                        f.write(f"### Conflicting Model: {conflict['model_name']}\n")
                        f.write(f"- Conflicting Apps: {', '.join(conflict['conflicting_apps'])}\n")
                        f.write("- Conflict Details:\n")
                        for detail in conflict['details']:
                            f.write(f"  - App: {detail['app']}, Module: {detail['module']}\n")
                        f.write("\n")
                else:
                    f.write("## No Model Registration Conflicts Detected\n")

            # Output to console
            print(f'Model registration diagnostic complete. Total models: {model_registration_details["total_models"]}')
            if model_registration_details['potential_conflicts']:
                print(f'Potential model conflicts detected: {len(model_registration_details["potential_conflicts"])}')
            
            # Confirm file creation
            print(f'JSON report saved to: {json_path}')
            print(f'Markdown report saved to: {md_path}')

        except Exception as e:
            # Detailed error logging
            error_msg = f'Error during model registration diagnostic: {e}'
            print(f'ERROR: {error_msg}')
            
            # Log full traceback to a file
            error_log_path = os.path.join(output_dir, 'model_registration_diagnostic_error.log')
            with open(error_log_path, 'w') as error_log:
                error_log.write(error_msg + '\n\n')
                traceback.print_exc(file=error_log)
            
            print(f'Detailed error log saved to: {error_log_path}')
            
            # Re-raise the exception to ensure it's visible
            raise