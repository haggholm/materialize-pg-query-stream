#!/usr/bin/env node
"use strict";

const { existsSync } = require("fs")
const { Client } = require("pg");
const QueryStream = require("pg-query-stream");

if (existsSync(".env")) {
	console.log("Load environment from .env file")
	require("dotenv").config({path: ".env"})
	console.log(Object.fromEntries(Object.entries(process.env).filter(([k,v]) => k.startsWith("MATERIALIZE_"))));
}

async function main() {
	const client = new Client({
		host: process.env.MATERIALIZE_HOST,
		user: process.env.MATERIALIZE_USERNAME,
		password: process.env.MATERIALIZE_PASSWORD,
		port: Number(process.env.MATERIALIZE_PORT) || 6875,
		database: process.env.MATERIALIZE_DATABASE || "materialize",
  	ssl: { rejectUnauthorized: false },
	});
	await client.connect();
	if (process.env.MATERIALIZE_CLUSTER && process.env.MATERIALIZE_CLUSTER !== "default") {
		await client.query(`SET cluster = ${process.env.MATERIALIZE_CLUSTER}`);
	}

	const stream = await client.query(
		new QueryStream(process.env.MATERIALIZE_QUERY, [], { batchSize: 10 })
	);
	let rows = 0;
	stream.on("data", (data) => {
		console.log(`got row ${++rows}:`, data);
	});
	await new Promise((resolve, reject) => {
		stream.on("end", resolve);
		stream.on("error", reject);
	})
}

if (module === require.main) {
	void main()
		.then(() => process.exit(0))
		.catch((err) => {
		console.error(err);
		process.exit(1)
	});
}