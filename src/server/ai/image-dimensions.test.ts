import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { imageDimensionsForAspect } from "./image-dimensions.ts";

describe("imageDimensionsForAspect", () => {
  it("maps common aspect ratios to pixel sizes", () => {
    assert.deepEqual(imageDimensionsForAspect("1:1"), {
      aspectRatio: "1:1",
      size: "1024x1024",
    });
    assert.deepEqual(imageDimensionsForAspect("9:16"), {
      aspectRatio: "9:16",
      size: "1024x1792",
    });
    assert.deepEqual(imageDimensionsForAspect("16:9"), {
      aspectRatio: "16:9",
      size: "1792x1024",
    });
  });
});
