import React, { Component } from "react";
import Game from "./contracts/Game.json";
import getWeb3 from "./getWeb3";
import {K, L, N, deck, generate_shuffled_deck} from "./crypto";
import {Button} from 'react-bootstrap';
import {EventTable} from './Events.js';

import 'bootstrap/dist/css/bootstrap.min.css';
// import "./App.css";

class App extends Component {
    state = { storageValue: 0, web3: null, accounts: null,  game: null, N: 5, index: 100, _index: 0, eventData: []};


    componentDidMount = async () => {
        try {
            // Get network provider and web3 instance.
            // Use web3 to get the user's accounts.
            const web3 = await getWeb3();

            const accounts = await web3.eth.getAccounts();

            // Get the contract instance.
            const networkId = await web3.eth.net.getId();

            const gameDeployedNetwork = Game.networks[networkId];
            const gameInstance = new web3.eth.Contract(
                Game.abi,
                gameDeployedNetwork && gameDeployedNetwork.address,
            );

			gameInstance.events.Play({
				// TODO write a filter
				fromBlock: 0
			}, function(error, result){
				if(!error) {
					const event = {
						index: result.returnValues._index,
						address: result.returnValues._address,
						state: result.returnValues._state,
					};

					this.setState(prevState => ({
						eventData: [...prevState.eventData, event]
					}));

				}
				else {
					console.log("Event did not emit");
					console.log({error});
				}
			}.bind(this));

            this.setState({ web3, accounts, game: gameInstance, account: this.state.account}, this.runExample);
        } catch (error) {
            // Catch any errors for any of the above operations.
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`,
            );
            console.error(error);
        }
    };

    runExample = async () => {
        const { accounts, game } = this.state;

        // Stores a given value, 5 by default.
        // await contract.methods.set(25).send({ from: accounts[0] });

        // // Get the value from the contract to prove it worked.
        // const response = await contract.methods.get().call();
        // const _index = await game.methods.N().send({ from: accounts[0] });
        const _N = await game.methods.N().call({from: accounts[0]});
        const _index = await game.methods.index().call({from: accounts[0]});

        // const  _N = await game.methods.N().send({ from: accounts[0] });
        // const _N = await game.methods.N().call({from: accounts[0] });
        // console.log(_N);
        // const _index = await game.methods.index().send({ from: accounts[0] });

        // Update state with the result.
        this.setState({ N: _N, index: _index });
    };

    activateLasers() {
        console.log("Laser activated");
    }

    // First generate private information
    commit_alice = async() => {
        const {accounts, contract, game, web3} = this.state;
		// TODO add a step to generate private information.
		// TODO add functions to add them to localstorage
        const cards = generate_shuffled_deck(K, N, deck);
        const ret = await game.methods
			  .commit_alice(cards.map(x => web3.utils.toHex(x.toString())))
			  .send( {from: accounts[0]}, function(err, val) { });
    }

	handleGetIndex = async (event) => {
		this.setState({_index: event.target.value});
		// Make a call to getInstance
		const {accounts, game, web3, _index} = this.state;
		const instance = await game.methods
			  .getInstance(web3.utils.toHex(_index))
			  .call();
		console.log(instance);
	}

	handleSubmit(event) {
		console.log('GetIndex was submitted with the value: ' + this.state.value);
		event.preventDefault();
	}


    render() {
		console.log(this.state.eventData);
        if (!this.state.web3) {
            return <div>Loading Web3, accounts, and contract...</div>;
        }

		const data = [{
			index: 0,
			address: 1,
			state: 1,
		},];

        return (
                <div className="App">

                <h1>Deal! A trustless card game!</h1>
                <div>The stored value is: {this.state.storageValue}</div>
                <div>The value of N is: {this.state.N}</div>
                <div>The index is: {this.state.index}</div>
                <Button onClick={this.commit_alice}>commit_alice</Button>

				<EventTable data={this.state.eventData}/>

            </div>

        );
    }
}

export default App;
