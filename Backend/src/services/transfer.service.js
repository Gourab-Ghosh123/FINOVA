const createTransfer = (transferData) => {
    console.log(transferData);

    const fine = transferData.amount * 0.01;
    const totalAmount = transferData.amount + fine;

    return {
        message : "Proceeded Successfully!",
        amount : transferData.amount,
        fine : fine,
        totalAmount : totalAmount,
        transfer : transferData
    };
}

module.exports = {
    createTransfer
};