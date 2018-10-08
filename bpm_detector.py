import math
import time
import sys
import array
import argparse
import librosa

def get_audio_from_file(filename = None):
    if filename is None:
        print("Audio file not entered")
    #print("Opening file:" + filename)
    try:
        y, sr = librosa.load(filename, sr=22050)
        window_size = 512

        tempo, beats = librosa.beat.beat_track(y=y, sr=sr, hop_length=window_size)
        tempo_float = float(tempo)
        print(round(tempo_float,2))

    except (OSError):
        print("Could not open file")
        return
    return

if len(sys.argv) < 2:
    print("Command line parameter not provided")
else:
    get_audio_from_file(sys.argv[1])
