import styled from "styled-components";

const SVG = styled.svg<{$isCompleted: boolean}>`
	height: 1.5rem;
	width: 1.5rem;
	flex: none;
	cursor: pointer;
	stroke: var(${props => props.$isCompleted ? "--primary" : "--background"});
	stroke-width: 7;
`

const Undo = ({onClick, $isCompleted}: {onClick: (event: React.MouseEvent) => void, $isCompleted: boolean}) => {
	return (
		<SVG $isCompleted={$isCompleted} version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
			 viewBox="0 0 100 100" onClick={onClick}>
			<path
				fill="none" stroke-linecap="round" stroke-linejoin="round"
				d="M 15 80 h 50 a 25 25 0 0 0 0 -50 h -60 l 15 15 l -15 -15 l 15 -15"
			/>
		</SVG>
	)
}

export default Undo;
