pragma circom 2.0.0;

include "lib/query/credentialAtomicQueryMTP.circom";

component main{public [challenge,
                        userID,
                        userState,
                        issuerID,
                        issuerClaimIdenState,
                        claimSchema,
                        slotIndex,
                        operator,
                        value,
                        timestamp]} = CredentialAtomicQueryMTP(32, 32, 64);
