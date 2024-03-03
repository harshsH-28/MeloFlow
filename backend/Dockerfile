FROM python:3.11

# Set the working directory in the container
WORKDIR /meloflow

# Copy the current directory contents into the container at /app
COPY . /meloflow

# Install any needed packages specified in requirements.txt
RUN pip install -r requirements.txt

# Make port 8080 available to the world outside this container
EXPOSE 8080

# Run app.py when the container launches
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080", "--reload"]