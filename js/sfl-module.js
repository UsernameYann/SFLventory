// Constantes
const API_ENDPOINT = 'https://m4qc2kpy03.execute-api.eu-west-3.amazonaws.com/prod2/verify-token';
const POLYGON_CHAIN_ID = '0x89';
const NFT_CONTRACT_ADDRESS = '0x2B4A66557A79263275826AD31a4cDDc2789334bD';
const SFL_API = 'https://api.sunflower-land.com/community/farms/';

// ABI minimal pour ERC721
const ERC721_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
    "function ownerOf(uint256 tokenId) view returns (address)",
];

// Éléments DOM
let statusDiv;
let walletDiv;
let tokenInfo;
let connectButton;

document.addEventListener('DOMContentLoaded', () => {
    // Initialisation des éléments DOM
    statusDiv = document.getElementById('status');
    walletDiv = document.getElementById('walletAddress');
    tokenInfo = document.getElementById('tokenInfo');
    connectButton = document.getElementById('connectButton');

    // Vérifier si MetaMask est installé
    const checkIfMetaMaskIsInstalled = () => {
        const { ethereum } = window;
        return Boolean(ethereum && ethereum.isMetaMask);
    };

    // Fonction pour se connecter à MetaMask
    const connectMetaMask = async () => {
        try {
            // Vérifier et attendre MetaMask
            if (typeof window.ethereum === 'undefined') {
                statusDiv.textContent = '⚠️ MetaMask not detected. Please install it...';
                return;
            }

            // Attendre que le provider soit complètement chargé
            await new Promise(resolve => setTimeout(resolve, 1000));

            statusDiv.textContent = '🔄 Connecting to MetaMask...';
            
            // Demander l'accès au compte
            const accounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
            });

            // Créer le provider avec délai
            const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
            await provider.ready; // Attendre que le provider soit prêt
            const signer = provider.getSigner();
            
            // Récupérer l'adresse
            const address = accounts[0];
            console.log('Connected address:', address);
            
            // Afficher l'adresse et mettre à jour le statut
            statusDiv.textContent = '✅ Successfully connected!';
            walletDiv.textContent = `Wallet address: ${address}`;
            
            // Change button text
            connectButton.textContent = 'Connected ✓';
            connectButton.disabled = true;

            // Switch to Polygon network
            await switchToPolygon();
            
            // Check NFT ownership
            const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, ERC721_ABI, provider);
            const balance = await contract.balanceOf(address);
            
            if (balance > 0) {
                const tokenIds = [];
                for (let i = 0; i < balance; i++) {
                    const tokenId = await contract.tokenOfOwnerByIndex(address, i);
                    tokenIds.push(tokenId.toString());
                }
                
                statusDiv.textContent = '✅ Connecté avec succès !';
                walletDiv.textContent = `Wallet address: ${address}\nNumber of NFTs: ${balance}\nToken IDs: ${tokenIds.join(', ')}`;
            } else {
                statusDiv.textContent = '✅ Connected, but no NFTs found';
                walletDiv.textContent = `Wallet address: ${address}\nNo NFTs found in this contract`;
            }

            // Récupérer l'ID du token (exemple avec le premier token trouvé)
            const tokenId = await contract.tokenOfOwnerByIndex(address, 0);
            
            // Vérifier si le token est enregistré
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    tokenId: tokenId.toString() 
                })
            });

            const result = await response.json();

            if (result.exists) {
                statusDiv.innerHTML = '✅ Verification successful';
                walletDiv.innerHTML = `
                    <div style="margin: 10px 0;">
                        <strong>Address:</strong> ${address}<br>
                        <strong>NFTs:</strong> ${balance} token(s)<br>
                        <strong>Token ID:</strong> ${tokenId}
                    </div>
                `;
                tokenInfo.innerHTML = `
                    <div style="background: #e8f5e9; padding: 10px; border-radius: 5px; margin-top: 10px;">
                        ✓ Token verified and registered<br>
                        <small>Associated wallet: ${result.walletInfo.address}</small>
                    </div>
                `;
            } else {
                statusDiv.innerHTML = '❌ Token not registered';
                tokenInfo.innerHTML = `Token ID: ${tokenId}`;
            }

            // Dans la fonction de traitement de la réponse

            if (result.success) {
                statusDiv.innerHTML = `
                    <div class="success-message">
                        ✅ Verifications successful
                        <ul>
                            <li>Token verified</li>
                            <li>Today's data available</li>
                            <li>Date: ${result.date}</li>
                        </ul>
                    </div>
                `;
                
                tokenInfo.innerHTML = `
                    <div class="token-info">
                        <strong>Token ID:</strong> ${result.tokenId}<br>
                        <strong>Wallet:</strong> ${result.walletInfo.address}<br>
                        <strong>Registered on:</strong> ${result.walletInfo.registrationDate}
                    </div>
                `;
            }

            // Vérification supplémentaire avec la nouvelle fonction
            const verificationResult = await verifyToken(tokenId.toString());
            await updateUIWithVerification(address, balance, tokenId.toString(), verificationResult);

            return address;

        } catch (error) {
            console.error('Erreur de connexion:', error);
            statusDiv.textContent = '❌ Erreur : ' + error.message;
            throw error;
        }
    }

    // Ajouter l'écouteur d'événement au bouton
    connectButton.addEventListener('click', async () => {
        try {
            await connectMetaMask();
            // Mettre à jour l'interface ou effectuer d'autres actions ici
        } catch (error) {
            // Gérer l'erreur dans l'interface
            console.error('Échec de la connexion:', error.message);
        }
    });

    // Écouter les changements de compte
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length === 0) {
                // L'utilisateur s'est déconnecté
                statusDiv.textContent = 'Disconnected from MetaMask';
                walletDiv.textContent = '';
                connectButton.textContent = 'Connect with MetaMask';
                connectButton.disabled = false;
            } else {
                // Le compte a changé - on peut mettre à jour l'interface
                connectMetaMask();
            }
        });
    }
});

