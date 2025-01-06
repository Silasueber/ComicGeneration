from diffusers import StableDiffusionXLAdapterPipeline, T2IAdapter, EulerAncestralDiscreteScheduler, AutoencoderKL
from diffusers.utils import load_image, make_image_grid
from controlnet_aux.lineart import LineartDetector
import torch
import matplotlib.pyplot as plt
import numpy as np

import gc
gc.collect()
torch.cuda.empty_cache()

# load adapter
adapter = T2IAdapter.from_pretrained(
  "TencentARC/t2i-adapter-lineart-sdxl-1.0", torch_dtype=torch.float16
).to("cuda")

# load euler_a scheduler
model_id = 'stabilityai/stable-diffusion-xl-base-1.0'
euler_a = EulerAncestralDiscreteScheduler.from_pretrained(model_id, subfolder="scheduler")
vae=AutoencoderKL.from_pretrained("madebyollin/sdxl-vae-fp16-fix", torch_dtype=torch.float16)
pipe = StableDiffusionXLAdapterPipeline.from_pretrained(
    model_id, vae=vae, adapter=adapter, scheduler=euler_a, torch_dtype=torch.float16, variant="fp16",
).to("cuda")
#pipe.enable_xformers_memory_efficient_attention()

line_detector = LineartDetector.from_pretrained("lllyasviel/Annotators").to("cuda")

url = "https://imgs.search.brave.com/whdmlJZGwsafpyLdDLQclUpkuXjzwYBZ4fdKWWmaOoI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pMC53/cC5jb20vd3d3LnBy/aW50bWFnLmNvbS93/cC1jb250ZW50L3Vw/bG9hZHMvMjAxNC8w/NS8yYTM0ZDhfOTc3/YjkyYjNhNmNmNGQ2/N2FkOGM0MzliYWRk/ZmI5MDBtdjIuanBn/P3Jlc2l6ZT02MDAs/MTAzNiZxdWFsaXR5/PTg5JnNzbD0x"
#url = "https://imgs.search.brave.com/6Yo2RD17DB4wVLUw9GHfJliRJsnTxdp9olUVe61b5kE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzLzU0LzVl/LzNmLzU0NWUzZmVj/Y2NmNTRjYWQ3Y2Vj/NzMyOTJhZWRiYTRj/LmpwZw"
url = "https://huggingface.co/Adapter/t2iadapter/resolve/main/figs_SDXLV1.0/org_lin.jpg"
url = "https://t3.ftcdn.net/jpg/05/54/12/28/360_F_554122808_70uodDBTFvbJJjM8Fu9Vy24WHK614SXh.jpg"
image = load_image(url)
detected_image = line_detector(
    image, detect_resolution=384, image_resolution=1024
)

# # Display the image
plt.figure(figsize=(8, 8))
plt.imshow(detected_image)
plt.axis('off')  # Hide axis
plt.show()


prompt = "Ice dragon roar, 4k photo"
negative_prompt = "anime, cartoon, graphic, text, painting, crayon, graphite, abstract, glitch, deformed, mutated, ugly, disfigured"
gen_images = pipe(
    prompt=prompt,
    negative_prompt=negative_prompt,
    image=detected_image,
    num_inference_steps=30,
    adapter_conditioning_scale=0.8,
    guidance_scale=7.5,
).images[0]

# Display the image
plt.figure(figsize=(8, 8))
plt.imshow(gen_images)
plt.axis('off')  # Hide axis
plt.show()