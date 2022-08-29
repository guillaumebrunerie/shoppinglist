import { useSubmit } from "@remix-run/react";
import * as React from "react";
import { createContext, useContext } from "react";
import type { Socket } from "socket.io-client";

type ProviderProps = {
	socket: Socket | undefined;
	children: React.ReactNode;
};

const context = createContext<Socket | undefined>(undefined);

export const SocketProvider = ({ socket, children }: ProviderProps) => {
	return <context.Provider value={socket}>{children}</context.Provider>;
};

export const useReloadOnUpdate = (listId?: string) => {
	// Update shown data when we receive an update message from the websocket
	const submit = useSubmit();
	const socket = useContext(context);
	React.useEffect(() => {
		const listener = (updatedListId: string) => {
			if (!listId || updatedListId === listId) {
				submit(null, {method: "post"});
			}
		};
		socket?.on("update", listener);
		return () => void socket?.off("update", listener);
	}, [socket, listId, submit]);
};

export const useBroadcastUpdate = () => {
	const socket = useContext(context);
	return React.useCallback((listId: string) => {
		socket?.emit("update", listId);
	}, [socket]);
};
