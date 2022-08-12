import * as React from "react";

import {
	useLoaderData,
	useFetcher,
	useSubmit,
    useNavigate,
} from "@remix-run/react";
import {json, type LoaderFunction} from "@remix-run/node";
import {getList, type FullList} from "~/models/lists.server";
import {useSocket} from "~/context";
import List from "~/components/List";

type LoaderData = {
	listId: string;
	list: FullList | null;
};

export const loader: LoaderFunction = async ({ params }) => {
	const listId = params.listId as string;
	const list = await getList(listId);
	return json<LoaderData>({listId, list});
};

export default function ListPage() {
	// const fetcher = useFetcher<LoaderData>();
	const data = useLoaderData<LoaderData>();
	// const data = fetcher.data || loaderData;
	const { list, listId } = data || {list: null, listId: ""};

	const submit = useSubmit();

	const socket = useSocket();
	const navigate = useNavigate();
	// const fetcherLoad = fetcher.load;
	React.useEffect(() => {
		if (!socket) return;

		socket.on("update", (updatedListId) => {
			if (updatedListId === listId) {
				navigate(`/${listId}`, {replace: true});
				// navigate(0);
			}
		});
	}, [socket, navigate, listId]);

	// Add the listId to local storage
	React.useEffect(() => {
		let knownLists = JSON.parse(localStorage.getItem("knownLists") || JSON.stringify([listId]));
		if (!knownLists.includes(listId)) {
			knownLists.push(listId);
		}
		localStorage.setItem("knownLists", JSON.stringify(knownLists));
	});

	const handleCreate = () => {
		submit(null, { method: "post", action: `${listId}/create` });
	};

	const handleCancel = () => {
		localStorage.removeItem("rootList");
		navigate(`/`);
	};

	if (!list) {
		return (
			<p>
				La liste "{listId}" n’existe pas, <button onClick={handleCreate}>la créer</button>, <button onClick={handleCancel}>annuler</button>.
			</p>
		);
	}
	return <List list={list} />;
}
