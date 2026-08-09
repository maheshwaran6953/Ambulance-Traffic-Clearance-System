class AudioAlertService {
  private isMuted: boolean = false;

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public playSirenChime(): void {
    if (this.isMuted) return;

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;

      const audioCtx = new AudioContextClass();
      
      // Dual oscillator emergency siren sound
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sine';

      // Siren frequency sweep (800Hz -> 1200Hz -> 800Hz)
      const now = audioCtx.currentTime;
      osc1.frequency.setValueAtTime(750, now);
      osc1.frequency.exponentialRampToValueAtTime(1200, now + 0.3);
      osc1.frequency.exponentialRampToValueAtTime(750, now + 0.6);

      osc2.frequency.setValueAtTime(800, now);
      osc2.frequency.exponentialRampToValueAtTime(1300, now + 0.3);
      osc2.frequency.exponentialRampToValueAtTime(800, now + 0.6);

      gainNode.gain.setValueAtTime(0.2, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.65);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.65);
      osc2.stop(now + 0.65);
    } catch (e) {
      console.warn('Audio playback not allowed without user gesture:', e);
    }
  }
}

export const audioService = new AudioAlertService();
