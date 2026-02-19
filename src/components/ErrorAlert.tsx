import { AlertCircle, X } from "lucide-react";
import { useState } from "react";

interface ErrorAlertProps {
  message: string;
}

export function ErrorAlert({ message }: ErrorAlertProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 flex items-start gap-3">
      <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-destructive">Error</p>
        <p className="text-sm text-destructive/80 mt-0.5 break-words">{message}</p>
      </div>
      <button onClick={() => setDismissed(true)} className="text-destructive/50 hover:text-destructive shrink-0">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
