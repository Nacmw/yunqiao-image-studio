import assert from "node:assert/strict";
import { buildImageRequestBodyForTest } from "../src/shared/imageApi.ts";
import { validateGptImage2Size } from "../src/shared/imageSize.ts";
import { composePrompt } from "../src/shared/promptComposer.ts";

const validSize = validateGptImage2Size("1024x1536");
assert.equal(validSize.ok, true);
assert.equal(validSize.value, "1024x1536");

const oversized = validateGptImage2Size("4096x4096");
assert.equal(oversized.ok, false);
assert.match(oversized.message ?? "", /2K|2048/);

const badRatio = validateGptImage2Size("2048x512");
assert.equal(badRatio.ok, false);
assert.match(badRatio.message ?? "", /3:1/);

const prompt = composePrompt(
  {
    id: "test",
    industry: "电商零售",
    scene: "商品主图",
    size: "1024x1024",
    quality: "medium",
    format: "png",
    prompt: "主体是 {product_name}，卖点是 {selling_points}。",
    avoid: "避免 {avoid_item}。"
  },
  {
    product_name: "旅行水杯",
    selling_points: "轻量保温",
    avoid_item: "水印"
  },
  "白底棚拍",
  "乱码文字"
);
assert.match(prompt, /旅行水杯/);
assert.match(prompt, /轻量保温/);
assert.match(prompt, /白底棚拍/);
assert.match(prompt, /水印/);

const body = buildImageRequestBodyForTest({
  prompt: "测试",
  size: "1024x1024",
  quality: "high",
  output_format: "png",
  background: "auto"
});
assert.equal(body.model, "gpt-image-2");
assert.equal(body.size, "1024x1024");
assert.equal(Object.hasOwn(body, "n"), false);

console.log("core tests passed");
