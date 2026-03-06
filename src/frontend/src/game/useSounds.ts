import { useCallback, useEffect, useRef } from "react";
import { useGameStore } from "./useGameStore";

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

function resumeContext() {
  const ctx = getAudioContext();
  if (ctx.state === "suspended") {
    void ctx.resume();
  }
  return ctx;
}

export function useSounds() {
  const isMuted = useGameStore((s) => s.isMuted);
  const gameState = useGameStore((s) => s.gameState);
  const isMutedRef = useRef(isMuted);
  const musicNodesRef = useRef<{
    gainNode: GainNode;
    oscillators: OscillatorNode[];
    intervalId: ReturnType<typeof setInterval> | null;
  } | null>(null);
  const musicStoppedRef = useRef(false);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  const stopMusic = useCallback(() => {
    if (musicNodesRef.current) {
      const { gainNode, oscillators, intervalId } = musicNodesRef.current;
      if (intervalId) clearInterval(intervalId);
      gainNode.gain.setTargetAtTime(0, getAudioContext().currentTime, 0.1);
      setTimeout(() => {
        for (const o of oscillators) {
          try {
            o.stop();
            o.disconnect();
          } catch (_) {}
        }
        gainNode.disconnect();
      }, 300);
      musicNodesRef.current = null;
    }
  }, []);

  const startMusic = useCallback(() => {
    if (musicNodesRef.current) return;
    if (isMutedRef.current) return;

    const ctx = resumeContext();
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.08, ctx.currentTime);
    masterGain.connect(ctx.destination);

    // C4, E4, G4, A4 in Hz
    const notes = [261.63, 329.63, 392.0, 440.0];
    const bpm = 120;
    const beatDuration = 60 / bpm;
    let noteIndex = 0;
    const oscillators: OscillatorNode[] = [];
    musicStoppedRef.current = false;

    const playNote = () => {
      if (musicStoppedRef.current || isMutedRef.current) return;
      const ctxNow = resumeContext();
      const osc = ctxNow.createOscillator();
      const envGain = ctxNow.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(
        notes[noteIndex % notes.length],
        ctxNow.currentTime,
      );

      envGain.gain.setValueAtTime(0, ctxNow.currentTime);
      envGain.gain.linearRampToValueAtTime(0.6, ctxNow.currentTime + 0.02);
      envGain.gain.exponentialRampToValueAtTime(
        0.001,
        ctxNow.currentTime + beatDuration * 0.8,
      );

      osc.connect(envGain);
      envGain.connect(masterGain);
      osc.start(ctxNow.currentTime);
      osc.stop(ctxNow.currentTime + beatDuration);
      oscillators.push(osc);
      noteIndex++;
    };

    playNote();
    const intervalId = setInterval(playNote, beatDuration * 1000);

    musicNodesRef.current = { gainNode: masterGain, oscillators, intervalId };
  }, []);

  const playTapSound = useCallback(() => {
    if (isMutedRef.current) return;
    const ctx = resumeContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  }, []);

  const playCorrectSound = useCallback(() => {
    if (isMutedRef.current) return;
    const ctx = resumeContext();

    const playTone = (freq: number, startTime: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.08);
    };

    playTone(660, ctx.currentTime);
    playTone(880, ctx.currentTime + 0.07);
  }, []);

  const playErrorSound = useCallback(() => {
    if (isMutedRef.current) return;
    const ctx = resumeContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  }, []);

  const vibrate = useCallback((pattern: number | number[]) => {
    if ("vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  // Handle game state changes for music
  useEffect(() => {
    if (gameState === "playing" && !isMuted) {
      startMusic();
    } else {
      musicStoppedRef.current = true;
      stopMusic();
    }
  }, [gameState, isMuted, startMusic, stopMusic]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      musicStoppedRef.current = true;
      stopMusic();
    };
  }, [stopMusic]);

  return {
    playTapSound,
    playCorrectSound,
    playErrorSound,
    vibrate,
    startMusic,
    stopMusic,
  };
}
