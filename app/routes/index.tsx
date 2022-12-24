import { useNavigate } from "@remix-run/react";
import * as React from "react";
import styled from "styled-components";
import List, { type HalfList } from "~/components/List";
import { useTranslate } from "~/translation";

const SHeader = styled.h1`
	padding: 0.75rem;
`;

const localStorageApply = <T,>(key: string, def: T, f: (value: T) => T = x => x): T => {
	const valueStr = localStorage.getItem(key);
	let value = def;
	try {
		if (valueStr !== null) {
			value = JSON.parse(valueStr) as T;
		}
	} catch (e) {}
	const newValue = f(value);
	if (newValue !== value) {
		localStorage.setItem(key, JSON.stringify(newValue));
	}
	return newValue;
}

export default function MainPage() {
	const navigate = useNavigate();
	const [noRootList, setNoRootList] = React.useState(false);
	React.useEffect(() => {
		const rootList = localStorage.getItem("lastList");
		if (rootList !== null) {
			navigate(`/${rootList}`, {replace: true});
		} else {
			setNoRootList(true);
		}
	}, [navigate]);

	const [value, setValue] = React.useState("");
	const handleChange = (event: React.ChangeEvent) => {
		setValue((event.target as HTMLInputElement).value);
	}

	const handleClick = () => {
		navigate(`/${value}`);
	}

	const {t} = useTranslate();

	const [myListIds, setMyListIds] = React.useState<string[] | null>(null);
	React.useEffect(() => {
		if (!myListIds) {
			setMyListIds(localStorageApply("allLists", []));
		}
	}, [myListIds]);

	if (!myListIds || !noRootList) {
		return;
	}

	const rootLists: HalfList = {
		id: "root",
		name: t("allMyLists"),
		parent: null,
		items: myListIds.map((id, i) => ({
			id: `root${i}`,
			order: "a",
			listId: "root",
			completed: false,
			childListId: id,
			childList: {
				id,
				name: id,
			},
		})),
	};

	return (
		<>
			<List list={rootLists}/>
			<div>
				<SHeader>Ajouter une liste</SHeader>
				<input type="text" value={value} onChange={handleChange}/>
				<button onClick={handleClick}>
					OK
				</button>
			</div>
		</>
	);
};
