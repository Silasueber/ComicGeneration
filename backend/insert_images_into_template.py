from dotenv import load_dotenv
import os
import requests
import datetime
import asyncio
import time
import traceback
import json
import io
from PIL import Image
import svgwrite
from bs4 import BeautifulSoup, Tag
from openai import OpenAI
from multiprocessing import Process, Queue
import base64
from generate_image import generate_image_and_return_base64
import ast

import re


# @Silas: Update this path to the correct template


font_path = "./KOMTITW_.ttf"

# List of prompts for each panel
# We want to describe a pack of wolves in the snow in Canada for MidJourney
prompts = [
    "A pack of grey wolves standing on a bright white snowy ridge, sunny winter sky and pure white snow, Canadian wilderness, extreme low angle shot, deep snow drifts, transition to pure white snow at the bottom of the image",
    "Birds-eye view of a wolf pack creating geometric patterns in pristine snow as they track prey, Canadian boreal forest, scattered pine trees casting long shadows, early morning light",
    "Ultra-close up of an alpha wolf's face, steam rising from its breath, crystalline snowflakes caught in its fur, intense yellow eyes, Canadian tundra background",
    "Pack of wolves running through deep powder snow, motion blur, snow spraying in their wake, Canadian winter forest, dynamic action pose, strong diagonal composition, comic book energy",
    "Wolf pack emerging from between snow-laden pine trees, Northern Lights shimmer above, full moon, pristine wilderness, Canadian Rockies in background, atmospheric fog",
    "Intimate scene of wolf pack at rest in a snow den, cubs playing, adults keeping watch, snow gently falling, Canadian wilderness, soft winter afternoon light",
    "Pack of wolves surrounding their prey, creating a circle in virgin snow, viewed from 20 feet away, Canadian forest at dusk, long shadows, stark contrast",
    "Lone wolf scout perched on a fallen log, watching over sleeping pack below, heavy snowfall, Canadian pine forest, moonlit scene, blue shadows on snow",
    "Wolf pack navigating through a grove of snow-laden birch trees, bark peeling like paper, Canadian wilderness, shafts of sunlight",
]


prompts = [
    "A pirate captain named TOK stands proudly on the deck of his weathered ship, 'The Stormchaser', in the midst of a storm. Dark clouds swirl above, and fierce waves crash against the ship's sides. TOK has wild black hair, a weathered coat, and an eyepatch. His piercing eyes scan the horizon, and the crew works diligently in the background. Lightning strikes illuminate the scene, creating dramatic shadows and highlighting the rugged ship.",
    
    "Captain TOK stands atop a rocky outcrop overlooking a hidden cove. The ocean crashes violently against the rocks below, and a secret cave entrance is visible. Sunlight flickers off a golden treasure hidden within. TOK’s long coat billows in the wind as he adjusts his eyepatch, a determined look on his face. The atmosphere is tense, with a sense of adventure in the air.",
    
    "Close-up of Captain TOK’s face as he studies an ancient, tattered treasure map. His expression is intense and focused, with deep lines on his weathered face. The map is partially unrolled in his hands, showing detailed sketches of hidden treasure. In the background, dark shadows loom, suggesting something is amiss. The lighting creates dramatic highlights and shadows across TOK’s face.",
    
    "TOK and his first mate, Flint, stand at the entrance of a dark, mysterious cave. The cave is dimly lit, with eerie blue light reflecting off the walls. TOK, with his sword drawn, takes a cautious step forward. Flint, the burly first mate, grips his cutlass tightly. Tension fills the air as they exchange wary glances, unsure of what dangers lie ahead. The cave's interior is filled with ominous shadows.",
    
    "Captain TOK exclaims with excitement as he opens the chest to reveal a trove of glittering treasure, including gold coins, sparkling jewels, and ancient artifacts. The chest is glowing with an eerie light, illuminating the dark cave around them. TOK’s face lights up with exhilaration, while Flint stands watchful beside him. The treasure room is vast, with stone walls adorned with ancient markings.",
    
    "TOK and Flint fight off dangerous traps and shadowy figures in the treasure cave. TOK skillfully wields his sword, slashing through phantom-like figures, while Flint throws punches with brute strength. The cave is chaotic, with beams of light coming from the chest and traps triggering in the background. The air is thick with dust and danger, while their movements create a blur of motion.",
    
    "The final moment of victory: Captain TOK and Flint stand triumphantly in front of the treasure chest. TOK, with his hand resting on the chest, smiles as the ancient symbols carved into the chest glow. Flint stands beside him, both of them covered in the glow of their victory. The treasure room is filled with golden light, and their faces are illuminated with a sense of accomplishment and pride.",
    
    "TOK and Flint stand outside the cave, the golden treasure chest in hand. They look toward the horizon where the *Stormchaser* waits. The setting sun casts warm golden and purple hues across the sky, and the ocean sparkles in the distance. The silhouette of the ship can be seen on the horizon, ready to sail toward new adventures. TOK and Flint share a moment of camaraderie, ready for whatever comes next.",
    
    "TOK and his crew are back aboard *The Stormchaser*, sailing through calm seas under a bright blue sky. TOK stands at the helm, looking out at the horizon with a confident smile. The ship sails smoothly, and the crew is hard at work, while TOK’s coat flaps in the wind. The scene is peaceful but filled with the promise of more adventure ahead, as the ship sails toward distant lands."
  ]

