# Use Ubuntu 22.04 which has Python 3.10 by default
FROM nvidia/cuda:11.7.1-cudnn8-runtime-ubuntu22.04

# Set environment variables to prevent interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=UTC

# Update package sources and install dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        ffmpeg \
        git \
        wget \
        curl \
        python3 \
        python3-pip \
        python3-venv \
        python3-dev \
        build-essential && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install huggingface-hub via pip
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
