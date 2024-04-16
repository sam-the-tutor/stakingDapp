import React from "react"
import { useQuery, useQueryClient, } from '@tanstack/react-query'
import { Principal } from "@dfinity/principal";


const UseData = () => {

    const queryClient = useQueryClient();

    const { data: isAuthenticated } = useQuery({
        queryKey: ['isAuthenticated'],
    });

    const { data: principal } = useQuery({
        queryKey: ['principal'],
    });
    const { data: backendActor } = useQuery({
        queryKey: ['backendActor'],
    });

    const { data: tokenLedger } = useQuery({
        queryKey: ['tokenLedger'],
    });


    const bal = useQuery({
        queryKey: ['userBalance'],
        queryFn: () => loadUserBalance(),
    });


    const loadUserBalance = async () => {
        try {

            if (!isAuthenticated || !principal || !tokenLedger) {
                alert("login first")
                return
            }

            let tokenBal = await tokenLedger?.icrc1_balance_of({
                owner: Principal.fromText(principal),
                subaccount: []
            })
            return Number(tokenBal) / 1e8
        } catch (error) {
            alert(error)
        }
    }


    const stake = useQuery({
        queryKey: ['stakeData'],
        queryFn: () => loadUserStakeInfo(),
    });

    const loadUserStakeInfo = async () => {
        try {
            if (!isAuthenticated || !principal || !backendActor) { return }
            let userStake = await backendActor.get_user_stake_info(Principal.fromText(principal))
            return userStake?.ok ? userStake.ok : {}
        } catch (error) {
            alert(error)
        }
    }

    const invalidateUserBalance = async () => {
        await queryClient.invalidateQueries(['userBalance']);
    }

    const invalidateUserStake = async () => {
        await queryClient.invalidateQueries(['stakeData'])
    }

    return {
        invalidateUserBalance,
        invalidateUserStake

    }
}

export default UseData
