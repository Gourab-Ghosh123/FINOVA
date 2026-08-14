const createTransfer = (transferData) => {
    console.log(transferData);

    return {
        message : "Proceeded Successfully!",
        transfer : transferData
    };
}

module.exports = {
    createTransfer
};