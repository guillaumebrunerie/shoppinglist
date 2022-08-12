import {
	redirect,
	type ActionFunction,
	type LoaderFunction,
} from "@remix-run/node";
import { addList } from "~/models/lists.server";

export const action: ActionFunction = async ({ params }) => {
	const listId = params.listId as string;
	await addList(listId, "Liste", "blue");
	return null;
};

export const loader: LoaderFunction = async ({ params }) => {
	const listId = params.listId as string;
	return redirect(`${listId}`);
};
