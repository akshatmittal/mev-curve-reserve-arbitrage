// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.15;

abstract contract Executor {
    struct Call {
        address target;
        uint256 value;
        bytes data;
    }

    function _getRevertMsg(bytes memory _returnData) internal pure returns (string memory) {
        // If the _res length is less than 68, then the transaction failed silently (without a revert message)
        if (_returnData.length < 68) return "Reverted Silently";

        assembly {
            // Slice the sighash.
            _returnData := add(_returnData, 0x04)
        }
        return abi.decode(_returnData, (string)); // All that remains is the revert string
    }

    function executeCalls(Call[] memory calls) internal {
        for (uint256 i; i < calls.length; i++) {
            (bool success, bytes memory res) = calls[i].target.call{ value: calls[i].value }(calls[i].data);
            require(success, _getRevertMsg(res));
        }
    }
}
