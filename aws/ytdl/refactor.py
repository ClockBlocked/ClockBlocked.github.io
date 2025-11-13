#!/usr/bin/env python3
"""
YouTube Audio Downloader Script - FIXED & ENHANCED VERSION
Now includes reliable .mp3 detection, renaming, and progress validation.
Fully compatible with PyDroid on Android.
"""

import os
import re
import sys
import json
import time

try:
    import yt_dlp
    print("✅ yt-dlp imported successfully")
except ImportError:
    print("ERROR: yt-dlp not installed!")
    print("Install it with: pip install yt-dlp")
    sys.exit(1)

# Configuration
LIBRARY_FILE = "library.js"
OUTPUT_FOLDER = "audioDL"
PROGRESS_FILE = "download_progress.json"
AUDIO_FORMAT = "mp3"

# Search priority
SEARCH_PATTERNS = [
    ["audio", "(audio)", "official audio", "(official audio)"],
    ["lyrics", "(lyrics)", "official lyrics", "(official lyrics)"],
    ["official music video"]
]

# ==============================================================
# Progress Tracking Class
# ==============================================================
class DownloadProgress:
    def __init__(self, progress_file):
        self.progress_file = progress_file
        self.data = self.load_progress()

    def load_progress(self):
        if os.path.exists(self.progress_file):
            try:
                with open(self.progress_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                print(f"⚠️  Could not load progress file: {e}")
        return {
            'completed_songs': [],
            'failed_songs': [],
            'last_update': time.time(),
            'total_processed': 0
        }

    def save_progress(self):
        try:
            self.data['last_update'] = time.time()
            with open(self.progress_file, 'w', encoding='utf-8') as f:
                json.dump(self.data, f, indent=2)
            return True
        except Exception as e:
            print(f"⚠️  Could not save progress: {e}")
            return False

    def is_song_completed(self, song_id):
        return str(song_id) in self.data['completed_songs']

    def mark_song_completed(self, song_id):
        song_id_str = str(song_id)
        if song_id_str not in self.data['completed_songs']:
            self.data['completed_songs'].append(song_id_str)
            self.data['total_processed'] = len(self.data['completed_songs'])
            return self.save_progress()
        return True

    def mark_song_failed(self, song_id, reason=""):
        song_id_str = str(song_id)
        failed_entry = {
            'song_id': song_id_str,
            'reason': reason,
            'timestamp': time.time()
        }
        # Avoid duplicates
        if not any(f['song_id'] == song_id_str for f in self.data['failed_songs']):
            self.data['failed_songs'].append(failed_entry)
        return self.save_progress()

    def get_completed_count(self):
        return len(self.data['completed_songs'])

    def get_failed_count(self):
        return len(self.data['failed_songs'])

# ==============================================================
# Library Parser
# ==============================================================
def parse_library_js(file_path):
    print(f"\n📖 Reading {file_path}...")

    if not os.path.exists(file_path):
        print(f"❌ Error: {file_path} not found!")
        return []

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        songs, current_artist, current_title, current_id = [], "Unknown", None, None
        for line in content.split('\n'):
            line = line.strip()

            if 'artist:' in line:
                if '"' in line:
                    current_artist = line.split('"')[1]
                elif "'" in line:
                    current_artist = line.split("'")[1]

            elif 'id:' in line:
                part = line.split(':', 1)[1].split('//')[0].strip().rstrip(',')
                current_id = part.strip('"').strip("'")

            elif 'title:' in line:
                if '"' in line:
                    current_title = line.split('"')[1]
                elif "'" in line:
                    current_title = line.split("'")[1]

                if current_title and current_id:
                    songs.append({'id': current_id, 'title': current_title, 'artist': current_artist})
                    current_title, current_id = None, None

        print(f"✅ Found {len(songs)} songs")
        if songs:
            for i, s in enumerate(songs[:3]):
                print(f"   {i+1}. {s['title']} - {s['artist']} (ID: {s['id']})")
            if len(songs) > 3:
                print(f"   ... and {len(songs)-3} more")
        return songs

    except Exception as e:
        print(f"❌ Error parsing: {e}")
        return []

# ==============================================================
# YouTube Search Helpers
# ==============================================================
def search_youtube(query, limit=5):
    ydl_opts = {'quiet': True, 'no_warnings': True, 'extract_flat': True}
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            search_query = f"ytsearch{limit}:{query}"
            result = ydl.extract_info(search_query, download=False)
            return result.get('entries', []) if result else []
    except Exception as e:
        print(f"   ⚠️ Search error: {e}")
        return []

def find_best_match(title, artist):
    base_query = f"{title} {artist}"
    for pattern_list in SEARCH_PATTERNS:
        for keyword in pattern_list:
            query = f"{base_query} {keyword}"
            print(f"   🔍 Searching: {query}")
            results = search_youtube(query, limit=3)
            for r in results or []:
                vid_title = r.get('title', '').lower()
                clean_title = title.lower().replace('(', '').replace(')', '')
                if clean_title in vid_title or any(w in vid_title for w in clean_title.split() if len(w) > 3):
                    url = f"https://www.youtube.com/watch?v={r.get('id')}"
                    print(f"   ✅ Found: {r.get('title')}")
                    return url
    print(f"   ⚠️ Using basic search fallback")
    results = search_youtube(base_query)
    if results:
        url = f"https://www.youtube.com/watch?v={results[0].get('id')}"
        print(f"   ✅ Using fallback: {results[0].get('title')}")
        return url
    return None

# ==============================================================
# Robust Download Logic
# ==============================================================
def download_audio(video_url, song_id, output_folder):
    base_name = str(song_id)
    expected_path = os.path.join(output_folder, f"{base_name}.{AUDIO_FORMAT}")

    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': os.path.join(output_folder, base_name),
        'quiet': False,
        'no_warnings': False,
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': AUDIO_FORMAT,
            'preferredquality': '192',
        }],
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            print(f"   ⬇️ Downloading...")
            info = ydl.extract_info(video_url, download=True)
            actual = ydl.prepare_filename(info)

        # Search folder for files related to this ID
        found_files = [f for f in os.listdir(output_folder) if f.startswith(base_name)]
        for f in found_files:
            full = os.path.join(output_folder, f)
            if not f.endswith(f".{AUDIO_FORMAT}"):
                new_name = f"{base_name}.{AUDIO_FORMAT}"
                new_path = os.path.join(output_folder, new_name)
                os.rename(full, new_path)
                print(f"   🔄 Renamed {f} → {new_name}")

        # Final verification
        if os.path.exists(expected_path):
            print(f"   ✅ Verified: {expected_path}")
            return True
        else:
            print(f"   ⚠️ No .mp3 found even though yt-dlp ran")
            return False

    except Exception as e:
        print(f"   ❌ Download error: {e}")
        return False

