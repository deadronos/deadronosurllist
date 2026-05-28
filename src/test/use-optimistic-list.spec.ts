// @vitest-environment happy-dom
import { describe, expect, test, vi } from "vitest";

import { renderHook, act } from "@testing-library/react";

import { useOptimisticList } from "@/hooks/use-optimistic-list";

// Mock dnd-kit
vi.mock("@dnd-kit/core", () => ({
  PointerSensor: class {},
  KeyboardSensor: class {},
  useSensor: (sensor: unknown) => sensor,
  useSensors: (...sensors: unknown[]) => sensors,
}));

vi.mock("@dnd-kit/sortable", () => ({
  arrayMove: <T>(arr: T[], from: number, to: number) => {
    const result = [...arr];
    const [removed] = result.splice(from, 1);
    result.splice(to, 0, removed!);
    return result;
  },
  sortableKeyboardCoordinates: {},
}));

type TestItem = { id: string; name: string };

const items: TestItem[] = [
  { id: "1", name: "A" },
  { id: "2", name: "B" },
  { id: "3", name: "C" },
];

describe("useOptimisticList", () => {
  test("returns initial items", () => {
    const { result } = renderHook(() => useOptimisticList(items));
    expect(result.current.items).toEqual(items);
  });

  test("serializes concurrent mutations via queue", () => {
    const { result } = renderHook(() => useOptimisticList(items));

    const callOrder: string[] = [];

    const mutationFn1 = vi.fn((callbacks: { onSuccess?: () => void; onError?: () => void }) => {
      callOrder.push("mutation1-start");
      // Don't resolve immediately
      setTimeout(() => {
        callOrder.push("mutation1-complete");
        callbacks.onSuccess?.();
      }, 50);
    });

    const mutationFn2 = vi.fn((callbacks: { onSuccess?: () => void; onError?: () => void }) => {
      callOrder.push("mutation2-start");
      setTimeout(() => {
        callOrder.push("mutation2-complete");
        callbacks.onSuccess?.();
      }, 10);
    });

    act(() => {
      result.current.optimisticUpdate(
        "1",
        (item) => ({ ...item, name: "A-updated" }),
        mutationFn1,
        "Updated 1",
        "Failed 1",
      );
    });

    act(() => {
      result.current.optimisticUpdate(
        "2",
        (item) => ({ ...item, name: "B-updated" }),
        mutationFn2,
        "Updated 2",
        "Failed 2",
      );
    });

    // Mutation 2 should be queued, not started yet
    expect(mutationFn1).toHaveBeenCalledTimes(1);
    expect(mutationFn2).toHaveBeenCalledTimes(0);
  });

  test("rolls back to previous items on error", () => {
    const { result } = renderHook(() => useOptimisticList(items));

    const mutationFn = vi.fn((callbacks: { onSuccess?: () => void; onError?: () => void }) => {
      callbacks.onError?.();
    });

    act(() => {
      result.current.optimisticUpdate(
        "1",
        (item) => ({ ...item, name: "A-updated" }),
        mutationFn,
        "Updated",
        "Failed",
      );
    });

    expect(result.current.items).toEqual(items);
    expect(result.current.feedback).toEqual({ type: "error", message: "Failed" });
  });

  test("sets success feedback on success", () => {
    const { result } = renderHook(() => useOptimisticList(items));

    const mutationFn = vi.fn((callbacks: { onSuccess?: () => void; onError?: () => void }) => {
      callbacks.onSuccess?.();
    });

    act(() => {
      result.current.optimisticUpdate(
        "1",
        (item) => ({ ...item, name: "A-updated" }),
        mutationFn,
        "Updated",
        "Failed",
      );
    });

    expect(result.current.feedback).toEqual({ type: "success", message: "Updated" });
  });

  test("optimistic delete removes item", () => {
    const { result } = renderHook(() => useOptimisticList(items));

    const mutationFn = vi.fn((callbacks: { onSuccess?: () => void; onError?: () => void }) => {
      callbacks.onSuccess?.();
    });

    act(() => {
      result.current.optimisticDelete("2", mutationFn, "Deleted", "Failed");
    });

    expect(result.current.items).toEqual([
      { id: "1", name: "A" },
      { id: "3", name: "C" },
    ]);
  });

  test("optimistic delete rolls back on error", () => {
    const { result } = renderHook(() => useOptimisticList(items));

    const mutationFn = vi.fn((callbacks: { onSuccess?: () => void; onError?: () => void }) => {
      callbacks.onError?.();
    });

    act(() => {
      result.current.optimisticDelete("2", mutationFn, "Deleted", "Failed");
    });

    expect(result.current.items).toEqual(items);
    expect(result.current.feedback).toEqual({ type: "error", message: "Failed" });
  });
});
