import { describe, test, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/actions", () => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
}));

vi.mock("@/lib/anon-work-tracker", () => ({
  getAnonWorkData: vi.fn(),
  clearAnonWork: vi.fn(),
}));

vi.mock("@/actions/get-projects", () => ({
  getProjects: vi.fn(),
}));

vi.mock("@/actions/create-project", () => ({
  createProject: vi.fn(),
}));

import { useRouter } from "next/navigation";
import { signIn as signInAction, signUp as signUpAction } from "@/actions";
import { getAnonWorkData, clearAnonWork } from "@/lib/anon-work-tracker";
import { getProjects } from "@/actions/get-projects";
import { createProject } from "@/actions/create-project";
import { useAuth } from "@/hooks/use-auth";

const mockPush = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any);
  vi.mocked(getAnonWorkData).mockReturnValue(null);
  vi.mocked(getProjects).mockResolvedValue([]);
  vi.mocked(createProject).mockResolvedValue({ id: "new-project-id" } as any);
});

describe("initial state", () => {
  test("isLoading starts as false", () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.isLoading).toBe(false);
  });
});

describe("signIn", () => {
  test("returns the result from the signIn action", async () => {
    vi.mocked(signInAction).mockResolvedValue({ success: true });
    vi.mocked(getProjects).mockResolvedValue([{ id: "proj-1" } as any]);

    const { result } = renderHook(() => useAuth());
    let returnValue: any;

    await act(async () => {
      returnValue = await result.current.signIn("user@example.com", "password");
    });

    expect(returnValue).toEqual({ success: true });
  });

  test("returns failure result without redirecting", async () => {
    vi.mocked(signInAction).mockResolvedValue({
      success: false,
      error: "Invalid credentials",
    });

    const { result } = renderHook(() => useAuth());
    let returnValue: any;

    await act(async () => {
      returnValue = await result.current.signIn("user@example.com", "wrong");
    });

    expect(returnValue).toEqual({ success: false, error: "Invalid credentials" });
    expect(mockPush).not.toHaveBeenCalled();
  });

  test("sets isLoading to true while the action is in flight", async () => {
    let resolveAction!: (val: any) => void;
    const pending = new Promise((res) => {
      resolveAction = res;
    });
    vi.mocked(signInAction).mockReturnValue(pending as any);

    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.signIn("user@example.com", "password");
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolveAction({ success: false });
      await pending;
    });
  });

  test("resets isLoading to false after successful sign-in", async () => {
    vi.mocked(signInAction).mockResolvedValue({ success: true });
    vi.mocked(getProjects).mockResolvedValue([{ id: "proj-1" } as any]);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn("user@example.com", "password");
    });

    expect(result.current.isLoading).toBe(false);
  });

  test("resets isLoading to false after a failed sign-in", async () => {
    vi.mocked(signInAction).mockResolvedValue({
      success: false,
      error: "Invalid credentials",
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn("user@example.com", "wrong");
    });

    expect(result.current.isLoading).toBe(false);
  });

  test("resets isLoading even when the action throws", async () => {
    vi.mocked(signInAction).mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn("user@example.com", "password").catch(() => {});
    });

    expect(result.current.isLoading).toBe(false);
  });

  test("does not call handlePostSignIn when sign-in fails", async () => {
    vi.mocked(signInAction).mockResolvedValue({
      success: false,
      error: "Invalid credentials",
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn("user@example.com", "wrong");
    });

    expect(getProjects).not.toHaveBeenCalled();
    expect(createProject).not.toHaveBeenCalled();
  });
});

