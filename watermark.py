from PIL import Image, ImageDraw
import sys

input_path = sys.argv[1]
output_path = sys.argv[2]

image = Image.open(input_path)
draw = ImageDraw.Draw(image)

text = "Xct Preview"
draw.text((50, 50), text, fill=(255, 0, 0))

image.save(output_path)