prompts = [
    "A lone pirate, Silver, stands on the deck of his battered ship, *The Sea Raven*, under the light of a full moon. His tricorne hat casts a shadow over his weathered face, and his crimson coat flutters in the ocean breeze. He holds a compass glowing with mysterious blue light, pointing toward a distant island shrouded in mist. The sea is calm but eerily silent, and stars scatter the night sky.",

    "Captain Silver leads his crew through a dense jungle, their path illuminated by flickering lanterns. Vines hang down like curtains, and strange sounds echo through the trees. Silver wields a machete to cut through the undergrowth while his map is tucked under his arm. Behind them, a ruined stone archway hints at ancient secrets waiting to be uncovered.",

    "Captain Silver kneels beside a weathered, half-buried chest in a sandy cove at dusk. The ocean waves gently lap at the shore as he brushes sand away, revealing a lock adorned with intricate carvings. His expression is a mix of anticipation and reverence. In the distance, the silhouette of *The Sea Raven* waits under a fiery orange and pink sky.",

    "Silver and his crew face off against rival pirates on the cliffs overlooking a stormy sea. The wind howls as swords clash and pistols fire. Silver, his coat torn and a cutlass in hand, engages the rival captain in a fierce duel. The scene is chaotic, with lightning splitting the sky and waves crashing far below.",

    "Captain Silver and his first mate, Mara, cautiously step into an ancient temple hidden deep within the jungle. The temple’s interior is dim, illuminated by glowing green crystals embedded in the walls. Silver holds a torch aloft, revealing murals depicting lost treasures and long-forgotten gods. The air is thick with mystery and the faint sound of dripping water echoes around them.",

    "Silver and his crew are caught in a fierce battle with ghostly figures aboard *The Sea Raven*. The spectral attackers, clad in tattered sailor uniforms, wield glowing swords. Silver stands at the helm, barking orders while fending off a ghost with his cutlass. The ship is surrounded by a glowing, eerie mist, and the moon casts an otherworldly light on the chaotic scene.",

    "Captain Silver unlocks the treasure chest in the heart of the jungle temple, revealing a dazzling collection of jewels, gold coins, and an ancient crown. The treasure glows with a golden light that reflects off the walls of the chamber. Silver’s face shows a mix of triumph and relief as his crew celebrates in the background, their cheers echoing through the chamber.",

    "Silver and his crew return to the shores of their hidden cove, their rowboat loaded with the treasure chest. The setting sun paints the sky in brilliant hues of red and purple. In the background, *The Sea Raven* waits, anchored near the shore. Silver and his first mate exchange a victorious glance, their next adventure already taking shape in their minds.",

    "Captain Silver gazes out over a sea of glittering stars reflected on the water as he stands on the bow of *The Sea Raven*. In his hand, he holds a cryptic star chart illuminated by the moonlight. The constellations on the chart seem to shift and glow, pointing the way to an uncharted island. Behind him, his crew whispers of legends and curses, their faces filled with a mix of awe and trepidation."
]

