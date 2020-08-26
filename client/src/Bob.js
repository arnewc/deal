import {generate_secret, generate_shuffled_deck, N, deck} from './crypto.js';
import {Button, Col} from 'react-bootstrap';
import React from "react";
import * as bigintCryptoUtils from 'bigint-crypto-utils';
import { FaHandshake, FaLockOpen, FaDiceFive} from 'react-icons/fa';
/* global BigInt */


async function commit_bob({web3, accounts, game, index}){
	// TODO implement a function in the contract that can get an empty spot for bob to play against.
	const ret = await game.methods
	// TODO do I have to call toHex?
		  .commit_bob(index, Math.floor(Math.random()*52))
		  .send( {from: accounts[0]}, function(err, val) { });

	const secret = await generate_secret();
	var data = JSON.parse(localStorage.getItem("data"));

	const json =  {"K": secret.K.toString(), "L": secret.L.toString()};

	if (data.hasOwnProperty(index))
		data[index]["bob"] = json;
	else
		data[index] = {"bob": json};

	localStorage.setItem("data", JSON.stringify(data));
}

export function CommitBob({web3, accounts, game, index}) {
	return (
		<Button variant="danger" onClick={() => commit_bob({web3, accounts, game, index})}>
			<FaHandshake/>
		</Button>

	)
}

async function play_bob({web3, accounts, game, index}){
	const instance = await game.methods
		  .getInstance(index)
		  .call();

	const cards = instance.cards;

	var rand_index;
	do {
		rand_index = Math.floor(Math.random()*52);
	} while (rand_index == Number(instance.alice_index));

	const K = BigInt(JSON.parse(localStorage["data"])[index]["bob"]["K"]);

	const bob_card_encrypted = bigintCryptoUtils.modPow(BigInt(cards[rand_index]), K, N);

	const ret = await game.methods
		  .play_bob(index, web3.utils.toHex(bob_card_encrypted.toString()))
		  .send( {from: accounts[0]}, function(err, val) { });

}

export function PlayBob({web3, accounts, game, index}) {
	return (
		<Button variant="danger" onClick={() => play_bob({web3, accounts, game, index})}>
			<FaDiceFive/>
		</Button>
	)
}


async function reveal_bob({web3, accounts, game, index}) {
	const L = BigInt(JSON.parse(localStorage["data"])[index]["bob"]["L"]);

	const ret = await game.methods
		  .reveal_bob(web3.utils.toHex(index.toString()), web3.utils.toHex(L.toString()))
		  .send( {from: accounts[0]}, function(err, val) { });
}

export function RevealBob({web3, accounts, game, index}) {
	return (
		<Button variant="danger" onClick={() => reveal_bob({web3, accounts, game, index})}>
			<FaLockOpen/>
		</Button>

	)

}
