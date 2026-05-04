import { ToolInvocation } from "ai";
import { Loader2 } from "lucide-react";

export function getToolLabel(toolName: string, args: Record<string, unknown>): string {
  const rawPath = typeof args.path === "string" ? args.path : "";
  const filename = rawPath.split(/[/\\]/).filter(Boolean).pop() ?? "";
  const file = filename || "file";

  if (toolName === "str_replace_editor") {
    switch (args.command) {
      case "create":    return `Creating ${file}`;
      case "str_replace":
      case "insert":    return `Editing ${file}`;
      case "view":      return `Reading ${file}`;
      case "undo_edit": return `Undoing edit to ${file}`;
      default:          return `Editing file`;
    }
  }

  if (toolName === "file_manager") {
    switch (args.command) {
      case "rename": return `Renaming ${file}`;
      case "delete": return `Deleting ${file}`;
      default:       return `Managing file`;
    }
  }

  return toolName;
}

interface ToolInvocationDisplayProps {
  toolInvocation: ToolInvocation;
}

export function ToolInvocationDisplay({ toolInvocation }: ToolInvocationDisplayProps) {
  const label = getToolLabel(toolInvocation.toolName, toolInvocation.args as Record<string, unknown>);
  const isCompleted = toolInvocation.state === "result" && toolInvocation.result;

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs border border-neutral-200">
      {isCompleted ? (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-neutral-700">{label}</span>
        </>
      ) : (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
          <span className="text-neutral-700">{label}</span>
        </>
      )}
    </div>
  );
}
