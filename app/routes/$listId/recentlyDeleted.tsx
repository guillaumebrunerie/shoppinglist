import {
	useLoaderData,
} from "@remix-run/react";
import {json, type LoaderArgs} from "@remix-run/node";
import {getDeletedItems} from "~/models/lists.server";
import { RecentlyDeletedList } from "~/components/List";
import { useReloadOnUpdate } from "~/socket";

export const loader = async ({ params }: LoaderArgs) => {
	const listId = params.listId as string;
	const items = await getDeletedItems(listId);
	return json({items, listId});
};

export const action = async () => {
	return json({})
};

export default function ListPage() {
	let {items, listId} = useLoaderData<typeof loader>();

	useReloadOnUpdate("");

	return <RecentlyDeletedList items={items} listId={listId} isLoading={false}/>;
}