// Add this new function after your existing code
const switchToPolygon = async () => {
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: POLYGON_CHAIN_ID }],
        });
        return true;
    } catch (switchError) {
        if (switchError.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: POLYGON_CHAIN_ID,
                        chainName: 'Polygon Mainnet',
                        nativeCurrency: {
                            name: 'MATIC',
                            symbol: 'MATIC',
                            decimals: 18
                        },
                        rpcUrls: ['https://polygon-rpc.com/'],
                        blockExplorerUrls: ['https://polygonscan.com/']
                    }]
                });
                return true;
            } catch (addError) {
                throw addError;
            }
        }
        throw switchError;
    }
};

// Nouvelle fonction pour mettre à jour les fichiers
async function updateFarmFiles(tokenId) {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        // Utiliser la Lambda comme proxy pour l'API Sunflower
        const response = await fetch(`${API_ENDPOINT}/update-farm`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                tokenId,
                date: today
            })
        });

        if (!response.ok) {
            throw new Error('Error updating files');
        }

        const result = await response.json();
        return result.success;

    } catch (error) {
        console.error('Erreur de mise à jour:', error);
        throw error;
    }
}

// Modifier la fonction verifyToken existante
const verifyToken = async (tokenId) => {
    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ tokenId: tokenId.toString() })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // La réponse est déjà un objet JSON parsé
        const result = await response.json();
        
        // Obtenir les données du body parsé
        return JSON.parse(result.body);  // ✅ Parser le body une seule fois

    } catch (error) {
        console.error('Erreur verifyToken:', error);
        throw error;
    }
};

async function updateUIWithVerification(address, balance, tokenId, verificationResult) {
    try {
        // Cas 1: Nouveau token non enregistré
        if (verificationResult.error === 'Token not found in farms_list.json') {
            statusDiv.innerHTML = '⏳ Registration in progress...';
            
            try {
                const response = await fetch(API_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        tokenId: tokenId,
                        walletAddress: address,
                        register: true
                    })
                });

                const result = await response.json();
                const data = typeof result.body === 'string' ? JSON.parse(result.body) : result.body;

                if (data.success) {
                    statusDiv.innerHTML = '✅ Token registered';
                    walletDiv.innerHTML = `
                        <div style="margin: 10px 0;">
                            <strong>Token ID:</strong> ${tokenId}<br>
                            <strong>NFTs:</strong> ${balance} token(s)
                        </div>
                    `;
                    tokenInfo.innerHTML = '🆕 First save completed';
                }
            } catch (error) {
                console.error('Detailed error:', error);
                statusDiv.innerHTML = '❌ Registration error';
            }
        } 
        // Cas 2: Token déjà enregistré
        else if (verificationResult.success) {
            statusDiv.innerHTML = '✅ Token verified';
            walletDiv.innerHTML = `
                <div style="margin: 10px 0;">
                    <strong>Token ID:</strong> ${tokenId}<br>
                    <strong>NFTs:</strong> ${balance} token(s)
                </div>
            `;

            if (verificationResult.fileExists) {
                tokenInfo.innerHTML = '📅 Today\'s save already completed';
            } else {
                tokenInfo.innerHTML = '⚡ Save completed';
            }
        }
    } catch (error) {
        console.error('Error:', error);
        statusDiv.innerHTML = '❌ Error during verification';
    }
}
