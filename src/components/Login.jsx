import React, { useState } from "react";
import { AuthClient } from '@dfinity/auth-client';
import {
  canisterId as backendCanisterID,
  createActor,
} from '../declarations/backend';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {canisterId as LedgerID, createActor as createLedgerActor} from "../declarations/icrc1_ledger_canister"

import UseData from "./useData";
const StakingApp = () => {
  const navigate = useNavigate();
const queryClient = useQueryClient();

const IdentityHost =
process.env.DFX_NETWORK === 'ic'
  ? 'https://identity.ic0.app/#authorize'
  : `http://localhost:4943?canisterId=${process.env.CANISTER_ID_INTERNET_IDENTITY}#authorize`;

const HOST =
process.env.DFX_NETWORK === 'ic'
  ? 'https://identity.ic0.app/#authorize'
  : 'http://localhost:4943';

const days = BigInt(1);
const hours = BigInt(24);
const nanoseconds = BigInt(3600000000000);

const defaultOptions = {
createOptions: {
  idleOptions: {
    // Set to true if you do not want idle functionality
    disableIdle: true,
  },
},
loginOptions: {
  identityProvider: IdentityHost,
  // Maximum authorization expiration is 8 days
  maxTimeToLive: days * hours * nanoseconds,
},
};


const handleLogin = async () => {
try {
  const authClient = await AuthClient.create(defaultOptions.createOptions);

  if (await authClient.isAuthenticated()) {
    handleAuthenticated(authClient);
  } else {
    await authClient.login({
      identityProvider: IdentityHost,
      onSuccess: () => {
        handleAuthenticated(authClient);
      },
    });
  }
} catch (error) {
alert(error)}
};



async function handleAuthenticated(authClient) {
if (!(await authClient?.isAuthenticated())) {
  navigate('/');
  return;
}
const identity = authClient.getIdentity();
const principal = identity.getPrincipal();

const actor = createActor(backendCanisterID, {
  agentOptions: {
    identity,
  },
});

const legActor = createLedgerActor(LedgerID,{
  agentOptions:{
    identity
  },
})

let balance = await legActor.icrc1_balance_of({
  owner:principal,
  subaccount:[]
})
const stakeData = await actor.get_user_stake_info(principal)


await Promise.all([
  queryClient.setQueryData(['tokenLedger'],legActor),
  queryClient.setQueryData(['userBalance'],Number(balance)/1e8),
  queryClient.setQueryData(['stakeData'], stakeData?.ok?stakeData.ok :{}),
  queryClient.setQueryData(['principal'], principal?.toString()),
  queryClient.setQueryData(['backendActor'], actor),
  queryClient.setQueryData(
    ['isAuthenticated'],
    await authClient?.isAuthenticated(),
  ),
])
navigate('/dashboard');
}


  return (
    <div
      className=" flex justify-center items-center h-full flex-col mt-16 w-full">
      <div className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900">Welcome to the Staking App</h2>
          <p className="text-gray-600">Earn passive income by staking your STT tokens.</p>
          <button className="bg-purple-400 text-white py-2 px-4 rounded mt-8" onClick={handleLogin}>
            Login
          </button>
        </div>
      </div>

    </div>
  );
};

export default StakingApp;


// dfx identity use default
// dfx canister call icrc1_ledger_canister icrc1_transfer "(record { to = record { owner = principal \"57moz-eg4uk-jgpky-ciygb-aopfv-5t7iy-dlrde-krfkc-z2dft-a2dml-wae\";};  amount = 1110000_000;})"
