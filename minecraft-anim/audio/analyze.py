#!/usr/bin/env python3
""""Listen" to a song: tempo, beats, energy, where the voice is, song sections, and
approximate timings for each lyric line.

Usage:
    python3 audio/analyze.py audio/song.m4a --lyrics audio/lyrics.txt --out out/audio

Writes:
    timeline.json   everything below, in seconds
    analysis.png    spectrogram + energy + vocal activity + beats + sections + lyric lines
    lyrics.srt      lyric lines with the estimated timings (open next to the song in a player to check)

Lyric timings are estimated from the separated vocal track (no speech recognition), so they are
approximate: they are snapped to where the voice starts after a pause and spread by syllable count.
"""
import argparse
import json
import os
import re
import subprocess

import librosa
import matplotlib
import numpy as np

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402

SR = 22050
HOP = 512
VOWELS = re.compile(r"[аеёиоуыэюяaeiouy]", re.I)


def frames_to_time(n):
    return librosa.frames_to_time(n, sr=SR, hop_length=HOP)


def load_audio(path):
    """Decode any format ffmpeg understands (m4a, mp3, mp4 ...) to mono float32 at SR."""
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()


def separate_vocals(y):
    """REPET-SIM style foreground/background split (librosa's vocal separation recipe)."""
    S_full, phase = librosa.magphase(librosa.stft(y, hop_length=HOP))
    S_filter = librosa.decompose.nn_filter(S_full, aggregate=np.median, metric="cosine",
                                           width=int(librosa.time_to_frames(2, sr=SR, hop_length=HOP)))
    S_filter = np.minimum(S_full, S_filter)
    mask_v = librosa.util.softmask(S_full - S_filter, 10 * S_filter, power=2)
    return mask_v * S_full


def vocal_activity(S_vocal):
    freqs = librosa.fft_frequencies(sr=SR)
    band = (freqs > 250) & (freqs < 4000)
    e = np.sqrt((S_vocal[band] ** 2).mean(axis=0))
    e = librosa.amplitude_to_db(e, ref=np.max)
    e = np.convolve(e, np.ones(5) / 5, mode="same")
    thr = np.percentile(e, 35)
    return e, e > thr


def segments(active, min_gap=0.18, min_len=0.25):
    t = frames_to_time(np.arange(len(active)))
    segs, start = [], None
    for i, a in enumerate(active):
        if a and start is None:
            start = t[i]
        elif not a and start is not None:
            segs.append([start, t[i]])
            start = None
    if start is not None:
        segs.append([start, t[-1]])
    merged = []
    for s in segs:
        if merged and s[0] - merged[-1][1] < min_gap:
            merged[-1][1] = s[1]
        else:
            merged.append(s)
    return [s for s in merged if s[1] - s[0] >= min_len]


