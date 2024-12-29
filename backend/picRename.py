import os

folder_path = '../frontend/pics2' 

files = os.listdir(folder_path)

for index, file_name in enumerate(files):
    old_path = os.path.join(folder_path, file_name)
    file_extension = os.path.splitext(file_name)[1]  # Get the file extension
    new_path = os.path.join(folder_path, f"{index}{file_extension}")
    os.rename(old_path, new_path)
    print(f"Renamed {file_name} to {index}{file_extension}")
