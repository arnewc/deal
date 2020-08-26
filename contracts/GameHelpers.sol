// SPDX-License-Identifier: GPL v3
pragma solidity >= 0.7.0;
pragma experimental ABIEncoderV2;

import "./GameData.sol";

abstract contract GameHelpers is GameData
{
    modifier validIndex(uint _index)
    {
        require (
                _index < index,
                "Index out of bounds."
        );
        _;
    }

    modifier atState(uint _index, State _state)
    {
        require (
                 data[_index].state == _state,
                 "Function cannot be called at this state."
        );
        _;
    }

    modifier onlyAlice(uint _index)
    {
      require(
              msg.sender == data[_index].alice,
              "Sender is not Alice."
      );
      _;
    }

    modifier onlyBob(uint _index)
    {
      require(
              msg.sender == data[_index].bob,
              "Sender is not Bob."
      );
      _;
    }

    modifier transitionNext(uint _index)
    {
        _;
        data[_index].state = State(uint(data[_index].state) + 1);
    }

    function is_card_in_deck(uint card) internal view returns (bool)
    {
        for (uint i = 0; i < 52; ++i) {
            if (card == deck[i])
                return true;
        }
        return false;
    }

    function getInstance(uint _index) validIndex(_index) public view returns (Instance memory)
    {
        return data[_index];
    }

    event Play(address _address, uint _index, State _state);

	event Winner(uint _index, bool verified, bool isAlice);

	/// Finds a free spot to play, i.e., an instance whose state is waiting for bob to commit. The
	/// seed is used to start the search.
	function createMatch(uint seed) public view returns (uint _index)
	{
		require(index > 0, "Nobody has initiated play. Start as Alice.");
		seed = seed % index;

		if (data[seed].state == State.Commit_Bob)
			return seed;

		for (uint i = seed; i < seed; i = (i + 1) % seed)
		{
			if (data[i].state == State.Commit_Bob)
				return i;
		}

		require(false, "There are no empty spots. Start as Alice.");
	}
}
