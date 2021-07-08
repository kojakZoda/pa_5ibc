import React, { useEffect, useState } from 'react';
import NavbarPlayer from '../navbar/NavbarPlayer';
import { TezosToolkit } from '@taquito/taquito';
import { TempleWallet } from '@temple-wallet/dapp';
import {
    Button,
    Alert
} from "reactstrap"
const Blackjack = () => {
    const Tezos = new TezosToolkit('https://api.tez.ie/rpc/edonet');
    const [bet, setBet] = useState(null);
    const [errorMsg, setErrorMsg] = useState("");
    const [playerHand, setPlayerHand] = useState("");
    const [currentPlayer, setCurrentPlayer] = useState("");
    const [msg, setMsg] = useState("");
    const getStorage = async () => {
        const contract = await Tezos.contract.at("KT1AHz8XqbxKgxbzfvFH3DoVmh3SRgPEQ1qt");
        const storage = await contract.storage();
        setPlayerHand(storage.playerHand.c[0])
        setCurrentPlayer(storage.player)
        console.log(storage);
        setBet(storage.amountValue.s / 1000000);
    }
    const newPlayer = () => {
        setErrorMsg("");
        setMsg("");
        TempleWallet.isAvailable()
            .then(() => {
                const mywallet = new TempleWallet('5IBC');
                mywallet.connect('edo2net').then(() => {
                    Tezos.setWalletProvider(mywallet);
                    return mywallet.getPKH()
                }).then((pkh) => {
                    Tezos.wallet
                        .at('KT1AHz8XqbxKgxbzfvFH3DoVmh3SRgPEQ1qt')
                        .then((contract) =>{
                            if (pkh === currentPlayer){
                                setMsg("You're participating")
                            }
                            contract.methods.newPlayer(1).send({ amount: bet })
                        }
                        )
                        .then((op) => {
                            console.log(`Hash: ${op.opHash}`);
                            return op.confirmation();
                        })
                        .then((result) => {
                            console.log(result);
                            if (result.completed) {
                                console.log(`Transaction correctly processed!
                                Block: ${result.block.header.level}
                                Chain ID: ${result.block.chain_id}`);
                            } else {
                                console.log('An error has occurred');
                            }
                        })

                        .catch((err) => {
                            console.log(err)
                            setErrorMsg(err.message);
                        });
                });
            })
            .catch((err) => console.log(err));
    }
    const play = () => {
        setErrorMsg("");
        TempleWallet.isAvailable()
            .then(() => {
                const mywallet = new TempleWallet('5IBC');
                mywallet.connect('edo2net').then(() => {
                    Tezos.setWalletProvider(mywallet);
                    return mywallet.getPKH()
                }).then((pkh) => {
                    Tezos.wallet
                        .at('KT1AHz8XqbxKgxbzfvFH3DoVmh3SRgPEQ1qt')
                        .then((contract) =>{
                                contract.methods.startGame(1).send({ amount: bet })
                                getStorage()
                            }
                        )
                        .then((op) => {
                            console.log(`Hash: ${op.opHash}`);
                            return op.confirmation();
                        })
                        .then((result) => {
                            console.log(result);
                            if (result.completed) {
                                console.log(`Transaction correctly processed!
                                Block: ${result.block.header.level}
                                Chain ID: ${result.block.chain_id}`);
                            } else {
                                console.log('An error has occurred');
                            }
                        })

                        .catch((err) => {
                            console.log(err)
                            setErrorMsg(err.message);
                        });
                });
            })
            .catch((err) => console.log(err));
    }
    useEffect(()=>{
        getStorage();
    })
    return (
        <div>
            <NavbarPlayer/>
            {
                errorMsg !== "" &&
                <Alert color="danger">
                    {errorMsg}
                </Alert>
            }
            {
                msg !== "" &&
                <Alert color="info">
                    {msg}
                </Alert>
            }
            <h1>Play Blackjack</h1>
            <div>The current bet amount is: {bet} Tz</div>
            <Button onClick={newPlayer}>newPlayer</Button>
            <Button onClick={play}>Play</Button>
            {
                playerHand &&
                <h2>Final Score is : {playerHand}</h2>
            }
        </div>
    );
};

export default Blackjack;