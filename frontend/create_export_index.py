#!/usr/bin/env python3
import os
import re
import json
import glob
from pathlib import Path

# Pfade definieren
SRC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "src")
INDEX_FILE = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "export_index.json"
)

# Dictionary für den Export-Index
export_index = {}


def extract_exports(file_path):
    """Extrahiert alle exportierten Elemente aus einer TypeScript-Datei."""
    with open(file_path, "r", encoding="utf-8") as file:
        content = file.read()

    exports = []

    # Reguläre Exporte (const, let, var, function, class, interface, type)
    export_regex = r"export\s+(const|let|var|function|class|interface|type)\s+(\w+)"
    for match in re.finditer(export_regex, content):
        if match and match.group(2):
            exports.append(match.group(2))

    # Default-Exporte
    export_default_regex = r"export\s+default\s+(function|class)?\s*(\w+)?"
    for match in re.finditer(export_default_regex, content):
        if match.group(2):
            exports.append(match.group(2))
        else:
            # Für anonyme Default-Exporte den Dateinamen verwenden
            filename = os.path.splitext(os.path.basename(file_path))[0]
            exports.append(filename)

    return exports


def build_index():
    """Erstellt den Export-Index für alle TypeScript-Dateien im Quellverzeichnis."""
    # Alle TypeScript-Dateien finden
    files = []
    for extension in ["ts", "tsx"]:
        pattern = os.path.join(SRC_DIR, f"**/*.{extension}")
        files.extend(glob.glob(pattern, recursive=True))

    base_dir = os.path.dirname(os.path.abspath(__file__))

    for file in files:
        relative_path = os.path.relpath(file, base_dir)
        extracted_exports = extract_exports(file) or []

        for export_name in extracted_exports:
            if export_name not in export_index:
                export_index[export_name] = []
            export_index[export_name].append(relative_path)

    # Export-Index in JSON-Datei schreiben
    with open(INDEX_FILE, "w", encoding="utf-8") as file:
        json.dump(export_index, file, indent=2)

    print(f"Export-Index erstellt unter {INDEX_FILE}")


if __name__ == "__main__":
    build_index()
