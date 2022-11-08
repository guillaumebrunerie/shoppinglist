import { useSubmit } from "@remix-run/react";
import * as React from "react";
import { createContext, useContext } from "react";
import io, {type Socket} from "socket.io-client";

type ProviderProps = {
	children: React.ReactNode;
};

const context = createContext<Socket | null>(null);

export const SocketProvider = ({ children }: ProviderProps) => {
	const [socket, setSocket] = React.useState<Socket | null>(null);
	React.useEffect(() => {
		console.log("Connecting…");
		const socket = io();
		setSocket(socket);
		return () => {
			socket.close();
		};
	}, []);
	React.useEffect(() => {
		if (!socket) return;
		socket.on("confirmation", () => {
			console.log("Connected!");
		});
	}, [socket]);

	return <context.Provider value={socket}>{children}</context.Provider>;
};

export const useReloadOnUpdate = (channel: string) => {
	// Update shown data when we receive an update message from the websocket
	const submit = useSubmit();
	const socket = useContext(context);
	React.useEffect(() => {
		const listener = (updatedChannel: string) => {
			if (channel !== updatedChannel) return;
			submit(null, {method: "post"});
		};
		socket?.on("update", listener);
		return () => {
			socket?.off("update", listener);
		}
	}, [socket, channel, submit]);
};

export const useBroadcastUpdate = () => {
	const socket = useContext(context);
	return React.useCallback((channel: string) => {
		socket?.emit("update", channel);
	}, [socket]);
};