def sections(y, beats, n_sections=7):
    """Split the song into sections and label the ones that repeat (A, B, ...).

    Works on beat-synchronous chroma+MFCC with a few beats of context, so a repeated chorus shows up
    as a block of high self-similarity in the recurrence matrix."""
    chroma = librosa.feature.chroma_cqt(y=y, sr=SR, hop_length=HOP)
    mfcc = librosa.feature.mfcc(y=y, sr=SR, hop_length=HOP, n_mfcc=20)
    feat = np.vstack([chroma, librosa.util.normalize(mfcc, axis=1) * 0.5])
    fs = librosa.util.sync(feat, beats, aggregate=np.median)
    fs = librosa.feature.stack_memory(fs, n_steps=4, mode="edge")
    R = librosa.segment.recurrence_matrix(fs, mode="affinity", width=4, sym=True, k=max(2, fs.shape[1] // 6))
    bounds = librosa.segment.agglomerative(fs, n_sections)  # indices into beat intervals
    edges = list(bounds) + [fs.shape[1]]
    beat_t = frames_to_time(np.concatenate([[0], beats, [len(y) // HOP]]))
    spans = [(a, b) for a, b in zip(edges[:-1], edges[1:]) if b > a]
    # Similarity of two sections = mean recurrence along their best-matching diagonal band.
    sim = np.zeros((len(spans), len(spans)))
    for i, (a, b) in enumerate(spans):
        for j, (c, d) in enumerate(spans):
            if i != j:
                sim[i, j] = R[a:b, c:d].sum() / min(b - a, d - c)
    thr = 0.35 * sim.max() if sim.max() > 0 else 1
    labels = [None] * len(spans)
    nxt = 0
    for i in range(len(spans)):
        if labels[i] is None:
            labels[i] = chr(65 + nxt)
            nxt += 1
        for j in range(i + 1, len(spans)):
            if labels[j] is None and sim[i, j] > thr:
                labels[j] = labels[i]
    return [{"start": round(float(beat_t[a]), 2), "end": round(float(beat_t[b]), 2), "label": l}
            for (a, b), l in zip(spans, labels)]


def align_lyrics(lines, vocal_db, active, vocal_onsets_t):
    """Place each line on the vocal track: DP over candidate start points, cost = mismatch between
    the line's syllable count and the voiced time it gets, minus a bonus for starting after a pause."""
    t = frames_to_time(np.arange(len(active)))
    dt = t[1] - t[0]
    voiced_cum = np.concatenate([[0], np.cumsum(active) * dt])

    def voiced(a, b):
        ia, ib = np.searchsorted(t, [a, b])
        return voiced_cum[ib] - voiced_cum[ia]

    segs = segments(active)
    cands = sorted(set([round(s[0], 2) for s in segs] + [round(x, 2) for x in vocal_onsets_t]))
    seg_starts = np.array([s[0] for s in segs])
    gap_before = {}
    for c in cands:
        k = np.searchsorted(seg_starts, c + 1e-3) - 1
        is_seg_start = k >= 0 and abs(seg_starts[k] - c) < 0.03
        prev_end = segs[k - 1][1] if is_seg_start and k > 0 else c
        gap_before[c] = (c - prev_end) if is_seg_start else 0.0
    end_t = segs[-1][1] if segs else t[-1]
    cands.append(end_t)

    syl = [max(1, len(VOWELS.findall(l))) for l in lines]
    total_voiced = voiced(cands[0], end_t)
    rate = total_voiced / sum(syl)  # seconds of voice per syllable

    n, K = len(lines), len(cands)
    INF = 1e18
    cost = np.full((n + 1, K), INF)
    back = np.zeros((n + 1, K), dtype=int)
    cost[0, :] = [0.0 if j == 0 else 2.0 + 0.02 * (cands[j] - cands[0]) for j in range(K)]  # may skip an intro
    for i in range(n):
        want = syl[i] * rate
        for j in range(K - 1):
            if cost[i, j] >= INF:
                continue
            for k in range(j + 1, K):
                dur = cands[k] - cands[j]
                if dur > want * 4 + 6:
                    break
                v = voiced(cands[j], cands[k])
                c = ((v - want) / (want + 0.3)) ** 2 - min(gap_before.get(cands[j], 0.0), 1.0) * 0.8
                c += max(0.0, dur - v - 2.5) * 0.3  # long silence inside a line is unlikely
                if cost[i, j] + c < cost[i + 1, k]:
                    cost[i + 1, k] = cost[i, j] + c
                    back[i + 1, k] = j
    k = K - 1 if cost[n, K - 1] < INF else int(np.argmin(cost[n]))
    spans = []
    for i in range(n, 0, -1):
        j = back[i, k]
        spans.append((cands[j], cands[k]))
        k = j
    spans.reverse()
    out = []
    for line, (a, b) in zip(lines, spans):
        # Trim the line's end to the last voiced moment before the next line starts.
        ia, ib = np.searchsorted(t, [a, b])
        vi = np.nonzero(active[ia:ib])[0]
        end = t[ia + vi[-1]] + dt if len(vi) else b
        out.append({"start": round(float(a), 2), "end": round(float(end), 2), "text": line})
    return out, rate


def srt_time(s):
    h, rem = divmod(s, 3600)
    m, sec = divmod(rem, 60)
    return f"{int(h):02}:{int(m):02}:{int(sec):02},{int(round((sec % 1) * 1000)):03}"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("audio")
    ap.add_argument("--lyrics")
    ap.add_argument("--out", default="out/audio")
    args = ap.parse_args()
    os.makedirs(args.out, exist_ok=True)

    y = load_audio(args.audio)
    dur = len(y) / SR
    print(f"duration {dur:.1f}s")

    onset_env = librosa.onset.onset_strength(y=y, sr=SR, hop_length=HOP)
    tempo, beats = librosa.beat.beat_track(onset_envelope=onset_env, sr=SR, hop_length=HOP)
    tempo = float(np.atleast_1d(tempo)[0])
    beats_t = frames_to_time(beats)
    # Downbeats: the phase (of 4) whose beats carry the most low-end energy.
    S = np.abs(librosa.stft(y, hop_length=HOP))
    low = S[:20].sum(axis=0)
    phase = int(np.argmax([low[beats[p::4]].mean() for p in range(4)])) if len(beats) >= 8 else 0
    downbeats_t = beats_t[phase::4]
    onsets_t = frames_to_time(librosa.onset.onset_detect(onset_envelope=onset_env, sr=SR, hop_length=HOP))
    rms = librosa.feature.rms(y=y, hop_length=HOP)[0]
    rms_db = librosa.amplitude_to_db(rms, ref=np.max)
    print(f"tempo {tempo:.1f} BPM, {len(beats_t)} beats")

    S_vocal = separate_vocals(y)
    vocal_db, active = vocal_activity(S_vocal)
    v_onsets = librosa.onset.onset_detect(onset_envelope=librosa.onset.onset_strength(S=librosa.amplitude_to_db(S_vocal), sr=SR),
                                          sr=SR, hop_length=HOP, backtrack=True)
    v_onsets_t = frames_to_time(v_onsets)
    phrases = segments(active)
    secs = sections(y, beats)
    print(f"{len(phrases)} vocal phrases, sections: {' '.join(s['label'] for s in secs)}")

    lyric_lines = []
    if args.lyrics:
        raw = [l.strip() for l in open(args.lyrics, encoding="utf-8")]
        lines = [l for l in raw if l and not l.lower().startswith(("моя голова винтом — ", "@"))]
        lyric_lines, rate = align_lyrics(lines, vocal_db, active, v_onsets_t)
        print(f"aligned {len(lyric_lines)} lyric lines ({rate:.2f}s of voice per syllable)")
        with open(os.path.join(args.out, "lyrics.srt"), "w", encoding="utf-8") as f:
            for i, l in enumerate(lyric_lines, 1):
                f.write(f"{i}\n{srt_time(l['start'])} --> {srt_time(l['end'])}\n{l['text']}\n\n")

    step = int(round(0.1 * SR / HOP))
    timeline = {
        "duration": round(dur, 3),
        "tempo_bpm": round(tempo, 2),
        "beats": [round(float(x), 3) for x in beats_t],
        "downbeats": [round(float(x), 3) for x in downbeats_t],
        "onsets": [round(float(x), 3) for x in onsets_t],
        "energy_db_10hz": [round(float(x), 1) for x in rms_db[::step]],
        "vocal_phrases": [[round(a, 2), round(b, 2)] for a, b in phrases],
        "sections": secs,
        "lyrics": lyric_lines,
    }
    with open(os.path.join(args.out, "timeline.json"), "w", encoding="utf-8") as f:
        json.dump(timeline, f, ensure_ascii=False, indent=1)

    # One long strip per ~35 s so everything stays readable.
    chunk = 35.0
    rows = int(np.ceil(dur / chunk - 1e-3))
    fig, axes = plt.subplots(rows * 2, 1, figsize=(22, 4.2 * rows), gridspec_kw={"height_ratios": [2, 1] * rows})
    mel = librosa.power_to_db(librosa.feature.melspectrogram(y=y, sr=SR, hop_length=HOP, n_mels=96), ref=np.max)
    tt = frames_to_time(np.arange(len(rms_db)))
    colors = plt.cm.tab10.colors
    for r in range(rows):
        a0, a1 = r * chunk, min(dur, (r + 1) * chunk)
        ax, ax2 = axes[2 * r], axes[2 * r + 1]
        f0, f1 = librosa.time_to_frames([a0, a1], sr=SR, hop_length=HOP)
        ax.imshow(mel[:, f0:f1], origin="lower", aspect="auto", extent=[a0, a1, 0, 96], cmap="magma")
        for s in secs:
            if s["end"] > a0 and s["start"] < a1:
                ax.axvline(s["start"], color="cyan", lw=2)
                ax.text(max(s["start"], a0) + 0.1, 88, s["label"], color="cyan", fontsize=14, weight="bold")
        for i, l in enumerate(lyric_lines):
            if l["end"] > a0 and l["start"] < a1:
                ax.axvspan(l["start"], l["end"], ymin=0.02, ymax=0.12, color=colors[i % 10], alpha=0.8)
                ax.text(max(l["start"], a0), 13 + (i % 3) * 9, l["text"][:38], color="white", fontsize=8,
                        bbox=dict(facecolor="black", alpha=0.5, pad=1, lw=0))
        ax.set_xlim(a0, a0 + chunk)
        ax.set_yticks([])
        m = (tt >= a0) & (tt <= a1)
        ax2.plot(tt[m], rms_db[m], color="gray", lw=1, label="loudness dB")
        vt = frames_to_time(np.arange(len(vocal_db)))
        mv = (vt >= a0) & (vt <= a1)
        ax2.plot(vt[mv], vocal_db[mv], color="tab:orange", lw=1, label="voice dB")
        for p in phrases:
            if p[1] > a0 and p[0] < a1:
                ax2.axvspan(p[0], p[1], color="tab:orange", alpha=0.15)
        for b in beats_t[(beats_t >= a0) & (beats_t <= a1)]:
            ax2.axvline(b, color="tab:blue", lw=0.4, alpha=0.5)
        for b in downbeats_t[(downbeats_t >= a0) & (downbeats_t <= a1)]:
            ax2.axvline(b, color="tab:blue", lw=1.2)
        ax2.set_xlim(a0, a0 + chunk)
        ax2.set_xticks(np.arange(np.ceil(a0), a0 + chunk + 0.01, 1), minor=True)
        ax2.set_xticks(np.arange(np.ceil(a0 / 5) * 5, a0 + chunk + 0.01, 5))
        if r == 0:
            ax2.legend(loc="upper right", fontsize=8)
    fig.suptitle(f"{os.path.basename(args.audio)}  |  {tempo:.1f} BPM  |  {dur:.1f}s", fontsize=14)
    fig.tight_layout()
    fig.savefig(os.path.join(args.out, "analysis.png"), dpi=70)
    print("wrote", args.out)


if __name__ == "__main__":
    main()
