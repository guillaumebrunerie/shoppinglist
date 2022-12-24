import * as React from "react";
import {
	useLoaderData,
	useSubmit,
	useNavigate,
	useParams,
	useTransition,
} from "@remix-run/react";
import {json, type LoaderArgs} from "@remix-run/node";
import {getList} from "~/models/lists.server";
import {useReloadOnUpdate} from "~/socket";
import List, { type HalfList } from "~/components/List";

export const loader = async ({ params }: LoaderArgs) => {
	const listId = params.listId as string;
	const list = await getList(listId);
	return json(list);
};

export const action = async () => {
	return json({})
};

const localStorageApply = <T,>(key: string, def: T, f: (value: T) => T): T => {
	const valueStr = localStorage.getItem(key);
	let value = def;
	try {
		if (valueStr !== null) {
			value = JSON.parse(valueStr) as T;
		}
	} catch (e) {}
	const newValue = f(value);
	localStorage.setItem(key, JSON.stringify(newValue));
	return newValue;
}

export default function ListPage() {
	const params = useParams();
	const listId = params["listId"] as string;
	let list = useLoaderData<typeof loader>();

	useReloadOnUpdate(listId || "");

	React.useEffect(() => {
		localStorage.setItem("lastList", listId);
		if (list && !list.parent) {
			localStorageApply("allLists", [], (allLists: string[]) => {
				if (!allLists.includes(listId)) {
					allLists.push(listId);
				}
				return allLists;
			});
		}
	}, [list, listId]);

	// Create root list
	const submit = useSubmit();
	const handleCreate = () => {
		submit(null, { method: "post", action: `${listId}/create` });
	};

	// Go back to the screen for choosing root list
	const navigate = useNavigate();
	const handleCancel = () => {
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
	let displayedList: HalfList = list;
	if (transition.type === "normalLoad") {
		const id = transition.location.pathname.slice(1);
		const item = list.items.find(item => item.childListId === id);
		const name = item?.childList?.name;
		const items = item?.childList?.items;
		if (id && item && name && items) {
			isLoading = true;
			displayedList = {
				id,
				name,
				parent: {listId: item.listId},
				items,
			}
		} else {
			const id = list.parent?.listId;
			const item = list.parent;
			const name = item?.list.name;
			const items = item?.list.items;
			if (id && item && name && items) {
				displayedList = {
					id,
					name,
					parent: null,
					items,
				}
				isLoading = true;
			}
		}
	}

	return <List key={displayedList.id} list={displayedList} isLoading={isLoading}/>;
}
