import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  Volume2,
  VolumeX,
  X,
  Clock,
  BellRing,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  formatSeconds,
  playKitchenChime,
  triggerKitchenVibration,
  sendTimerNotification,
} from "@/lib/cooking-timer";

export interface CookingTimerWidgetProps {
  initialSeconds?: number;
  label?: string;
  onClose?: () => void;
  className?: string;
}

export const CookingTimerWidget: React.FC<CookingTimerWidgetProps> = ({
  initialSeconds = 0,
  label = "Minuteur",
  onClose,
  className = "",
}) => {
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);
  const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isAlarming, setIsAlarming] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const alarmIntervalRef = useRef<any>(null);

  // Synchronize when a new duration is clicked from step text
  useEffect(() => {
    if (initialSeconds > 0) {
      setTotalSeconds(initialSeconds);
      setRemainingSeconds(initialSeconds);
      setIsRunning(true);
      setIsAlarming(false);
    }
  }, [initialSeconds, label]);

  // Main countdown loop
  useEffect(() => {
    let interval: any = null;

    if (isRunning && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsAlarming(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, remainingSeconds]);

  // Alarming sound + vibration loop
  useEffect(() => {
    if (isAlarming) {
      // First chime + vibration
      if (!isMuted) playKitchenChime();
      triggerKitchenVibration();
      sendTimerNotification("Minuteur de cuisine terminé !", `${label || "Votre étape"} est prête 🍳`);

      // Repeat chime every 2.5s
      alarmIntervalRef.current = setInterval(() => {
        if (!isMuted) playKitchenChime();
        triggerKitchenVibration();
      }, 2500);
    } else {
      if (alarmIntervalRef.current) {
        clearInterval(alarmIntervalRef.current);
        alarmIntervalRef.current = null;
      }
    }

    return () => {
      if (alarmIntervalRef.current) {
        clearInterval(alarmIntervalRef.current);
      }
    };
  }, [isAlarming, isMuted, label]);

  const togglePlay = () => {
    if (isAlarming) {
      stopAlarm();
      return;
    }
    if (remainingSeconds === 0 && totalSeconds > 0) {
      setRemainingSeconds(totalSeconds);
    }
    setIsRunning(!isRunning);
  };

  const addMinutes = (mins: number) => {
    const addSecs = mins * 60;
    setRemainingSeconds((prev) => prev + addSecs);
    setTotalSeconds((prev) => Math.max(prev, remainingSeconds + addSecs));
    if (isAlarming) {
      setIsAlarming(false);
    }
    setIsRunning(true);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsAlarming(false);
    setRemainingSeconds(totalSeconds);
  };

  const stopAlarm = () => {
    setIsAlarming(false);
  };

  const progressPercentage =
    totalSeconds > 0 ? Math.max(0, Math.min(100, ((totalSeconds - remainingSeconds) / totalSeconds) * 100)) : 0;

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 ${
        isAlarming
          ? "bg-destructive/15 border-destructive animate-pulse shadow-lg"
          : "bg-card/95 backdrop-blur-md border-border/80 shadow-md"
      } p-3.5 ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
              isAlarming
                ? "bg-destructive text-destructive-foreground animate-bounce"
                : isRunning
                ? "bg-accent text-accent-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {isAlarming ? <BellRing className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
          </div>
          <span className="font-semibold text-xs text-foreground truncate">{label}</span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 text-muted-foreground hover:text-foreground"
            onClick={() => setIsMuted(!isMuted)}
            title={isMuted ? "Activer le son" : "Couper le son"}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </Button>

          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="w-7 h-7 text-muted-foreground hover:text-foreground"
              onClick={() => {
                stopAlarm();
                onClose();
              }}
              title="Fermer le minuteur"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Large countdown display */}
      <div className="flex items-baseline justify-between gap-3 my-1">
        <div className="font-mono text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          {formatSeconds(remainingSeconds)}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={() => addMinutes(1)}
            className="h-8 px-2 text-xs font-semibold bg-background/80 hover:bg-accent hover:text-accent-foreground"
          >
            <Plus className="w-3 h-3 mr-0.5" />
            1 min
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => addMinutes(5)}
            className="h-8 px-2 text-xs font-semibold bg-background/80 hover:bg-accent hover:text-accent-foreground"
          >
            <Plus className="w-3 h-3 mr-0.5" />
            5 min
          </Button>
        </div>
      </div>

      {/* Linear progress bar */}
      <div className="w-full bg-muted/60 h-1.5 rounded-full overflow-hidden my-2">
        <div
          className={`h-full transition-all duration-300 ${
            isAlarming ? "bg-destructive" : "bg-accent"
          }`}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        {isAlarming ? (
          <Button
            size="sm"
            onClick={stopAlarm}
            className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold text-xs h-9 shadow-xs"
          >
            <BellRing className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            Arrêter l'alarme
          </Button>
        ) : (
          <>
            <Button
              size="sm"
              variant={isRunning ? "secondary" : "default"}
              onClick={togglePlay}
              disabled={remainingSeconds === 0}
              className={`flex-1 font-semibold text-xs h-9 ${
                !isRunning && remainingSeconds > 0
                  ? "bg-accent text-accent-foreground hover:bg-accent/90 shadow-xs"
                  : ""
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-3.5 h-3.5 mr-1.5" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 mr-1.5" />
                  Démarrer
                </>
              )}
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={resetTimer}
              className="h-9 px-3 text-xs bg-background/80 hover:bg-muted"
              title="Réinitialiser"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
