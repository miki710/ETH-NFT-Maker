"use client"; // 追加

import { Button, Typography, Stack, Alert } from "@mui/material";
import Image from "next/image"; // next/image をインポート
import { useAccount, useDisconnect, useConnect, useEnsName } from 'wagmi';
import { useSimulateContract, useWriteContract } from 'wagmi'
import { mainnet, polygonAmoy } from 'wagmi/chains';
import "./NftUploader.css";

import Web3Mint from "../abi/Web3Mint.json"; // コントラクトのABIをインポート
import { useEffect, useState } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import { v4 as uuidv4 } from 'uuid';


const CONTRACT_ADDRESS = "0xe80a17cbd288fbbf6538483cbd2037acaac213d7";


export const NftUploader = () => {
  const { address, isConnected, chain } = useAccount();
  const [showNetworkWarning, setShowNetworkWarning] = useState(false);
  const { writeContract } = useWriteContract();

  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });
  const [isClient, setIsClient] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isMetadataUploading, setIsMetadataUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [nftName, setNftName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [ipfsCid, setIpfsCid] = useState<string | null>(null);
  const [metadataURI, setMetadataURI] = useState<string | null>(null);

  console.log('Current chain:', chain); // デバッグ用

  // 許可されたチェーンIDのリスト
  const allowedChainIds: readonly number[] = [mainnet.id, polygonAmoy.id] as const;

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    console.log('接続状態:', isConnected);
    console.log('現在のチェーン:', chain);

    if (isConnected) {
      if (chain) {
        const isAllowedNetwork = allowedChainIds.includes(chain.id);
        console.log('許可されたネットワーク:', isAllowedNetwork);
        setShowNetworkWarning(!isAllowedNetwork);
      } else {
        // chainがundefinedの場合も警告を表示
        setShowNetworkWarning(true);
      }
    } else {
      setShowNetworkWarning(false);
    }

    console.log('警告表示フラグ:', showNetworkWarning);
  }, [isConnected, chain]);


  // ネットワークチェック関数
  const checkNetwork = () => {
    if (chain && !allowedChainIds.includes(chain.id as typeof allowedChainIds[number])) {
      alert('このアプリケーションはEthereumメインネットまたはAmoyテストネットでのみ動作します。ネットワークを切り替えてください。');
      return false;
    }
    return true;
  };

  const { data: simulateData, error: simulateError } = useSimulateContract({
    address: CONTRACT_ADDRESS,
    abi: Web3Mint.abi,
    functionName: 'mintIpfsNFT',
    args: [metadataURI]
  })
  
  

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setIpfsCid(null); // 新しいファイルが選択されたらIPFS CIDをリセット
      
      // プレビューURLを作成
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadToPinata = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`
          }, // JWTトークンを設定
        }
      );
      console.log('Pinataレスポンス:', response.data); // デバッグ用ログ
      setIpfsCid(response.data.IpfsHash);
    } catch (error) {
      console.error('Pinataへのアップロードエラー:', error);
    }
  };

  const uploadMetadataToPinata = async (imageCid: string) => {
    const name = `NFT ${uuidv4().slice(0, 8)}`;
    setNftName(name);
    const metadata = {
      name: name,
      description: "このNFTはeth-nft-makerで作成されました。",
      image: `ipfs://${imageCid}`,
      attributes: []
    };
  
    try {
      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        metadata,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`
          },
        }
      );
      console.log('メタデータPinataレスポンス:', response.data);
      return `ipfs://${response.data.IpfsHash}`;
    } catch (error) {
      console.error('メタデータのPinataへのアップロードエラー:', error);
      return null;
    }
  };
  
  const handleImageUpload = async () => {
    if (!checkNetwork()) return;

    if (!selectedFile) {
      alert('ファイルを選択してください。');
      return;
    }
    setIsImageUploading(true);
    try {
      await uploadToPinata();
    } catch (error) {
      console.error('画像アップロードエラー:', error);
      alert('画像のアップロードに失敗しました。');
    } finally {
      setIsImageUploading(false);
    }
  };

  const handleMetadataUpload = async () => {
    if (!checkNetwork()) return;

    if (!ipfsCid) {
      alert('まず画像をアップロードしてください。');
      return;
    }
    setIsMetadataUploading(true);
    try {
      const uri = await uploadMetadataToPinata(ipfsCid);
      if (uri) {
        setMetadataURI(uri);
        alert('メタデータのアップロードに成功しました。');
      } else {
        throw new Error('メタデータのアップロードに失敗しました。');
      }
    } catch (error) {
      console.error('メタデータアップロードエラー:', error);
      alert('メタデータのアップロードに失敗しました。');
    } finally {
      setIsMetadataUploading(false);
    }
  };

  const handleMint = async () => {
    console.log('Current metadataURI:', metadataURI);
    if (!checkNetwork()) return;

    if (!metadataURI) {
      alert('まずメタデータをアップロードしてください。');
      return;
    }
    setIsLoading(true);
    try {
      if (simulateError) {
        throw new Error(`シミュレーションエラー: ${simulateError.message}`);
      }
      if (!simulateData) {
        throw new Error('シミュレーションデータがありません。再度お試しください。');
      }
      // 実際のミント処理
      await writeContract(simulateData.request);
      console.log("ミント処理開始");
    } catch (error) {
      console.error('NFTのミント中にエラーが発生しました:', error);
      alert(`ミントに失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
    } finally {
      setIsLoading(false);
    }
  }

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      await connect({ connector: connectors[0] });
    } catch (error) {
      console.error('接続中にエラーが発生しました:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setIsLoading(true);
      await disconnect();
    } catch (error) {
      console.error('切断中にエラーが発生しました:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderConnectedContainer = () => (
    <div>
      <p>{isClient && (ensName ? `${ensName} (${address})` : address)}</p>
      <button onClick={() => disconnect()}>切断</button>
    </div>
  );

  const renderNotConnectedContainer = () => (
    <div>
      <p>ウォレットが接続されていません</p>
      <button onClick={handleConnect} disabled={isLoading}>
        {isLoading ? '接続中...' : 'ウォレットを接続'}
      </button>
    </div>
  );


  return (
    <div className="outerBox">
      <Stack spacing={0.5}>
        <Typography variant="body2">
          ウォレット接続状態: {isConnected ? '接続済み' : '未接続'}
        </Typography>
        <Typography variant="body2">
          現在のチェーンID: {chain ? chain.id : '不明なネットワーク'}
        </Typography>
      </Stack>
      
      {showNetworkWarning && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          警告: 不適切なネットワークに接続されています。EthereumメインネットまたはAmoyテストネットに切り替えてください。
        </Alert>
      )}

      {isClient ? (
        isConnected ? (
          <>
          {renderConnectedContainer()}
          <p>画像を選択すると、NFTをミントできます</p>
          </> 
        ) : (
          renderNotConnectedContainer()
        )
      ) : (
        <p>読み込み中...</p>
      )}
      <div className="title">
        <h2>NFTアップローダー</h2>
      </div>
      <div className="nftUplodeBox">
        {previewUrl ? (
          <Image src={previewUrl} alt="選択された画像" width={200} height={200} />
        ) : (
          <div className="imageLogoAndText">
            <Image src="/image.svg" alt="imagelogo" width={100} height={100} />
            <p>ここにドラッグ＆ドロップしてね</p>
          </div>
        )}
        <input
          className="nftUploadInput"
          multiple
          name="imageURL"
          type="file"
          accept=".jpg , .jpeg , .png"
        />
      </div>
      <p>または</p>
      <Stack direction="column" spacing={2}>
        <Button variant="contained">
          ファイルを選択
          <input 
            className="nftUploadInput" 
            type="file" 
            onChange={handleFileChange}
            accept=".jpg , .jpeg , .png" 
          />
        </Button>

        <Button 
          variant="contained" 
          onClick={handleImageUpload} 
          disabled={!selectedFile || isImageUploading}
        >
          {isImageUploading ? 'アップロード中...' : '画像をアップロード'}
        </Button>

        <Button 
          variant="contained" 
          onClick={handleMetadataUpload} 
          disabled={!ipfsCid || isMetadataUploading}
        >
          {isMetadataUploading ? 'メタデータアップロード中...' : 'メタデータをアップロード'}
        </Button>
      </Stack>
      {selectedFile && (
      <p>選択されたファイル: {selectedFile.name}</p>
      )}
      <Stack spacing={2} sx={{ mt: 2 }}>
        <Stack spacing={0.5}>
          <Typography variant="body2">
            画像IPFS CID: {ipfsCid || 'まだアップロードされていません'}
          </Typography>
          <Typography variant="body2">
            メタデータIPFS CID: {metadataURI ? metadataURI.replace('ipfs://', '') : 'まだアップロードされていません'}
          </Typography>
          <Typography variant="body2">
            NFT名: {nftName || 'まだ設定されていません'}
          </Typography>
        </Stack>
      </Stack>
      
      {ipfsCid && (
        <a 
          href={`https://gateway.pinata.cloud/ipfs/${ipfsCid}`} 
          target="_blank" 
          rel="noopener noreferrer"
        >
          アップロードされたファイルを表示
        </a>
      )}

      <Button 
        variant="contained" 
        onClick={handleMint} 
        disabled={!metadataURI || isLoading}
        sx={{ mt: 2 }}
      >
        NFTをミント
      </Button>
    </div>
  );
};

const DynamicNftUploader = dynamic(() => Promise.resolve(NftUploader), {
  ssr: false,
});

export default function NftUploaderPage() {
  return <DynamicNftUploader />;
}

