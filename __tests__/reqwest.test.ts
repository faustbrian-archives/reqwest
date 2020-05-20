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

test("#withCookies", async () => {
	const responseWithCookies = await Reqwest.new("https://httpbin.org/")
		.withCookies({ foo: "bar" }, "https://httpbin.org/cookies")
		.get("/cookies");

	expect(responseWithCookies.json()).toEqual({ cookies: { foo: "bar" } });

	const responseWithoutCookies = await Reqwest.new("https://httpbin.org/").get("/cookies");

	expect(responseWithoutCookies.json()).toEqual({ cookies: {} });
});

test("#withSocksProxy", async () => {
	const oldOrigin: string = (await Reqwest.new("https://httpbin.org/").get("/ip")).json().origin as string;

	const newOrigin: string = (
		await Reqwest.new("https://httpbin.org/").withSocksProxy("socks5h://127.0.0.1:9050").get("/ip")
	).json().origin as string;

	expect(oldOrigin).not.toBe(newOrigin);
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
