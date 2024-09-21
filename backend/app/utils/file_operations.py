"""
This file does the file basic or specific operations on files and paths
"""

import os


def ensure_directory_exists(directory):
    """ Ensure that the specified directory exists; create it if it does not """
    if not os.path.exists(directory):
        os.makedirs(directory)
        print(f"Created directory: {directory}")
    else:
        print(f"Directory already exists: {directory}")

def check_file_exists(file_path):
    """ Checks if file exists or not in the given path """
    exists = os.path.exists(file_path)
    if exists:
        print(f"File exists: {file_path}")
    else:
        print(f"File does not exist: {file_path}")
    return exists