describe("signUp", () => {
  test("returns the result from the signUp action", async () => {
    vi.mocked(signUpAction).mockResolvedValue({ success: true });
    vi.mocked(getProjects).mockResolvedValue([{ id: "proj-1" } as any]);

    const { result } = renderHook(() => useAuth());
    let returnValue: any;

    await act(async () => {
      returnValue = await result.current.signUp("user@example.com", "password");
    });

    expect(returnValue).toEqual({ success: true });
  });

  test("returns failure result without redirecting", async () => {
    vi.mocked(signUpAction).mockResolvedValue({
      success: false,
      error: "Email already registered",
    });

    const { result } = renderHook(() => useAuth());
    let returnValue: any;

    await act(async () => {
      returnValue = await result.current.signUp("user@example.com", "password");
    });

    expect(returnValue).toEqual({
      success: false,
      error: "Email already registered",
    });
    expect(mockPush).not.toHaveBeenCalled();
  });

  test("sets isLoading to true while the action is in flight", async () => {
    let resolveAction!: (val: any) => void;
    const pending = new Promise((res) => {
      resolveAction = res;
    });
    vi.mocked(signUpAction).mockReturnValue(pending as any);

    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.signUp("user@example.com", "password");
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolveAction({ success: false });
      await pending;
    });
  });

  test("resets isLoading to false after completion", async () => {
    vi.mocked(signUpAction).mockResolvedValue({ success: true });
    vi.mocked(getProjects).mockResolvedValue([{ id: "proj-1" } as any]);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signUp("user@example.com", "password");
    });

    expect(result.current.isLoading).toBe(false);
  });

  test("resets isLoading even when the action throws", async () => {
    vi.mocked(signUpAction).mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signUp("user@example.com", "password").catch(() => {});
    });

    expect(result.current.isLoading).toBe(false);
  });

  test("does not call handlePostSignIn when sign-up fails", async () => {
    vi.mocked(signUpAction).mockResolvedValue({
      success: false,
      error: "Email already registered",
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signUp("user@example.com", "password");
    });

    expect(getProjects).not.toHaveBeenCalled();
    expect(createProject).not.toHaveBeenCalled();
  });
});

describe("post sign-in routing (handlePostSignIn)", () => {
  beforeEach(() => {
    vi.mocked(signInAction).mockResolvedValue({ success: true });
  });

  test("creates a project from anon work and redirects when anon messages exist", async () => {
    const anonMessages = [{ role: "user", content: "Make a button" }];
    const anonFileSystem = { "/": { type: "directory" } };
    vi.mocked(getAnonWorkData).mockReturnValue({
      messages: anonMessages,
      fileSystemData: anonFileSystem,
    });
    vi.mocked(createProject).mockResolvedValue({ id: "from-anon" } as any);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn("user@example.com", "password");
    });

    expect(createProject).toHaveBeenCalledWith({
      name: expect.stringContaining("Design from"),
      messages: anonMessages,
      data: anonFileSystem,
    });
    expect(clearAnonWork).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/from-anon");
  });

  test("does not use anon work when messages array is empty", async () => {
    vi.mocked(getAnonWorkData).mockReturnValue({
      messages: [],
      fileSystemData: {},
    });
    vi.mocked(getProjects).mockResolvedValue([{ id: "existing-proj" } as any]);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn("user@example.com", "password");
    });

    expect(clearAnonWork).not.toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/existing-proj");
  });

  test("redirects to the most recent project when no anon work exists", async () => {
    vi.mocked(getProjects).mockResolvedValue([
      { id: "recent-proj" } as any,
      { id: "older-proj" } as any,
    ]);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn("user@example.com", "password");
    });

    expect(mockPush).toHaveBeenCalledWith("/recent-proj");
    expect(createProject).not.toHaveBeenCalled();
  });

  test("creates a new project and redirects when no anon work and no projects exist", async () => {
    vi.mocked(getProjects).mockResolvedValue([]);
    vi.mocked(createProject).mockResolvedValue({ id: "brand-new" } as any);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn("user@example.com", "password");
    });

    expect(createProject).toHaveBeenCalledWith(
      expect.objectContaining({ messages: [], data: {} })
    );
    expect(mockPush).toHaveBeenCalledWith("/brand-new");
  });

  test("new project name includes a random identifier", async () => {
    vi.mocked(getProjects).mockResolvedValue([]);
    vi.mocked(createProject).mockResolvedValue({ id: "new-id" } as any);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn("user@example.com", "password");
    });

    const [callArgs] = vi.mocked(createProject).mock.calls;
    expect(callArgs[0].name).toMatch(/^New Design #\d+$/);
  });

  test("does not fetch projects when anon work with messages exists", async () => {
    vi.mocked(getAnonWorkData).mockReturnValue({
      messages: [{ role: "user", content: "hello" }],
      fileSystemData: {},
    });
    vi.mocked(createProject).mockResolvedValue({ id: "anon-proj" } as any);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn("user@example.com", "password");
    });

    expect(getProjects).not.toHaveBeenCalled();
  });

  test("post sign-in routing also runs after a successful signUp", async () => {
    vi.mocked(signInAction).mockResolvedValue({ success: false });
    vi.mocked(signUpAction).mockResolvedValue({ success: true });
    vi.mocked(getProjects).mockResolvedValue([{ id: "signup-proj" } as any]);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signUp("user@example.com", "password");
    });

    expect(mockPush).toHaveBeenCalledWith("/signup-proj");
  });
});
