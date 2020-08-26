// SPDX-License-Identifier: GPL v3
pragma solidity >= 0.7.0;
pragma experimental ABIEncoderV2;

import "./Math.sol";
import "./GameHelpers.sol";

contract Game is GameHelpers
{
    function commit_alice(uint[52] memory cards)
        public
        returns (uint _index)
    {
        Instance memory instance;
        instance.alice = msg.sender;
        instance.cards = cards;
        instance.state = State.Commit_Bob;
        _index = index;

        emit Play(msg.sender, _index, State.Commit_Alice);
        data[_index] = instance;
        ++index;
    }

    function commit_bob(uint _index, uint8 alice_index)
        validIndex(_index)
        atState(_index, State.Commit_Bob)
        transitionNext(_index)
        public
        returns (uint[52] memory)
    {
        data[_index].bob = msg.sender;
        data[_index].alice_index = alice_index;

        emit Play(msg.sender, _index, State.Commit_Bob);
        return data[_index].cards;
    }

    function play_bob(uint _index, uint card)
        validIndex(_index)
        onlyBob(_index)
        atState(_index, State.Play_Bob)
        transitionNext(_index)
        public
    {
        emit Play(msg.sender, _index, State.Play_Bob);
        data[_index].bob_card = card;
    }

    function play_alice(uint _index, uint _bob_card)
        validIndex(_index)
        onlyAlice(_index)
        atState(_index, State.Play_Alice)
        transitionNext(_index)
        public
    {
        emit Play(msg.sender, _index, State.Play_Alice);
        data[_index].bob_card = _bob_card;
    }

    function reveal_alice(uint _index, uint alice_secret)
        validIndex(_index)
        onlyAlice(_index)
        atState(_index, State.Reveal_Alice)
        transitionNext(_index)
        public
    {
        emit Play(msg.sender, _index, State.Reveal_Alice);
        data[_index].alice_secret = alice_secret;
    }

    function reveal_bob(uint _index, uint bob_secret)
        validIndex(_index)
        onlyBob(_index)
        atState(_index, State.Reveal_Bob)
        transitionNext(_index)
        public
    {
        emit Play(msg.sender, _index, State.Reveal_Bob);
        data[_index].bob_secret = bob_secret;
    }

    function verify(uint _index)
        validIndex(_index)
        atState(_index, State.Verify)
        public returns (bool, address)
    {
		Instance memory instance = data[_index];
        uint alice_card_decrypted =
            Math.expmod(instance.cards[instance.alice_index], instance.alice_secret, N);
        uint bob_card_decrypted =
            Math.expmod(instance.bob_card, instance.bob_secret, N);

        bool verify_alice = is_card_in_deck(alice_card_decrypted);
        bool verify_bob = is_card_in_deck(bob_card_decrypted);

        emit Play(msg.sender, _index, State.Verify);
        data[_index].state = State.Done;
        emit Play(msg.sender, _index, State.Done);

        if (!verify_alice || !verify_bob)
		{
			emit Winner(_index, false, false);
			return (false, address(0));
		}

		bool isAlice = alice_card_decrypted > bob_card_decrypted;
		emit Winner(_index, true, isAlice);

        /* Picking a winner based on who has the "largest hand" */
        return (
                true,
				isAlice ? data[_index].alice : data[_index].bob
        );
    }
}
