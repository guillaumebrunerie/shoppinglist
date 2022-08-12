import * as React from "react";
import type {MetaFunction} from "@remix-run/node";
import {
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useLocation,
	useMatches,
} from "@remix-run/react";
import io, {type Socket} from "socket.io-client";
import {SocketProvider} from "./context";
import { createGlobalStyle } from "styled-components";

let isMount = true;

export const meta: MetaFunction = () => ({
	charset: "utf-8",
	title: "Listes de courses",
	viewport: "width=device-width,initial-scale=1,maximum-scale=1,user-scalable=yes",
});

const font = "Gantari";
const weight = "400,700";

const GlobalStyles = createGlobalStyle`
	body, html {
		height: 100%;
		margin: 0;
		background-color: #F0F0F0;
		font-family: '${font}', sans-serif;
	}
	a {
		text-decoration-line: none;
		color: inherit;
	}
`

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

	let location = useLocation();
	let matches = useMatches();

	React.useEffect(() => {
		let mounted = isMount;
		isMount = false;
		if ("serviceWorker" in navigator) {
			if (navigator.serviceWorker.controller) {
				navigator.serviceWorker.controller?.postMessage({
					type: "REMIX_NAVIGATION",
					isMount: mounted,
					location,
					matches,
					manifest: window.__remixManifest,
				});
			} else {
				let listener = async () => {
					await navigator.serviceWorker.ready;
					navigator.serviceWorker.controller?.postMessage({
						type: "REMIX_NAVIGATION",
						isMount: mounted,
						location,
						matches,
						manifest: window.__remixManifest,
					});
				};
				navigator.serviceWorker.addEventListener("controllerchange", listener);
				return () => {
					navigator.serviceWorker.removeEventListener(
						"controllerchange",
						listener
					);
				};
			}
		}
	}, [location, matches]);

	return (
		<html lang="en">
			<head>
				<Meta />
				<link rel="manifest" href="/resources/manifest.webmanifest" />
				<link rel="preconnect" href="https://fonts.googleapis.com"/>
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true"/>
				<link href={`https://fonts.googleapis.com/css2?family=${font}:wght@${weight}&display=swap`} rel="stylesheet"/>
				<Links />
				{typeof document === "undefined"
					? "__STYLES__"
					: null
				}
			</head>
			<body>
				<GlobalStyles/>
				<SocketProvider socket={socket}>
					<Outlet />
				</SocketProvider>
				{/*<ScrollRestoration/>*/}
				<Scripts />
				<LiveReload />
			</body>
		</html>
	);
}
