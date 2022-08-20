import type { EntryContext } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import { renderToString } from "react-dom/server";
import { ServerStyleSheet } from "styled-components";
import { resetServerContext } from 'react-beautiful-dnd';

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
	resetServerContext();
	const sheet = new ServerStyleSheet();
	const markup = renderToString(
		sheet.collectStyles(
			<RemixServer
				context={remixContext}
				url={request.url}
			/>
		)
	).replace("__STYLES__", sheet.getStyleTags());

	responseHeaders.set("Content-Type", "text/html");

	return new Response("<!DOCTYPE html>" + markup, {
		status: responseStatusCode,
		headers: responseHeaders,
	});
}
