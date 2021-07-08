import React, { useEffect, useState } from 'react';
import NavbarPlayer from '../navbar/NavbarPlayer';
import {
    Form,
    Input,
    FormGroup,
    Label,
    Button,
    Alert
} from "reactstrap"
import { TezosToolkit } from '@taquito/taquito';
import { TempleWallet } from '@temple-wallet/dapp';
const Roulette = () => {
    const Tezos = new TezosToolkit('https://api.tez.ie/rpc/edonet');
    const [bet, setBet] = useState(null);
    const [numberToBet, setNumberToBet] = useState(null);
    const [errorMsg, setErrorMsg] = useState("");
    const getStorage = async () => {
        const contract = await Tezos.contract.at("KT1DQo26G6o76sXa9dEQpPbo8xnWrfraVKb2");
        const storage = await contract.storage();
        setBet(storage.amountValue.s/1000000)
    }
    const newPlayer = () => {
        setErrorMsg("");
        TempleWallet.isAvailable()
            .then(() => {
                const mywallet = new TempleWallet('5IBC');
                mywallet.connect('edo2net').then(() => {
                    Tezos.setWalletProvider(mywallet);
                    console.log(numberToBet);
                    return mywallet.getPKH()
                }).then((pkh) => {
                    Tezos.wallet
                        .at('KT1DQo26G6o76sXa9dEQpPbo8xnWrfraVKb2')
                        .then((contract) =>
                            contract.methods.newPlayer(numberToBet).send({ amount: bet })
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
        getStorage()
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
            <h1>Bet for Roulette</h1>
            <div>The current bet amount is: {bet} Tz</div>
            <Label for="exampleAddress">Number to bet on:</Label>
            <Input type="number" name="betNumber" id="betNumber" placeholder="Min amount: 1, Max amount: 50" onChange={e => setNumberToBet(e.target.value)}/>
            <Button onClick={newPlayer}>Play</Button>
        </div>
    );
};

export default Roulette;