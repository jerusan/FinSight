import requests
import os

# File to upload
file_path = "../../Statements/Statement-3.pdf"
file_name = os.path.basename(file_path)

# Endpoint URL
url = "http://localhost:8000/upload-statement"

# Open the file in binary mode and send it using multipart/form-data
with open(file_path, "rb") as file:
    print("File opened successfully")
    files = {
        "file": (file_name, file, "application/pdf")  # just the file name here
    }
    response = requests.post(url, files=files)
    print("Response received")

# Print response
print("Status Code:", response.status_code)
print("Response Text:", response.text)

