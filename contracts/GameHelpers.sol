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

    function getInstance(uint _index) validIndex(_index) public returns (Instance memory)
    {
        return data[_index];
    }

    event Play(address _address, uint _index, State _state);
}
