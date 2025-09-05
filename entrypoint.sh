#!/bin/bash

# Define the model directory
MODEL_DIR="/app/models"

# Check if the models have already been downloaded
if [ ! -d "$MODEL_DIR/musetalk" ]; then
    echo "Downloading MuseTalk models..."
    huggingface-cli download TMElyralab/MuseTalk --local-dir "$MODEL_DIR"
    echo "Model download complete."
fi

# Start the application
exec python3 MuseTalk/app.py
