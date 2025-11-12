#!/usr/bin/env python3
"""
YouTube Audio Downloader Script - AWS Batch Version
Automatically downloads audio from YouTube and uploads to S3
"""

import os
import re
import sys
import json
import boto3
from pathlib import Path

try:
    import yt_dlp
    print("✓ yt-dlp imported successfully")
except ImportError:
    print("ERROR: yt-dlp not installed!")
    sys.exit(1)

# Configuration
LIBRARY_FILE = os.getenv("LIBRARY_FILE", "library.js")
OUTPUT_FOLDER = os.getenv("OUTPUT_FOLDER", "audioDL")
AUDIO_FORMAT = os.getenv("AUDIO_FORMAT", "mp3")
S3_BUCKET = os.getenv("S3_BUCKET", "")  # Set via environment variable
S3_PREFIX = os.getenv("S3_PREFIX", "music/")  # Optional prefix in S3

# Initialize S3 client if bucket is specified
s3_client = None
if S3_BUCKET:
    try:
        s3_client = boto3.client('s3')
        print(f"✓ S3 client initialized for bucket: {S3_BUCKET}")
    except Exception as e:
        print(f"⚠ Warning: Could not initialize S3 client: {e}")
        s3_client = None

# Search priority patterns
SEARCH_PATTERNS = [
    {"keywords": ["audio", "(audio)", "official audio", "(official audio)"], "case_insensitive": True},
    {"keywords": ["lyrics", "(lyrics)", "official lyrics", "(official lyrics)"], "case_insensitive": True},
    {"keywords": ["official music video"], "case_insensitive": True}
]


