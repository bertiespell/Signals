import React, { useEffect, useState } from "react";
import { AuthClient } from "@dfinity/auth-client";
import {
	idlFactory,
	rust_avenue,
	canisterId,
} from "../../../declarations/rust_avenue";
import { Actor, ActorSubclass, HttpAgent } from "@dfinity/agent";
import { _SERVICE } from "../../../declarations/avenue_assets/avenue_assets.did";

export const UserContext = React.createContext<{
	login: any;
	authenticatedActor: ActorSubclass<_SERVICE> | undefined;
}>({ login: undefined, authenticatedActor: undefined });

const UserProvider = ({ children }: any) => {
	const [authClient, setAuthClient] = useState<AuthClient>();
	const [authenticatedActor, setAuthenticatedActor] =
		useState<ActorSubclass<_SERVICE>>();

	useEffect(() => {
		internetIdentityLogin();
	}, []);

	useEffect(() => {
		if (authClient) login();
	}, [authClient]);

	const handleAuthenticated = async (authClient: AuthClient) => {
		const identity = await authClient.getIdentity();
		const agent = new HttpAgent({ identity });

		const whoami_actor = Actor.createActor<_SERVICE>(idlFactory, {
			agent,
			canisterId: canisterId as string,
		});

		const actorwhoami = await (whoami_actor as any).whoami();
		setAuthenticatedActor(whoami_actor);

		const whoami = await rust_avenue.whoami();
	};
	const internetIdentityLogin = async () => {
		const createdAuthClient = await AuthClient.create();
		setAuthClient(createdAuthClient);

		const authenticated = await createdAuthClient.isAuthenticated();

		if (authenticated) {
			handleAuthenticated(createdAuthClient);
		} else {
			console.log("Starting!");
			// login();
		}
	};

	const login = async () => {
		const login = await authClient?.login({
			onSuccess: async () => {
				handleAuthenticated(authClient);
			},
			onError: async (err: any) => {
				console.log("Oh no!", err);
			},
			// TODO: We'll want to remove this in production, or check an environment variable
			identityProvider: "http://localhost:8080",
		});
	};

	return (
		<UserContext.Provider value={{ login, authenticatedActor }}>
			{children}
		</UserContext.Provider>
	);
};

export default UserProvider;
