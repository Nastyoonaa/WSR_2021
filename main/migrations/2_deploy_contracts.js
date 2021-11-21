const Shop = artifacts.require('Shop')

module.exports = async (deployer, network, accounts) => {
    await deployer.deploy(Shop)
    const shop = Shop.deployed()
}