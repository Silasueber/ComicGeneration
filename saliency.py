import urllib.request
import cv2

# URL of the image
url = "https://imgs.search.brave.com/RbHwaqGyv0AysLXseeiT8TNr5KaPGq_JAX3HWTFUkEU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzL2ZiL2Uy/L2I1L2ZiZTJiNWI3/OTU2NzdmYjg3ZTg3/N2UxMWYzNTQzNjBj/LmpwZw"

# Download the image and save it to a temporary file
temp_file = urllib.request.urlopen(url)
with open("temp_image.jpg", "wb") as f:
    f.write(temp_file.read())

# Read the image from the temporary file
image = cv2.imread("temp_image.jpg")

# Convert the image to BGR color space (default is RGB)
image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

# Create saliency detector
saliency = cv2.saliency.StaticSaliencySpectralResidual_create()

# Compute saliency
(success, saliency_map) = saliency.computeSaliency(image)

# Convert to binary saliency map
binary_map = (saliency_map * 255).astype("uint8")


cv2.imshow("Image", image)
cv2.imshow("Output", saliency_map)
cv2.waitKey(0)