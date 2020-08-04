const Migrations = artifacts.require("Migrations");
const Math = artifacts.require("Math");
const Game = artifacts.require("Game");

module.exports = function (deployer) {
	deployer.deploy(Migrations);
	deployer.deploy(Math);
	deployer.link(Math, Game);
	deployer.deploy(Game);
};
