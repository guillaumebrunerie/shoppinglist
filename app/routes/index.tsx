import { useNavigate } from "@remix-run/react";
import * as React from "react";
import styled from "styled-components";

const SHeader = styled.h1`
	padding: 0.75rem;
	// font-size: 1.5rem;
	// line-height: 2rem;
`

export default function MainPage() {
	const navigate = useNavigate();
	const [noRootList, setNoRootList] = React.useState(false);
	React.useEffect(() => {
		const rootList = localStorage.getItem("rootList");
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
		localStorage.setItem("rootList", value);
		navigate(`/${value}`);
	}

	if (noRootList) {
		return (
			<div>
				<SHeader>Veuillez entrer l’identifiant de la liste</SHeader>
				<input type="text" value={value} onChange={handleChange}/>
				<button onClick={handleClick}>
					OK
				</button>
			</div>
		)
	}
}
