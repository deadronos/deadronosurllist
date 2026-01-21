"use client";

import { CheckCircle2Icon, TriangleAlertIcon } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Feedback } from "@/types/ui";

type FeedbackAlertProps = {
  feedback: Feedback;
  className?: string;
};

export function FeedbackAlert({ feedback, className }: FeedbackAlertProps) {
  if (!feedback) return null;

  return (
    <Alert
      variant={feedback.type === "success" ? "default" : "destructive"}
      className={className}
    >
      {feedback.type === "success" ? (
        <CheckCircle2Icon className="size-4" />
      ) : (
        <TriangleAlertIcon className="size-4" />
      )}
      <AlertDescription>{feedback.message}</AlertDescription>
    </Alert>
  );
}
