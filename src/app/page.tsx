"use client";

import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  ReloadIcon,
  ClipboardCopyIcon,
  CheckIcon,
} from "@radix-ui/react-icons";

function CopyTextButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-4 flex gap-2 items-center">
      <Button variant="outline" onClick={handleCopy}>
        {copied ? (
          <>
            <CheckIcon className="mr-1 h-4 w-4" /> Copied!
          </>
        ) : (
          <>
            <ClipboardCopyIcon className="mr-1 h-4 w-4" /> Copy Text
          </>
        )}
      </Button>
    </div>
  );
}

export default function Home() {
  const [resumeText, setResumeText] = useState("");
  const [rewrittenText, setRewrittenText] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [personality, setPersonality] = useState({
    introverted: 0.5,
    cautious: 0.5,
    practical: 0.5,
    analytical: 0.5,
  });

  const [tone, setTone] = useState({
    expressiveness: 0.5,
    language: 0.5,
    structure: 0.5,
    professionalism: 0.5,
  });

  const personalityLabels = {
    introverted: ["Introverted", "Extroverted"],
    cautious: ["Cautious", "Bold"],
    practical: ["Practical", "Imaginative"],
    analytical: ["Analytical", "Empathetic"],
  };

  const toneLabels = {
    expressiveness: ["Reserved", "Expressive"],
    language: ["Precise", "Conversational"],
    structure: ["Structured", "Spontaneous"],
    professionalism: ["Professional", "Playful"],
  };

  function handleSliderChange<T extends Record<string, number>>(
    setter: React.Dispatch<React.SetStateAction<T>>,
    key: keyof T,
    value: number,
  ) {
    setter((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  const rewriteResume = async (textOverride?: string) => {
    const textToUse = textOverride || resumeText;

    setLoading(true);
    setRewrittenText("");

    const response = await fetch("/api/rewrite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        resume: textToUse,
        personality,
        tone,
      }),
    });

    const data = await response.json();
    setRewrittenText(data.result);
    setLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload-resume", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (data?.text) {
      setResumeText(data.text);
      await rewriteResume(data.text); // auto-trigger rewrite
    }

    setUploading(false);
  };

  // 👇 Load from share link
  useEffect(() => {
    const url = new URL(window.location.href);
    const sharedRewrite = url.searchParams.get("rewrite");
    if (sharedRewrite) {
      setRewrittenText(decodeURIComponent(sharedRewrite));
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">📄 Resume Rewriter: Narrative Mode</h1>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div>
            <Label htmlFor="upload">Upload Resume (PDF)</Label>
            <Input
              type="file"
              id="upload"
              accept="application/pdf"
              onChange={handleFileUpload}
            />
            {uploading && (
              <p className="text-sm text-muted-foreground mt-2">
                Extracting text from PDF...
              </p>
            )}
          </div>

          <div>
            <Label>Resume Text</Label>
            <Textarea
              id="resume"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Resume text..."
              className="max-h-48 overflow-auto resize-none"
            />
          </div>

          <div className="space-y-4">
            <Label className="text-lg">Your Personality</Label>
            {{(Object.keys(personalityLabels) as Array<keyof typeof personality>).map((key) => (
              <div key={key}>
                <Label className="flex justify-between">
                  <span>{left}</span>
                  <span>{right}</span>
                </Label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={personality[key as keyof typeof personality]}
                  onChange={(e) =>
                    handleSliderChange(
                      setPersonality,
                      key,
                      Number(e.target.value),
                    )
                  }
                  className="w-full"
                />
              </div>
            ))}
          </div>

          <div className="space-y-4 pt-4">
            <Label className="text-lg">Narrative Tone</Label>
            {Object.entries(toneLabels).map(([key, [left, right]]) => (
              <div key={key}>
                <Label className="flex justify-between">
                  <span>{left}</span>
                  <span>{right}</span>
                </Label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={tone[key as keyof typeof tone]}
                  onChange={(e) =>
                    handleSliderChange(setTone, key, Number(e.target.value))
                  }
                  className="w-full"
                />
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={() => rewriteResume()}
              disabled={loading || !resumeText}
            >
              {loading ? (
                <>
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />{" "}
                  Rewriting...
                </>
              ) : rewrittenText ? (
                "Regenerate"
              ) : (
                "Rewrite It"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {rewrittenText && (
        <Card>
          <CardContent className="pt-6 space-y-2">
            <Label>Rewritten Narrative</Label>
            <Textarea
              value={rewrittenText}
              rows={12}
              readOnly
              className="resize-none"
            />
            <CopyTextButton text={rewrittenText} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