def parse_library_js(file_path):
    """
    Parse the library.js file to extract song information.
    Returns a list of songs with title and artist.
    """
    print(f"\n📖 Reading {file_path}...")

    if not os.path.exists(file_path):
        print(f"❌ Error: {file_path} not found!")
        return []

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        songs = []

        # Find all song titles
        title_pattern = r'title:\s*["']([^"']+)["']'

        # Split by artist sections
        artist_sections = re.split(r'artist:\s*["']([^"']+)["']', content)

        for i in range(1, len(artist_sections), 2):
            if i < len(artist_sections):
                artist_name = artist_sections[i]
                section_content = artist_sections[i+1] if i+1 < len(artist_sections) else ""

                # Find all titles in this artist section
                section_titles = re.findall(title_pattern, section_content)

                for title in section_titles:
                    songs.append({
                        "title": title,
                        "artist": artist_name
                    })

        print(f"✓ Found {len(songs)} songs from {len(set(s['artist'] for s in songs))} artists")
        return songs

    except Exception as e:
        print(f"❌ Error parsing {file_path}: {e}")
        return []


def sanitize_filename(text):
    """
    Remove spaces and special characters from filename.
    Example: "You Need to Calm Down" -> "youneedtocalmdown"
    """
    text = text.lower()
    text = re.sub(r'[^a-z0-9]', '', text)
    return text


def search_youtube(query, search_limit=5):
    """
    Search YouTube and return video information without downloading.
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
        print(f"   ⚠ Search error: {e}")
        return []


def find_best_match(song_title, artist_name):
    """
    Search for the song using fallback logic.
    Returns the best video URL or None.
    """
    base_query = f"{song_title} {artist_name}"

    # Try each search pattern in order
    for i, pattern_set in enumerate(SEARCH_PATTERNS, 1):
        for keyword in pattern_set["keywords"]:
            query = f"{base_query} {keyword}"
            print(f"   🔍 Searching: {query}")

            results = search_youtube(query, search_limit=3)

            if results:
                for result in results:
                    if result:
                        title = result.get('title', '').lower()

                        if song_title.lower() in title:
                            video_url = f"https://www.youtube.com/watch?v={result.get('id')}"
                            print(f"   ✓ Found match: {result.get('title')}")
                            return video_url

    # Last resort: basic search
    print(f"   ⚠ Trying last resort: basic search")
    results = search_youtube(base_query, search_limit=1)
    if results and results[0]:
        video_url = f"https://www.youtube.com/watch?v={results[0].get('id')}"
        print(f"   ✓ Using: {results[0].get('title')}")
        return video_url

    return None


def download_audio(video_url, output_filename, output_folder):
    """
    Download audio from YouTube video URL and convert to MP3.
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
            print(f"   ⬇ Downloading and converting...")
            ydl.download([video_url])

        expected_file = f"{output_path}.{AUDIO_FORMAT}"
        if os.path.exists(expected_file):
            print(f"   ✅ Downloaded: {output_filename}.{AUDIO_FORMAT}")
            return expected_file
        else:
            print(f"   ⚠ File not found after download")
            return None

    except Exception as e:
        print(f"   ❌ Download failed: {e}")
        return None


def upload_to_s3(local_file, s3_key):
    """
    Upload file to S3 bucket.
    """
    if not s3_client or not S3_BUCKET:
        print(f"   ⏭ S3 upload skipped (no bucket configured)")
        return False

    try:
        print(f"   ☁️  Uploading to S3: s3://{S3_BUCKET}/{s3_key}")
        s3_client.upload_file(
            local_file, 
            S3_BUCKET, 
            s3_key,
            ExtraArgs={'ContentType': 'audio/mpeg'}
        )
        print(f"   ✅ Uploaded to S3")
        return True
    except Exception as e:
        print(f"   ❌ S3 upload failed: {e}")
        return False


def main():
    """
    Main execution function for AWS Batch.
    """
    print("=" * 60)
    print("🎵 YouTube Audio Downloader - AWS Batch Version")
    print("=" * 60)

    # Create output folder if it doesn't exist
    if not os.path.exists(OUTPUT_FOLDER):
        os.makedirs(OUTPUT_FOLDER)
        print(f"\n📁 Created folder: {OUTPUT_FOLDER}")

    # Parse the library.js file
    songs = parse_library_js(LIBRARY_FILE)

    if not songs:
        print("\n❌ No songs found in library.js!")
        sys.exit(1)

    # Get batch parameters from environment (optional)
    START_INDEX = int(os.getenv("START_INDEX", "0"))
    END_INDEX = int(os.getenv("END_INDEX", str(len(songs))))

    songs_to_process = songs[START_INDEX:END_INDEX]

    print(f"\n📋 Processing songs {START_INDEX} to {END_INDEX} ({len(songs_to_process)} songs)")
    print(f"🚀 Starting download...")
    print("=" * 60)

    # Track statistics
    successful = 0
    failed = 0
    uploaded = 0

    # Process each song
    for idx, song in enumerate(songs_to_process, 1):
        title = song['title']
        artist = song['artist']

        print(f"\n[{idx}/{len(songs_to_process)}] {title} by {artist}")

        # Create sanitized filename
        filename = sanitize_filename(title)

        # Find the best matching video
        video_url = find_best_match(title, artist)

        if video_url:
            # Download the audio
            local_file = download_audio(video_url, filename, OUTPUT_FOLDER)

            if local_file:
                successful += 1

                # Upload to S3 if configured
                if S3_BUCKET:
                    s3_key = f"{S3_PREFIX}{filename}.{AUDIO_FORMAT}"
                    if upload_to_s3(local_file, s3_key):
                        uploaded += 1
                        # Optionally delete local file after upload
                        try:
                            os.remove(local_file)
                            print(f"   🗑️  Removed local file (uploaded to S3)")
                        except:
                            pass
            else:
                failed += 1
        else:
            print(f"   ❌ No suitable video found")
            failed += 1

    # Print summary
    print("\n" + "=" * 60)
    print("📊 BATCH JOB SUMMARY")
    print("=" * 60)
    print(f"✅ Successful downloads: {successful}")
    print(f"❌ Failed downloads: {failed}")
    if S3_BUCKET:
        print(f"☁️  Uploaded to S3: {uploaded}")
        print(f"📍 S3 Location: s3://{S3_BUCKET}/{S3_PREFIX}")
    else:
        print(f"📁 Local files saved in: {OUTPUT_FOLDER}/")
    print("=" * 60)

    # Exit with appropriate code
    sys.exit(0 if failed == 0 else 1)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⏸ Job interrupted.")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
