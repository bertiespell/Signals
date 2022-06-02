import * as React from "react";
import { rust_avenue } from "../../declarations/rust_avenue";
import Map from "./Map";

const App = () => {
	const [greeting, setGreeting] = React.useState("");
	const [pending, setPending] = React.useState(false);
	const inputRef = React.useRef();

	const handleSubmit = async (e: any) => {
		e.preventDefault();
		if (pending) return;
		setPending(true);
		const name = (inputRef as any).current.value.toString();

		// Interact with hello actor, calling the greet method
		const greeting = await rust_avenue.greet(name);
		setGreeting(greeting);
		setPending(false);
		return false;
	};

	return (
		<main>
			<form onSubmit={handleSubmit}>
				<label htmlFor="name">Enter your name: &nbsp;</label>
				<input id="name" alt="Name" type="text" ref={inputRef as any} />
				<button id="clickMeBtn" type="submit" disabled={pending}>
					Click Me!
				</button>
			</form>
			<h1 className="text-l font-bold font-serif underline decoration-sky-500">
				<div className="absolute inset-0 bg-gray-300">
					<div id="map">
						<Map />
					</div>
				</div>
			</h1>
			<section id="greeting">{greeting}</section>
		</main>
	);
};

export default App;
