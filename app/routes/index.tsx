import { Link } from "@remix-run/react";
import * as React from "react";

const Header = () => {
	return (
		<h1 className="text-2xl p-3">Listes accédées récemment</h1>
	)
}

const ListIndicator = ({listId}: {listId: string}) => {
	return (
		<Link to={`/${listId}`}>
			<li
				className="flex h-14 pl-5 my-1 cursor-pointer items-center border border-black bg-blue-700 text-2xl text-slate-300"
			>
				{listId}
			</li>
		</Link>
	)
}

export default function MainPage() {
	const [knownLists, setKnownLists] = React.useState<string[] | null>(null);
	React.useEffect(() => {
		// TODO: remove hacky default
		setKnownLists(JSON.parse(localStorage.getItem("knownLists") || "[testList]"));
	}, []);

	if (knownLists === null) return null;

	return (
		<div>
			<Header/>
			<ul className="flex select-none flex-col place-items-stretch">
				{knownLists.map(listId => (
					<ListIndicator key={listId} listId={listId}/>
				))}
			</ul>
		</div>
	)
}
