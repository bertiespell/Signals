import { Proposal } from "../../../declarations/rust_avenue/rust_avenue.did";

export const proposalIsOpen = (proposal: Proposal) =>
getProposalState(proposal) === "Open";

export const getProposalState = (proposal: Proposal): string =>
    Object.keys(proposal.state)[0];