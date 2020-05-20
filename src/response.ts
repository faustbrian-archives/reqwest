import { Primitive } from "type-fest";

import { RequestException } from "./exceptions";

export class Response {
	readonly #response;

	readonly #error: Error | undefined;

	readonly #body: string;

	private constructor({ body, error, response }) {
		this.#response = response;
		this.#body = body;
		this.#error = error;
	}

	public static async make(response, error?: Error | undefined): Promise<Response> {
		let body;
		try {
			body = await response.text();
		} catch (error) {
			body = undefined;
		}

		return new Response({ response, body, error });
	}

	public body(): string {
		return this.#body;
	}

	public json(): Record<string, Primitive> {
		return JSON.parse(this.#body);
	}

	public header(header: string): Primitive {
		return this.headers()[header];
	}

	public headers(): Record<string, Primitive> {
		return this.#response.headers;
	}

	public status(): number {
		return this.#response.status;
	}

	public successful(): boolean {
		return this.status() >= 200 && this.status() < 300;
	}

	public ok(): boolean {
		return this.status() === 200;
	}

	public redirect(): boolean {
		return this.status() >= 300 && this.status() < 400;
	}

	public failed(): boolean {
		return this.serverError() || this.clientError();
	}

	public clientError(): boolean {
		return this.status() >= 400 && this.status() < 500;
	}

	public serverError(): boolean {
		return this.status() >= 500;
	}

	public throw(): Response {
		if (this.serverError() || this.clientError()) {
			throw new RequestException(this, this.#error);
		}

		return this;
	}
}
