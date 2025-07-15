"use client";
import React, { useState, useEffect } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { useRouter } from "next/navigation";
import { useOrganization } from "@clerk/nextjs";

const VoiceAssistant = () => {
  const router = useRouter();
  const { organization } = useOrganization();
  const orgId = organization?.id;
  const [enabled, setEnabled] = useState(false);
  const [error, setError] = useState("");

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) return;
    if (enabled) {
      SpeechRecognition.startListening({ continuous: true });
    } else {
      SpeechRecognition.stopListening();
      resetTranscript();
      setError("");
    }
    // Cleanup on unmount
    return () => {
      SpeechRecognition.stopListening();
    };
  }, [enabled, browserSupportsSpeechRecognition, resetTranscript]);

  useEffect(() => {
    if (!transcript) return;
    const lowerTranscript = transcript.toLowerCase();
    // Commands for organization page (projects/tasks)
    if (
      [
        "show my tasks",
        "go to my tasks",
        "my tasks",
        "show my issues",
        "go to my issues",
        "show my projects",
        "go to my projects",
        "my projects"
      ].some((phrase) => lowerTranscript.includes(phrase))
    ) {
      if (orgId) {
        router.push(`/organization/${orgId}`);
        setError("");
      } else {
        setError("No organization found. Please join or select an organization.");
      }
      resetTranscript();
      return;
    }
    if (["go to dashboard", "open dashboard"].some((phrase) => lowerTranscript.includes(phrase))) {
      router.push("/dashboard");
      resetTranscript();
      return;
    }
    if (["go to organization", "open organization"].some((phrase) => lowerTranscript.includes(phrase))) {
      if (orgId) {
        router.push(`/organization/${orgId}`);
        setError("");
      } else {
        setError("No organization found. Please join or select an organization.");
      }
      resetTranscript();
      return;
    }
    if (["go to home", "go home", "open home", "home"].some((phrase) => lowerTranscript.includes(phrase))) {
      router.push("/");
      resetTranscript();
      return;
    }
  }, [transcript, router, orgId, resetTranscript]);

  if (!browserSupportsSpeechRecognition) {
    return null;
  }

  return (
    <>
      {/* Floating mic button */}
      {!enabled && (
        <button
          className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg focus:outline-none"
          onClick={() => setEnabled(true)}
          aria-label="Enable Voice Assistant"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18v3m0 0h3m-3 0H9m6-3a6 6 0 10-12 0 6 6 0 0012 0zm-6 0V6a2 2 0 114 0v6a2 2 0 11-4 0z" /></svg>
        </button>
      )}
      {/* Voice Assistant UI */}
      {enabled && (
        <div className="fixed bottom-6 right-6 z-50 bg-white/90 shadow-lg rounded-xl p-4 flex flex-col items-start gap-2 border border-gray-200 w-72">
          <div className="flex items-center gap-2">
            <span className={`h-3 w-3 rounded-full ${listening ? "bg-green-500" : "bg-red-400"}`}></span>
            <span className="font-semibold text-gray-700">
              Voice Assistant {listening ? "(Listening...)" : "(Off)"}
            </span>
          </div>
          <div className="text-sm text-gray-600 break-words min-h-[2rem]">
            {transcript || <span className="italic text-gray-400">Say a command...</span>}
          </div>
          {error && <div className="text-xs text-red-500">{error}</div>}
          <div className="flex gap-2 mt-2">
            <button
              className="px-3 py-1 rounded bg-blue-500 text-white text-xs hover:bg-blue-600 transition"
              onClick={() => {
                if (listening) {
                  SpeechRecognition.stopListening();
                } else {
                  SpeechRecognition.startListening({ continuous: true });
                }
              }}
            >
              {listening ? "Stop Listening" : "Start Listening"}
            </button>
            <button
              className="px-3 py-1 rounded bg-gray-300 text-gray-700 text-xs hover:bg-gray-400 transition"
              onClick={() => setEnabled(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default VoiceAssistant; 