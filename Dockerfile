# Use an NVIDIA CUDA image as the base for the application
FROM nvidia/cuda:11.7.1-cudnn8-runtime-ubuntu20.04

# Set environment variables to prevent interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=UTC

# Alternative approach 1: Try different Ubuntu mirrors
RUN sed -i 's|http://archive.ubuntu.com/ubuntu/|http://us.archive.ubuntu.com/ubuntu/|g' /etc/apt/sources.list

# Alternative approach 2: Update package sources and install dependencies in one layer
RUN apt-get clean && \
    apt-get update --fix-missing && \
    apt-get install -y --no-install-recommends \
        ffmpeg \
        git \
        wget \
        curl \
        python3.10 \
        python3-pip \
        python3.10-venv \
        build-essential && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install huggingface-hub via pip instead of apt
RUN python3 -m pip install --upgrade pip && \
    python3 -m pip install huggingface-hub

# Set up the application directory
WORKDIR /app

# Copy your application files
COPY . .

# Install Python dependencies for MuseTalk
RUN python3 -m pip install -r MuseTalk/requirements.txt

# Copy and set up the entrypoint script
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# Expose port (adjust as needed for your MuseTalk app)
EXPOSE 8000

# Use the entrypoint script to run the application
CMD ["./entrypoint.sh"]
