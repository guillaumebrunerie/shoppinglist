import * as React from "react";

import {
	useLoaderData,
	useFetcher,
	useSubmit,
	useParams,
} from "@remix-run/react";
import { json, type LoaderFunction } from "@remix-run/node";
import { getList, type Item } from "~/models/lists.server";
import {useSocket} from "~/context";

type LoaderData = {
	listId: string;
	list: Item[] | null;
};

export const loader: LoaderFunction = async ({ params }) => {
	const listId = params.listId as string;
	const list = await getList(listId);
	return json<LoaderData>({ listId, list });
};

const DeleteButton = (props: React.ComponentProps<"svg">) => {
	return (
		<svg className="h-10 w-10 flex-none mr-2 cursor-pointer" viewBox="-100 -100 200 200" preserveAspectRatio="xMidYMid slice" role="img" {...props}>
			<title>Supprimer cet élément</title>
			<path d="M -70 -70 L 70 70 M -70 70 L 70 -70" strokeWidth="20" stroke="#C00" strokeLinecap="round"/>
		</svg>
	)

	// return <div className="mr-2 h-10 w-10 flex-none bg-red-900" {...props} />;
};

const ItemRow = ({ item }: { item: Item }) => {
	const socket = useSocket();
	const params = useParams();
	const listId = params.listId as string;
	const fetcher = useFetcher();
	const handleDelete = () => {
		socket?.emit("update", listId);
		fetcher.submit(
			{ id: item.id },
			{ method: "post", action: `${listId}/delete` }
		);
	};
	const handleCheck = () => {
		socket?.emit("update", listId);
		fetcher.submit(
			{ id: item.id, currentState: `${item.completed}` },
			{ method: "post", action: `${listId}/toggle` }
		);
	};

	const bg = item.completed ? "bg-blue-800 " : "bg-blue-700 ";
	const submitting = fetcher.state == "idle" ? "" : "opacity-50 ";

	return (
		<li
			className={
				bg +
				submitting +
				"flex min-h-[4rem] items-center border border-black text-2xl"
			}
		>
			<span
				className={
					"ml-2 flex-auto text-slate-300 cursor-pointer " +
					(item.completed ? "text-slate-500 line-through" : "")
				}
				onClick={handleCheck}
			>
				{item.value}
			</span>
			<DeleteButton onClick={handleDelete} />
		</li>
	);
};

const AddItem = () => {
	const socket = useSocket();
	const params = useParams();
	const listId = params.listId as string;
	const fetcher = useFetcher();
	const [text, setText] = React.useState("");

	const doAdd = () => {
		if (!text) return;
		socket?.emit("update", listId);
		fetcher.submit(
			{ item: text },
			{ method: "post", action: `${listId}/add` }
		);
		setText("");
	};

	const handleChange = (event: React.ChangeEvent) => {
		setText((event.target as HTMLInputElement).value);
	};
	const handleKeyDown = (event: React.KeyboardEvent) => {
		switch (event.key) {
			case "Enter":
				doAdd();
		}
	};

	const placeholder = "Ajouter…";

	return (
		<li
			className="flex h-16 cursor-pointer items-center border border-black bg-blue-700 text-2xl text-slate-300"
		>
			<input
				autoFocus
				placeholder={placeholder}
				value={text}
				onChange={handleChange}
				onKeyDown={handleKeyDown}
				className="mx-4 w-4/5 select-text text-black"
			/>
		</li>
	);
};

const ShoppingList = ({ list }: { list: Item[] }) => {
	return (
		<ul className="flex select-none flex-col place-items-stretch">
			{list.map((item) => (
				<ItemRow key={item.id} item={item} />
			))}
			<AddItem />
		</ul>
	);
};

export default function MainPage() {
	const fetcher = useFetcher<LoaderData>();
	const fetcherLoad = fetcher.load;
	const loaderData = useLoaderData<LoaderData>();
	const data = fetcher.data || loaderData;
	const { list, listId } = data || {list: null, listId: ""};

	const submit = useSubmit();

	const socket = useSocket();
	React.useEffect(() => {
		if (!socket) return;

		socket.on("update", (updatedListId) => {
			if (updatedListId === listId) {
				fetcherLoad(`/${listId}?index`);
			}
		});
	}, [socket, fetcherLoad, listId]);

	// Add the listId to local storage
	React.useEffect(() => {
		let knownLists = JSON.parse(localStorage.getItem("knownLists") || JSON.stringify([listId]));
		if (!knownLists.includes(listId)) {
			knownLists.push(listId);
		}
		localStorage.setItem("knownLists", JSON.stringify(knownLists));
	});

	const handleClick = () => {
		submit(null, { method: "post", action: `${listId}/create` });
	};

	if (!list) {
		return <button onClick={handleClick}>Create list {listId}</button>;
	}
	return <ShoppingList list={list} />;
}
