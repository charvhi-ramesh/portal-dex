import assert from "node:assert/strict";
import { test } from "node:test";
import nextConfig from "../next.config.ts";
import {
  AVATAR_ORIGIN,
  AVATAR_PATH_PREFIX,
  isAvatarUrl,
} from "./api/avatar.ts";

test("next/image only optimises API avatars with no query string (PERF-01, T-01-12)", () => {
  assert.deepEqual(nextConfig.images?.remotePatterns, [
    {
      protocol: "https",
      hostname: "rickandmortyapi.com",
      pathname: "/api/character/avatar/**",
      search: "",
    },
  ]);
});

test("avatar guard constants mirror the remotePatterns entry", () => {
  assert.equal(AVATAR_ORIGIN, "https://rickandmortyapi.com");
  assert.equal(AVATAR_PATH_PREFIX, "/api/character/avatar/");
});

test("isAvatarUrl accepts a real API avatar URL", () => {
  assert.equal(
    isAvatarUrl("https://rickandmortyapi.com/api/character/avatar/1.jpeg"),
    true,
  );
});

test("isAvatarUrl rejects anything remotePatterns would not allow (T-01-13)", () => {
  const rejected = [
    "http://rickandmortyapi.com/api/character/avatar/1.jpeg",
    "https://evil.example/api/character/avatar/1.jpeg",
    "https://rickandmortyapi.com/api/location/1",
    "https://rickandmortyapi.com/api/character/avatar/1.jpeg?w=1",
    "https://rickandmortyapi.com:8443/api/character/avatar/1.jpeg",
    "",
    "not a url",
  ];
  for (const url of rejected) {
    assert.equal(isAvatarUrl(url), false, `expected false for ${JSON.stringify(url)}`);
  }
});

test("isAvatarUrl rejects a fragment and a path outside the prefix", () => {
  assert.equal(
    isAvatarUrl("https://rickandmortyapi.com/api/character/avatar/1.jpeg#x"),
    false,
  );
  assert.equal(
    isAvatarUrl("https://rickandmortyapi.com/api/character/avatarx/1.jpeg"),
    false,
  );
});
