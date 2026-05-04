import { test, expect, vi, afterEach } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

vi.mock("jose", () => ({
  jwtVerify: vi.fn(),
  SignJWT: vi.fn(),
}));

import { getSession, deleteSession } from "@/lib/auth";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

afterEach(() => {
  vi.clearAllMocks();
});

test("getSession returns null when no auth-token cookie exists", async () => {
  (cookies as any).mockResolvedValue({
    get: vi.fn().mockReturnValue(undefined),
  });

  const result = await getSession();
  expect(result).toBeNull();
});

test("getSession returns SessionPayload when token is valid", async () => {
  const mockPayload = {
    userId: "user-123",
    email: "test@example.com",
    expiresAt: new Date("2026-01-01"),
  };

  (cookies as any).mockResolvedValue({
    get: vi.fn().mockReturnValue({ value: "valid-token" }),
  });
  (jwtVerify as any).mockResolvedValue({ payload: mockPayload });

  const result = await getSession();
  expect(result).toEqual(mockPayload);
});

test("getSession returns null when token verification fails", async () => {
  (cookies as any).mockResolvedValue({
    get: vi.fn().mockReturnValue({ value: "invalid-token" }),
  });
  (jwtVerify as any).mockRejectedValue(new Error("JWTInvalid"));

  const result = await getSession();
  expect(result).toBeNull();
});

test("getSession returns null when token is expired", async () => {
  (cookies as any).mockResolvedValue({
    get: vi.fn().mockReturnValue({ value: "expired-token" }),
  });
  (jwtVerify as any).mockRejectedValue(new Error("JWTExpired"));

  const result = await getSession();
  expect(result).toBeNull();
});

test("getSession looks up the correct cookie name", async () => {
  const getCookie = vi.fn().mockReturnValue(undefined);
  (cookies as any).mockResolvedValue({ get: getCookie });

  await getSession();

  expect(getCookie).toHaveBeenCalledWith("auth-token");
});

test("getSession passes the token to jwtVerify", async () => {
  (cookies as any).mockResolvedValue({
    get: vi.fn().mockReturnValue({ value: "my-token" }),
  });
  (jwtVerify as any).mockResolvedValue({ payload: { userId: "1", email: "a@b.com" } });

  await getSession();

  expect(jwtVerify).toHaveBeenCalledWith("my-token", expect.anything());
});

test("deleteSession calls delete with the correct cookie name", async () => {
  const deleteCookie = vi.fn();
  (cookies as any).mockResolvedValue({ delete: deleteCookie });

  await deleteSession();

  expect(deleteCookie).toHaveBeenCalledWith("auth-token");
});

test("deleteSession calls delete exactly once", async () => {
  const deleteCookie = vi.fn();
  (cookies as any).mockResolvedValue({ delete: deleteCookie });

  await deleteSession();

  expect(deleteCookie).toHaveBeenCalledTimes(1);
});

test("deleteSession resolves without throwing", async () => {
  (cookies as any).mockResolvedValue({ delete: vi.fn() });

  await expect(deleteSession()).resolves.toBeUndefined();
});
