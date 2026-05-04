import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { getToolLabel, ToolInvocationDisplay } from "../ToolInvocationDisplay";

afterEach(() => {
  cleanup();
});

// getToolLabel unit tests

test("getToolLabel: str_replace_editor create", () => {
  expect(getToolLabel("str_replace_editor", { command: "create", path: "Card.tsx" })).toBe("Creating Card.tsx");
});

test("getToolLabel: str_replace_editor str_replace", () => {
  expect(getToolLabel("str_replace_editor", { command: "str_replace", path: "Button.tsx" })).toBe("Editing Button.tsx");
});

test("getToolLabel: str_replace_editor insert uses same label as str_replace", () => {
  expect(getToolLabel("str_replace_editor", { command: "insert", path: "utils.ts" })).toBe("Editing utils.ts");
});

test("getToolLabel: str_replace_editor view", () => {
  expect(getToolLabel("str_replace_editor", { command: "view", path: "index.tsx" })).toBe("Reading index.tsx");
});

test("getToolLabel: str_replace_editor undo_edit", () => {
  expect(getToolLabel("str_replace_editor", { command: "undo_edit", path: "App.tsx" })).toBe("Undoing edit to App.tsx");
});

test("getToolLabel: str_replace_editor missing command falls back to default", () => {
  expect(getToolLabel("str_replace_editor", { path: "Card.tsx" })).toBe("Editing file");
});

test("getToolLabel: str_replace_editor missing path uses 'file'", () => {
  expect(getToolLabel("str_replace_editor", { command: "create" })).toBe("Creating file");
});

test("getToolLabel: extracts basename from nested path", () => {
  expect(getToolLabel("str_replace_editor", { command: "create", path: "src/components/Card.tsx" })).toBe("Creating Card.tsx");
});

test("getToolLabel: extracts basename from Windows-style path", () => {
  expect(getToolLabel("str_replace_editor", { command: "create", path: "src\\components\\Card.tsx" })).toBe("Creating Card.tsx");
});

test("getToolLabel: file_manager rename", () => {
  expect(getToolLabel("file_manager", { command: "rename", path: "utils.ts", new_path: "helpers.ts" })).toBe("Renaming utils.ts");
});

test("getToolLabel: file_manager delete", () => {
  expect(getToolLabel("file_manager", { command: "delete", path: "old.tsx" })).toBe("Deleting old.tsx");
});

test("getToolLabel: file_manager missing command falls back to default", () => {
  expect(getToolLabel("file_manager", { path: "thing.ts" })).toBe("Managing file");
});

test("getToolLabel: file_manager missing path uses 'file'", () => {
  expect(getToolLabel("file_manager", { command: "rename" })).toBe("Renaming file");
});

test("getToolLabel: unknown tool name returns raw tool name", () => {
  expect(getToolLabel("some_unknown_tool", { command: "foo" })).toBe("some_unknown_tool");
});

// ToolInvocationDisplay render tests

test("ToolInvocationDisplay renders human-readable label, not raw tool name", () => {
  render(
    <ToolInvocationDisplay
      toolInvocation={{ state: "result", toolCallId: "1", toolName: "str_replace_editor", args: { command: "create", path: "Card.tsx" }, result: "ok" }}
    />
  );
  expect(screen.getByText("Creating Card.tsx")).toBeDefined();
  expect(screen.queryByText("str_replace_editor")).toBeNull();
});

test("ToolInvocationDisplay shows green dot when state is result with truthy result", () => {
  const { container } = render(
    <ToolInvocationDisplay
      toolInvocation={{ state: "result", toolCallId: "1", toolName: "str_replace_editor", args: { command: "create", path: "Card.tsx" }, result: "ok" }}
    />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
});

test("ToolInvocationDisplay shows no green dot when state is call", () => {
  const { container } = render(
    <ToolInvocationDisplay
      toolInvocation={{ state: "call", toolCallId: "1", toolName: "str_replace_editor", args: { command: "create", path: "Card.tsx" } }}
    />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("ToolInvocationDisplay shows spinner when state is call", () => {
  const { container } = render(
    <ToolInvocationDisplay
      toolInvocation={{ state: "call", toolCallId: "1", toolName: "str_replace_editor", args: { command: "create", path: "Card.tsx" } }}
    />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
});

test("ToolInvocationDisplay shows no spinner when state is result with truthy result", () => {
  const { container } = render(
    <ToolInvocationDisplay
      toolInvocation={{ state: "result", toolCallId: "1", toolName: "str_replace_editor", args: { command: "create", path: "Card.tsx" }, result: "ok" }}
    />
  );
  expect(container.querySelector(".animate-spin")).toBeNull();
});

test("ToolInvocationDisplay shows spinner when state is partial-call", () => {
  const { container } = render(
    <ToolInvocationDisplay
      toolInvocation={{ state: "partial-call", toolCallId: "1", toolName: "str_replace_editor", args: { command: "create", path: "Card.tsx" } }}
    />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
});

test("ToolInvocationDisplay treats falsy result as in-progress", () => {
  const { container } = render(
    <ToolInvocationDisplay
      toolInvocation={{ state: "result", toolCallId: "1", toolName: "str_replace_editor", args: { command: "create", path: "Card.tsx" }, result: null }}
    />
  );
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("ToolInvocationDisplay renders correct label for str_replace invocation", () => {
  render(
    <ToolInvocationDisplay
      toolInvocation={{ state: "call", toolCallId: "1", toolName: "str_replace_editor", args: { command: "str_replace", path: "Button.tsx" } }}
    />
  );
  expect(screen.getByText("Editing Button.tsx")).toBeDefined();
});

test("ToolInvocationDisplay renders correct label for file_manager delete", () => {
  render(
    <ToolInvocationDisplay
      toolInvocation={{ state: "call", toolCallId: "1", toolName: "file_manager", args: { command: "delete", path: "old.tsx" } }}
    />
  );
  expect(screen.getByText("Deleting old.tsx")).toBeDefined();
});

test("ToolInvocationDisplay outer wrapper has inline-flex and border-neutral-200", () => {
  const { container } = render(
    <ToolInvocationDisplay
      toolInvocation={{ state: "call", toolCallId: "1", toolName: "str_replace_editor", args: { command: "create", path: "Card.tsx" } }}
    />
  );
  const wrapper = container.firstChild as HTMLElement;
  expect(wrapper.className).toContain("inline-flex");
  expect(wrapper.className).toContain("border-neutral-200");
});

test("ToolInvocationDisplay outer wrapper does not have font-mono", () => {
  const { container } = render(
    <ToolInvocationDisplay
      toolInvocation={{ state: "call", toolCallId: "1", toolName: "str_replace_editor", args: { command: "create", path: "Card.tsx" } }}
    />
  );
  const wrapper = container.firstChild as HTMLElement;
  expect(wrapper.className).not.toContain("font-mono");
});
