App = {
    web3Provider: null,
    contracts: {},
    account: "0x0",

    init: async function() {
        // Load Anything for the website
        return await App.initWeb3();
    },

    initWeb3: async function() {
        // Modern dapp browsers...
        if (window.ethereum) {
            App.web3Provider = window.ethereum;
            try {
                // Request account access
                const accounts = await ethereum.request({
                    method: "eth_requestAccounts",
                });
                App.account = accounts[0];
            } catch (error) {
                // User denied account access...
                console.error("User denied account access");
            }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
            App.web3Provider = window.web3.currentProvider;
        }
        // If no injected web3 instance is detected, fall back to Ganache
        else {
            App.web3Provider = new Web3.providers.HttpProvider(
                "http://localhost:7545"
            );
        }
        web3 = new Web3(App.web3Provider);

        web3.eth.getCoinbase(function(err, account) {
            if (err === null) {
                App.account = account;
                console.log(account);
            }
        });

        return App.initContract();
    },

    initContract: function() {
        $.getJSON("LuxChain.json", function(data) {
            // Get the necessary contract artifact file and instantiate it with truffle-contract
            var LuxChainArtifact = data;
            App.contracts.LuxChain = TruffleContract(LuxChainArtifact);

            // Set the provider for our contract
            App.contracts.LuxChain.setProvider(App.web3Provider);
            App.listernForEvent();
            return App.bindEvents();
        });
    },

    listernForEvent: function() {
        App.contracts.LuxChain.deployed().then(function(instance) {
            instance
                .mintToken(
                    {},
                    {
                        fromBlock: "latest",
                        toBlock: "latest",
                    }
                )
                .watch(function(error, event) {
                    console.log("event triggered", event.args.tokenId);
                });
        });
    },

    bindEvents: function() {
        $(document).on("click", "#btn-mint", App.mintToken);
        $(document).on("click", "#btn-owner", App.tokenOwner);
        $(document).on("click", "#btn-tran", App.transferToken);
        $(document).on("click", "#btn-serial", App.tokenSerial);
    },

    mintToken: async function() {
        var luxInstance;
        App.contracts.LuxChain.deployed()
            .then(function(instance) {
                luxInstance = instance;
                var tkname = document.getElementById("tk-name").value;
                var tkto = document.getElementById("tk-to").value;
                var tkser = document.getElementById("tk-ser").value;
                return instance.mint(tkto, tkser, tkname, {
                    from: App.account,
                });
            })
            .then(() => {
                document.getElementById("tk-name").value = " ";
                document.getElementById("tk-to").value = " ";
                document.getElementById("tk-ser").value = " ";
            })
            .catch(function(err) {
                console.log(err.message);
            });
    },

    tokenOwner: async function() {
        var tkid = document.getElementById("ownerof").value;

        App.contracts.LuxChain.deployed()
            .then(function(instance) {
                return instance.ownerOf(tkid);
            })
            .then(function(add) {
                console.log("test2");
                return (document.getElementById("tk-owner").innerHTML =
                    "The owner address is:" + add);
            })
            .catch(function(err) {
                if (err.message === "Internal JSON-RPC error.") {
                    alert("There is no such token.");
                    document.getElementById("ownerof").value = " ";
                }
                console.log(err.message);
            });
    },

    tokenSerial: async function() {
        var tkid = document.getElementById("serof").value;

        App.contracts.LuxChain.deployed()
            .then(function(instance) {
                return instance.viewSerialNumber(tkid);
            })
            .then(function(ser) {
                return (document.getElementById("tk-serial").innerHTML =
                    "The token serial number is:" + ser);
            })
            .catch(function(err) {
                console.log(err.message);
            });
    },

    transferToken: async function() {
        var tkto = document.getElementById("tk-tranto").value;
        var tkid = document.getElementById("tk-id").value;
        App.contracts.LuxChain.deployed()
            .then(function(instance) {
                console.log(tkto);
                console.log(tkid);
                return instance.transferFrom(App.account, tkto, tkid, {
                    from: App.account,
                    to: tkto
                });
            })
            .catch(function(err) {
                console.log(err.message);
            });
    },
};

$(function() {
    $(window).load(function() {
        App.init();
    });
});