# prompts = [
#     "A playful otter swimming gracefully in a sparkling blue river, surrounded by tall reeds and water lilies, sunny day, golden ripples in the water, vibrant Canadian wilderness, low angle shot from the river's surface.",
#     "The otter pauses mid-swim, noticing a beaver diligently working on its dam, logs stacked neatly, water softly cascading over the dam, warm afternoon light filtering through the trees.",
#     "The otter peeks its head out of the water, tilting it curiously as it watches the beaver, sparkling droplets trailing from its fur, reeds and reflections framing the scene.",
#     "The beaver, holding a stick mid-task, notices the otter and turns its head, looking surprised but intrigued, surrounded by the structure of its half-finished dam, a peaceful forest setting.",
#     "The otter climbs onto the riverbank and waves shyly at the beaver, looking slightly bashful but playful, soft golden light casting gentle shadows, river sparkling in the background.",
#     "The beaver approaches cautiously, still holding a stick, curious but friendly, the warm tones of logs and soft green foliage enhancing the moment.",
#     "The otter presents the beaver with a water lily, holding it delicately in its paws, a big, warm smile on its face, golden hour lighting adding a romantic glow.",
#     "The beaver accepts the water lily, smiling gently in return, tails overlapping slightly as they sit together on the riverbank, framed by soft focus on the tranquil river and forest behind.",
#     "The otter and the beaver sit closely on the riverbank as the sun sets, silhouetted against a vibrant sunset with pink, orange, and purple hues, tails entwined, reflecting their newfound bond."
# ]

text = [
    None,  # Panel 1: Visual setup of the otter swimming.
    None,  # Panel 2: The otter notices the beaver at work.
    None,
    None,
    None,
    None,
    None,
    None,
    None,
    None,
    None,
    None  # Panel 9: A wordless, heartwarming sunset conclusion.
]

# text = [
#     None,  # Panel 1: The dog notices something unusual in the meadow.
#     None,  # Panel 2: The pig is introduced, dancing joyfully.
#     None,  # Panel 3: The dog reacts with curiosity, setting up the encounter.
#     None,  # Panel 4: The cautious first meeting.
#     "'Charlie?'",  # Panel 5: The realization that they share the same name.
#     "We're the same!",  # Panel 6: Celebrating their newfound friendship.
#     None,  # Panel 7: A moment of shared peace under the oak tree.
#     None,  # Panel 8: The pig teaches the dog to dance.
#     None,  # Panel 9: A wordless, heartwarming sunset conclusion.
# ]

# # prompts for black background
# prompts = [
#     "A pack of grey wolves standing on a moonlit snowy ridge, star-filled winter night sky and silvery snow, Canadian wilderness, extreme low angle shot, deep snow drifts illuminated by starlight, transition to black dark snow at the bottom of the image",
#     "Birds-eye view of a wolf pack creating geometric patterns in pristine snow as they track prey, Canadian boreal forest, scattered pine trees casting blue-black shadows, starlight catching the snow crystals",
#     "Ultra-close up of an alpha wolf's face, steam rising from its breath, crystalline snowflakes caught in its fur glinting in the moonlight, intense yellow eyes reflecting starlight, Canadian tundra background shrouded in darkness",
#     "Pack of wolves running through deep powder snow, motion blur, snow spraying in their wake catching moonbeams, Canadian winter forest at night, dynamic action pose, strong diagonal composition, comic book energy",
#     "Wolf pack emerging from between snow-laden pine trees, Northern Lights shimmer above, full moon casting blue shadows, pristine wilderness, Canadian Rockies silhouetted in background, atmospheric fog",
#     "Intimate scene of wolf pack at rest in a snow den, cubs playing, adults keeping watch, snow gently falling in moonlight, Canadian wilderness, dark navy shadows on snow",
#     "Pack of wolves surrounding their prey, creating a circle in virgin snow, viewed from 20 feet away, Canadian forest under starlight, elongated shadows from moonlight, stark contrast between dark forest and luminescent snow",
#     "Lone wolf scout perched on a fallen log, watching over sleeping pack below, heavy snowfall in darkness, Canadian pine forest, moonlit scene, deep indigo shadows on snow",
#     "Wolf pack navigating through a grove of snow-laden birch trees, bark peeling like paper glowing faintly in starlight, Canadian wilderness, shafts of moonlight piercing through branches"
# ]

