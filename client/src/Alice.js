// Contains code for all calls performed by Alice

import {Button, Col} from 'react-bootstrap';
import {generate_secret, generate_shuffled_deck, N, deck} from './crypto.js';
import React from "react";
import * as bigintCryptoUtils from 'bigint-crypto-utils';
import { FaHandshake, FaLockOpen, FaDiceFive, FaCheck, FaUserCheck} from 'react-icons/fa';
/* global BigInt */

async function commit_alice({web3, accounts, game}) {
	// TODO add functions to add them to localstorage
	// TODO Perhaps print the error if there is an error!

	const secret = await generate_secret();
    const cards = generate_shuffled_deck(secret.K, N, deck);
    const ret = await game.methods
		  .commit_alice(cards.map(x => web3.utils.toHex(x.toString())))
		  .send( {from: accounts[0]}, function(err, val) { });

	// Add the corresponding index to local storage.
	const _index = ret.events.Play.returnValues._index;
	var indexes = JSON.parse(localStorage.getItem("indexes"));
	indexes.push(_index);
	localStorage.setItem("indexes", JSON.stringify(indexes));

	var data = JSON.parse(localStorage.getItem("data"));
	data[_index] = {"alice": {"K": secret.K.toString(), "L": secret.L.toString()}};
	localStorage.setItem("data", JSON.stringify(data));

}


export function CommitAlice({web3, accounts, game}) {
	return (

		<Button onClick={() => commit_alice({web3, accounts, game})}>
			<FaHandshake/>
		</Button>

 	)
}

async function play_alice({web3, accounts, game, index}) {

	// First we need to find the bobcard. For this we'll have to call the getInstance.
	// TODO Perhaps print the error if there is an error!

	const instance = await game.methods
		  .getInstance(web3.utils.toHex(index.toString()))
		  .call();

	const bob_card = instance.bob_card;
	// TODO Handle error when
	const L = BigInt(JSON.parse(localStorage["data"])[index]["alice"]["L"]);
	const bob_card_decrypted = bigintCryptoUtils.modPow(BigInt(bob_card), L, N);

    const ret = await game.methods
		  .play_alice(index, web3.utils.toHex(bob_card_decrypted.toString()))
		  .send( {from: accounts[0]}, function(err, val) { });
}

export function PlayAlice({web3, accounts, game, index}) {
	return (
		<Button onClick={() => play_alice({web3, accounts, game, index})}>
			<FaDiceFive/>
		</Button>

	)

}

async function reveal_alice({web3, accounts, game, index}) {
	const L = BigInt(JSON.parse(localStorage["data"])[index]["alice"]["L"]);

	const ret = await game.methods
		  .reveal_alice(index, web3.utils.toHex(L.toString()))
		  .send( {from: accounts[0]}, function(err, val) { });
}

export function RevealAlice({web3, accounts, game, index}) {
	return (
		<Button onClick={() => reveal_alice({web3, accounts, game, index})}>
			<FaLockOpen/>
		</Button>

	)
}

async function verify({web3, accounts, game, index}) {
	const ret = await game.methods
		  .verify(index)
		  .send( {from: accounts[0]}, function(err, val) { });

	const instance = await game.methods
		  .getInstance(index)
		  .call();
	console.log(instance);
}

export function Verify({web3, accounts, game, index}) {
	return (
		<Button variant="success"onClick={() => verify({web3, accounts, game, index})}>
			<b>Verify</b> <FaUserCheck/>
		</Button>
	)
}
