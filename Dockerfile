# [Previous multi-stage build remains the same, but the model download step is optional]
# Use an NVIDIA CUDA image as the base for the application
FROM nvidia/cuda:11.7.1-cudnn8-runtime-ubuntu20.04

# Install system dependencies
RUN apt-get update && apt-get install -y ffmpeg git wget python3.10 python3-pip huggingface-hub

# Set up the rest of the application
WORKDIR /app
COPY . .

# Install Python dependencies for MuseTalk
RUN pip install -r MuseTalk/requirements.txt

# Copy and set up the entrypoint script
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# Use the entrypoint script to run the application
CMD ["./entrypoint.sh"]
