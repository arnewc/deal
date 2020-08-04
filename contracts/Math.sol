// SPDX-License-Identifier: GPL v3
pragma solidity >= 0.7.0;

library Math {
    // Based on https://github.com/ethereum/solidity/blob/12d0d6ab3428bee619432f281fbf3f51633cf669/libsolidity/codegen/YulUtilFunctions.cpp#L611
    function expmod(uint base, uint exponent, uint mod_n) public pure returns (uint power)
    {
        assembly {
            // 0**0 == 1
            switch exponent case 0 { power := 1 } case 1 { power := base }
            power := 1
            for { } gt(exponent, 1) {} {
                if and(exponent, 1) { power := mulmod(power, base, mod_n) }
                base := mulmod(base, base, mod_n)
                exponent := shr(1, exponent)
            }
            power := mulmod(power, base, mod_n)
        }
    }
}
