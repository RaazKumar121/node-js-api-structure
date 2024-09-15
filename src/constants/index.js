const USER_STATUS = {
    ACTIVE: 1,
    INACTIVE: 0,
    BLOCKED: 3,
};
const OFFER_STATUS = {
    ACTIVE: 1,
    INACTIVE: 0,
    BLOCKED: 3,
};
const DEPOSIT_STATUS = {
    APROVED: 1,
    PENDING: 0,
    REJECTED: 3,
};

const TRANSACTION_TYPE = {
    WITHDRAW: 1,
    PENDING: 0,
};

module.exports = { USER_STATUS, DEPOSIT_STATUS,OFFER_STATUS }