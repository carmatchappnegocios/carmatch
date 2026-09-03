import re

with open('temp_prompts.txt', 'r', encoding='utf-8') as f:
    lines = f.readlines()

output_lines = []
for line in lines:
    line = line.strip()
    if not line:
        continue
    # Split by first two pipes
    parts = line.split('|', 2)
    if len(parts) < 3:
        continue
    id_num, title, prompt = parts
    # Extract overlay text from prompt: find the text between quotes after "reads"
    match = re.search(r'reads "([^"]+)"', prompt)
    if match:
        overlay_text = match.group(1)
    else:
        # Fallback: use title
        overlay_text = title
    output_line = f"{id_num}|{overlay_text}|{prompt}"
    output_lines.append(output_line)

# Write to output file
with open('output_prompts.txt', 'w', encoding='utf-8') as f:
    for line in output_lines:
        f.write(line + '\n')

print(f"Processed {len(output_lines)} prompts.")