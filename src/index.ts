import ky from "ky-universal";

import { ensureTrailingSlash } from "./helpers";

type RequestOptions = Record<string, any>;

interface Response<T> {
	body: T | undefined;
	status: number;
	headers: string;
}

export class Reqwest {
	/**
	 * The request body format.
	 */
	#bodyFormat!: string;

	/**
	 * The request options.
	 */
	#options: RequestOptions = {};

	/**
	 * Create a new HTTP Client instance.
	 */
	public constructor() {
		this.asJson();
	}

	/**
	 * Create a new HTTP Client instance and set the base URL for the request.
	 */
	public static new(url: string): Reqwest {
		return new Reqwest().baseUrl(url);
	}

	/**
	 * Set the base URL for the request.
	 */
	public baseUrl(url: string): Reqwest {
		this.#options.prefixUrl = ensureTrailingSlash(url);

		return this;
	}

	/**
	 * Indicate the request contains JSON.
	 */
	public asJson(): Reqwest {
		return this.bodyFormat("json").contentType("application/json");
	}

	/**
	 * Indicate the request contains form parameters.
	 */
	public asForm(): Reqwest {
		return this.bodyFormat("form_params").contentType("application/x-www-form-urlencoded");
	}

	/**
	 * Indicate the request is a multi-part form request.
	 */
	public asMultipart(): Reqwest {
		return this.bodyFormat("multipart");
	}

	/**
	 * Specify the body format of the request.
	 */
	public bodyFormat(format: string): Reqwest {
		this.#bodyFormat = format;

		return this;
	}

	/**
	 * Specify the request's content type.
	 */
	public contentType(contentType: string): Reqwest {
		return this.withHeaders({ "Content-Type": contentType });
	}

	/**
	 * Indicate that JSON should be returned by the server.
	 */
	public acceptJson(): Reqwest {
		return this.accept("application/json");
	}

	/**
	 * Indicate the type of content that should be returned by the server.
	 */
	public accept(contentType: string): Reqwest {
		return this.withHeaders({ Accept: contentType });
	}

	/**
	 * Add the given headers to the request.
	 */
	public withHeaders(headers: object): Reqwest {
		this.#options.headers = { ...this.#options.headers, ...headers };

		return this;
	}

	/**
	 * Specify the basic authentication username and password for the request.
	 */
	public withBasicAuth(username: string, password: string): Reqwest {
		return this.withHeaders({
			Authorization: `Basic ${Buffer.from(username + ":" + password).toString("base64")}`,
		});
	}

	/**
	 * Specify the digest authentication username and password for the request.
	 */
	public withDigestAuth(username: string, password: string): Reqwest {
		throw new Error(`The [withDigestAuth("${username}", "${password}")] method is not yet supported.`);
	}

	/**
	 * Specify an authorization token for the request.
	 */
	public withToken(token: string): Reqwest {
		return this.withHeaders({ Authorization: `Bearer ${token}` });
	}

	/**
	 * Indicate that redirects should not be followed.
	 */
	public withoutRedirecting(): Reqwest {
		this.#options.followRedirects = false;

		return this;
	}

	/**
	 * Indicate that TLS certificates should not be verified.
	 */
	public withoutVerifying(): Reqwest {
		this.#options.verify = false;

		return this;
	}

	/**
	 * Specify the timeout (in seconds) for the request.
	 */
	public timeout(seconds: number): Reqwest {
		this.#options.timeout = seconds;

		return this;
	}

	/**
	 * Specify the number of times the request should be attempted.
	 */
	public retry(times: number, sleep?: number): Reqwest {
		this.#options.retry = {
			limit: times,
			maxRetryAfter: sleep,
		};

		return this;
	}

	/**
	 * Merge new options into the client.
	 */
	public withOptions(options: object): Reqwest {
		this.#options = { ...this.#options, ...options };

		return this;
	}

	/**
	 * Issue a GET request to the given URL.
	 */
	public async get<T>(url: string, query?: object): Promise<Response<T>> {
		return this.send<T>("GET", url, { query });
	}

	/**
	 * Issue a HEAD request to the given URL.
	 */
	public async head<T>(url: string, query?: object): Promise<Response<T>> {
		return this.send<T>("HEAD", url, { query });
	}

	/**
	 * Issue a POST request to the given URL.
	 */
	public async post<T>(url: string, data?: object): Promise<Response<T>> {
		return this.send<T>("POST", url, { data });
	}

	/**
	 * Issue a PATCH request to the given URL.
	 */
	public async patch<T>(url, data?: object): Promise<Response<T>> {
		return this.send<T>("PATCH", url, { data });
	}

	/**
	 * Issue a PUT request to the given URL.
	 */
	public async put<T>(url, data?: object): Promise<Response<T>> {
		return this.send<T>("PUT", url, { data });
	}

	/**
	 * Issue a DELETE request to the given URL.
	 */
	public async delete<T>(url: string, data?: object): Promise<Response<T>> {
		return this.send<T>("DELETE", url, { data });
	}

	/**
	 * Send the request to the given URL.
	 */
	private async send<T>(method: string, url: string, data?: { query?: object; data?: any }): Promise<Response<T>> {
		const options: RequestOptions = {
			...this.#options,
		};

		if (data && data.query) {
			options.searchParams = data.query;
		}

		if (data && data.data) {
			if (this.#bodyFormat === "json") {
				options.json = data.data;
			}

			if (this.#bodyFormat === "form_params") {
				options.body = new URLSearchParams();

				for (const [key, value] of Object.entries(data.data)) {
					options.body.set(key, value);
				}
			}

			if (this.#bodyFormat === "multipart") {
				options.body = new FormData();

				for (const [key, value] of Object.entries(data.data)) {
					options.body.append(key, value);
				}
			}
		}

		let response;
		try {
			response = await ky[method.toLowerCase()](url.replace(/^\/+/g, ""), options);
		} catch (error) {
			response = error.response;
		}

		let body: T | undefined;
		try {
			body = await response[method === "HEAD" ? "text" : "json"]();
		} catch (error) {
			body = undefined;
		}

		return {
			body,
			status: response.status,
			headers: response.headers,
		};
	}
}
