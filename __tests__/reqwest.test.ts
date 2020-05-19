import "jest-extended";
// import nock from "nock";

import { Reqwest } from "../src";

test("#withBasicAuth", async () => {
	const response = await Reqwest.new("https://httpbin.org/")
		.withBasicAuth("username", "password")
		.get<{ authenticated: boolean }>("/basic-auth/username/password");

	expect(response.body.authenticated).toBeTrue();
});

test.skip("#withDigestAuth", async () => {
	const response = await Reqwest.new("https://httpbin.org/")
		.withDigestAuth("username", "password")
		.get<{ authenticated: boolean }>("/digest-auth/auth/username/password");

	expect(response.body.authenticated).toBeTrue();
});

test("#withToken", async () => {
	const response = await Reqwest.new("https://httpbin.org/")
		.withToken("token")
		.get<{ authenticated: boolean }>("/bearer");

	expect(response.body.authenticated).toBeTrue();
});

test("#get", async () => {
	const response = await Reqwest.new("https://httpbin.org/").get<{ args: object }>("/get", { key: "value" });

	expect(response.body.args).toEqual({ key: "value" });
});

test("#head", async () => {
	const response = await Reqwest.new("https://httpbin.org/").head("/get", { key: "value" });

	expect(response.body).toBeEmpty();
});

test("#post", async () => {
	const response = await Reqwest.new("https://httpbin.org/").post<{ json: object }>("/post", { key: "value" });

	expect(response.body.json).toEqual({ key: "value" });
});

test("#patch", async () => {
	const response = await Reqwest.new("https://httpbin.org/").patch<{ json: object }>("/patch", { key: "value" });

	expect(response.body.json).toEqual({ key: "value" });
});

test("#put", async () => {
	const response = await Reqwest.new("https://httpbin.org/").put<{ json: object }>("/put", {
		key: "value",
	});

	expect(response.body.json).toEqual({ key: "value" });
});

test("#delete", async () => {
	const response = await Reqwest.new("https://httpbin.org/").delete<{ json: object }>("/delete", { key: "value" });

	expect(response.body.json).toEqual({ key: "value" });
});
