import React, { useEffect, useState } from "react";
import { AuthClient } from "@dfinity/auth-client";
import {
	rust_avenue,
	canisterId,
	createActor,
} from "../../../declarations/rust_avenue";
import { Actor, ActorSubclass, HttpAgent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import {
	_SERVICE,
	Profile,
} from "../../../declarations/rust_avenue/rust_avenue.did";

export const UserContext = React.createContext<{
	login: any;
	authenticatedActor: ActorSubclass<_SERVICE> | undefined;
	authenticatedUser: Principal | undefined;
	user: Profile | undefined;
}>({
	login: undefined,
	authenticatedActor: undefined,
	authenticatedUser: undefined,
	user: undefined,
});

const UserProvider = ({ children }: any) => {
	const [authClient, setAuthClient] = useState<AuthClient>();
	const [authenticatedActor, setAuthenticatedActor] =
		useState<ActorSubclass<_SERVICE>>();
	const [authenticatedUser, setAuthenticatedUser] = useState<Principal>();
	const [user, setUser] = useState<Profile>();

	useEffect(() => {
		checkUserMetadata();
	}, [authenticatedActor]);

	useEffect(() => {
		internetIdentityLogin();
	}, []);

	useEffect(() => {
		if (authClient) login();
	}, [authClient]);

	const checkUserMetadata = async () => {
		const userDetails = await authenticatedActor?.get_user_self();
		setUser(userDetails);
	};

	const handleAuthenticated = async (authClient: AuthClient) => {
		const identity = await authClient.getIdentity();
		const whoami_actor = createActor(canisterId as string, {
			agentOptions: {
				identity,
			},
		});
		const actorwhoami = await whoami_actor.whoami();
		setAuthenticatedActor(whoami_actor);
		setAuthenticatedUser(actorwhoami);
	};

	const internetIdentityLogin = async () => {
		const createdAuthClient = await AuthClient.create();
		setAuthClient(createdAuthClient);
		const authenticated = await createdAuthClient.isAuthenticated();
		if (authenticated) {
			handleAuthenticated(createdAuthClient);
		}
	};

	const login = async () => {
		await authClient?.login({
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
		<UserContext.Provider
			value={{ login, authenticatedActor, authenticatedUser, user }}
		>
			{children}
		</UserContext.Provider>
	);
};

export default UserProvider;
