from dotenv import load_dotenv
import replicate
import time
import pathlib
from urllib.request import pathname2url
from urllib.parse import urljoin

load_dotenv()

# output = replicate.run(
#     "black-forest-labs/flux-fill-dev",
#     input={
#         "mask": "https://i.ibb.co/H72ZMZw/out-0-1.png",
#         "image": "https://replicate.delivery/xezq/FabMMQBehnTiMaMN4UfsPnr0MoRrQc24cGUECcAkZy0QYYAUA/out-0.webp",
#         "prompt": "GEORGE standing on the beach",
#         "guidance": 30,
#         "megapixels": "1",
#         "num_outputs": 1,
#         "output_format": "webp",
#         "output_quality": 80,
#         "lora": "https://replicate.delivery/xezq/LavxSA3MhkIFLtHF6mgG6FKhCofWvj2ZbwE9boaZJBIigCAKA/trained_model.tar", # GEORGE
#         "num_inference_steps": 28
#     }
# )


# output = replicate.run(
#     "cprototyping/jim_new:965b088f5e5573a1c3e1dde7518764e7c256537ba16df66f10f257529560194c",
#     input={
#         "model": "dev",
#         "prompt": "JIM standing on the beach facing the camera",
#         # "mask": "https://i.ibb.co/z2pZ3jy/out-0-1-3.png",
#         # "image": "https://i.ibb.co/rF7NzxZ/out-0-1-4.png",
#         "go_fast": False,
#         "lora_scale": 1,
#         "megapixels": "1",
#         "num_outputs": 1,
#         "aspect_ratio": "1:1",
#         "output_format": "webp",
#         "guidance_scale": 3,
#         "output_quality": 80,
#         "prompt_strength": 0.8,
#         "num_inference_steps": 28,
#     }
# )

output = replicate.run(
    "cprototyping/jim_new:965b088f5e5573a1c3e1dde7518764e7c256537ba16df66f10f257529560194c",
    input={
        "model": "dev",
        "prompt": "the person JIM standing on the beach",
        "mask": "https://i.ibb.co/z2pZ3jy/out-0-1-3.png",
        "image": "https://i.ibb.co/rF7NzxZ/out-0-1-4.png",
        "go_fast": False,
        "lora_scale": 1,
        "megapixels": "1",
        "num_outputs": 1,
        "aspect_ratio": "1:1",
        "output_format": "webp",
        "guidance_scale": 3,
        "output_quality": 80,
        "prompt_strength": 0.8,
        "num_inference_steps": 28,
        
    }
)
print(output)

# Save the generated image

with open(str(time.time())+'_replicate.png', 'wb') as f:
    f.write(output[0].read())