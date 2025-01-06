# Use an NVIDIA CUDA base image with Ubuntu 20.04 and CUDNN support
FROM nvidia/cuda:11.7.1-cudnn8-runtime-ubuntu20.04

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV DEBIAN_FRONTEND=noninteractive

# Install Python 3.10 and other dependencies
RUN apt-get update && \
    apt-get install -y software-properties-common && \
    add-apt-repository ppa:deadsnakes/ppa && \
    apt-get update && \
    apt-get install -y python3.10 python3.10-distutils python3.10-venv git curl && \
    curl -sS https://bootstrap.pypa.io/get-pip.py | python3.10 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install PyTorch with CUDA support
RUN python3.10 -m pip install torch==1.12.1+cu113 torchvision==0.13.1+cu113 torchaudio==0.12.1+cu113 --extra-index-url https://download.pytorch.org/whl/cu113

# Install remaining application dependencies
COPY requirements.txt /app/requirements.txt
RUN python3.10 -m pip install --upgrade pip && \
    python3.10 -m pip install -r /app/requirements.txt

# Set the working directory
WORKDIR /app

# Copy the application code to the Docker image
COPY . /app

# Expose the port the Flask app will run on
EXPOSE 5000

# Start the Flask app
CMD ["flask", "run", "--host", "0.0.0.0"]
