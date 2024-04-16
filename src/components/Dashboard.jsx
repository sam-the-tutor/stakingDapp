
import React, { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { canisterId as BackendID } from "../declarations/backend"
import { Principal } from "@dfinity/principal"
import { useNavigate } from "react-router-dom"
import UseData from "./useData"
const Dashboard = () => {

    const { invalidateUserBalance,invalidateUserStake} = UseData()

    const [stakeAmount, setStakeAmount] = useState(0)

    const navigate = useNavigate()

    const { data: isAuthenticated } = useQuery({
        queryKey: ['isAuthenticated'],
    });
    const { data: principal } = useQuery({
        queryKey: ['principal'],
    });
    const { data: userBalance } = useQuery({
        queryKey: ['userBalance'],
    });

    const { data: tokenLedger } = useQuery({
        queryKey: ['tokenLedger'],
    });

    const { data: backendActor } = useQuery({
        queryKey: ['backendActor'],
    });

    const { data: stakeData } = useQuery({
        queryKey: ['stakeData'],
    });

    const handleChange = (e) => {
        setStakeAmount(e.target.value)

    }

    const { mutateAsync: HandleStakeRequest } = useMutation({
        mutationFn: () => handleStake(),
        onSuccess: async () => {
            await invalidateUserBalance()          
              await invalidateUserStake()      
              },
    });


    const handleStake = async () => {
        try {
            if (!backendActor || !tokenLedger || !isAuthenticated) {
                alert("you need to login first")
                return
            } else if (stakeAmount >= userBalance) {
                alert("you dont have enought funds")
                return
            }

            let formattedStake = stakeAmount * 1e8;
            const approveResult = await tokenLedger.icrc2_approve({
                fee: [],
                memo: [],
                from_subaccount: [],
                created_at_time: [],
                amount: formattedStake + 10000,//add the 10000 which is the token transfer fee
                expected_allowance: [],
                expires_at: [],
                spender: {
                    owner: Principal.fromText(BackendID),
                    subaccount: []
                }
            })

            let stakeResults = await backendActor.stake_tokens(formattedStake);
            console.log("staking res :",stakeResults);
            stakeResults?.ok === null ? alert("staking successful") : alert(stakeResults.err)
            return stakeResults
        } catch (error) {
            console.log("error in stating :",error);
            alert(error)
        }
    }



    const { mutateAsync: HandleClaimRequest} = useMutation({
        mutationFn: () => handleClaim(),
        onSuccess: async () => {
            await invalidateUserBalance()          
              await invalidateUserStake()      
              },
    });

    const handleClaim = async () => {
        if (!backendActor || !tokenLedger || !isAuthenticated) {
            alert("you need to login first")
            return
        }
        try {
            let claimResults = await backendActor.claim_rewards();
            claimResults?.ok === null ? alert("claim successful") : alert(claimResults.err)
            return claimResults
        } catch (error) {
            alert(error)
        }
    }


    const { mutateAsync: HandleUnstakeRequest } = useMutation({
        mutationFn: () => handleUnstake(),
        onSuccess: async () => {
            await invalidateUserBalance()          
            await invalidateUserStake() 


        },
    });





    const handleUnstake = async () => {
        if (!backendActor || !tokenLedger || !isAuthenticated) {
            alert("you need to login first")
            return
        }
        let res = await backendActor.unstake_tokens()
        res?.ok === null ? alert("unstaking successdul") : alert(res.err)
        if (res.err) {
            alert(res.err)
        }
        return res;
    }

    return (
        <>
        {
            isAuthenticated?
            <div className="flex flex-col w-full min-h-full justify-center items-center">
            <h1 className="border-b-2 p-2 mb-8">Dashboard</h1>
            <div className="flex flex-col gap-2">
                <span>Principal ID</span>
                <span>{principal && principal}</span>
                <span>Balance : {userBalance && userBalance} STT</span>
            </div>
            {
                Object.keys(stakeData).length > 0 ?
                    // stakeData?.amount ?
                    <div className="flex flex-col justify-center items-center p-1 border rounded-md mt-6">
                        <span> Staked :{Number(stakeData.amount) / 1e8} STT </span>
                        <span>Rewards : {(Number(stakeData.rewards) / 1e8).toFixed(4)} STT</span>
                        <div className=" flex gap-3 p-2 mt-4">
                            <button onClick={HandleClaimRequest} className="text-sm">Claim Rewards</button>
                            <button onClick={HandleUnstakeRequest} className="text-sm">UnStake Tokens</button>
                        </div>
                    </div>
                    :
                    <div className="flex flex-col gap-4 border p-2 mt-6 ">
                        <input className="h-12" type="number" placeholder="enter stake amount" value={stakeAmount} onChange={handleChange} />
                        <button onClick={HandleStakeRequest}>Stake</button>
                    </div>
            }
        </div>
        :navigate("/")
        }
</>
    )
}

export default Dashboard
