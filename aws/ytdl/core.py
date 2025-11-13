#!/usr/bin/env python3
"""
YouTube Audio Downloader Script - SIMPLE VERSION
No complex regex - just basic string parsing
100% compatible with PyDroid on Android
"""

import os
import re
import sys

try:
    import yt_dlp
    print("âœ“ yt-dlp imported successfully")
except ImportError:
    print("ERROR: yt-dlp not installed!")
    print("Install it with: pip install yt-dlp")
    sys.exit(1)

# Configuration
LIBRARY_FILE = "library.js"
OUTPUT_FOLDER = "audioDL"
AUDIO_FORMAT = "mp3"

# Search priority
SEARCH_PATTERNS = [
    ["audio", "(audio)", "official audio", "(official audio)"],
    ["lyrics", "(lyrics)", "official lyrics", "(official lyrics)"],
    ["official music video"]
]


def parse_library_js(file_path):
    """
    Parse library.js using simple string splitting - no complex regex!
    """
    print(f"\nðŸ“– Reading {file_path}...")

    if not os.path.exists(file_path):
        print(f"âŒ Error: {file_path} not found!")
        return []

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        songs = []
        current_artist = "Unknown"

        # Split into lines and process
        lines = content.split('\n')

        for line in lines:
            line = line.strip()

            # Look for artist line
            if 'artist:' in line:
                # Extract artist name between quotes
                if '"' in line:
                    parts = line.split('"')
                    if len(parts) >= 2:
                        current_artist = parts[1]
                elif "'" in line:
                    parts = line.split("'")
                    if len(parts) >= 2:
                        current_artist = parts[1]

            # Look for title line
            elif 'title:' in line:
                # Extract title between quotes
                title = None
                if '"' in line:
                    parts = line.split('"')
                    if len(parts) >= 2:
                        title = parts[1]
                elif "'" in line:
                    parts = line.split("'")
                    if len(parts) >= 2:
                        title = parts[1]

                if title:
                    songs.append({
                        'title': title,
                        'artist': current_artist
                    })

        print(f"âœ“ Found {len(songs)} songs")
        return songs

    except Exception as e:
        print(f"âŒ Error parsing file: {e}")
        return []


def sanitize_filename(text):
    """
    Remove spaces and special characters.
    Example: "You Need to Calm Down" -> "youneedtocalmdown"
    """
    text = text.lower()
    # Keep only letters and numbers
    text = ''.join(c for c in text if c.isalnum())
    return text


def search_youtube(query, search_limit=5):
    """
    Search YouTube and return results.
    """
    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'extract_flat': True,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            search_query = f"ytsearch{search_limit}:{query}"
            result = ydl.extract_info(search_query, download=False)

            if result and 'entries' in result:
                return result['entries']
            return []
    except Exception as e:
        print(f"   âš  Search error: {e}")
        return []


def find_best_match(song_title, artist_name):
    """
    Search using fallback logic: audio > lyrics > music video
    """
    base_query = f"{song_title} {artist_name}"

    # Try each search pattern
    for pattern_list in SEARCH_PATTERNS:
        for keyword in pattern_list:
            query = f"{base_query} {keyword}"
            print(f"   ðŸ” Searching: {query}")

            results = search_youtube(query, search_limit=3)

            if results:
                for result in results:
                    if result:
                        title = result.get('title', '').lower()
                        if song_title.lower() in title:
                            video_url = f"https://www.youtube.com/watch?v={result.get('id')}"
                            print(f"   âœ“ Found: {result.get('title')}")
                            return video_url

    # Last resort
    print(f"   âš  Using basic search")
    results = search_youtube(base_query, search_limit=1)
    if results and results[0]:
        video_url = f"https://www.youtube.com/watch?v={results[0].get('id')}"
        print(f"   âœ“ Using: {results[0].get('title')}")
        return video_url

    return None


def download_audio(video_url, output_filename, output_folder):
    """
    Download and convert to MP3.
    """
    output_path = os.path.join(output_folder, output_filename)

    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': output_path,
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': AUDIO_FORMAT,
            'preferredquality': '0',
        }],
        'quiet': False,
        'no_warnings': False,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            print(f"   â¬‡ Downloading...")
            ydl.download([video_url])

        expected_file = f"{output_path}.{AUDIO_FORMAT}"
        if os.path.exists(expected_file):
            print(f"   âœ… Downloaded: {output_filename}.{AUDIO_FORMAT}")
            return True
        else:
            print(f"   âš  File not found")
            return False
    except Exception as e:
        print(f"   âŒ Failed: {e}")
        return False


def main():
    """
    Main function.
    """
    print("=" * 60)
    print("ðŸŽµ YouTube Audio Downloader")
    print("=" * 60)

    # Create output folder
    if not os.path.exists(OUTPUT_FOLDER):
        os.makedirs(OUTPUT_FOLDER)
        print(f"\nðŸ“ Created folder: {OUTPUT_FOLDER}")

    # Parse songs
    songs = parse_library_js(LIBRARY_FILE)

    if not songs:
        print("\nâŒ No songs found!")
        return

    # Ask how many to download
    print(f"\nðŸ“‹ Total songs: {len(songs)}")

    try:
        choice = input("\n(A)ll, (F)irst 10, or (C)ustom? [A/F/C]: ").strip().upper()

        if choice == 'F':
            songs_to_process = songs[:10]
        elif choice == 'C':
            num = int(input("How many? "))
            songs_to_process = songs[:num]
        else:
            songs_to_process = songs
    except:
        print("Using first 10 songs...")
        songs_to_process = songs[:10]

    print(f"\nðŸš€ Starting download of {len(songs_to_process)} songs...")
    print("=" * 60)

    # Stats
    successful = 0
    failed = 0
    skipped = 0

    # Process each song
    for idx, song in enumerate(songs_to_process, 1):
        title = song['title']
        artist = song['artist']

        print(f"\n[{idx}/{len(songs_to_process)}] {title} by {artist}")

        filename = sanitize_filename(title)
        output_file = os.path.join(OUTPUT_FOLDER, f"{filename}.{AUDIO_FORMAT}")

        # Skip if exists
        if os.path.exists(output_file):
            print(f"   â­ Already exists")
            skipped += 1
            continue

        # Find and download
        video_url = find_best_match(title, artist)

        if video_url:
            if download_audio(video_url, filename, OUTPUT_FOLDER):
                successful += 1
            else:
                failed += 1
        else:
            print(f"   âŒ No video found")
            failed += 1

    # Summary
    print("\n" + "=" * 60)
    print("ðŸ“Š SUMMARY")
    print("=" * 60)
    print(f"âœ… Successful: {successful}")
    print(f"âŒ Failed: {failed}")
    print(f"â­ Skipped: {skipped}")
    print(f"ðŸ“ Files in: {OUTPUT_FOLDER}/")
    print("=" * 60)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nâ¸ Interrupted")
        sys.exit(0)
    except Exception as e:
        print(f"\n\nâŒ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)