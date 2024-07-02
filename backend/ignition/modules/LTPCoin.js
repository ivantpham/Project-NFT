const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("CoinModule", (m) => {

  const ltp = m.contract("LiquidityTrustProtocol");

  return { ltp };
});
