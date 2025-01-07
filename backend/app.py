
import os
from flask import Flask, jsonify, request , send_file
from flask_cors import CORS
from PIL import Image
import io

import matplotlib.pyplot as plt
import numpy as np
from openai import OpenAI
from insert_images_into_template import generate_single_image, insert_images_into_template
from dotenv import load_dotenv


load_dotenv()

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
    

@app.route('/generate_new_image', methods=["POST"])
def generate_single_new_image():
    id = request.form["id"]
    lora = request.form["lora"]
    width = request.form["width"]
    height = request.form["height"]
    prompt = request.form["prompt"]


    # return send_file("./svg_templates/single_page_normal_2_with_wobbly_borders.svg", mimetype="image/svg")
    # Open the uploaded image file
    # svg2png(bytestring=svg_template_path, write_to="outputimage.png")
    output_file_path = generate_single_image(prompt, id, width, height, lora)
    return send_file(output_file_path)  # Use appropriate MIME type for SVG



@app.route('/get-svg', methods=["POST"])
def get_svg():
    print("GET SVG FILE")
    layout = request.form["layout"]
    lora = request.form["lora"]
    prompt = request.form["prompt"]


    # return send_file("./output_tmp.svg", mimetype="image/svg")
    # Open the uploaded image file
    # svg2png(bytestring=svg_template_path, write_to="outputimage.png")
    output_file_path = insert_images_into_template(layout, lora, prompt)
    return send_file(output_file_path, mimetype="image/svg")  # Use appropriate MIME type for SVG



# @app.route('/image', methods = ['POST']) 
# def image(): 
#     if "image" not in request.files:
#         return {"error": "No file uploaded"}, 400
#     # Open the uploaded image file
#     image_file = request.files["image"]
#     image = Image.open(image_file)


#     # Convert the image to black and white
#     bw_image = image.convert("L")

#     # Save the processed image to a BytesIO object
#     img_io = io.BytesIO()
#     bw_image.save(img_io, "PNG")
#     img_io.seek(0)

#     return send_file(img_io, mimetype="image/png")


@app.route("/generatePage", methods=["GET"])
def generatePage():
    svg_template_path = "./Untitled (1).svg"
    output_file_path = insert_images_into_template(svg_template_path)
    return send_file(output_file_path, mimetype="image/svg")  # Use appropriate MIME type for SVG


# @app.route("/prompt", methods= ["GET"])
# def prompt():
#     # load adapter
#     adapter = T2IAdapter.from_pretrained(
#     "TencentARC/t2i-adapter-lineart-sdxl-1.0", torch_dtype=torch.float16, varient="fp16"
#     ).to("cuda")

#     # load euler_a scheduler
#     model_id = 'stabilityai/stable-diffusion-xl-base-1.0'
#     euler_a = EulerAncestralDiscreteScheduler.from_pretrained(model_id, subfolder="scheduler")
#     vae=AutoencoderKL.from_pretrained("madebyollin/sdxl-vae-fp16-fix", torch_dtype=torch.float16)
#     pipe = StableDiffusionXLAdapterPipeline.from_pretrained(
#         model_id, vae=vae, adapter=adapter, scheduler=euler_a, torch_dtype=torch.float16, variant="fp16",
#     ).to("cuda")
#     #pipe.enable_xformers_memory_efficient_attention()

#     line_detector = LineartDetector.from_pretrained("lllyasviel/Annotators").to("cuda")

#     url = "https://imgs.search.brave.com/whdmlJZGwsafpyLdDLQclUpkuXjzwYBZ4fdKWWmaOoI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pMC53/cC5jb20vd3d3LnBy/aW50bWFnLmNvbS93/cC1jb250ZW50L3Vw/bG9hZHMvMjAxNC8w/NS8yYTM0ZDhfOTc3/YjkyYjNhNmNmNGQ2/N2FkOGM0MzliYWRk/ZmI5MDBtdjIuanBn/P3Jlc2l6ZT02MDAs/MTAzNiZxdWFsaXR5/PTg5JnNzbD0x"
#     #url = "https://imgs.search.brave.com/6Yo2RD17DB4wVLUw9GHfJliRJsnTxdp9olUVe61b5kE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzLzU0LzVl/LzNmLzU0NWUzZmVj/Y2NmNTRjYWQ3Y2Vj/NzMyOTJhZWRiYTRj/LmpwZw"
#     url = "https://huggingface.co/Adapter/t2iadapter/resolve/main/figs_SDXLV1.0/org_lin.jpg"
#     image = load_image(url)
#     detected_image = line_detector(
#         image, detect_resolution=384, image_resolution=1024
#     )

#     # # Display the image
#     # plt.figure(figsize=(8, 8))
#     # plt.imshow(detected_image)
#     # plt.axis('off')  # Hide axis
#     # plt.show()


#     prompt = "Ice dragon roar, 4k photo"
#     negative_prompt = "anime, cartoon, graphic, text, painting, crayon, graphite, abstract, glitch, deformed, mutated, ugly, disfigured"
#     gen_images = pipe(
#         prompt=prompt,
#         negative_prompt=negative_prompt,
#         image=detected_image,
#         num_inference_steps=30,
#         adapter_conditioning_scale=0.8,
#         guidance_scale=7.5,
#     ).images[0]

#     # Display the image
#     # plt.figure(figsize=(8, 8))
#     # plt.imshow(gen_images)
#     # plt.axis('off')  # Hide axis
#     # plt.show()
#     return send_file(gen_images, mimetype="image/png")

if __name__ == '__main__':
    app.run(host='0.0.0.0')