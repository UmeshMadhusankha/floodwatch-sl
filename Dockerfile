# Step 1: Use the full Python 3.11 image containing built-in compilation tools
FROM python:3.11

# Step 2: Establish the working environment inside the container
WORKDIR /workspace

# Step 3: Set the Python path early so script imports can find the src directory
ENV PYTHONPATH=/workspace

# Step 4: Install underlying OS dependencies required for CatBoost C-bindings 
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Step 5: Copy the dependencies file first to leverage Docker layer caching
COPY ./api/requirements.txt .

# Step 6: Install Python libraries
RUN pip install --no-cache-dir -r requirements.txt

# Step 7: Copy all the modular components of your system into the container
COPY api/ ./api/
COPY src/ ./src/
COPY models/ ./models/
COPY scripts/ ./scripts/

# Step 8: Create the data directory so SQLite has a valid path to write predictions.db
RUN mkdir -p data

# Step 9: Execute the one-time artifact script to generate the .joblib transformers
# We add a fallback print statement to show the exact error trace if it fails
RUN python scripts/fit_transformers.py || (echo "ERROR: Transformation script failed. Check if train.csv data is missing in your Git repository!" && exit 1)

# Step 10: Expose Render's standard web service port
EXPOSE 10000

# Step 11: Spin up the server using uvicorn, routing to main.py inside the api directory
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "10000"]