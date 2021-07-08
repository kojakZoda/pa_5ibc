import React, { useEffect, useState } from 'react';
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
import NavbarAdmin from '../navbar/NavbarAdmin';
const Blackjack = ({ number, suit }) => {
    const Tezos = new TezosToolkit('https://api.tez.ie/rpc/edonet');
    const [bet, setBet] = useState(null);
    const [errorMsg, setErrorMsg] = useState("");
    const [balance, setBalance] = useState(null);
    const [amountToWithdraw, setAmountToWithdraw] = useState(null);
    const [currentPlayer, setCurrentPlayer] = useState("");
    const cards =
    [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,
    ];
    const [currentHand, setCurrentHand] = useState([]);
    const getStorage = async () => {
        const contract = await Tezos.contract.at("KT1AHz8XqbxKgxbzfvFH3DoVmh3SRgPEQ1qt");
        const storage = await contract.storage();
        console.log(storage);
        const balance = await Tezos.tz.getBalance("KT1AHz8XqbxKgxbzfvFH3DoVmh3SRgPEQ1qt");
        setBalance(balance.c);
        setBet(storage.amountValue.s / 1000000);
        setCurrentPlayer(storage.player);
    }
    const shuffle = () => {
        var currentIndex = cards.length, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // And swap it with the current element.
            [cards[currentIndex], cards[randomIndex]] = [
                cards[randomIndex], cards[currentIndex]];
        }
        cards.splice(13, 39);
        renderHand(cards);
        return cards;
    }
    const renderHand = (cards) => {
        const renderCards = []
        cards.forEach(hand => {
            renderCards.push(
                <div>{hand}</div>
            )
        })
        setCurrentHand(renderCards);
    }
    const cardPack = () => {
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
                        .then((contract) =>
                            contract.methods.cardPack(shuffle()).send()
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
    const withdraw = () => {
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
                        .then(async (contract) =>{
                            contract.methods.withdraw(amountToWithdraw).send()
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
    const handleWithdraw = (amount) => {
        setAmountToWithdraw(amount)
    }
    useEffect(() => {
        getStorage();
    },[])
    return (
        <div>
            <NavbarAdmin />
            {
                errorMsg !== "" &&
                <Alert color="danger">
                    {errorMsg}
                </Alert>
            }
            <h1>Setup Blackjack</h1>
            <div>The current bet amount is : {bet} Tz</div>
            <div>The current player is : {currentPlayer}</div>
            <Button onClick={cardPack}>Generate Game</Button>
            <div>The current balance is : {balance}</div>
            <Label for="exampleAddress">Amount to withdraw in Mutez:</Label>
            <Input type="text" name="amount" id="amountToBet" onChange={e => handleWithdraw(e.target.value)}/>
            <Button onClick={withdraw}>Withdraw</Button>
        </div>
    );
};

export default Blackjack;