# ==============================================================
# Helpers
# ==============================================================
def filter_unprocessed_songs(songs, tracker):
    return [s for s in songs if not tracker.is_song_completed(s['id'])]

def check_existing_files(songs, folder):
    existing = sum(os.path.exists(os.path.join(folder, f"{s['id']}.{AUDIO_FORMAT}")) for s in songs)
    if existing:
        print(f"📁 Found {existing} existing MP3s")
    return existing

# ==============================================================
# Main Entry Point
# ==============================================================
def main():
    print("="*60)
    print("🎵 YouTube Audio Downloader - FIXED & ENHANCED")
    print("="*60)

    if not os.path.exists(OUTPUT_FOLDER):
        os.makedirs(OUTPUT_FOLDER)
        print(f"📂 Created: {OUTPUT_FOLDER}")

    tracker = DownloadProgress(PROGRESS_FILE)
    print(f"📊 Progress: {tracker.get_completed_count()} done, {tracker.get_failed_count()} failed")

    songs = parse_library_js(LIBRARY_FILE)
    if not songs:
        print("❌ No songs found.")
        return

    check_existing_files(songs, OUTPUT_FOLDER)
    pending = filter_unprocessed_songs(songs, tracker)

    if not pending:
        print("🎉 All songs already downloaded!")
        return

    print(f"\n🚀 {len(pending)} songs to process")

    try:
        choice = input("(A)ll, (F)irst 10, (C)ustom count [A/F/C]: ").strip().upper()
        if choice == 'F':
            pending = pending[:10]
        elif choice == 'C':
            count = int(input("How many? "))
            pending = pending[:count]
    except:
        print("⚠️ Defaulting to first 10")
        pending = pending[:10]

    success, fail = 0, 0
    for i, song in enumerate(pending, 1):
        print(f"\n[{i}/{len(pending)}] {song['title']} - {song['artist']} ({song['id']})")
        mp3_path = os.path.join(OUTPUT_FOLDER, f"{song['id']}.{AUDIO_FORMAT}")

        if os.path.exists(mp3_path):
            print(f"   ✅ Already exists: {mp3_path}")
            tracker.mark_song_completed(song['id'])
            success += 1
            continue

        url = find_best_match(song['title'], song['artist'])
        if not url:
            tracker.mark_song_failed(song['id'], "No video found")
            fail += 1
            continue

        if download_audio(url, song['id'], OUTPUT_FOLDER):
            if os.path.exists(mp3_path):
                tracker.mark_song_completed(song['id'])
                success += 1
            else:
                tracker.mark_song_failed(song['id'], ".mp3 missing")
                fail += 1
        else:
            tracker.mark_song_failed(song['id'], "Download failed")
            fail += 1

    tracker.save_progress()

    print("\n="*60)
    print("📊 SUMMARY")
    print(f"✅ Successful: {success}")
    print(f"❌ Failed: {fail}")
    print(f"📈 Completed total: {tracker.get_completed_count()}")
    print(f"📉 Failed total: {tracker.get_failed_count()}")
    print(f"📂 Output: {OUTPUT_FOLDER}")
    print(f"💾 Progress file: {PROGRESS_FILE}")
    print("="*60)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n⏸️ Interrupted, saving progress...")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Fatal Error: {e}")
        import traceback; traceback.print_exc()
        sys.exit(1)
