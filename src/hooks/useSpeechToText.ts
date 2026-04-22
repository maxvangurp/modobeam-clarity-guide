import { useCallback, useEffect, useRef, useState } from "react";

interface SpeechRecognitionAlternative {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: SpeechRecognitionAlternative;
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionErrorEventLike {
  error: string;
}

interface BrowserSpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export function useSpeechToText({
  onFinalText,
}: {
  onFinalText: (text: string) => void;
}) {
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const onFinalTextRef = useRef(onFinalText);

  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onFinalTextRef.current = onFinalText;
  }, [onFinalText]);

  useEffect(() => {
    const RecognitionCtor =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;

    if (!RecognitionCtor) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);

    const recognition = new RecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setError(null);
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimText("");
    };

    recognition.onerror = (event) => {
      setIsListening(false);

      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setError("Microphone access is off. You can still type instead.");
        return;
      }

      if (event.error === "no-speech") {
        setError("I didn't catch anything that time.");
        return;
      }

      setError("Voice input paused. Try again when you're ready.");
    };

    recognition.onresult = (event) => {
      const finalParts: string[] = [];
      const interimParts: string[] = [];

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const text = result[0]?.transcript?.trim();
        if (!text) continue;

        if (result.isFinal) {
          finalParts.push(text);
        } else {
          interimParts.push(text);
        }
      }

      setInterimText(interimParts.join(" "));

      if (finalParts.length > 0) {
        onFinalTextRef.current(finalParts.join(" "));
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return;
    setError(null);
    recognitionRef.current.start();
  }, [isListening]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  return {
    error,
    interimText,
    isListening,
    isSupported,
    startListening,
    stopListening,
  };
}