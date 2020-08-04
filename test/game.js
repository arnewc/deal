const Game = artifacts.require("./Game.sol");
const Web3 = require("web3");
const web3 = new Web3();

// For simplicity we assume that the secrets for both bob and alice are K = 1, L = 1.

var deck = [161803398874989484820458683436563811772030917980576n, 286213544862270526046281890244970720720418939113748n,
            475408807538689175212663386222353693179318006076672n, 635443338908659593958290563832266131992829026788067n,
            520876689250171169620703222104321626954862629631361n, 443814975870122034080588795445474924618569536486444n,
            924104432077134494704956584678850987433944221254487n, 706647809158846074998871240076521705751797883416625n,
            624940758906970400028121042762177111777805315317141n, 11704666599146697987317613560067087480710131795236n,
            894275219484353056783002287856997829778347845878228n, 911097625003026961561700250464338243776486102838312n,
            683303724292675263116533924731671112115881863851331n, 620384005222165791286675294654906811317159934323597n,
            349498509040947621322298101726107059611645629909816n, 290555208524790352406020172799747175342777592778625n,
            619432082750513121815628551222480939471234145170223n, 735805772786160086883829523045926478780178899219902n,
            707769038953219681986151437803149974110692608867429n, 622675756052317277752035361393621076738937645560606n,
            59216589466759551900400555908950229530942312482355n, 212212415444006470340565734797663972394949946584578n,
            873039623090375033993856210242369025138680414577995n, 698122445747178034173126453220416397232134044449487n,
            302315417676893752103068737880344170093954409627955n, 898678723209512426893557309704509595684401755519881n,
            921802064052905518934947592600734852282101088194644n, 544222318891319294689622002301443770269923007803085n,
            261180754519288770502109684249362713592518760777884n, 665836150238913493333122310533923213624319263728910n,
            670503399282265263556209029798642472759772565508615n, 487543574826471814145127000602389016207773224499435n,
            308899909501680328112194320481964387675863314798571n, 911397815397807476150772211750826945863932045652098n,
            969855567814106968372884058746103378105444390943683n, 583581381131168993855576975484149144534150912954070n,
            50194775486163075422641729394680367319805861833918n, 328599130396072014455950449779212076124785645916160n,
            837059498786006970189409886400764436170933417270919n, 143365013715766011480381430626238051432117348151005n,
            590134561011800790506381421527093085880928757034505n, 78081454588199063361298279814117453392731208092897n,
            279222132980642946878242748740174505540677875708323n, 731097591511776297844328474790817651809778726841611n,
            763250386121129143683437670235037111633072586988325n, 871033632223810980901211019899176841491751233134015n,
            273384383723450093478604979294599158220125810459823n, 92552872124137043614910205471855496118087642657651n,
            106054588147560443178479858453973128630162544876114n, 852021706440411166076695059775783257039511087823082n,
            710647893902111569103927683845386333321565829659773n, 103436032322545743637204124406408882673758433953679n];

function assertEventOfType(response, eventName, _index, _address, _state) {
    assert.equal(response.logs[0].event, eventName, "The event did not fire.");
    assert.equal(response.logs[0].args._index, _index, "Wrong index.");
    assert.equal(response.logs[0].args._address, _address, "Wrong address.");
    assert.equal(response.logs[0].args._state, _state, "Wrong state.");
}

contract("Game", accounts => {
    it("initial index should be 0.", async () => {
        const game = await Game.deployed();

        const index = await game.index.call();

        assert.equal(index, 0, "Initial index is not 0.");
    });

    it("Check the value of N.", async () => {
        const game = await Game.deployed();

        const N = await game.N.call();

        assert.equal(N, 114229338781499300852999117797613317487529393292838994789209652886651289431457n, "Initial index is not 0.");
    });

    it("Check commit_alice", async () => {
        const game = await Game.deployed();

        const tx = await game.commit_alice(deck.map(x => web3.utils.toHex(x.toString())), {from: accounts[0]});

        assertEventOfType(tx, 'Play', 0, accounts[0], 0);

        let index = await game.index.call();
        assert.equal(index.toNumber(), 1, "The updated index returned is not 1.");
    });

    it("Check commit_bob", async () => {
        const game = await Game.deployed();

        const tx = await game.commit_bob(0, 5, {from: accounts[1]});

        assertEventOfType(tx, 'Play', 0, accounts[1], 1);
        assert.equal(tx.logs[0].args._index, 0, "Wrong index.");
        assert.equal(tx.logs[0].args._address, accounts[1], "Wrong address.");
        assert.equal(tx.logs[0].args._state, 1, "Wrong state.");
    });

    it("Check getInstance", async () => {
        const game = await Game.deployed();
        let instance = await game.getInstance.call(0, {from: accounts[0]});

        assert.equal(instance.alice, accounts[0], "Wrong address for alice.");
        assert.equal(instance.bob, accounts[1], "Wrong address for bob.");
    });

    it("Check play_bob", async () => {
        const game = await Game.deployed();

        const tx = await game.play_bob(0, web3.utils.toHex(deck[20].toString()), {from: accounts[1]});

        assertEventOfType(tx, 'Play', 0, accounts[1], 2);
    });

    it("Check play_alice", async () => {
        const game = await Game.deployed();

        const tx = await game.play_alice(0, web3.utils.toHex(deck[20].toString()), {from: accounts[0]});
        assertEventOfType(tx, 'Play', 0, accounts[0], 3);
    });

    it("Check reveal_alice", async () => {
        const game = await Game.deployed();

        const tx = await game.reveal_alice(0, 1, {from: accounts[0]});
        assertEventOfType(tx, 'Play', 0, accounts[0], 4);
    });

    it("Check reveal_bob", async () => {
        const game = await Game.deployed();

        const tx = await game.reveal_bob(0, 1, {from: accounts[1]});
        assertEventOfType(tx, 'Play', 0, accounts[1], 5);
    });

    it("Check verify", async () => {
        const game = await Game.deployed();

        const tx = await game.verify(0, {from: accounts[0]});
        assertEventOfType(tx, 'Play', 0, accounts[0], 6);
        // A second event is emitted since the state changes twice
        assert.equal(tx.logs[1].args._state, 7);
    });

    it("Check correctness of the data", async () => {
        const game = await Game.deployed();

        let instance = await game.getInstance.call(0, {from: accounts[0]});

        assert.equal(instance.state, 7, "Wrong state");
        assert.equal(instance.alice_secret, 1, "Wrong alice_secret");
        assert.equal(instance.bob_secret, 1, "Wrong bob_secret");
        assert.equal(instance.alice_index, 5, "Wrong alice_index");
        assert.equal(instance.bob_card, deck[20], "Wrong bob_card");
    });

});
