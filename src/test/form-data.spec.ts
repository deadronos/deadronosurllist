import { expect, test, describe } from "vitest";
import {
  getFormString,
  getTrimmedFormString,
  getRequiredTrimmedFormString,
} from "@/lib/form-data";

describe("FormData utilities", () => {
  describe("getFormString", () => {
    test("returns string value when it exists", () => {
      const formData = new FormData();
      formData.append("name", "John Doe");
      expect(getFormString(formData, "name")).toBe("John Doe");
    });

    test("returns null when key does not exist", () => {
      const formData = new FormData();
      expect(getFormString(formData, "missing")).toBe(null);
    });

    test("returns null when value is a File", () => {
      const formData = new FormData();
      const file = new File(["content"], "test.txt", { type: "text/plain" });
      formData.append("file", file);
      expect(getFormString(formData, "file")).toBe(null);
    });
  });

  describe("getTrimmedFormString", () => {
    test("returns trimmed string value", () => {
      const formData = new FormData();
      formData.append("name", "  John Doe  ");
      expect(getTrimmedFormString(formData, "name")).toBe("John Doe");
    });

    test("returns null when getFormString returns null", () => {
      const formData = new FormData();
      expect(getTrimmedFormString(formData, "missing")).toBe(null);
    });
  });

  describe("getRequiredTrimmedFormString", () => {
    test("returns trimmed string when it's not empty", () => {
      const formData = new FormData();
      formData.append("name", "  John Doe  ");
      expect(getRequiredTrimmedFormString(formData, "name")).toBe("John Doe");
    });

    test("returns null when trimmed string is empty", () => {
      const formData = new FormData();
      formData.append("name", "   ");
      expect(getRequiredTrimmedFormString(formData, "name")).toBe(null);
    });

    test("returns null when key does not exist", () => {
      const formData = new FormData();
      expect(getRequiredTrimmedFormString(formData, "missing")).toBe(null);
    });
  });
});
