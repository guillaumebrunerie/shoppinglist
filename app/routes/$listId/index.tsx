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

export default function ListPage() {
	const params = useParams();
	const listId = params["listId"];
	let list = useLoaderData<typeof loader>();

	useReloadOnUpdate(listId || "");

	// Create root list
	const submit = useSubmit();
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
