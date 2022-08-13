import * as React from "react";

import {
	useLoaderData,
	useSubmit,
	useNavigate,
	useParams,
	useTransition,
} from "@remix-run/react";
import {json, type LoaderArgs} from "@remix-run/node";
import {getList, Item} from "~/models/lists.server";
import {useSocket} from "~/context";
import List from "~/components/List";

export const loader = async ({ params }: LoaderArgs) => {
	const listId = params.listId as string;
	const list = await getList(listId);
	return json(list);
};

export const action = async () => {
	return json({})
};

export default function ListPage() {
	const params = useParams();
	const listId = params["listId"];
	let list = useLoaderData<typeof loader>();

	// Update shown data when we receive an update message from the websocket
	const submit = useSubmit();
	const socket = useSocket();
	React.useEffect(() => {
		const listener = (updatedListId: string) => {
			if (updatedListId === listId) {
				submit(null, {method: "post"});
			}
		};
		socket?.on("update", listener);
		return () => void socket?.off("update", listener);
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

	const transition = useTransition();

	if (!list) {
		return (
			<p>
				La liste "{listId}" n’existe pas, <button onClick={handleCreate}>la créer</button>, <button onClick={handleCancel}>annuler</button>.
			</p>
		);
	}

	let isLoading = false;
	if (transition.state === "loading") {
		const id = transition.location.pathname.slice(1);
		const item = list.items.find(item => item.childListId === id);
		const name = item?.childList?.name;
		if (id && item && name) {
			isLoading = true;
			list = {
				id,
				name,
				parent: {...item, list},
				items: [],
				color: "red",
			}
		} else {
			const id = list.parent?.listId;
			const item = list.parent;
			const name = item?.list.name;
			if (id && item && name) {
				list = {
					id,
					name,
					parent: null,
					items: [],
					color: "red",
				}
				isLoading = true;
			}
		}
	}

	return <List list={list} isLoading={isLoading}/>;
}
