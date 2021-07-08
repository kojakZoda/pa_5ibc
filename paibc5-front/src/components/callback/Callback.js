import React, { useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";
import Cookies from 'universal-cookie';
import { TezosToolkit } from '@taquito/taquito';
import { TempleWallet } from '@temple-wallet/dapp';
import Axios from "axios"

const Callback = () => {
    const { user, isAuthenticated, getAccessTokenWithPopup } = useAuth0();
    const [token, setToken] = useState();
    const [ownerAddrs, setOwnerAddrs] = useState([]);
    const [isAdmin, setIsAdmin] = useState("");
    const [isPlayer, setIsPlayer] = useState("");
    const cookies = new Cookies();
    const Tezos = new TezosToolkit('https://api.tez.ie/rpc/edonet');
    const getStorage = async () => {
        const contract = await Tezos.contract.at("KT1AHz8XqbxKgxbzfvFH3DoVmh3SRgPEQ1qt");
        const storage = await contract.storage();
        const owners = []
        console.log(storage);
        setOwnerAddrs(storage.admins);
    }

    const getAuth0Token = async (addr) => {
        if(user){
            try {
                const accessToken = await getAccessTokenWithPopup({
                    audience: '5ibc-esgi',
                    scope: "openid read:current_user update:current_user_metadata read:current_user_metadata",
                });
                console.log(accessToken);
                const headers = {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
                console.log(user);
                const data = {
                    user,
                    "address": addr
                }
                Axios.post("http://localhost:3005/user", data, {
                    headers: headers
                })
                    .then((res) => {
                        console.log(res);
                    })
                    .catch((err) => {
                        console.log(err);
                    })
                const userDetailsByIdUrl = `5ibc-esgi/userinfo`;
                // console.log(user);
                // const metadataResponse = await fetch(userDetailsByIdUrl, {
                //     headers: {
                //         Authorization: `Bearer ${accessToken}`,
                //     },
                // });
                // console.log(accessToken);
                // const { user_metadata } = await metadataResponse.json();
                // console.log(user_metadata);
                setToken(accessToken);
            } catch (e) {
                console.log(e);
            }
        }
    };

    useEffect(() => {
        getStorage();
    }, [])
    useEffect(() => {
        cookies.set('access_token', token,
            {
                path: '/',
                expirationDate: Date.now() + 3600
            }
        );
    }, [token]);
    useEffect(()=>{
        TempleWallet.isAvailable()
            .then(() => {
                const mywallet = new TempleWallet('5IBC');
                mywallet.connect('edo2net').then(() => {
                    Tezos.setWalletProvider(mywallet);
                    return mywallet.getPKH()
                }).then((pkh) => {
                    getAuth0Token(pkh)
                    let admin = "";
                    if(ownerAddrs.length !== 0){
                        console.log(ownerAddrs);
                        ownerAddrs.forEach(addr => {
                            if (addr === pkh) {
                                admin = true;
                            }
                        })
                        if (admin === "") {
                            setIsAdmin(false)
                        } else {
                            setIsAdmin(true)
                        }
                    }
                });
            })
            .catch((err) => console.log(err));
    }, [ownerAddrs])

    useEffect(()=>{
        if(isAdmin === true){
            setIsPlayer(false);
        }else if(isAdmin === false){
            setIsPlayer(true);
        }
    },[isAdmin])

    return (
        <div>
            {
                isAuthenticated && isAdmin === true &&
                <Redirect to={{
                    pathname: "/admin"
                }} />
            }
            {
                isAuthenticated && isAdmin === false && isPlayer === true &&
                <Redirect to={{
                    pathname: "/"
                }} />
            }
        </div>
    )
};
export default Callback;