# # Pirate scenes; not continuous story
# prompts = [
#     "A grizzled one-legged ship's cook standing on a moonlit ship's deck, stars glinting off his brass buttons, wooden vessel creaking in darkness, extreme low angle shot, deep shadows between deck planks, eerie glow from lanterns below",
#     "Birds-eye view of mutinous pirates creating a search pattern across the torchlit beach as they hunt for buried treasure, scattered palm trees casting wavering shadows, embers from their torches drifting in the night air",
#     "Ultra-close up of the scarred ship captain's weathered face, pipe smoke curling from his lips, beads of sweat caught in his graying beard, intense eyes reflecting candlelight, dark cabin walls behind him",
#     "Band of pirates running through jungle undergrowth, motion blur, leaves whipping in their wake, abandoned stockade in background, dynamic action pose, strong diagonal composition, moonlit chase scene",
#     "Group of mutineers emerging from between twisted mangroves, stars twinkling above through breaks in the canopy, full moon casting ghostly shadows, pristine tropical island, mountains looming in background, thick night mist",
#     "Intimate scene of loyal crew members resting in ship's hold, young cabin boy learning knots, old salts keeping watch, lantern light flickering, creaking timbers, dark corners filled with cargo",
#     "Pirates surrounding the young nobleman and his companions, creating a circle in the sandy clearing, viewed from 20 feet away, tropical forest under starlight, torch shadows dancing on palm fronds, stark contrast",
#     "Loyal scout sailor perched in the crow's nest, watching over the sleeping ship below, sea spray in darkness, rigging creaking in the night wind, moonlit scene, deep shadows in the sails",
#     "Band of buccaneers navigating through a grove of weather-beaten palms, tattered clothes fluttering like flags in the breeze, island wilderness, shafts of moonlight revealing glimpses of treasure map"
# ]

# # pirate scenes; continuous story
# prompts = [
#     "An abandoned galleon looming in the moonlit harbor, stars glinting off dark waters, wooden hull creaking in darkness, extreme low angle shot, deep shadows between weathered planks, eerie phosphorescent glow from beneath the waves, 18th century",
#     "Birds-eye view of torchlit figures moving across the beach in search formations, their lights creating an ominous pattern as they approach the sleeping ship, scattered palm trees casting wavering shadows, embers drifting in the night air, 18th century",
#     "Ultra-close up of a spyglass abandoned on the ship's rail, dewdrops caught on the brass, reflected starlight showing smeared fingerprints, dark water stretching endlessly behind, tension in the empty scene, 18th century",
#     "Crew pirate members fleeing through jungle undergrowth, motion blur, leaves whipping in their wake, glimpse of the abandoned stockade offering refuge, dynamic action pose, strong diagonal composition, moonlit chase scene, 18th century",
#     "Mutineers emerging from twisted mangroves in pursuit, stars twinkling above through breaks in the canopy, full moon casting ghostly shadows, pristine tropical island, mountains looming in background, thick night mist, 18th century",
#     "Hidden scene inside the stockade - loyal crew members tending wounds, young cabin boy loading muskets, old salts barricading windows, lantern light flickering, wooden walls creaking, dark corners holding secrets, 18th century",
#     "Pirates surrounding the stockade, creating a circle in the sandy clearing, viewed from 20 feet away, tropical forest under starlight, torch shadows dancing on palm fronds, stark contrast between light and shadow, 18th century",
#     "Single loyal lookout perched in the stockade tower, watching the pirate forces gathering below, sea spray visible in distance, palm fronds creaking in the night wind, moonlit scene, deep shadows across the defenses, 18th century",
#     "The final confrontation - sailors and pirates clashing through a grove of weather-beaten palms, torn treasure map fragments scattered in the breeze, island wilderness, shafts of moonlight illuminating the chaos of battle, 18th century"
# ]


