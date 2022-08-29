import {
	useLoaderData,
} from "@remix-run/react";
import {json} from "@remix-run/node";
import {getDeletedItems} from "~/models/lists.server";
import { RecentlyDeletedList } from "~/components/List";
import { useReloadOnUpdate } from "~/socket";

export const loader = async () => {
	const items = await getDeletedItems();
	return json(items);
};

export const action = async () => {
	return json({})
};

export default function ListPage() {
	let items = useLoaderData<typeof loader>();

	useReloadOnUpdate();

	return <RecentlyDeletedList items={items} isLoading={false}/>;
}
