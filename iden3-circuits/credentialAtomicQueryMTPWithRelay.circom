pragma circom 2.0.0;

include "lib/query/credentialAtomicQueryMTPWithRelay.circom";

component main{public [challenge,
                        userID,
                        relayState,
                        issuerID,
                        claimSchema,
                        slotIndex,
                        operator,
                        value,
                        timestamp]} = CredentialAtomicQueryMTPWithRelay(32, 32, 32, 64);
