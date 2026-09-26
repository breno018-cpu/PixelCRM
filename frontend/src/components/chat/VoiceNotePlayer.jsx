// frontend/src/components/chat/VoiceNotePlayer.jsx
// Reprodutor Real de Mensagens de Voz e Áudios (PROMPT 04 - ETAPA 08)
// Design e Ergonomia de Controles do WhatsApp Web (Sem waveforms falsas)

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Mic, AlertCircle } from 'lucide-react';

export default function VoiceNotePlayer({ 
  mediaUrl, 
  backendUrl = '', 
  isMe = false 
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [hasError, setHasError] = useState(false);
  const audioRef = useRef(null);

  const fullUrl = mediaUrl
    ? (mediaUrl.startsWith('http') ? mediaUrl : `${backendUrl}${mediaUrl}`)
    : null;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setHasError(false);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const handleError = () => {
      setHasError(true);
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [fullUrl]);

  const togglePlay = () => {
    if (!audioRef.current || hasError) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        setHasError(true);
      });
    }
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const togglePlaybackRate = () => {
    const rates = [1, 1.5, 2];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    const nextRate = rates[nextIdx];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const formatAudioTime = (sec) => {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!fullUrl || hasError) {
    return (
      <div className="flex items-center gap-2 py-1 px-2 text-xs text-rose-500 bg-rose-50/50 rounded-lg">
        <AlertCircle size={15} />
        <span>Áudio indisponível</span>
      </div>
    );
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-2.5 py-1 min-w-[220px] sm:min-w-[260px] select-none">
      <audio ref={audioRef} src={fullUrl} preload="metadata" />

      {/* Ícone de Avatar com Microfone */}
      <div className="relative shrink-0">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
          isMe ? 'bg-[#00a884]/20 text-[#00a884]' : 'bg-slate-200 text-slate-700'
        }`}>
          <Mic size={18} />
        </div>
        <button
          type="button"
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 rounded-full text-white transition-colors"
          title={isPlaying ? "Pausar áudio" : "Tocar áudio"}
        >
          {isPlaying ? <Pause size={16} fill="white" /> : <Play size={16} fill="white" className="ml-0.5" />}
        </button>
      </div>

      {/* Barra de Progresso e Timer */}
      <div className="flex-1 flex flex-col justify-center gap-1">
        <input
          type="range"
          min="0"
          max={duration || 100}
          step="0.1"
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 bg-slate-300 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-[#00a884]"
        />
        <div className="flex items-center justify-between text-[10px] text-[var(--text-secondary)] font-medium">
          <span>{formatAudioTime(currentTime)}</span>
          <span>{formatAudioTime(duration)}</span>
        </div>
      </div>

      {/* Acelerador de Velocidade (1x / 1.5x / 2x) */}
      <button
        type="button"
        onClick={togglePlaybackRate}
        className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--sidebar-bg)] hover:bg-[var(--active-bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-light)] transition-all shrink-0"
        title="Velocidade de reprodução"
      >
        {playbackRate}x
      </button>
    </div>
  );
}
