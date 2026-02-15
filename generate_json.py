import os
import json
import re

def clean_filename(filename):
    """
    Cleans messy filenames like:
    'Ego Killer – Dhanda Nyoliwala (Music Video) _ Deepesh Goyal (MP3_320K).mp3'
    Into: 'Ego Killer – Dhanda Nyoliwala.mp3'
    """
    # 1. Remove anything inside parentheses () or brackets []
    name = re.sub(r'\s*[\(\[].*?[\)\]]', '', filename)
    
    # 2. Split by common separators (pipes |, underscores _, or double dashes --) 
    # and keep only the first part if it looks like promotional text follows
    if " _ " in name:
        name = name.split(" _ ")[0]
    if " | " in name:
        name = name.split(" | ")[0]
        
    # 3. Handle the extension
    base_name = name.replace(".mp3", "").strip()
    return f"{base_name}.mp3"

def process_music_library():
    root_songs = "songs"
    
    if not os.path.exists(root_songs):
        print(f"❌ Error: '{root_songs}' folder not found!")
        return

    albums = []
    
    # Iterate through each album folder
    for folder in os.listdir(root_songs):
        folder_path = os.path.join(root_songs, folder)
        
        if os.path.isdir(folder_path):
            print(f"\n📂 Processing Album: {folder}")
            albums.append(folder)
            cleaned_songs = []
            
            for file in os.listdir(folder_path):
                if file.endswith(".mp3"):
                    old_path = os.path.join(folder_path, file)
                    new_name = clean_filename(file)
                    new_path = os.path.join(folder_path, new_name)
                    
                    # Rename the actual file on your hard drive
                    if old_path != new_path:
                        try:
                            os.rename(old_path, new_path)
                            print(f"  ✨ Renamed: {file} -> {new_name}")
                        except Exception as e:
                            print(f"  ⚠️ Could not rename {file}: {e}")
                            new_name = file # Fallback to old name if error
                    
                    cleaned_songs.append(new_name)
            
            # Create the list.json for this album
            with open(os.path.join(folder_path, "list.json"), "w", encoding="utf-8") as f:
                json.dump(cleaned_songs, f, indent=4)
            print(f"  ✅ list.json created for {folder}")

    # Create the master songs.json
    with open(os.path.join(root_songs, "songs.json"), "w", encoding="utf-8") as f:
        json.dump(albums, f, indent=4)
        
    print("\n🚀 ALL DONE! Your library is clean and the JSON maps are ready.")

if __name__ == "__main__":
    process_music_library()