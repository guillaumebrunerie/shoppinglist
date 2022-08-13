import * as React from "react";

import {
	useLoaderData,
	useSubmit,
    useNavigate,
} from "@remix-run/react";
import {json, type LoaderArgs} from "@remix-run/node";
import {getList} from "~/models/lists.server";
import {useSocket} from "~/context";
import List from "~/components/List";

export const loader = async ({ params }: LoaderArgs) => {
	const listId = params.listId as string;
	const list = await getList(listId);
	return json({listId, list});
};

export const action = async () => {
	return json({})
};

export default function ListPage() {
	const {list, listId} = useLoaderData<typeof loader>();

	// Update shown data when we receive an update message from the websocket
	const submit = useSubmit();
	const socket = useSocket();
	React.useEffect(() => {
		socket?.on("update", (updatedListId: string) => {
			if (updatedListId === listId) {
				submit(null, {method: "post"});
			}
		});
	}, [socket, listId, submit]);

	// Create root list
	const handleCreate = () => {
		submit(null, { method: "post", action: `${listId}/create` });
	};

	// Go back to the screen for choosing root list
	const navigate = useNavigate();
	const handleCancel = () => {
		localStorage.removeItem("rootList");
		navigate(`/`);
	};

	if (list) {
		return <List list={list} />;
	}

	return (
		<p>
			La liste "{listId}" n’existe pas, <button onClick={handleCreate}>la créer</button>, <button onClick={handleCancel}>annuler</button>.
		</p>
	);
}
