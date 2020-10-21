import React, { Component } from "react";
import Game from "./contracts/Game.json";
import getWeb3 from "./getWeb3";
import {Button, Container, Row, Col, Form, Table, InputGroup} from 'react-bootstrap';
import {EventTable} from './Events.js';
import {WinnerTable} from './Winner.js';
import {CommitAlice, PlayAlice, RevealAlice, Verify} from './Alice.js';
import {CommitBob, PlayBob, RevealBob} from './Bob.js';

import 'bootstrap/dist/css/bootstrap.min.css';
// import "./App.css";

class App extends Component {
    state = {
		web3: null,
		accounts: null,
		game: null,
		index: 0,
		eventData: [],
		winnerData: [],
	};

	decodeState(_state) {
		const states = [
			"Commit Alice", "Commit Bob", "Play Bob", "Play Alice", "Verify Alice", "Verify Bob", "Verify", "Done"
		];

		return states[_state];
	}


    componentDidMount = async () => {
        try {
            const web3 = await getWeb3();
            const accounts = await web3.eth.getAccounts();
            const networkId = await web3.eth.net.getId();
            const gameDeployedNetwork = Game.networks[networkId];
            const gameInstance = new web3.eth.Contract(
                Game.abi,
                gameDeployedNetwork && gameDeployedNetwork.address,
            );

			// Initialize elements in localStorage if it doesn't exist.
			const indexes = localStorage.getItem("indexes");
			if (!indexes)
				localStorage.setItem("indexes", JSON.stringify([]));
			const data = localStorage.getItem("data");
			if (!data)
				localStorage.setItem("data", JSON.stringify({}));

			// Everytime we start, we need to check for the current status. Maybe one of the state
			// variable would be index and state of what's going on right now.
			var latestBlock = web3.eth.blockNumber;

			console.log("hello");

			gameInstance.events.Play({
				fromBlock: 0
			}, function(error, result){
				if(!error) {
					const event = {
						index: result.returnValues._index,
						address: result.returnValues._address,
						state: this.decodeState(result.returnValues._state),
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

			gameInstance.events.Winner({
				fromBlock: 0
			}, function(error, result){
				console.log({error, result});
				if(!error) {
					const event = {
						index: result.returnValues._index,
						verified: result.returnValues.verified? "Yes": "No",
						winner: result.returnValues.isAlice ? "Alice" : "Bob",
					};

					this.setState(prevState => ({
						winnerData: [...prevState.winnerData, event]
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
        console.log
("Laser activated");
    }

	// TODO Is it possible to take a parameter?
	play_bob = async() => {
		console.log(1);
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

	handleIndexInput = (e) => {
		console.log(e);
		this.setState({index: e.target.value});
		console.log(this.state.index);
	}


    render1() {
        if (!this.state.web3) {
            return <div>Loading Web3, accounts, and contract...</div>;
        }

        return (
            <div className="App">

				<Container>

					<Row>
						<h1>Deal! A trustless card game!</h1>
					</Row>


					<Row>
						<Col>
							<CommitAlice web3={this.state.web3} accounts={this.state.accounts} game={this.state.game}/>
						</Col>

						<Col>
							<Row>
								<CommitBob web3={this.state.web3} accounts={this.state.accounts} game={this.state.game} index={this.state.index}/>
							</Row>

							<Row>
								<Form.Group as={Row} controlId="seed">
									<Form.Label column sm="2">
										Seed
									</Form.Label>
									<Col sm="10">

										<Form.Control type="number" placeholder="leave empty for random" onChange={this.handleIndexChange}/>
									</Col>
								</Form.Group>

							</Row>
						</Col>


					</Row>

					<Row>
						You don't have anything to do now!
					</Row>

					<Row>
						<PlayAlice web3={this.state.web3} accounts={this.state.accounts} game={this.state.game} index={this.state.index}/>
					</Row>


					<Row>
						<EventTable data={this.state.eventData}/>
					</Row>


				</Container>
			</div>

        );
    }

	render() {

		const {web3, accounts, index, game} = this.state;
		return (
			<body>
				<Container>
					<h1>Deal: A trustless cardgame!</h1>
					<Form.Control type="number" placeholder="Index to interact with" onChange={this.handleIndexInput}/>
					<Table bordered hover>
						<thead>
							<tr>
								<th></th>
								<th>Alice</th>
								<th>Bob</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td><b>Commit</b></td>
								<td><CommitAlice web3={web3} accounts={accounts} game={game}/></td>
								<td><CommitBob web3={web3} accounts={accounts} game={game} index={index}/></td>
							</tr>

							<tr>
								<td><b>Play</b></td>
								<td><PlayAlice web3={web3} accounts={accounts} game={game} index={index}/></td>
								<td><PlayBob web3={web3} accounts={accounts} game={game} index={index}/></td>
							</tr>

							<tr>
								<td><b>Reveal</b></td>
								<td><RevealAlice web3={web3} accounts={accounts} game={game} index={index}/></td>
								<td><RevealBob web3={web3} accounts={accounts} game={game} index={index}/></td>
							</tr>
						</tbody>
					</Table>
					<Verify web3={web3} accounts={accounts} game={game} index={index}/>
					<EventTable data={this.state.eventData}/>
					<WinnerTable data={this.state.winnerData}/>
				</Container>
			</body>
		);


	}
}

export default App;