general_style_prompt = ", for the cyclops comics style, josan gonzalez, haroon mirza, realist detail, traditional belgian graphic novel"
#general_style_prompt = ", very few lines, lines, thumbnail sketch, rough, storyboard frame, white fineliner on pure black background, Linework-only, hatched style,quick lines, linienbasiert, craft, A dynamic, expressive rough sketch style, characterized by loose, energetic lines and minimal detail. The artwork emphasizes flow and motion, raw, evocative, spontaneous"
negative_prompt = "ugly, blurry, low quality"
#negative_prompt = "intricate details, color, signature, flächig, generated, handwriting, painting, 3D render, photorealistic, polished, refined details, clean or sharp edges, rigid or overly structured composition, highly realistic rendering, smooth gradients, intricate background details, sterile, overworked"

def get_story(prompt):
    # Set OpenAI API key from environment variable
    client = OpenAI(api_key=os.environ.get("OPEN_AI_KEY"))
    
    # Make a request to OpenAI API
    response = client.chat.completions.create(
    model="gpt-4o-2024-08-06",
    messages=[
        {
            "role": "system",
            "content": "Create 9 image prompts and text for speech bubbles For image generation which can be used for a comic page based on the story I will provide you. Speech can also be none and then leave it empty if there shouldn't be a speech bubble. The speech should also just have the string of what the speech is NOT who is saying it. Both should exactly be ONE element in the array! "
        },
        {
            "role": "user",
            "content": prompt
        }
    ],
    response_format={
    "type": "json_schema",
    "json_schema": {
        "name": "prompts",
        "schema": {
      "type": "object",
      "properties": {
          "panels": {
              "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "image": {"type": "object", "items": {"type": "string"}},
                        "speech":{"type": "object", "items": {"type": "string"}},
                    }
                }
          }
      },
      "required": [
          "prompt"
      ]
  }
    }
}
    )
    
    # Parse the response (assuming the structure is similar to JavaScript)
    print(response.choices[0].message.content)
    parsed_response = response.choices[0].message.content
    return json.loads(response.choices[0].message.content)['panels']

def generate_image_task(prompt, general_style_prompt, negative_prompt, width, height, queue, index, lora):
    """
    Worker process to generate an image for a specific panel.
    """

    # TODO: großbuschtaven vom text, create image weg und so
    try:
        print(prompt)
        if prompt['speech'] and len(prompt['speech'][0]) > 2:
            result = asyncio.run(
                generate_image_and_return_base64(
                    positive_prompt="Create an image of" + prompt['image'][0] + general_style_prompt + " with an integrated speech bubble, thought bubble or text box. Ensure the speech bubble/text box is seamlessly incorporated into the image, positioned to complement the scene without obstructing important details. Include the following text in the thought bubble/speech bubble/text box: '"+prompt['speech'][0]+"', styled to match the image's aesthetics.",
                    negative_prompt=negative_prompt,
                    desired_width=width,
                    desired_height=height,
                    lora=lora
                )
            )
        else:
            result = asyncio.run(
                generate_image_and_return_base64(
                    positive_prompt="Create an image of" + prompt['image'][0] + general_style_prompt,
                    negative_prompt=negative_prompt,
                    desired_width=width,
                    desired_height=height,
                    lora=lora
                )
            )
        queue.put((index, result))  # Send the result back to the main process
    except Exception as e:
        print(f"Error in process for index {index}: {e}")
        queue.put((index, None))

def generate_single_image(prompt, id, width, height, lora):
    queue = Queue()
    print(prompt)
    print(lora)
    try:
        # Replace single quotes with double quotes for keys and string values
        sanitized_string = re.sub(r"(?<!\\)'", '"', prompt)

        # Ensure the JSON syntax remains valid by accounting for escaped quotes
        # For example, 'It\'s' becomes 'It"s' which might require correction
        sanitized_string = re.sub(r'\\?"', r'"', sanitized_string)

        # Attempt to parse the sanitized string
        prompt = json.loads(sanitized_string)
        print(prompt)
    except (ValueError, SyntaxError) as e:
        print(f"Error processing the input: {e}")
    print(prompt)
    process = Process(
            target=generate_image_task,
            args=(prompt, general_style_prompt, negative_prompt, float(width), float(height), queue, 0, lora)
        )
    process.start()
    index, result = queue.get()
    _, filename = result
    return filename

    


