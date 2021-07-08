import React, { useState, useEffect } from 'react'
import { Wheel } from 'react-custom-roulette'
import { TezosToolkit } from '@taquito/taquito';
import { TempleWallet } from '@temple-wallet/dapp';
import NavbarAdmin from '../navbar/NavbarAdmin';
import {
    Container,
    Form,
    Input,
    FormGroup,
    Label,
    Button,
    Alert,
    Row,
    Col
} from "reactstrap"
const AdminRoulette = () => {
    const data = [
        0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
    ]
    const [randomLotto, setRandomLotto] = useState(1);
    const Tezos = new TezosToolkit('https://api.tez.ie/rpc/edonet');
    const [bet, setBet] = useState(null);
    const [errorMsg, setErrorMsg] = useState("");
    const [nbOfPlayers, setNbOfPlayers] = useState(null);
    const [msg, setMsg] = useState("");
    const getStorage = async () => {
        const contract = await Tezos.contract.at("KT1DQo26G6o76sXa9dEQpPbo8xnWrfraVKb2");
        const storage = await contract.storage();
        console.log(storage);
        setBet(storage.amountValue.s / 1000000)
        setNbOfPlayers(storage.count.c)
        console.log(storage);
    }
    const closeGame = () => {
        setErrorMsg("");
        TempleWallet.isAvailable()
            .then(() => {
                const mywallet = new TempleWallet('5IBC');
                mywallet.connect('edo2net').then(() => {
                    Tezos.setWalletProvider(mywallet);
                    return mywallet.getPKH()
                }).then((pkh) => {
                    Tezos.wallet
                        .at('KT1DQo26G6o76sXa9dEQpPbo8xnWrfraVKb2')
                        .then((contract) =>{
                            const randomElement = data[Math.floor(Math.random() * data.length)];
                            contract.methods.endGame(randomElement).send()
                        }
                        )
                        .then((op) => {
                            setMsg(`Hash: ${op.opHash}`)
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
    }, [])
    return (
        <Container fluid>
            <NavbarAdmin />
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
            <Container>
                <Row>
                    <Col className="text-center">
                        <h2>Current number of players is: {nbOfPlayers}</h2>
                        <Button onClick={closeGame}>Close Game</Button>
                    </Col>
                </Row>
            </Container>
        </Container>
    )
}

export default AdminRoulette;
