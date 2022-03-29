App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',

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
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        App.account = account[0]
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        console.log(account)
      }
    });

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('LuxChain.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var LuxChainArtifact = data;
      App.contracts.LuxChain = TruffleContract(LuxChainArtifact);

      // Set the provider for our contract
      App.contracts.LuxChain.setProvider(App.web3Provider);
      return App.bindEvents();
    })
    
    
  },

  bindEvents: function() {
    $(document).on('click', '#btn-mint', App.mintToken);
    

  },

  mintToken: async function() {
    var luxchainInstance;

    App.contracts.LuxChain.deployed().then(function(instance) {
      luxchainInstance = instance;
      var tkname = $("tk-name").value
      var tkto = $("tk-to").value
      var tkser = $("tk-ser").value

      console.log("test2")
      return instance.mint(tkto, tkser, tkname, { from: App.account })
    }).catch(function(err) {
      console.log(err.message);
    });
  },
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});