const { expect } = require("chai");
const { ethers } = require("hardhat");


describe("Dambyurak Token", () => {
    let owner, others;
    
    let contract;

    before(async () => {
        [owner, ...others] = await ethers.getSigners();
    });

    const baseTokenURI = 'ipfs://SOMERANDOMFAKECID/WALL-';
    const tokenSuffix = '.json';
    const baseAssetURI = 'http://127.0.0.1:8000/metadata/WALL-';
    const assetSuffix = '.json';

    beforeEach(async () => {
        const Dambyurak = await ethers.getContractFactory("Dambyurak");

        contract = await Dambyurak.deploy(
            baseTokenURI, tokenSuffix, baseAssetURI, assetSuffix
        );
        await contract.deployed();
    });

    context("Token Minting", async () => {
        it("Should increase totalSupply on new mint", async () => {
            expect(await contract.totalSupply()).to.equal(0);

            const tx1 = await contract.safeMint(owner.address);
            await tx1.wait();
            
            expect(await contract.totalSupply()).to.equal(1);

            const tx2 = await contract.safeMint(owner.address);
            await tx2.wait();
            
            expect(await contract.totalSupply()).to.equal(2);
        });

        it("Should return correct token and asset URI", async () => {
            const tx1 = await contract.safeMint(owner.address);
            await tx1.wait();

            expect(await contract.tokenURI(1)).to.equal(baseTokenURI + '1' + tokenSuffix);
            expect(await contract.assetURI(1)).to.equal(baseAssetURI + '1' + assetSuffix);
        })

        it("Should update base URI correctly", async () => {
            let tx = await contract.safeMint(owner.address);
            await tx.wait();
            const newBaseTokenURI = "ipfs://SOMENEWEIRDCID/metadata/WALL-";
            const newBaseAssetURI = "https://some.new.uri/";
            tx = await contract.setBaseTokenURI(newBaseTokenURI);
            tx.wait();
            tx = await contract.setBaseAssetURI(newBaseAssetURI);
            tx.wait();

            expect(await contract.tokenURI(1)).to.equal(newBaseTokenURI + '1' + tokenSuffix);
            expect(await contract.assetURI(1)).to.equal(newBaseAssetURI + '1' + assetSuffix);
        });

        it("Should update suffix correctly", async () => {
            let tx = await contract.safeMint(owner.address);
            await tx.wait();
            const newTokenSuffix = ".md";
            const newAssetSuffix = "";
            tx = await contract.setTokenSuffix(newTokenSuffix);
            tx.wait();
            tx = await contract.setAssetSuffix(newAssetSuffix);
            tx.wait();
            
            expect(await contract.tokenURI(1)).to.equal(baseTokenURI + '1' + newTokenSuffix);
            expect(await contract.assetURI(1)).to.equal(baseAssetURI + '1' + newAssetSuffix);
        })
    })

    context("Writing on Wall", async () => {
        let tokenId;

        beforeEach(async () => {
            // Mint a new token each time
            const tx = await contract.safeMint(owner.address);
            const rc = await tx.wait();
            const event = rc.events[0];
            tokenId = event.args[2].toNumber();
        })

        it("Should write on wall correctly with a correct content", async () => {
            expect(await contract.nakseoCount(tokenId)).to.equal(1);
            const tx = await contract.connect(owner).writeOnWall(tokenId, "Hello World");
            await tx.wait();

            expect(await contract.nakseoCount(tokenId)).to.equal(2);
            const [writer, content] = await contract.nakseo(tokenId, 1);
            expect(writer).to.equal(owner.address);
            expect(content).to.equal("Hello World");
        });

        it("Should set correct writePrice for wall", async () => {
            expect(await contract.writePrice(tokenId)).to.equal(0);
            const price = ethers.utils.parseEther("10");
            const tx = await contract.connect(owner).setWritePrice(tokenId, price);
            await tx.wait();

            expect(await contract.writePrice(tokenId)).to.equal(price);
        });

        it("Should not let others to set writePrice for wall", async () => {
            const price = ethers.utils.parseEther("10");
            await expect(contract.connect(others[0]).setWritePrice(tokenId, price))
                .to.be.revertedWith('');
        });

        it("Should make user pay for writing", async () => {
            const price = ethers.utils.parseEther("10.0");
            const tx = await contract.connect(owner).setWritePrice(tokenId, price);
            await tx.wait();

            await expect(contract.connect(others[0]).writeOnWall(tokenId, "Hello World"))
                .to.be.revertedWith("Dambyurak: Writing price is not enough");
            await expect(contract.connect(others[0]).writeOnWall(tokenId, "Hello World", { value: ethers.utils.parseEther("20.0") }))
                .to.be.revertedWith("Dambyurak: Writing price is not enough");
            
            await contract.connect(others[0]).writeOnWall(tokenId, "Hello World", { value: price });

            expect(await contract.nakseoCount(tokenId)).to.equal(2);
        });

        it("Should not make owner pay for writing", async () => {
            const price = ethers.utils.parseEther("10.0");
            const tx = await contract.connect(owner).setWritePrice(tokenId, price);
            await tx.wait();

            await expect(contract.connect(owner).writeOnWall(tokenId, "Hello World", { value: price }))
                .to.be.revertedWith("Dambyurak: Owner does not have to pay to write");
            await expect(contract.connect(owner).writeOnWall(tokenId, "Hello World", { value: ethers.utils.parseEther("20.0") }))
                .to.be.revertedWith("Dambyurak: Owner does not have to pay to write");

                await contract.connect(owner).writeOnWall(tokenId, "Hello World");

                expect(await contract.nakseoCount(tokenId)).to.equal(2);
        });
    })
});