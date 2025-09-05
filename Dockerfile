# Use Ubuntu 22.04 with CUDA 11.7.1 + cuDNN8
FROM nvidia/cuda:11.7.1-cudnn8-runtime-ubuntu22.04

# Prevent interactive prompts
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=UTC

# Install dependencies
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
        build-essential \
        && apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install huggingface + gdown
RUN python3 -m pip install --upgrade pip && \
    python3 -m pip install "huggingface_hub[cli]" gdown

# Set working directory
WORKDIR /app

# Copy your app files
COPY . .

# Install Python deps
RUN python3 -m pip install -r MuseTalk/requirements.txt

# Create models directory
RUN mkdir -p /app/models/musetalk \
             /app/models/musetalkV15 \
             /app/models/syncnet \
             /app/models/dwpose \
             /app/models/face-parse-bisent \
             /app/models/sd-vae-ft-mse \
             /app/models/whisper

# Set HuggingFace mirror (optional for faster downloads in China)
ENV HF_ENDPOINT=https://hf-mirror.com

# Download all weights at build time
RUN huggingface-cli download TMElyralab/MuseTalk --local-dir /app/models/musetalk && \
    huggingface-cli download stabilityai/sd-vae-ft-mse --local-dir /app/models/sd-vae-ft-mse --include "config.json" "diffusion_pytorch_model.bin" && \
    huggingface-cli download openai/whisper-tiny --local-dir /app/models/whisper --include "config.json" "pytorch_model.bin" "preprocessor_config.json" && \
    huggingface-cli download yzd-v/DWPose --local-dir /app/models/dwpose --include "dw-ll_ucoco_384.pth" && \
    huggingface-cli download ByteDance/LatentSync --local-dir /app/models/syncnet --include "latentsync_syncnet.pt" && \
    gdown --id 154JgKpzCPW82qINcVieuPH3fZ2e0P812 -O /app/models/face-parse-bisent/79999_iter.pth && \
    curl -L https://download.pytorch.org/models/resnet18-5c106cde.pth -o /app/models/face-parse-bisent/resnet18-5c106cde.pth

# Expose port for app
EXPOSE 8000

# Entrypoint
CMD ["python3", "MuseTalk/app.py"]
