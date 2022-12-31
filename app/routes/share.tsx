import {useParams} from "@remix-run/react";

export default function ListPage() {
	const params = useParams();

	return (
		<div>
			{JSON.stringify(params)}
		</div>
	);
}
