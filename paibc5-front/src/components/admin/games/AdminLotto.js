import React, { useState, useEffect } from 'react'
import { Container } from 'reactstrap'
import NavbarAdmin from '../navbar/NavbarAdmin';
import { TezosToolkit } from '@taquito/taquito';
import { TempleWallet } from '@temple-wallet/dapp';
import {
    Form,
    Input,
    FormGroup,
    Label,
    Button,
    Alert
} from "reactstrap"
const AdminLotto = () => {
    const [randomLotto, setRandomLotto] = useState(1);
    const Tezos = new TezosToolkit('https://api.tez.ie/rpc/edonet');
    const [bet, setBet] = useState(null);
    const [numberToBet, setNumberToBet] = useState(null);
    const [errorMsg, setErrorMsg] = useState("");
    const getStorage = async () => {
        const contract = await Tezos.contract.at("KT1L3XfPcEovqyXVN6G31BBm5d7rQ4D7J4Hd");
        const storage = await contract.storage();
        setBet(storage.amountValue.s / 1000000)
    }
    const endGame = () => {
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
                        .at('KT1L3XfPcEovqyXVN6G31BBm5d7rQ4D7J4Hd')
                        .then((contract) =>
                            contract.methods.endGame(randomLotto).send()
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
    useEffect(() => {
        getStorage()
        const rndInt = Math.floor(Math.random() * 1000) + 1
        setRandomLotto(rndInt);
    },[])
    return (
        <Container fluid>
            <NavbarAdmin/>
            {
                errorMsg !== "" &&
                <Alert color="danger">
                    {errorMsg}
                </Alert>
            }
            <Button onClick={endGame}>Close Game</Button>
            <h2>
                Winning number is: {randomLotto}
            </h2>
        </Container>
    )
}

export default AdminLotto;
