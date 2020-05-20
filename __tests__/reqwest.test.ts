import "jest-extended";

import { Reqwest } from "../src";

test("#withBasicAuth", async () => {
	const response = await Reqwest.new("https://httpbin.org/")
		.withBasicAuth("username", "password")
		.get("/basic-auth/username/password");

	expect(response.json().authenticated).toBeTrue();
	expect(response.status()).toBe(200);
});

test.skip("#withDigestAuth", async () => {
	const response = await Reqwest.new("https://httpbin.org/")
		.withDigestAuth("username", "password")
		.get("/digest-auth/auth/username/password");

	expect(response.json().authenticated).toBeTrue();
	expect(response.status()).toBe(200);
});

test("#withToken", async () => {
	const response = await Reqwest.new("https://httpbin.org/").withToken("token").get("/bearer");

	expect(response.json().authenticated).toBeTrue();
	expect(response.status()).toBe(200);
});

test("#get", async () => {
	const response = await Reqwest.new("https://httpbin.org/").get("/get", { key: "value" });

	expect(response.json().args).toEqual({ key: "value" });
	expect(response.status()).toBe(200);
});

test("#head", async () => {
	const response = await Reqwest.new("https://httpbin.org/").head("/get", { key: "value" });

	expect(response.body()).toBeEmpty();
	expect(response.status()).toBe(200);
});

test("#post", async () => {
	const response = await Reqwest.new("https://httpbin.org/").post("/post", { key: "value" });

	expect(response.json().json).toEqual({ key: "value" });
	expect(response.status()).toBe(200);
});

test("#patch", async () => {
	const response = await Reqwest.new("https://httpbin.org/").patch("/patch", { key: "value" });

	expect(response.json().json).toEqual({ key: "value" });
	expect(response.status()).toBe(200);
});

test("#put", async () => {
	const response = await Reqwest.new("https://httpbin.org/").put("/put", {
		key: "value",
	});

	expect(response.json().json).toEqual({ key: "value" });
	expect(response.status()).toBe(200);
});

test("#delete", async () => {
	const response = await Reqwest.new("https://httpbin.org/").delete("/delete", { key: "value" });

	expect(response.json().json).toEqual({ key: "value" });
	expect(response.status()).toBe(200);
});

test("#get with 404", async () => {
	const response = await Reqwest.new("https://httpbin.org/").get("/status/404");

	expect(response.body()).toBeEmpty();
	expect(response.status()).toBe(404);
});
