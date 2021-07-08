import React, { useState, useEffect } from 'react'
import NavbarAdmin from '../navbar/NavbarAdmin';
import { TezosToolkit } from '@taquito/taquito';
import { TempleWallet } from '@temple-wallet/dapp';
import {
    Button,
    Alert,
    Row,
    Col,
    Container
} from "reactstrap"
const AdminLotto = () => {
    const [randomLotto, setRandomLotto] = useState(1);
    const Tezos = new TezosToolkit('https://api.tez.ie/rpc/edonet');
    const [bet, setBet] = useState(null);
    const [numberToBet, setNumberToBet] = useState(null);
    const [errorMsg, setErrorMsg] = useState("");
    const [msg, setMsg] = useState("");
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
            .catch((err) => {
                setErrorMsg(err.message);
                console.log(err)
            });
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
            {
                msg !== "" &&
                <Alert color="info">
                    {msg}
                </Alert>
            }
            <Container>
                <Row>
                    <Col className="text-center">
                        <Button onClick={endGame}>Close Game</Button>
                        <h2>
                            Winning number is: {randomLotto}
                        </h2>
                    </Col>
                </Row>
            </Container>
        </Container>
    )
}

export default AdminLotto;
