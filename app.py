from flask import Flask, jsonify, request , send_file
from flask_cors import CORS
from PIL import Image
import io

from diffusers import StableDiffusionXLAdapterPipeline, T2IAdapter, EulerAncestralDiscreteScheduler, AutoencoderKL
from diffusers.utils import load_image, make_image_grid
from controlnet_aux.lineart import LineartDetector

import matplotlib.pyplot as plt
import numpy as np




# creating a Flask app 
app = Flask(__name__) 
CORS(app)
# on the terminal type: curl http://127.0.0.1:5000/ 
# returns hello world when we use GET. 
# returns the data that we send when we use POST. 
@app.route('/', methods = ['GET', 'POST']) 
def home(): 
    if(request.method == 'GET'): 
  
        data = "hello world"
        return jsonify({'data': data}) 
    
@app.route('/image', methods = ['POST']) 
def image(): 
    if "image" not in request.files:
        return {"error": "No file uploaded"}, 400
    # Open the uploaded image file
    image_file = request.files["image"]
    image = Image.open(image_file)


    # Convert the image to black and white
    bw_image = image.convert("L")

    # Save the processed image to a BytesIO object
    img_io = io.BytesIO()
    bw_image.save(img_io, "PNG")
    img_io.seek(0)

    return send_file(img_io, mimetype="image/png")

@app.route('/sketch', methods = ['POST']) 
def generate_sketch(): 
    if "image" not in request.files:
        return {"error": "No file uploaded"}, 400
    # Open the uploaded image file
    image_file = request.files["image"]
    image = Image.open(image_file)

    line_detector = LineartDetector.from_pretrained("lllyasviel/Annotators").to("cuda")

    detected_image = line_detector(
        image, detect_resolution=384, image_resolution=1024
    )

    # Save the processed image to a BytesIO object
    img_io = io.BytesIO()
    detected_image.save(img_io, "PNG")
    img_io.seek(0)

    return send_file(img_io, mimetype="image/png")


@app.route("/prompt", methods= ["POST"])
def prompt():
    
    # Open the uploaded image file
    if "image" not in request.files:
        return {"error": "No file uploaded"}, 400
    # Open the uploaded image file


    image_file = request.files["image"]
    image = Image.open(image_file)
    
    # load adapter
    adapter = T2IAdapter.from_pretrained(
    "
    ", torch_dtype=torch.float16, varient="fp16"
    ).to("cuda")

    # load euler_a scheduler
    model_id = 'stabilityai/stable-diffusion-xl-base-1.0'
    euler_a = EulerAncestralDiscreteScheduler.from_pretrained(model_id, subfolder="scheduler")
    vae=AutoencoderKL.from_pretrained("madebyollin/sdxl-vae-fp16-fix", torch_dtype=torch.float16)
    pipe = StableDiffusionXLAdapterPipeline.from_pretrained(
        model_id, vae=vae, adapter=adapter, scheduler=euler_a, torch_dtype=torch.float16, variant="fp16",
    ).to("cuda")
    #pipe.enable_xformers_memory_efficient_attention()

    # line_detector = LineartDetector.from_pretrained("lllyasviel/Annotators").to("cuda")

    # # url = "https://imgs.search.brave.com/whdmlJZGwsafpyLdDLQclUpkuXjzwYBZ4fdKWWmaOoI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pMC53/cC5jb20vd3d3LnBy/aW50bWFnLmNvbS93/cC1jb250ZW50L3Vw/bG9hZHMvMjAxNC8w/NS8yYTM0ZDhfOTc3/YjkyYjNhNmNmNGQ2/N2FkOGM0MzliYWRk/ZmI5MDBtdjIuanBn/P3Jlc2l6ZT02MDAs/MTAzNiZxdWFsaXR5/PTg5JnNzbD0x"
    # # url = "https://imgs.search.brave.com/6Yo2RD17DB4wVLUw9GHfJliRJsnTxdp9olUVe61b5kE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzLzU0LzVl/LzNmLzU0NWUzZmVj/Y2NmNTRjYWQ3Y2Vj/NzMyOTJhZWRiYTRj/LmpwZw"
    # # url = "https://huggingface.co/Adapter/t2iadapter/resolve/main/figs_SDXLV1.0/org_lin.jpg"
    # # image = load_image(url)
    # detected_image = line_detector(
    #     image, detect_resolution=384, image_resolution=512
    # )

    # # Display the image
    # plt.figure(figsize=(8, 8))
    # plt.imshow(detected_image)
    # plt.axis('off')  # Hide axis
    # plt.show()


    prompt = request.form['prompt']
    negative_prompt = "anime, cartoon, graphic, text, painting, crayon, graphite, abstract, glitch, deformed, mutated, ugly, disfigured"
    gen_images = pipe(
        prompt=prompt,
        negative_prompt=negative_prompt,
        image=image,
        num_inference_steps=30,
        adapter_conditioning_scale=0.8,
        guidance_scale=7.5,
    ).images[0]

    # Display the image
    # plt.figure(figsize=(8, 8))
    # plt.imshow(gen_images)
    # plt.axis('off')  # Hide axis
    # plt.show()
     # Save the processed image to a BytesIO object
    img_io = io.BytesIO()
    gen_images.save(img_io, "PNG")
    img_io.seek(0)

    return send_file(img_io, mimetype="image/png")

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')