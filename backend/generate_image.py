'''
This script generates an image based on a prompt and returns the image as base64 encoded string.
'''

from dotenv import load_dotenv
import os
import requests
import datetime
import asyncio
import time
import traceback
import base64
import json
import io
from PIL import Image
import replicate

import nest_asyncio # to nest asyncio
nest_asyncio.apply()

# import key from .env file
load_dotenv()

# Max pixels for Runware on either side
max_pixels = 2048

def recompute_dimensions(desired_width: int, desired_height: int, maximise_resolution: bool = False) -> tuple[int, int]:

    '''
    Recompute the dimensions to the nearest multiple of 64, 
    while maintaining the aspect ratio and ensuring the height is 
    at least 512 pixels and max 2048 pixels.
    '''

    print(f"Desired dimensions: {desired_width}x{desired_height} pixels")

    ar = desired_width / float(desired_height)

    print(f"Aspect ratio: {ar:.2f}")

    # Calculate dimensions in pixels maintaining aspect ratio with max 2048 constraint
    # Image width must be an integer value between 512 and 2048, in multiples of 64.
    # We have to round up to the nearest multiple of 64

    if ar >= 1:  # Width greater than height
        if maximise_resolution:
            width = max_pixels
        else:
            width = desired_width
            # ensure width is at least 512
            width = max(512, width)
            # ensure width doesn't exceed max_pixels
            width = min(max_pixels, width)
            # ensure width is a multiple of 64
            width = ((width + 63) // 64) * 64
        height = int(width / ar)
        # check if height is a multiple of 64, if not round up
        # Round height up to nearest multiple of 64
        height = ((height + 63) // 64) * 64
        # Ensure height is at least 512
        height = max(512, height)
        # Ensure height doesn't exceed max_pixels
        height = min(max_pixels, height)
    else:  # Height greater than width
        if maximise_resolution:
            height = max_pixels
        else:
            height = desired_height
            # ensure height is at least 512
            height = max(512, height)
            # ensure height doesn't exceed max_pixels
            height = min(max_pixels, height)
            # ensure height is a multiple of 64
            height = ((height + 63) // 64) * 64
        width = int(height * ar)
        # check if width is a multiple of 64, if not round up
        # Round width up to nearest multiple of 64
        width = ((width + 63) // 64) * 64
        # Ensure width is at least 512
        width = max(512, width)
        # Ensure width doesn't exceed max_pixels
        width = min(max_pixels, width)

    # convert to int
    width = int(width) # 600
    height = int(height) # 800

    if height > 1400 or width > 1400:
        if height > width:
            scale = 1400 / height
        else:
            scale = 1400 / width
        width *= scale
        height *= scale
        width = round(width)
        height = round(height)

    print(f"Generated dimensions: {width}x{height} pixels")

    return width, height


async def generate_image_and_return_base64(positive_prompt, lora, negative_prompt="ugly, blurry, low quality", desired_width=512, desired_height=512) -> str:
    # runware = Runware(api_key=RUNWARE_API_KEY)
    # await runware.connect()

    recomputed_width, recomputed_height = recompute_dimensions(desired_width, desired_height, maximise_resolution=False)

    chosen_model = "runware:100@1"
    # Flux Schnell: runware:100@1
    # Flux Dev: runware:101@1
    # Stable Diffusion 3: runware:5@1


# {
#   "positivePrompt": "frog sitting on a log",
#   "model": "runware:101@1",
#   "width": 1024,
#   "height": 1024,
#   "numberResults": 1,
#   "outputFormat": "WEBP",
#   "steps": 28,
#   "CFGScale": 3.5,
#   "scheduler": "FlowMatchEulerDiscreteScheduler",
#   "strength": 0.8,
#   "promptWeighting": "none",
#   "seed": "",
#   "lora": [
#     {
#       "model": "civitai:661571@740355",
#       "weight": 1
#     }
#   ]
# }

# {
#   "positivePrompt": "a knight standing in front of a dragon",
#   "model": "civitai:133005@288982",
#   "width": 1024,
#   "height": 1024,
#   "numberResults": 1,
#   "outputFormat": "WEBP",
#   "steps": 20,
#   "CFGScale": 7.5,
#   "scheduler": "Default",
#   "strength": 0.8,
#   "promptWeighting": "none",
#   "seed": "",
#   "lora": [
#     {
#       "model": "civitai:138585@153153",
#       "weight": 1
#     }
#   ]
# }
    loras = None
    # LoRAs
    # LoRAs
    # ------------------------------------------------------------------------------------------------
    # Remember to always also load the corresponding base model!

    # LoRA SD 1.5 realistic comic book https://civitai.com/models/240267?modelVersionId=271085: civitai:240267@271085

    # Flux 1D civitai:830230@954701 https://civitai.com/models/830230?modelVersionId=954701

    # Flux 1D civitai:742916@830817 https://civitai.com/models/742916?modelVersionId=830817

    # Flux 1D civitai:896684@1003397 Wizard's Ligne Claire Comic Art Style https://civitai.com/models/896684?modelVersionId=1003397 

    # loras = [
    #     ILora(
    #     model="civitai:138585@153153",
    #     weight=1
    #     )
    # ]

    num_results = 1  # Careful: currently only 1 result is supported as we return after the first one

    # request_image = IImageInference(
    #     positivePrompt=positive_prompt,
    #     negativePrompt=negative_prompt,
    #     model=chosen_model,  
    #     numberResults=num_results,  
    #     width=recomputed_width,
    #     height=recomputed_height,  
    #     # outputType="base64Data",  # this works not for all sizes (512x512 generally works)
    #     outputFormat="PNG",
    #     steps=4,
    #     CFGScale=1,
    #     #lora=loras,
    #     # includeCost=True
    # )


    # for FLux 1D
    # request_image = IImageInference(
    #     positivePrompt=positive_prompt,
    #     negativePrompt=negative_prompt,
    #     model=chosen_model,  
    #     numberResults=num_results,  
    #     width=recomputed_width,
    #     height=recomputed_height,  
    #     # outputType="base64Data",  # this works not for all sizes (512x512 generally works)
    #     outputFormat="PNG",
    #     steps=28,
    #     CFGScale=3.5,
    #     lora=loras,
    #     # includeCost=True
    # )

    try:
        if lora == "silver":
            output = replicate.run(
                "cprototyping/silver_new:ff366c84c59fac49c5768d9e7c0447371b1b5bd72604fec9960dda7374ab9bf5",
                input={
                    "prompt": positive_prompt,
                    "model": "dev",
                    "go_fast": False,
                    "lora_scale": 1,
                    "megapixels": "1",
                    "num_outputs": 1,
                    "aspect_ratio": "custom",
                    "width": min(recomputed_width,1440),
                    "height": min(recomputed_height,1440),  
                    "output_format": "webp",
                    "guidance_scale": 3,
                    "output_quality": 80,
                    "prompt_strength": 0.8,
                    "extra_lora_scale": 1,
                    "num_inference_steps": 28
                }
            )
        elif lora == "jim":
            output = replicate.run(
                "cprototyping/jim_new:0a58fc101a0ae938cb6ba40c0382f2beeb46c5f6144a54833df5cd648c57fa89",
                input={
                    "prompt": positive_prompt,
                    "model": "dev",
                    "go_fast": False,
                    "lora_scale": 1,
                    "megapixels": "1",
                    "num_outputs": 1,
                    "output_format": "webp",
                    "aspect_ratio": "custom",
                    "width": min(recomputed_width,1440),
                    "height": min(recomputed_height,1440),  
                    "guidance_scale": 3,
                    "output_quality": 80,
                    "prompt_strength": 0.8,
                    "extra_lora_scale": 1,
                    "num_inference_steps": 28
                }
            )
        elif lora == "tom":
            output = replicate.run(
                "cprototyping/tom:704f70189b8d5bebbd1d332e133800f84f6988e47b6f9f6600844ae101d53acb",
                input={
                    "prompt": positive_prompt,
                    "model": "dev",
                    "go_fast": False,
                    "lora_scale": 1,
                    "megapixels": "1",
                    "num_outputs": 1,
                    "aspect_ratio": "custom",
                    "width": min(recomputed_width,1440),
                    "height": min(recomputed_height,1440),  
                    "output_format": "webp",
                    "guidance_scale": 3,
                    "output_quality": 80,
                    "prompt_strength": 0.8,
                    "extra_lora_scale": 1,
                    "num_inference_steps": 28
                }
            )
        elif lora == "george":
            output = replicate.run(
                "cprototyping/george:0431c530a4f4ef90bcc7a4fbbc2436eda2839e603f760b9a9322001b8bd42216",
                input={
                    "prompt": positive_prompt,
                    "model": "dev",
                    "go_fast": False,
                    "lora_scale": 1,
                    "megapixels": "1",
                    "num_outputs": 1,
                    "aspect_ratio": "custom",
                    "width": min(recomputed_width,1440),
                    "height": min(recomputed_height,1440),  
                    "output_format": "webp",
                    "guidance_scale": 3,
                    "output_quality": 80,
                    "prompt_strength": 0.8,
                    "extra_lora_scale": 1,
                    "num_inference_steps": 28
                }
            )
        elif lora == "dick":
            output = replicate.run(
            "cprototyping/dick:889bf8d5b313468d4532468e674a926678dcf82981c60cdeef3c7c9450b0bccc",
            input={
                "prompt": positive_prompt,
                "model": "dev",
                "go_fast": False,
                "lora_scale": 1,
                "megapixels": "1",
                "num_outputs": 1,
                "aspect_ratio": "custom",
                "width": min(recomputed_width,1440),
                "height": min(recomputed_height,1440),  
                "output_format": "webp",
                "guidance_scale": 3,
                "output_quality": 80,
                "prompt_strength": 0.8,
                "extra_lora_scale": 1,
                "num_inference_steps": 28
            }
        )
        else:
            output = replicate.run(
                lora,
                input={
                    "prompt": positive_prompt,
                    "model": "dev",
                    "go_fast": False,
                    "lora_scale": 1,
                    "megapixels": "1",
                    "num_outputs": 1,
                    "aspect_ratio": "custom",
                    "width": min(recomputed_width,1440),
                    "height": min(recomputed_height,1440),  
                    "output_format": "webp",
                    "guidance_scale": 3,
                    "output_quality": 80,
                    "prompt_strength": 0.8,
                    "extra_lora_scale": 1,
                    "num_inference_steps": 28
                }
            )

        # Save the generated image
        image_name = str(time.time())+'_replicate.png'
        with open(image_name, 'wb') as f:
            f.write(output[0].read())

        # images = await runware.imageInference(requestImage=request_image)
        # for image in images:  # image is an IImage object
        print(f"Image: {output}")

        # [IImage(taskType='imageInference', 
        # imageUUID='7b539f66-fc0f-40b9-a580-87d5c2fe0b8a', 
        # taskUUID='a1f8db76-907a-444d-b684-1c878fa5bbd0', 
        # inputImageUUID=None, 
        # imageURL=None, 
        # imageBase64Data='...4j7Efh/lQAAAABJRU5ErkJggg==', 
        # imageDataURI=None, 
        # NSFWContent=False, 
        # cost=0.0006)]

        # Get the imageURL
        image = Image.open("./"+image_name)

        print(image)
        # load the image from the base64 string into PIL Image
        # image = Image.open(io.BytesIO(base64.b64decode(image.imageBase64Data)))

        print(f'Generated image size: {image.width}x{image.height}')
        print(f'Desired size: {desired_width}x{desired_height}')

        if desired_width >= max_pixels or desired_height >= max_pixels:
            print(f'One desired side is >= {max_pixels}, this means we cannot crop the image')
        else:
            # cut off on both ends of the image anything that is more than the requested width and height
            # make sure to be pixel perfect (this may require cutting off a pixel more on one side)
            offset_width = (image.width - desired_width) // 2
            offset_height = (image.height - desired_height) // 2
            # The crop parameters are (left, upper, right, lower), essentially two points forming a rectangle
            image = image.resize((int(desired_width), int(desired_height)))
            # image = image.crop((offset_width, offset_height, image.width - offset_width, image.height - offset_height))
            print(f'Cropped image size: {image.width}x{image.height}')

        # convert the PIL image back to base64
        buffered = io.BytesIO()
        image.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()

        # generate a datetime string using seconds
        datetime_string = datetime.datetime.now().strftime("%Y%m%d%H%M%S")

        # save image to file
        image.save(f"output_tmp_{datetime_string}.png")

        return img_str, f"output_tmp_{datetime_string}.png"
    
    except Exception as e:
        print(f"Error generating image: {e}")
        return None


if __name__ == "__main__":
    asyncio.run(generate_image_and_return_base64(
        positive_prompt="A green alien on a chair", 
        negative_prompt="ugly, blurry, low quality", 
        desired_width=512, 
        desired_height=512
    ))