def insert_images_into_template(layout, lora, prompt):

    if layout == "layout1":
        svg_template_path = "./svg_templates/single_page_normal_1_with_wobbly_borders.svg"
    elif layout == "layout2":
        svg_template_path = "./svg_templates/single_page_normal_2_with_wobbly_borders.svg"
    elif layout == "layout3":
        svg_template_path = "./svg_templates/single_page_normal_3_with_wobbly_borders.svg"
    elif layout == "layout4":
        svg_template_path = "./svg_templates/single_page_with_background_1_with_wobbly_borders.svg"
    elif layout == "layout5":
        svg_template_path = "./svg_templates/single_page_with_background_2_with_wobbly_borders.svg"
    else:
        svg_template_path = "./svg_templates/single_page_with_background_3_with_wobbly_borders_black.svg"

    
    # Load the SVG file
    with open(svg_template_path, 'r') as file:
        svg_content = file.read()

    # Parse the SVG content using BeautifulSoup
    soup = BeautifulSoup(svg_content, 'lxml')

    # Find all <rect> elements with data-role="panel"
    panels = soup.find_all('rect', {'data-role': 'panel'})  # this should include any half-page background panels

    prompts = get_story(prompt)
    if len(panels) > len(prompts):
        print(f'Warning: More panels than prompts ({len(panels)} > {len(prompts)})')
        return None

    base64_images_as_string = [None] * len(panels)
    panel_ids = []
    processes = []
    queue = Queue()

    # Add a <path> element with a wobbly border to each panel
    for index, panel in enumerate(panels):
        # Get the panel's dimensions
        x = float(panel['x'])
        y = float(panel['y'])
        width = float(panel['width'])
        height = float(panel['height'])

        panel_id = panel['id']
        panel_ids.append(panel_id)

        prompt = prompts[index]
        process = Process(
            target=generate_image_task,
            args=(prompt, general_style_prompt, negative_prompt, width, height, queue, index, lora)
        )
        processes.append(process)
        process.start()

        time.sleep(1)

    # Collect results
    for _ in range(len(processes)):
        index, result = queue.get()
        image, _ = result
        base64_images_as_string[index] = image

    # Wait for all processes to complete
    for process in processes:
        process.join()


    print(f'Panel IDs: {panel_ids}')

    # Insert the images into the SVG where the panel ids match
    for index, panel_id in enumerate(panel_ids):

        print(f'Working on panel ID: {panel_id}')

        if base64_images_as_string[index] is not None:

            # Find the panel by id
            panel = soup.find('rect', {'id': panel_id})
            print(panel_id)
          
            # DISABLE TEXT
            # if text[index] != None:
            #     print(index)
            #     panel_text = soup.find('rect', {'id': "panel_text_"+str(index+1)})
            #     text_element = soup.new_tag("text")
            #     text_element['x'] = str(float(panel_text['x'])+float(panel_text['width'])//2)
            #     text_element['y'] = str(float(panel_text['y'])+float(panel_text['height'])//2)
            #     text_element['width'] = panel_text['width']
            #     text_element['height'] = panel_text['height']

            #     text_element['font-size'] = str(1000/len(text[index]))
            #     text_element['fill'] = 'black'  # Text color
            #     text_element['text-anchor'] = 'middle'  # Center the text horizontally
            #     text_element['dominant-baseline'] = 'middle'  # Center the text vertically
            #     text_element['font-family'] = 'Komika Title'  # Center the text vertically
            #     text_element.string = text[index]
            #     panel_text.insert_after(text_element)
            # else:
            #     panel_text = soup.find('rect', {'id': "panel_text_"+str(index+1)})
            #     panel_text.decompose()
                
            # Insert the image as a new <image> element into the panel
            image_element = soup.new_tag('image')
            image_element['x'] = panel['x']
            image_element['id'] = panel_id
            image_element['prompt'] = json.dumps(prompts[index])
            image_element['y'] = panel['y']
            image_element['width'] = panel['width']
            image_element['height'] = panel['height']
            image_element['href'] = 'data:image/png;base64,' + base64_images_as_string[index]

            panel.insert_after(image_element)

            # destroy the panel
            panel.decompose()
            
            output_path = 'output_tmp.svg'
            # Save the modified SVG
            with open(output_path, 'w') as file:
                file.write(soup.prettify())
    return output_path
