import * as React from "react";
import type { LinksFunction, MetaFunction } from "@remix-run/node";
import {
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from "@remix-run/react";
import io, { type Socket } from "socket.io-client";
import { SocketProvider } from "./context";

import tailwindStylesheetUrl from "./styles/tailwind.css";

export const links: LinksFunction = () => {
	return [{ rel: "stylesheet", href: tailwindStylesheetUrl }];
};

export const meta: MetaFunction = () => ({
	charset: "utf-8",
	title: "Listes de courses",
	viewport: "width=device-width,initial-scale=1",
});

export default function App() {
	const [socket, setSocket] = React.useState<Socket>();

	React.useEffect(() => {
		console.log("connecting");
		const socket = io();
		setSocket(socket);
		return () => {
			socket.close();
		};
	}, []);

	React.useEffect(() => {
		if (!socket) return;
		socket.on("confirmation", (data) => {
			console.log(data);
		});
	}, [socket]);

	return (
		<html lang="en" className="h-full">
			<head>
				<Meta />
				<Links />
			</head>
			<body className="h-full bg-slate-500">
				<SocketProvider socket={socket}>
					<Outlet />
				</SocketProvider>
				<ScrollRestoration />
				<Scripts />
				<LiveReload />
			</body>
		</html>
	);
}
