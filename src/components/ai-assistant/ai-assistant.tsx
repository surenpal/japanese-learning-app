"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, Mic, MicOff, Send, Volume2, VolumeX, Languages, BookOpen, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_ACTIONS = [
  { label: "Translate", prompt: "Translate to Japanese: ", icon: Languages },
  { label: "Grammar", prompt: "Check my Japanese grammar: ", icon: CheckSquare },
  { label: "Explain", prompt: "Explain this word/kanji: ", icon: BookOpen },
];

const WELCOME_MESSAGE: Message = {
  role: "assistant",
  content:
    "こんにちは！I'm Sensei, your AI Japanese learning assistant! 🎌\n\nI can help you:\n• Translate any language → Japanese\n• Check your grammar\n• Explain 【kanji】 and vocabulary\n• Practice conversation\n\nWhat would you like to learn today?",
};

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Periodic bounce animation on the button
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isOpen) {
        setIsPulsing(true);
        setTimeout(() => setIsPulsing(false), 600);
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMsg: Message = { role: "user", content: text };
      const history = [...messages, userMsg];
      setMessages(history);
      setInput("");
      setIsLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: history.map((m) => ({ role: m.role, content: m.content })),
          }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        const assistantMsg: Message = { role: "assistant", content: data.text ?? "Sorry, something went wrong." };
        setMessages((prev) => [...prev, assistantMsg]);
        if (voiceEnabled) speakText(assistantMsg.content);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `Error: ${msg}` },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading, voiceEnabled]
  );

  const speakText = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/【|】/g, "").replace(/[*_]/g, "");
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = "ja-JP";
    utterance.rate = 0.85;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  };

  const toggleVoiceInput = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in your browser. Try Chrome.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (e: any) => {
      setInput(e.results[0][0].transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const formatMessage = (text: string) => {
    const parts = text.split(/(【[^】]+】)/g);
    return parts.map((part, i) => {
      if (part.startsWith("【") && part.endsWith("】")) {
        const word = part.slice(1, -1);
        return (
          <span
            key={i}
            className="bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 px-1 rounded cursor-pointer hover:bg-yellow-200 dark:hover:bg-yellow-800/60 transition-colors underline decoration-dotted"
            onClick={() => sendMessage(`Explain this word/kanji in detail: ${word}`)}
            title={`Click to learn about "${word}"`}
          >
            {word}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <>
      {/* Chat Panel */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 w-80 sm:w-96 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden z-50"
          style={{ height: "500px" }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-xl">
                🎌
              </div>
              <div>
                <p className="text-white font-semibold text-sm leading-tight">Sensei AI 先生</p>
                <p className="text-white/70 text-xs">Japanese Learning Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className={`w-8 h-8 hover:bg-white/10 ${
                  voiceEnabled ? "text-white" : "text-white/50"
                }`}
                onClick={() => {
                  setVoiceEnabled((v) => !v);
                  if (isSpeaking) stopSpeaking();
                }}
                title={voiceEnabled ? "Voice output on — click to mute" : "Enable voice output"}
              >
                {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 text-white/70 hover:text-white hover:bg-white/10"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex gap-1.5 px-3 py-2 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
            {QUICK_ACTIONS.map(({ label, prompt, icon: Icon }) => (
              <button
                key={label}
                onClick={() => setInput(prompt)}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:border-purple-300 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
              >
                <Icon className="w-3 h-3" />
                {label}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-xs mr-1.5 flex-shrink-0 mt-0.5">
                    <span>🎌</span>
                  </div>
                )}
                <div
                  className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap leading-relaxed ${
                    msg.role === "user"
                      ? "bg-purple-600 text-white rounded-tr-sm"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-sm"
                  }`}
                >
                  {msg.role === "assistant" ? formatMessage(msg.content) : msg.content}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-xs mr-1.5 flex-shrink-0">
                  <span>🎌</span>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm px-3 py-3">
                  <div className="flex gap-1 items-center">
                    <span
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 flex-shrink-0">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
                placeholder={isListening ? "Listening..." : "Ask in any language..."}
                disabled={isListening}
                className="flex-1 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent disabled:opacity-60"
              />
              <Button
                variant="ghost"
                size="icon"
                className={`w-9 h-9 flex-shrink-0 rounded-xl transition-colors ${
                  isListening
                    ? "text-red-500 bg-red-50 dark:bg-red-950 hover:bg-red-100"
                    : "text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950"
                }`}
                onClick={toggleVoiceInput}
                title={isListening ? "Stop recording" : "Voice input"}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
              <Button
                size="icon"
                className="w-9 h-9 flex-shrink-0 bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="mt-1.5 text-xs text-purple-500 hover:text-purple-700 w-full text-center"
              >
                ▶ Speaking... (click to stop)
              </button>
            )}
          </div>
        </div>
      )}

      {/* Floating character button */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 ${
          isOpen
            ? "bg-gray-600 hover:bg-gray-700 scale-95"
            : `bg-gradient-to-br from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 hover:scale-110 ${isPulsing ? "animate-bounce" : ""}`
        }`}
        title={isOpen ? "Close Sensei AI" : "Open Sensei AI 先生"}
        aria-label={isOpen ? "Close AI assistant" : "Open AI assistant"}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <span className="text-2xl select-none" role="img" aria-hidden>
            🎌
          </span>
        )}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-purple-400 animate-ping opacity-25 pointer-events-none" />
        )}
      </button>
    </>
  );
}
